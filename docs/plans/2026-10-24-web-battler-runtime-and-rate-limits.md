---
title: Conservative runtime maintenance and web battle rate limits
type: fix
date: 2026-10-24
product_contract_source: ce-plan-bootstrap
---

# Conservative runtime maintenance and web battle rate limits

## Goal and scope

Prepare the silent web battler rollout with a supported Node runtime, a narrowly
reviewed package update, and HTTP abuse protection that leaves normal play alone.
This is an implementation plan, not evidence that upgrades have been tested.
No dependencies, runtime configuration or production flags changed during planning.

Implementation checkpoint, **2026-10-25**: U1's local Node 24.22.1 lane and CI
configuration, U2's HTTP package batch, U3's quotas/proxy configuration and U4's
client recovery are implemented. U1's real-runtime promotion and U5's staging
acceptance remain open. See the [verification record](../verification/runtime-rate-limits-2026-10-24.md)
for actual checks and residual advisories; the original sequence below remains
the accepted contract.

R1. Preserve Discord gameplay, OAuth/session security, persistence formats and
existing vote provider behavior. Do not upgrade a package whose compatibility is
uncertain; defer it with its risk and required follow-up evidence.
R2. Target Node 24 LTS, but do not switch the production VM until its actual Mongo
server/driver, OS and process supervisor compatibility are established.
R3. Use express-rate-limit with doubled initial budgets: 40 authentication
requests/minute/IP, 240 battle reads/minute/authenticated Discord user, and
60 actions/minute/authenticated Discord user. These are tuning defaults, not
measured capacity guarantees.
R4. Return useful 429 responses and make browser polling respect the retry delay.
R5. Keep the rollout silent: no Discord-to-web links or new announcements.

Out of scope: Express 5, MongoDB major migration, transactions/reconciliation,
Discord.js modernization, rendering/audio work, Pages deployment, live domain
purchase, VM provisioning and production cutover. Existing readiness gates remain.

## Evidence and decisions

- Root lockfile: Express 4.18.2, MongoDB 5.2.0, Axios 1.4.0, Discord.js 14.9.0,
  CORS 2.8.5. Root CI selects Node 18; local Node is 18.20.4. Prior validation:
  886 backend tests, 105 client tests and web build passed. Root typecheck has
  pre-existing failures; the vote fix added no diagnostic lines.
- `src/index.js` mounts the vote route and API in one bot process. JSON parsing
  precedes routing. Discord's limiter does not protect HTTP requests.
- `src/web/battleApi.js` owns CORS and sessions. `requireSession` sets
  `request.discordUserId`, which is the only acceptable user-limit key.
- `web/src/http.ts` currently discards response retry headers. Battle polling in
  `web/src/battles/useBattleSession.ts` runs every three seconds without an
  in-flight guard. Auth requests already have a 15-second timeout.
- `src/database/mongoHandler.js` and callers depend on `findOneAndUpdate` returning
  a wrapper with `.value`. Do not casually upgrade MongoDB to a major version
  with different return defaults. Node minimum engine ranges alone do not prove
  a legacy driver is supported on Node 24.
- Session-settled, user-directed: conservative upgrades and doubled initial limits.
  Reject blanket dependency updates/forced audit fixes and tighter initial budgets.
- Session-settled, user-directed: silent rollout; links remain deferred.
- Implementation choice: one Node process and one local TLS proxy initially.
  Verify this assumption before deployment. Use separate in-memory limiter stores;
  no Redis required unless multiple processes/instances must share quotas.

## Package disposition

Versions below were read from npm registry metadata on 2026-10-24. Recheck
advisories and release metadata before execution; do not silently replace targets
with newer releases. Candidate means eligible for staged verification, not safe
for an untested production install.

| Package | Locked → candidate | Disposition and reason |
| --- | --- | --- |
| express | 4.18.2 → 4.22.3 | First batch: stays on Express 4; review query/redirect/parser behavior and HTTP tests |
| body-parser, transitive | 1.20.1 → 1.20.9 | First batch: patched 1.x parser; Express 4.22.3 permits it via `~1.20.5`; ensure lockfile actually selects it |
| proxy-addr, transitive | 2.0.7 → 2.0.8 | First batch: compatible with Express's `~2.0.7`; verify trusted-proxy behavior before enabling IP quotas |
| path-to-regexp, transitive | inspect lock → 0.1.13 | Resolve within Express 4's declared range; test existing `/api` route matching; no major override |
| cors | 2.8.5 → 2.8.6 | First batch: upstream notes describe documentation/package-content cleanup; retain exact-origin credentials policy |
| express-rate-limit | absent → 8.7.1 | New dependency for U3; declares Node >=16 and Express >=4.11; explicit settings rather than defaults |
| axios | 1.4.0 → 1.20.0 available | Hold. Large accumulated minor-release jump and documented runtime option compatibility effects; review actual bot-list POST/image-download behavior and proxy/redirect handling separately |
| mongodb | 5.2.0 → 5.9.2 available within range | Hold. Real server version/topology and Node 24 compatibility not established; payment helper return semantics are consequential |
| discord.js | 14.9.0 → 14.27.0 available | Hold. Wide accumulated changes across REST/gateway/builders; full real Discord acceptance is not established |
| uuid / shortid | 9.0.0 / 2.2.16 | Hold. No ID-format migration or forced major updates; current use includes persisted/component identifiers |
| dotenv / log4js / microstats / discordbotlist / seedrandom | retain lock | No reviewed reason to update in this batch; include their startup behavior in Node validation |
| compression / cookie-parser | 1.8.2 / 1.4.7 | Retain direct versions; review any necessary transitive lock changes |
| Jest / TypeScript / ESLint / React / Vite / Node types | retain lock | Separate tooling modernization; do not mix major or broad tooling changes into security maintenance |

First-batch transitive changes should come through compatible parent ranges.
Inspect the entire resulting lockfile diff and audit it; update a necessary nested
copy within its parent's permitted range where applicable. Do not use global
major-version overrides or assume a parent bump refreshed every nested copy.
Preserve unrelated versions. Never use blanket `npm update` or `audit fix --force`.

Holding packages leaves security advisories unresolved. Record each residual's
reachability and mitigation; do not label a partial upgrade a clean security bill.
If a reachable serious issue cannot be safely remedied in scope, stop public
cutover and propose a separate change rather than making a speculative upgrade.

## Implementation sequence

### U1. Establish a Node 24 compatibility lane

Files: new `.nvmrc`, root and `web/package.json` runtime metadata as appropriate,
`.github/workflows/test.yml`, `web/README.md`, and the effort verification record.

1. Record current Node/npm versions, both lockfile hashes and existing validation
   results. Choose an exact supported Node 24 patch from the official release
   index at execution time and pin the same patch locally and in CI. Record its
   bundled npm version. Do not globally replace the existing installation.
2. In an isolated checkout/environment, install the unchanged locks under Node 24
   using `npm ci` for root and web. Do not regenerate locks merely to switch Node.
3. Run backend tests, client tests, client TypeScript/build, targeted JS lint, and
   compare root typecheck diagnostics against baseline. Tests and web build run
   on Node 24 in CI; root's pre-existing typecheck failures are not silently fixed
   or represented as passing. Keep the old CI lane temporarily for comparison.
4. Verify actual VM OS/architecture and supervisor executable path, process count,
   Mongo server version/topology/auth method and current driver support. The repo
   does not establish these deployment facts. Perform a real staging DB connection,
   index creation, session create/read/expiry, conditional debit in disposable
   records, and same-ruleset battle restart. Test bot startup, Gateway connection,
   vote handling, outgoing bot-list requests and microstats collection too.
5. If the driver/runtime combination remains uncertain or tests fail, stop the
   production runtime promotion. Keep the current deployment intact and propose
   the minimal separate compatibility work. Do not silently upgrade MongoDB,
   switch to another unverified Node version, or call Node 18 production-safe.
6. Once compatibility is established, make Node 24 the canonical lane and runtime
   metadata. Keep the previous release/runtime available for operational rollback.

Execution note: smoke checks and existing suites are the first evidence; adding
unit tests that only assert a version string adds no useful safety.

### U2. Apply the narrow HTTP package batch

Files: root `package.json` and `package-lock.json`; existing
`src/web/__tests__/battleApi.test.js`, `discordOAuth.test.js`, `voteWebhook.test.js`;
add focused parser integration coverage at `src/web/__tests__/httpParsing.test.js`
if no current test exercises the application's parser boundary.

Depends on U1's local/CI compatibility evidence, not on changing the live VM.
Update only the first-batch packages above. Keep Express 4 and CommonJS. Inspect
npm's resolved dependency tree and the lock diff for the patched parser/proxy
packages and unintended changes. Repeat production and full-dependency audits for
root and web; distinguish runtime exposure from build/dev exposure.

Verify valid/invalid OAuth state, secure cookies, exact CORS origin, preflight,
logout revocation, malformed/array query parameters, malformed/oversized JSON,
compressed JSON and existing vote status/payload behavior. Confirm no regression
in paths or redirects. Run the existing backend suite and web suite/build with
this lock, plus the staging smoke checks from U1. Retain each update only when its
release notes, resolved tree and verification support it; otherwise revert that
candidate and record the unresolved advisory. No forced upgrade to make an audit
count look better.

### U3. Add explicit HTTP limits and proxy configuration

Files: new `src/web/rateLimits.js`, `src/web/battleApi.js`, `src/index.js`, `.env.in`,
new `src/web/__tests__/rateLimits.test.js`, existing `battleApi.test.js`, deployment
notes in `web/README.md`. Add express-rate-limit 8.7.1 to the root manifest/lock.

Budgets use separate limiter instances/stores with a 60-second window:

- General `/api` safety ceiling: proposed **1,200 requests/minute/IP**, including
  failed authentication. This extra ceiling is an implementation default, not a
  user-requested doubling. Avoid placing `/vote` under browser quotas.
- Login initiation and OAuth callback: independent **40/minute/IP** buckets so
  initiation traffic cannot consume the callback's budget.
- `/api/battles` and `/api/battles/:id` GET/HEAD: shared **240/minute/Discord user**
  across battles/tabs/sessions, after `requireSession` and before battle work.
- `/api/battles/:id/actions`: **60/minute/Discord user**, after origin/session
  validation and before simulation or writes. Invalid actions still consume quota.
- Catalog, `/me` and logout use the general ceiling; logout must not consume or
  depend on the action quota. OPTIONS preflights do not consume quotas.

Apply `/api` CORS and no-store headers before limiter responses so legitimate
cross-origin clients can read 429s. Expose `Retry-After` to the configured site.
Use standard rate-limit headers and disable legacy headers. Return stable JSON
`{ error: "rate_limited" }` with HTTP 429 and `Retry-After` seconds, including a
readable response on callback throttling; do not exchange an OAuth code or clear
its state cookie when throttled. A callback retry is bounded by existing OAuth
expiry; restarting sign-in remains the recovery path.

IP keys use the library's IPv6-safe default; do not implement a naive raw-IP key.
User keys come exclusively from `request.discordUserId`, never body/query/header
identity. Do not skip successful reads: polling and replay cost still count.

Keep `trust proxy` disabled by default. For a verified single reverse proxy on the
VM, configure trust for the actual loopback peer, bind Node to loopback, strip or
replace incoming forwarding headers at the proxy, and ensure port 3000 is not
public. Do not set `trust proxy=true` or copy a hop count without verifying all
paths. Document any added configuration in `.env.in`. The app limiter protects
route work; edge body/connection/time limits protect work occurring before it,
including the current global JSON parser.

Tests: exactly N accepted then N+1 returns 429; reset permits requests; two users
at the same IP have independent user budgets; one user's two sessions share a
budget; IPv6 handling and forged X-Forwarded-For under untrusted connections;
proxy configuration; preflight exemption; denied requests never reach OAuth,
replay or mutation functions; 429 carries CORS/no-store/Retry-After; callbacks and
logout are not starved by login/action buckets. Use injected small test limits
and deterministic clocks rather than thousands of requests or real-minute waits.

### U4. Make the client tolerate limits without retrying writes

Files: `web/src/http.ts`, `web/src/battles/useBattleSession.ts`, relevant auth/list
screens only where retry messaging is needed; new `web/src/http.test.ts` and
`web/src/battles/useBattleSession.test.ts`, existing `web/src/auth/auth.test.ts`.

Preserve ApiError's status/code behavior and add parsed retry timing. On 429,
polling pauses until the retry deadline; visibility/focus/manual refresh must not
bypass it. Only one poll can be in flight. Add bounded request cancellation so a
hung poll does not occupy the slot forever; abort on unmount. After the deadline,
resume one read and normal visible-page polling. Honor a valid Retry-After and use
a bounded fallback for absent/malformed headers. Retain existing monotonic
revision/state-ID and playback protections.

Never automatically replay a battle POST after 429, timeout or network error.
Show the cooldown; permit a deliberate new action only after refresh/cooldown.
A timeout may have committed server-side, so refresh state before retrying.
Login initiation similarly shows retry guidance and retains the intended battle.
Do not rewrite OAuth, store tokens in localStorage, or remove Origin checks.

Tests: 429 pauses all poll triggers; reset resumes one request; missing/bad header
uses fallback; network timeout releases the in-flight slot; unmount cancels reads;
no automatic action retry; 401 remains session-expired and 404 remains unavailable;
login return-to survives rate limiting; stale responses cannot roll state back.

### U5. Validate staging and prepare an explicit promotion record

Files: `docs/efforts/web-battler.md`, `web/README.md`, and the existing readiness
record. No production changes occur as part of writing this plan.

Use the exact Node patch and locks accepted above in staging. Verify real OAuth,
normal two-tab battle use, two users behind one IP, crossing each quota, recovering
from 429, Mongo reconnect and same-ruleset restart, and legitimate vote requests.
Check the proxy sees distinct real clients, rejects forged forwarding identities,
and leaves Node/Mongo private. Log aggregate 429 counts by bucket and route without
cookies, tokens, OAuth codes or secrets. Watch event-loop latency and DB failures.

Promote only the verified runtime/package/config combination. Update the actual
supervisor to the pinned executable, then restart once in a planned window; merely
changing an interactive shell's Node does not update a service. Preserve prior
artifacts and config for rollback. Rollback of runtime must continue to honor
outstanding durable completion/Auto claims. Do not enable production flags or
clear battles as a side effect of maintenance. Keep unadvertised rollout links as-is.

## Verification contract and completion

The maintenance change is complete when the Node 24 compatibility lane and staging
runtime pass, the HTTP batch has reviewed locks and passing regression checks, the
three agreed quotas and general ceiling enforce correctly, and the browser backs
off without duplicate writes. Record audit residuals and actual tested runtime,
database and proxy topology. Unit tests alone do not establish live compatibility.

Blocking production facts: VM OS/supervisor/process count, Mongo server/runtime
compatibility, and proxy topology. These do not prevent implementing/testing U2–U4
locally once U1's local lane is viable; they prevent claiming production readiness.
If a deferred package blocks those gates, propose separate work rather than
ignoring the user's conservative-upgrade constraint.

## Sources

- `docs/efforts/web-battler.md` and `docs/verification/production-readiness-2026-10-24.md`.
- npm registry metadata (`npm outdated --json`, `npm view` for versions, engines,
  peer dependencies and transitive ranges); read-only queries, no installs.
- [Node release status](https://nodejs.org/en/about/previous-releases).
- [Express 4 change history](https://raw.githubusercontent.com/expressjs/express/4.x/History.md).
- [body-parser advisory and patched versions](https://github.com/expressjs/body-parser/security/advisories/GHSA-27r3-jxmh-p828).
- [CORS change history](https://raw.githubusercontent.com/expressjs/cors/master/HISTORY.md).
- [Axios 1.20 release](https://github.com/axios/axios/releases/tag/v1.20.0).
- [MongoDB compatibility reference](https://www.mongodb.com/docs/drivers/compatibility/?driver-language=javascript&javascript-driver-framework=nodejs)
  and [5.9.2 history](https://raw.githubusercontent.com/mongodb/node-mongodb-native/v5.9.2/HISTORY.md).
  The dynamic compatibility table did not establish Node 24 support for this
  legacy driver during this investigation; this remains a verification gate.
- [express-rate-limit configuration](https://express-rate-limit.mintlify.app/reference/configuration),
  [store behavior](https://express-rate-limit.mintlify.app/overview), and
  [proxy pitfalls](https://express-rate-limit.mintlify.app/guides/troubleshooting-proxy-issues).
