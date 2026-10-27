# Pokéstar deployment runbook

The Discord bot and Express API share one Node process on GCP. MongoDB runs
on the VM. GitHub Pages serves the static web client; Nginx terminates API HTTPS
and forwards to Node over loopback.

| Component | Deployment |
| --- | --- |
| Website | `https://play.pokestar.games` on GitHub Pages |
| API / vote webhook | `https://api.pokestar.games/api/...` / `/vote` |
| VM | `instance-1`, `us-west1-b`, project `pokestar-382904` |
| Reserved external IP | `35.197.2.114` |
| Node / MongoDB listeners | `127.0.0.1:3000` / `127.0.0.1:27017` |

The [deployment record](docs/verification/vm-https-2026-10-26.md) separates
observed results from pending work. The [effort overview](docs/efforts/web-battler.md)
owns web-battler acceptance and remaining work.

## Node and shell setup

Install NVM using its [official instructions](https://github.com/nvm-sh/nvm#installing-and-updating).
From the repository root, use the checked-in runtime and lockfile:

```sh
cd ~/pokestar
nvm install
nvm use
node --version
command -v node
npm ci
```

`.nvmrc` currently pins **24.22.1**. Use `npm ci` after dependency changes or a
Node major upgrade. NVM does not copy global packages from another Node
installation; install PM2 under the selected version with `npm install -g pm2`.

On Debian, `~/.profile` normally sources `~/.bashrc`. Linuxbrew's
`eval "$(/home/linuxbrew/.linuxbrew/bin/brew shellenv)"` must run **before**
that existing `.bashrc` block, so NVM initialization runs afterward. Remove
duplicate Brew initialization and any line prepending
`/home/linuxbrew/.linuxbrew/opt/node@16/bin`. Do not hardcode Node's bin path.

To repair the current shell and set the default for future shells:

```sh
nvm deactivate
nvm use
hash -r
nvm alias default 24.22.1
command -v node
node --version
```

Reconnect over SSH and verify again. PM2 startup units retain a Node-specific
PATH; regenerate the unit after Node upgrades as described below.

## Discord, database and environment

Create a Discord developer application and invite its bot with application-command
permissions. Configure the credentials from [.env.in](.env.in) in the root `.env`;
keep it outside version control and run `chmod 600 .env`. Use `STAGE=PROD` and
the existing production database configuration on the VM.

For a new host, follow the instructions for its
[supported Debian/MongoDB combination](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-debian/)
and install Database Tools too. The VM's existing MongoDB 6.0.5 is not a
recommendation for a new installation. Start MongoDB **before** the bot:

```sh
sudo systemctl start mongod
sudo systemctl is-active mongod
mongosh --quiet --eval 'db.adminCommand({ ping: 1 })'
```

The ping assumes the local default connection. If authentication is enabled,
use the configured connection and credential prompts without exposing secrets.
Discord Ready alone does not prove database access: commands query MongoDB
before their initial response.

Set these additional values for the deployed website:

```dotenv
HTTP_HOST=127.0.0.1
HTTP_TRUST_LOOPBACK_PROXY=true
WEB_BATTLER_ENABLED=true
WEB_SITE_ORIGIN=https://play.pokestar.games
WEB_BASE_PATH=/
WEB_DISCORD_REDIRECT_URI=https://api.pokestar.games/api/auth/discord/callback
```

Set backend `CLIENT_ID` and `DISCORD_CLIENT_SECRET`, and register that exact
callback under the Discord application's **OAuth2 redirects**. This bot receives
commands through the Gateway; the OAuth callback is not an Interactions Endpoint
URL. Leave that separate field unchanged.

`WEB_BATTLER_ENABLED=true` mounts `/api`, including CORS middleware.
`DURABLE_BATTLES_ENABLED=true` separately enables supported durable battle
starts in Discord. Keep `DURABLE_RAIDS_ENABLED` off during the initial rollout.
Restart after `.env` changes. Avoid duplicate app settings exported in the shell
or stored in PM2: inherited environment values take precedence over `.env`.

Upload commands with `node scripts/bot/deployCommands.js` only when definitions
change. Run `node scripts/database/setupDatabase.js` or other migrations only
when the release requires them and after a backup. Setup creates collections
and indexes and can recreate views.

## PM2 and reboot recovery

For a **new** PM2 process, run from the repository root:

```sh
pm2 start src/index.js --name index --max-memory-restart 384M
pm2 status
pm2 logs index --lines 30 --nostream
```

For an existing process, use `pm2 restart index`; do not start a duplicate or
kill the entire PM2 daemon. Keep one HTTP process while quotas use an in-memory
store. Confirm database Connected and Discord Ready logs and test a command.
Review logs locally before sharing: provider errors can contain request details.

The example 384M threshold is a starting budget, not a hard limit or reservation;
size it against measured usage, MongoDB and VM capacity. The old 160 MiB limit
caused repeated restarts. Wrap-up observed a user-selected **230 MiB** threshold
and about **176 MiB** RSS. Monitor actual battles before settling the budget.
[PM2 checks memory about every 30 seconds](https://pm2.keymetrics.io/docs/usage/memory-limit/).
To change the threshold: `pm2 restart index --max-memory-restart 384M`.

Once healthy, configure persistence:

1. Run `sudo systemctl enable mongod`.
2. Run `pm2 startup` as `ewei068` with NVM's Node 24 selected. Execute the exact
   privileged command it prints; it includes the selected Node/PM2 PATH.
3. Run `pm2 save` to persist the healthy process list.
4. Run `sudo systemctl edit pm2-ewei068` and add this override, then run
   `sudo systemctl daemon-reload`:

   ```ini
   [Unit]
   Wants=mongod.service network-online.target
   After=mongod.service network-online.target
   ```

5. Check `systemctl is-enabled mongod pm2-ewei068 nginx snap.certbot.renew.timer`.
   Test a reboot in a maintenance window and repeat the checks below. Ordering
   services does not replace checking database health.

After Node upgrades, [regenerate PM2's startup unit](https://pm2.keymetrics.io/docs/usage/startup/#updating-startup-script-after-nodejs-version-upgrade)
with `pm2 unstartup` / `pm2 startup` and their printed privileged commands.
Reinstall PM2 under the selected Node version. If an existing app retains an
old interpreter, restart it with `pm2 restart index --interpreter "$(command -v node)"`
and verify the runtime with `pm2 describe index`. Reapply the MongoDB ordering
override and save the healthy process list.

## DNS, HTTPS and voting

Porkbun DNS has an `api` A record pointing to the reserved GCP IP and a `play`
CNAME to `ewei068.github.io`. Pages owns the website domain/certificate. Keep
the API IP reserved. GCP allows public 80/443; Node 3000 and MongoDB 27017 stay
private. If `dig` is missing, use `getent ahostsv4 api.pokestar.games`.

The API site is `/etc/nginx/sites-available/pokestar-api`, linked in
`sites-enabled`. Its HTTPS location includes
`/etc/nginx/snippets/pokestar-proxy.conf`:

```nginx
proxy_pass http://127.0.0.1:3000;
proxy_http_version 1.1;
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-For $remote_addr;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header Forwarded "";
proxy_set_header Connection "";
proxy_cache off;
```

Enable loopback proxy trust only with these replacements and a private Node
listener. HTTP for the API hostname redirects to HTTPS; other HTTP hosts,
including the raw IP, return 404. TLS permits 1.2/1.3. Normal access logs use
`$uri` without queries to avoid recording OAuth code/state; error logs may still
include URLs. Back up `/etc/nginx` privately before edits and always run
`sudo nginx -t` before `sudo systemctl reload nginx`.

Certbot is installed through Snap; check certificates and renewal with:

```sh
sudo /snap/bin/certbot certificates
sudo /snap/bin/certbot renew --dry-run
systemctl list-timers --all snap.certbot.renew.timer
```

Vote providers must POST directly to **`https://api.pokestar.games/vote`**, with
the matching `DBL_SECRET` / `TOPGG_SECRET` Authorization value and supported
payload. Do not rely on HTTP POST redirects. Old raw-IP vote URLs were retired.
Check each provider's current webhook format before enabling rewards. Missing
or incorrect secrets are rejected. `/vote` works independently of the web flag.

## Publish GitHub Pages

Follow the [manual Pages setup](web/README.md#manual-github-pages-deployment):

1. In **Settings → Pages**, select **GitHub Actions**, configure
   `play.pokestar.games` and enforce HTTPS.
2. Set repository Actions **variable** `VITE_API_ORIGIN=https://api.pokestar.games`.
   It is public build configuration; never put secrets in frontend variables.
3. Limit the `github-pages` environment to `main` deployments.
4. Verify the API first, then manually run **Deploy web battler** from `main`.
   Pushes do not deploy. Domain/API changes require a new build/deployment.

The custom domain uses `/`; no repository `WEB_BASE_PATH` variable is needed.
The initial rollout intentionally omits Discord-to-web battle links.

## Subsequent backend updates

Use a maintenance window for runtime, migration or battle-rules changes. On the
current standalone database, stop all writers for a consistent logical backup.
**Leave MongoDB running for `mongodump`.**

```sh
cd ~/pokestar
pm2 stop index
sudo systemctl is-active mongod
umask 077
backup_dir="backups/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$backup_dir"
mongodump --host 127.0.0.1 --port 27017 --db pokestar --out "$backup_dir"
```

Adapt the local/default dump arguments if the database or authentication changes.
Verify success and BSON/metadata files, copy the backup off the VM, and
[test restoration in an isolated deployment](https://www.mongodb.com/docs/manual/tutorial/backup-and-restore-tools/).
A directory name does not prove a usable backup. Save the previous commit ID
and a private `.env` copy too.

```sh
git status --short
git rev-parse HEAD
git pull --ff-only origin main
nvm install
nvm use
npm ci
```

Before pulling, stop if tracked files have unexpected local edits and confirm
the checkout is on `main`. Stop if the fast-forward fails. Update `.env` and run
only release-required migrations/command registration. Run `pm2 restart index`,
verify below and run `pm2 save`. Rebuild Pages manually if its client changed.

A production `mongorestore --drop` overwrites collections and discards later
writes. Use it only for deliberate recovery with writers stopped, a verified
backup and compatible code. Before rolling back durable battle code, check
ruleset compatibility and drain/reconcile pending reward/payment claims; see
[completion recovery](docs/battle-completion-boundary.md).

## Verify and troubleshoot

```sh
sudo ss -lntp
pm2 status
curl -i -H 'Origin: https://play.pokestar.games' https://api.pokestar.games/api/me
curl -I https://play.pokestar.games/
```

Expect Node/MongoDB on loopback, Pages 200 and signed-out `/api/me` **401**
with `Access-Control-Allow-Origin: https://play.pokestar.games`,
`Access-Control-Allow-Credentials: true` and `Cache-Control: no-store`.
Check PM2 again after at least a minute: its restart counter should stay stable.
Sign in, reload to verify the session and test sign-out. Start a supported
battle in Discord, continue in the browser and return to Discord. Bot restarts,
raid rollout and physical-device behavior need their own checks.

| Symptom | Check |
| --- | --- |
| Node 16 despite NVM | Brew ordering / forced `node@16/bin`; deactivate NVM, then select it again |
| Missing `express-rate-limit` after pull | Run `npm ci` under the pinned Node |
| Discord Ready but commands time out | MongoDB health; the handler queries the database before replying |
| Repeated startup without an application exception | PM2 logs and memory threshold; old 160 MiB setting caused ~30-second restarts |
| CORS error; `/api/me` returns Express 404 | Set `WEB_BATTLER_ENABLED=true` and restart; API/CORS middleware was never mounted |
| `/api/me` 401 with correct CORS | Expected while signed out; proceed to login |
| Nginx 502 | Node stopped, startup failed or upstream differs; inspect PM2 and `ss` |
| OAuth callback fails | Exact registered redirect, backend credentials and sibling HTTPS site/API origins |

## Deployment follow-ups

- **First: reboot recovery.** At wrap-up MongoDB was active but disabled at boot,
  and no PM2 systemd unit was listed. Complete persistence above and test during
  maintenance; live command success does not establish reboot recovery.
- Keep an off-VM backup, perform a test restore and add routine retention.
  The proxy configuration backup is not a database backup.
- Monitor the current 230 MiB threshold, VM memory, disk/log growth, uptime and
  certificate renewal. Revisit capacity when actual battles increase usage.
- Assess remaining dependency advisories and plan supported Debian/MongoDB
  upgrades separately, with backups and compatibility checks.
- Check each vote provider's current webhook/auth settings. Keep raids off until
  accepted; retain mode, restart, reward/Auto recovery and device checks in the
  effort overview.
