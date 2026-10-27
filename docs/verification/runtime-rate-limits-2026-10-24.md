# Runtime maintenance and HTTP limits — 2026-10-24

Scope: implement the [accepted maintenance plan](../plans/2026-10-24-web-battler-runtime-and-rate-limits.md)
locally. No deployment, production runtime switch, flag change, credential change,
domain purchase or Discord link rollout occurred. Real infrastructure verification
is still required; passing mocks does not establish MongoDB driver support.

## Runtime and package evidence

Official Node release index selected **24.22.1**, LTS Krypton, released
2026-10-20, bundled **npm 11.19.1**. The Darwin arm64 archive was checked against
the official SHA256 manifest and installed under `/tmp/pokestar-node24`; no
global/default Node installation changed. `.nvmrc` and the new CI lane pin the
same patch. Existing Node 18.20.4 remains a temporary comparison lane, not a
supported production recommendation. Engines metadata was left unchanged until
actual deployment compatibility is established.

Unchanged-lock Node 24 baseline: root/web `npm ci` succeeded; **886 backend
tests / 31 suites**, **105 client tests / 23 suites**, client TypeScript and
production build passed. Initial lock SHA256 values:

- Root: `b47a4bbf25c163ef2155b5557fc63ad0af846c816eebec64b08bf2ee3eb71fbb`
- Web: `d60b30b5abb104d5559560230592d73885a841a138eb79b7bae103c481204e35`

Updated exact direct versions: Express **4.22.3**, CORS **2.8.6**, new
express-rate-limit **8.7.1**. Resolved body-parser **1.20.9**, proxy-addr
**2.0.8**, path-to-regexp **0.1.13** within parent ranges. Lock inspection found
only the HTTP subtree and new limiter dependencies changed versions: cookies,
URL encoding, finalhandler/send/serve-static, parser/query helpers and their
object-intrinsic helpers. Cookie-parser's existing 0.7.2 cookie copy deduplicated.
Shared HTTP helpers can also affect discordbotlist's Express consumer; existing
web/vote tests exercise their public behavior. No blanket update or forced audit
fix was used. Deferred direct package versions and the web lock stayed unchanged.

Upstream Express history was reviewed for route matching, query arrays, redirect
encoding and parser changes; CORS 2.8.6 changes documentation/package contents.
Parser tests check gzip action payload preservation and rejection of malformed,
oversized, oversized-after-inflation and corrupt gzip input before route work.

## Audit residuals

After the narrow update, root production audit: **16 affected package entries**
(1 critical, 8 high, 7 moderate), down from 24. Full root audit: **25**
(1 critical, 14 high, 9 moderate, 1 low). Web full audit: **0**. Counts are npm
affected-package entries, including parents, not independent exploits.

The packages below remain unchanged under the conservative-upgrade constraint.
These are source-based exposure observations, not exploit proofs or guarantees.
The serious residuals still gate public cutover until their use is checked in
the actual deployment or a separate, verified update fixes them.

| Residual entries | Observed use and current mitigation / required follow-up |
| --- | --- |
| axios; follow-redirects; form-data (critical) | Bot-list calls POST JSON to configured constant HTTPS URLs; the image-download script is separate. No web API forwards request-controlled Axios config or multipart fields. Review redirects, response-size limits, outbound proxy settings and bot-list behavior before a separate Axios update; do not expose a generic fetch/upload endpoint. |
| discord.js; @discordjs/rest; file-type; undici; ws | Discord REST/Gateway and discordbotlist clients remain old. No public WebSocket listener is added here, but outbound parsing and attachment processing remain exposed to remote inputs. Inventory actual attachment flows and verify a coordinated Discord dependency update against the real Gateway; HTTP quotas do not fix these advisories. |
| mongodb; socks; ip | Driver is constructed from operator configuration; no HTTP-controlled connection/proxy URL. Source does not enable command monitoring. Verify real authentication, event logging and SOCKS configuration; keep Mongo private and do not log credentials. Node 24 support for driver 5.2.0 is not established. |
| flatted | log4js uses it for event serialization/deserialization, including cluster IPC. Configured appenders are local files/console. Confirm single-process topology and absence of untrusted IPC/log receivers; review a compatible fix separately. |
| lodash | Transitive Discord builder validation dependency; no direct application template/unset/omit calls found. Inspect upstream call reachability before accepting exposure or changing its locked version. |
| nanoid; shortid | Application calls shortid.generate without request-controlled size; legacy IDs remain in use. These are not web session/OAuth secrets. Preserve persisted formats while reviewing an upgrade separately. |
| uuid | Application uses v4 without supplied output buffers; reported buffer-bound issues concern other APIs. No forced major update; review migration separately. |

Additional dev-only entries are `@babel/core`, `ajv`,
`baseline-browser-mapping`, `brace-expansion`, `browserslist`, `cross-spawn`,
`js-yaml`, `minimatch` and `picomatch`. They process source/config/glob input in
root tooling rather than serving web requests. Run builds/tests in trusted
checkout CI, and review tooling maintenance separately. The zero web audit does
not prove browser/auth behavior is secure.

## Verification and promotion gates

Final integrated local checks, completed **2026-10-25**:

| Check | Result |
| --- | --- |
| Backend, Node 24.22.1 and Node 18.20.4 | 899 tests / 33 suites passed on each |
| Client, both runtimes | 116 tests / 25 suites passed on each |
| Client TypeScript + production build, both runtimes | Passed, existing non-fatal Virtua annotation warnings |
| Changed JavaScript ESLint and whitespace | Passed; existing React-detection warning |
| Root TypeScript | Existing failures remain; no new diagnostic signatures against pre-maintenance baseline |
| Final root lock `npm ci`, Node 24 | Passed; web lock unchanged |
| Query parser regression | Array-shaped cursors/codes rejected before battle work/OAuth exchange |
| Simplification | One redundant comment removed; no runtime or proof-test changes |

HTTP integration tests use real local requests with injected sessions/service and
OAuth exchange. They cover quota boundaries/reset, per-user/session grouping,
independent buckets, no mutation/exchange on denial, IPv6 grouping, forged
forwarding headers, proxy configuration and exposed retry/security headers.
Client tests cover all polling triggers during cooldown, retry recovery,
single-flight/unmount/timeout cancellation, stale responses, uncertain writes,
no automatic POST retries and retaining the login battle link. New tests were
verified after implementation; no red-before-implementation claim is made.

Independent `ce-code-review` covered correctness, security, project standards,
testing, maintainability, API contracts, reliability, adversarial cases and client
request races. All nine passes found no actionable defects. No external peer CLI
was available, so the adversarial pass used an independent in-process reviewer;
this is not an external security audit. Review run:
`20261025-111829-2d715ba3`.

Before changing the production runtime, record and test:

1. VM OS/architecture, Node executable used by the actual service supervisor,
   process count, Mongo server version/topology/authentication and driver support.
2. Exact lockfiles on staging Node 24.22.1; real DB connection/index creation,
   session create/read/expiry, conditional debit using disposable records,
   durable battle restart with the same ruleset, reconnect and bot startup.
3. Real Discord OAuth/Gateway, legitimate vote webhooks, outgoing bot-list calls
   and microstats collection. Check two tabs, two users behind one IP, each
   quota's 429 and recovery, and no automatic POST replay.
4. One local TLS proxy with forwarding headers replaced, Node bound to loopback,
   Node/Mongo ports private, distinct real clients observed correctly and forged
   headers unable to change quota identity. Add proxy body/connection/time limits.
5. HTTPS `play`/`api` subdomains, reserved GCP IP, exact OAuth redirect and CORS
   origin. GitHub Pages publishing workflow and infrastructure setup are separate.
6. Resolve or explicitly assess remaining serious dependency exposures, then
   promote the exact verified runtime/config. Retain prior runtime/artifacts for
   rollback without discarding durable completion/payment claims. Keep rollout
   flags unchanged until acceptance; links remain intentionally unadvertised.

## Sources

- [Node release index](https://nodejs.org/dist/index.json) and
  [24.22.1 checksums](https://nodejs.org/dist/v24.22.1/SHASUMS256.txt).
- [Express 4 history](https://raw.githubusercontent.com/expressjs/express/4.x/History.md),
  [CORS history](https://raw.githubusercontent.com/expressjs/cors/master/HISTORY.md).
- npm resolved tree and audit JSON captured locally under
  `/tmp/pokestar-maintenance-{prod,full,web}-audit.json` (temporary evidence;
  rerun audits when deploying because advisories change).
- [Rate-limit configuration](https://express-rate-limit.mintlify.app/reference/configuration)
  and [proxy guidance](https://express-rate-limit.mintlify.app/guides/troubleshooting-proxy-issues).
