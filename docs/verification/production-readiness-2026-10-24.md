# Web battler production-readiness check

Reviewed 2026-10-24 (America/Los_Angeles), implementation commit
`d1c9654d010acb566c14fcbcf4972d155f4eac06`.

**Verdict: suitable for staging validation; not ready for public production cutover.**
The static client/API architecture fits GitHub Pages plus a GCP VM. Session and
participant authorization have a sound baseline, and local checks pass. Security
maintenance, public HTTP protection, completion recovery, and deployed acceptance
remain release gates. This review did not deploy, access secrets, change flags,
restart the bot, or write to a real database. Runtime code is unchanged.

## Follow-up decisions and local fix

The user clarified that the initial rollout is intentionally silent. Missing
Discord-to-web links are therefore deferred, not a release defect for that stage.
Manual website entry and battle selection remain the intended initial path.

The vote authentication finding is fixed locally in `src/web/voteWebhook.js`:
missing/empty provider secrets cannot authenticate a request, and invalid
credentials return 401 before reward processing. Nine regression tests cover
missing-secret combinations, valid providers and reward failures. The backend
suite now passes 886 tests / 31 suites. This is local verification, not a deployed
fix. The original findings below describe the reviewed commit.

The **2026-10-25 local maintenance pass** implements the narrow HTTP dependency
update, Node 24 compatibility/CI lane and server/client rate-limit handling.
See its [verification and residuals](runtime-rate-limits-2026-10-24.md). Those
findings are locally addressed to that scope; actual runtime promotion, remaining
dependency exposure and deployed acceptance still gate public cutover.

The user also questioned whether a bot-wide transaction migration should block
this effort. Partial reward writes predate the web client; durable claims add
persistent stuck-work/reconciliation cases. Full transactions are not the only
remedy. For a controlled pilot, monitoring and a manual recovery procedure may
be proportionate, with ambiguous Auto debits explicitly handled. This is a
recommendation under discussion, not acceptance of the existing recovery risks
or evidence that reconciliation is implemented.

## Evidence obtained

| Check | Observed result |
| --- | --- |
| Backend `npm test -- --runInBand` | 877 tests / 30 suites passed |
| Client `npm test` | 105 tests / 23 suites passed |
| Client `npm run build` | TypeScript and Vite passed; 112 modules; existing Virtua annotation warnings |
| Subpath build | Passed with `WEB_BASE_PATH=/pokestar/` and `VITE_API_ORIGIN=https://api.example.com`; emitted HTML asset paths resolve and bundle contains configured API origin |
| Backend `npm audit --omit=dev --json` | 24 affected dependency entries: 2 critical, 11 high, 8 moderate, 3 low |
| Client `npm audit --omit=dev --json` | 0 reported production dependency vulnerabilities |
| Vote authorization probe | Actual `/vote` handler evaluated in isolation, empty environment, no Authorization, mocked `addVote`: HTTP 200 and one reward invocation |
| Runtime | Local Node v18.20.4; checked-in CI also selects Node 18 |

The HTTP tests run real local HTTP requests with injected OAuth/session/service
dependencies. Battle service, persistence, restart, and Discord integration tests
use collection/interaction doubles. No real-provider OAuth, real MongoDB failure
injection, live browser acceptance, VM/network inspection, or independent human
security review was performed. Passing these tests does not establish those claims.
Dependency counts are advisory results, not a count of demonstrated exploits;
reachability must be assessed per advisory. Development/build dependencies were
outside the `--omit=dev` audit.

## Required before public cutover

### 1. Patch and verify the backend dependency/runtime baseline

The lockfile installs Express 4.18.2 and body-parser 1.20.1, among other affected
dependencies. `src/index.js` installs `express.json()` before authentication and
routing. The upstream body-parser advisory specifically covers compressed input
to the default parser before routing, making this a relevant exposed path:
[GHSA-27r3-jxmh-p828](https://github.com/expressjs/body-parser/security/advisories/GHSA-27r3-jxmh-p828).
It identifies 1.20.9 / 2.4.0 as patched versions. The app's uncaught-exception
logger means the upstream default-process-crash outcome is not established here;
it does not repair the vulnerable parser.

The audit also flags form-data, proxy-addr, Axios, undici and others. For example,
proxy trust is not enabled here, so its critical advisory is not automatically
evidence of an exploitable auth bypass in this app. Update compatible dependencies,
triage remaining advisories, and rerun tests. Do not blindly apply forced major
upgrades. Pin and verify a supported Node LTS in both CI and deployment; Node 18
is EOL according to the [Node release table](https://nodejs.org/en/about/previous-releases).

### 2. Make vote webhook authentication fail closed

In `src/index.js`, `/vote` compares `req.header("Authorization")` directly to
`process.env.DBL_SECRET`, then `TOPGG_SECRET`. If either comparison reaches an unset
secret, an absent header equals `undefined`. The isolated reproduction confirms
the DBL branch calls the reward function without authentication when unset.
This predates the web battler but shares its public listener.

Require a nonempty configured secret before comparing, reject missing headers,
and test each missing-secret combination. At the reverse proxy, expose only
required routes and preserve legitimate vote integrations deliberately. A VM's
actual secret configuration was not inspected; the finding is conditional on a
missing secret, not a claim that production is currently exploitable.

### 3. Bound public HTTP work

`src/web/battleApi.js` has no HTTP rate limiter. The existing `checkRateLimit`
in `src/index.js` only wraps Discord events. CORS does not rate-limit direct HTTP
clients. Authenticated participants can repeatedly request their battle without
a cursor, causing full synchronous replay in `battleWebView.js`; OAuth callbacks
and anonymous endpoints also consume resources. The API and Discord bot share
one event loop.

Add measured limits for login/callbacks, reads and actions, plus request time/body
limits at the proxy. Preserve normal three-second polling and multi-tab use. If
limits depend on forwarded client IPs, trust only the actual proxy and block
direct public access to port 3000. Verify 429 behavior and that one user's load
does not stall Discord. No production load or existing edge limits were inspected.

### 4. Use same-site HTTPS domains

Both OAuth state and session cookies use `SameSite=Lax`; HTTPS callbacks select
`__Host-` cookies with Secure, HttpOnly, Path=/ and no Domain. The client fetches
with credentials. This supports `play.example.com` on GitHub Pages and
`api.example.com` on GCP, both HTTPS.

An ordinary `owner.github.io` frontend plus an unrelated API domain or bare VM IP
is cross-site: current cookies will not support the fetch-based login/session
flow. `credentials: include` does not override SameSite. See
[MDN Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie).
Choose the custom domains before rollout; changing to `SameSite=None` alone
would still depend on third-party-cookie browser policies.

### 5. Finish reward/payment recovery before enabling durable starts

`BattleService.settleCompletion` claims `pending` as `processing`, then calls
multiple reward/quest/mode writes. A crash can leave `processing` indefinitely;
an error can leave partial effects with `failed`. `BattleStore.claimCompletion`
only claims `pending`. Retrying all effects after resetting a claim can duplicate
already-applied rewards. Auto similarly retains uncertain `autoCommit` claims
when a debit or final write is ambiguous, blocking further actions by design.

Implement per-effect idempotency or an appropriate transaction boundary, and a
tested reconciliation procedure with monitoring for old/failed claims. Test
failures after debit, after individual reward writes, and before final markers.
Do not expire/release ambiguous claims blindly. Keep raids disabled until shared
raid updates are verified under concurrency. These are account-state integrity
gates, even if minor presentation bugs are acceptable.

## Discord/browser continuity

The reviewed shared service enforces participation and current actor, and Mongo
updates use revision compare-and-swap and request deduplication. The existing
tests cover stale controls, cross-surface actions, serialized party recovery,
automatic turns and mode starts. A copied battle ID is not authority to read or
act. OAuth identity is taken from the session, never a body-supplied user ID.

However, **Discord does not currently generate a website battle link**. The
continuation command and shared renderer open Discord controls; there is no
site URL construction in these paths. A user can manually open the website and
select their ongoing durable battle, or use a constructed `?battle=...` URL.
Add a flag-aware link to the current durable battle to complete the intended
handoff. Legacy in-memory battles are not migrated into web continuity simply
by enabling the flag.

`/continue-battle` awaits service reads/replay before replying and does not defer
its initial response. Slow DB/replay work can exceed Discord's
[three-second initial response deadline](https://github.com/discord/discord-api-docs/blob/main/developers/interactions/receiving-and-responding.mdx).
Acknowledge first and edit the response, then test with delayed storage.

Client battle requests lack the timeout used by auth requests. Polling starts
every three seconds without an in-flight guard; slow requests can overlap and a
stalled action can keep controls busy until reload. Bound/abort requests and
serialize polling for a more reliable reconnect experience. Revision checks
already protect gameplay writes; these are availability/UX gaps rather than a
demonstrated authorization bypass.

## Security controls that passed inspection/tests

- OAuth uses the identify scope, a random state nonce, timing-safe comparison,
  age validation, and local-only return paths; code exchange has timeouts.
- Sessions are random opaque tokens stored by SHA-256 hash, explicitly checked
  for expiry, and deleted on logout. TTL cleanup is not the authorization check.
- Mutating battle/logout routes require the exact configured Origin. CORS allows
  only that site to read credentialed responses; service authorization separately
  prevents access by other users.
- Server validates action shape, revision and request ID, then checks gameplay
  legality. Browser projections omit opponent move inventory, held item, ability
  and private modifiers; full records are not returned by the HTTP adapter.
- Authenticated API responses use no-store. The client uses React rendering and
  contains no inspected `dangerouslySetInnerHTML`/eval path; auth tokens are not
  stored in browser localStorage. This is not an exhaustive XSS proof.

## Concrete deployment and acceptance sequence

1. Reserve/promote a **regional external static IP** for the VM and point the API
   hostname at it. A reserved address must actually be attached to the instance.
   See [GCP static external addresses](https://docs.cloud.google.com/vpc/docs/reserve-static-external-ip-address).
2. Serve the API behind a TLS reverse proxy with certificate renewal. Bind Node
   to loopback (`HTTP_HOST=127.0.0.1`); keep Mongo and Node's port private. Restrict
   management access, use a least-privilege VM identity, and verify database
   authentication, backups and restore. None of this VM configuration was observed.
3. Configure `WEB_SITE_ORIGIN=https://play.example.com`, `WEB_BASE_PATH=/`, and
   `WEB_DISCORD_REDIRECT_URI=https://api.example.com/api/auth/discord/callback`.
   Register the exact callback in Discord. Keep the client secret on the backend.
4. Configure Pages with the site custom domain and HTTPS. Build with
   `VITE_API_ORIGIN=https://api.example.com` and matching `WEB_BASE_PATH`.
   Query-string battle links need no SPA rewrite. A subpath must match on both
   backend and build; it does not solve cross-site cookies.
5. Add CI for root tests, web tests, and production build using locked installs.
   Current GitHub CI only runs backend Jest. A Pages workflow should upload only
   `web/dist`, use the `github-pages` environment, and grant deployment permissions
   only to the deploy job. Prefer manual production dispatch initially, then
   automatic main-branch deployment after acceptance. PRs should validate without
   publishing. See [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
6. Verify API startup/index creation and health under the actual process
   supervisor. Currently API startup failure sets `process.exitCode=1`, but the
   connected Discord client may keep the process alive with no HTTP listener;
   add readiness monitoring/fail-fast behavior rather than trusting process liveness.
7. In staging, use two participant accounts and one outsider: start in Discord,
   follow the website link through OAuth, act on both surfaces, click stale
   controls, race actions, reload/close/reopen, and restart the backend with the
   same ruleset. Verify one accepted revision, outsider denial, durable session
   continuity, and exact reward/debit outcomes. Exercise expired/logout sessions
   and interruption of Mongo/network access. Test all modes intended for launch.
8. Repeat real login and battle handoff on desktop and a physical phone, including
   links opened from Discord's browser. Verify TLS, cookie retention, CORS and
   callback return to the selected battle. Test cold-start latency and a long
   battle. Audio/touch polish can be triaged separately from auth failures.
9. Deploy API before the client, with flags controlled independently. Validate
   ruleset 2 compatibility before durable starts; do not expose incompatible
   retained records. Keep all production enable flags off until their gates pass.
   Rollback must preserve/reconcile outstanding completion and Auto claims.

## Deferred with explicit limits

SSE/WebSockets, restoring mode-specific replay menus after restart, historical
browser logs, and fine audio polish need not block a limited launch. Revisit
polling capacity and replay/document size when measured battle lengths or traffic
increase. Basic request limits remain required now. Static audio/music is large
but fetched separately; verify cold-device transfers before spending effort on
format changes. CSP and additional response hardening are worthwhile defense in
depth after inventorying required asset/API hosts; no CSP is currently configured
in the inspected client shell/API code.
