# Pokestar web battler

The web app is a static React/Vite client. Express on the bot host handles
Discord login, sessions, battle actions, and the display catalog.

## Local development

1. Set the bot environment values from `.env.in`, including
   `WEB_BATTLER_ENABLED=true`, `WEB_SITE_ORIGIN=http://localhost:5173`,
   `WEB_DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback`,
   and `DISCORD_CLIENT_SECRET`. Register that exact redirect URI with Discord.
2. Run the bot and its local MongoDB service.
3. In `web/`, run `npm ci` and `npm run dev`. Vite proxies `/api` to the bot.

For a visual review of the production battle screen without login, open
`http://localhost:5173/?previewBattle=1` while Vite runs. The story bar has
stable links for ready, area targeting, status and effects, NPC waiting, move
playback, completed, and dense/missing-art states. For example,
`http://localhost:5173/?previewBattle=1&story=playback` opens the event story
with a Replay action control. Stories use local display fixtures and never
submit server actions. In a live battle, select a move and hover or focus a
target to preview all pattern tiles. Mouse and keyboard activation use it
directly. Touch and pen taps preview first; Confirm or a second tap on the same
primary target uses the move. Tapping another target updates the preview.
Cancel returns to inspection. On narrow screens, targeting uses floating
controls beside the collapse/expand arrow.

Start web-battler work with the [effort overview](../docs/efforts/web-battler.md).
The [UI guide](../docs/web-ui-style-guide.md) owns visual direction and
[copy voice](../docs/web-ui-style-guide.md#copy-voice), including the author's
approved examples and game-style battle narration. Repeated battle interface
wording lives in `src/battles/copy.ts`; event narration and short cues live in
`src/battles/eventPresentation.ts`. The
[architecture guide](../docs/web-client-architecture.md) explains these boundaries.
`web/AGENTS.md` points agents to the guidance when editing screens or copy.
Story data lives in `src/battles/dev/battleStories.ts`;
add scenarios there when a UI state needs repeatable review. Component tests
exercise interactions through React Testing Library. Story tests check fixture
contracts rather than recording markup or pixel snapshots.

The accepted [desktop annotation batch](../docs/verification/widescreen-polish/README.md)
and [mobile follow-up](../docs/verification/mobile-polish/README.md) retain the
behavior checks and remaining live-device/backend verification. Restart the
bot/backend and reload the page to load new trainer labels and forced-skip
progression; Vite hot reload alone updates only the client.

Durable battle starts also need `DURABLE_BATTLES_ENABLED=true`. Keep the
separate raid flag off until the remaining raid cutover work is complete.

## Local HTTPS and phone testing (macOS)

The phone and Mac use one HTTPS origin. Vite forwards `/api` to Node on loopback;
Node does not need a second LAN listener. A local certificate is trusted by your
own devices, and does not require a public hostname or router port forwarding.

1. Install [mkcert](https://github.com/FiloSottile/mkcert) with `brew install mkcert`,
   then run `mkcert -install` in your terminal. macOS may request your administrator
   password to install the development CA in its trust store.
2. From `web/`, generate a server certificate for localhost and your current
   Wi-Fi IP (replace `192.168.4.29` below with `ipconfig getifaddr en0`):

   ```sh
   mkdir -p .certs
   mkcert -cert-file .certs/dev-cert.pem -key-file .certs/dev-key.pem localhost 127.0.0.1 ::1 192.168.4.29
   chmod 600 .certs/dev-key.pem
   ```

3. Copy `web/.env.example` to `web/.env.local`, and set:

   ```dotenv
   WEB_DEV_HOST=192.168.4.29
   WEB_DEV_API_TARGET=http://127.0.0.1:3000
   WEB_DEV_TLS_CERT=.certs/dev-cert.pem
   WEB_DEV_TLS_KEY=.certs/dev-key.pem
   ```

   Paths are relative to `web/`. Both TLS settings are required for HTTPS; leaving
   both empty retains HTTP development. Keep `VITE_API_ORIGIN` unset. Port 5173
   is fixed by default and startup fails if occupied, so callbacks cannot silently
   move to a different port. Stop old Vite instances before restarting.

4. In the bot's root `.env`, set:

   ```dotenv
   HTTP_HOST=127.0.0.1
   WEB_SITE_ORIGIN=https://192.168.4.29:5173
   WEB_DISCORD_REDIRECT_URI=https://192.168.4.29:5173/api/auth/discord/callback
   ```

   Keep the existing Discord credentials and enable flags. Restart the bot to
   apply environment changes. `HTTP_HOST` is optional; leaving it unset preserves
   the existing Express binding for production/webhook deployments.

5. In the Discord application's OAuth2 redirects, add the exact HTTPS callback
   above. Keep existing localhost redirects. Start Vite with `npm run dev` in
   `web/` and sign in through `https://192.168.4.29:5173/` on the Mac.
6. To use an iPhone, transfer **only the public CA certificate**. For convenient
   AirDrop handling, convert it to a `.cer` file on the Mac:

   ```sh
   openssl x509 -in "$(mkcert -CAROOT)/rootCA.pem" -outform DER -out /tmp/pokestar-local-ca.cer
   open -R /tmp/pokestar-local-ca.cer
   ```

   AirDrop that file to the phone. Install its downloaded profile in Settings,
   then enable it under **General → About → Certificate Trust Settings**. See
   [Apple's certificate trust instructions](https://support.apple.com/en-us/102390).
   Open the same HTTPS address on the phone while connected to the same Wi-Fi.
   Never transfer `rootCA-key.pem` or the server's `dev-key.pem`.

The certificate directory and local env file are ignored by Git. Server TLS paths
and keys are not exposed as frontend environment variables. If the Mac's IP
changes, regenerate the server certificate with the new IP and update the host,
backend origins and Discord redirect. A router DHCP reservation avoids that churn.

## Static build

Run `npm run build` in `web/`. The `dist/` directory can be published on
GitHub Pages. Set `VITE_API_ORIGIN=https://api.example.com` at build time for
the HTTPS API. For a GitHub Pages project URL with a repository path, also set
`WEB_BASE_PATH=/repository-name/`; a custom subdomain can keep `/`.

The battle ID is in a query parameter (`?battle=...`), so direct links work on
static hosts without a route rewrite. The site and API should use subdomains
of one domain for reliable session cookies. The API origin needs HTTPS, a
stable hostname, and a GCP reserved external IP pointing at the VM.

Run `npm test` for client unit tests. Browser validation and production
deployment are separate gates.

With Vite running, `node scripts/check-battle-action-layout.mjs` checks the real
HTTP/session action path with mocked API responses at desktop and phone widths.
It verifies that pending/resolved submission does not shift the arena or scroll
the viewport. This requires Playwright; if it is supplied by an external CLI,
set `PLAYWRIGHT_MODULE` to that installation's Playwright module directory.
`WEB_TEST_ORIGIN` overrides the default `http://127.0.0.1:5173` dev server.
The test makes no real battle writes and does not test OAuth.

## Pokémon cries

`public/audio/cries` holds every PokeAPI Pokémon and form's `latest` cry as
mono MP3, named by PokeAPI ID. Run `npm run download-cries` only when PokeAPI
adds Pokémon; it skips existing files (`--force` re-encodes them, adding their
full size to Git history). It needs `ffmpeg` on `PATH` or in `FFMPEG`. Custom
species must be mapped to a real cry in `src/battles/audio/crySpecies.json`;
`npm test` fails when a configured species has no cry.
