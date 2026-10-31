# Trainer initialization verification · 2026-10-31

Scope: U2 of the [first-slice plan](../plans/2026-10-30-1740-feat-web-first-playable-slice-plan.md),
stacked on the still-open shell PR [#242](https://github.com/ewei068/pokestar/pull/242).
The maintainer approved the [header/account study](../design/trainer-initialization/README.md)
before production UI implementation. Browser battle starts remain a later design
and implementation unit. No deployment, merge or production configuration changed.

## Automated checks

Checks used Node 24.22.1 and installed repository dependencies.

| Check | Observed result |
| --- | --- |
| `npm test` | 923 tests / 34 suites passed |
| `npm test --prefix web` | 134 tests / 28 suites passed after the logout/retry repair |
| `npm run build --prefix web` | Client TypeScript and production build passed with `/pokestar/` base |
| Changed backend source/test/script ESLint | Passed; existing React-version warning remains |
| `npm run typecheck` | Fails with 498 existing diagnostics; comparison found no new diagnostics |

The build retains existing nonfatal Virtua/Rollup warnings. A passing mocked
backend suite does not establish real database, provider or Discord behavior.

## Reproducible local Mongo check

Start MongoDB on loopback port 27017, install repository dependencies and run
from the repository root with Node 24.22.1:

```sh
node scripts/dev/verifyTrainerInitialization.js
```

The verifier uses the production Mongo adapter, shared trainer service, HTTP API
and persisted session store. It creates a randomly named
`pokestar_trainer_check_<16 hex characters>` database on
`mongodb://127.0.0.1:27017`, checks its name before use and drops it in cleanup.
It does not use the configured application database.

The final run passed:

- Sixteen concurrent mixed profile/id-only callers resolved one trainer with
  one configured starter allocation.
- Interleaved money, EXP, party and profile updates survived lifecycle refresh;
  stale regeneration recomputed from the winning values.
- An older valid session initialized its missing trainer through `/api/me`;
  an arbitrary query target was ignored.
- A separate Node process recovered the same session and trainer progress;
  repeated bootstrap granted no additional gameplay rewards.

The script creates and exercises the local unique index. Its result does not
verify the index or process-restart setup in production. Logs for this run were
`/tmp/pokestar-trainer-mongo-final.log`; the script is the retained reproducible
source rather than that temporary log.

## Browser checks

Production components were checked in seven states at each of 1280, 390 and
320 px: new trainer, returning trainer, missing profile, long name/large balance,
maximum level, recoverable failure and pending loading. The local harness used
actual trainer/session Mongo storage and the production API; battle data came
from the named `dense` fixture. No live Discord OAuth provider was involved.

The 21 state/width checks found no horizontal overflow or JavaScript page errors.
Additional checks covered retry recovery within the same session, sign-out
revocation, failed-avatar fallback, keyboard Escape/focus return, account-panel
scrolling, direct battle navigation, Back and reload. Desktop, phone and long-name
captures were visually checked against the approved study. An intentionally
failed avatar request and the existing missing favicon were not page exceptions.
Responsive browser checks do not establish physical-device acceptance.

## Review and repairs

Full CE review completed ten lenses: correctness, security, adversarial,
project standards, testing, maintainability, performance, API contract,
reliability and frontend races. A different-provider CLI was unavailable, so
the adversarial pass ran in process; no cross-provider review is claimed.

Two P2 findings were accepted. The maintained effort/discovery docs now record
the approved design, implemented boundaries and verification limits. The second
finding identified trainer retry racing an in-flight sign out; its implementation
now prevents retry from starting another trainer request while an auth operation
is busy. The new hook regression first reproduced the extra `/api/me` request,
then passed with the repair. All 19 focused auth/trainer checks and the final
134-test client suite passed; client TypeScript and production build also passed
again. No backend runtime change was needed for either review repair.

## Remaining acceptance and next unit

Run live OAuth for new and returning trainers, recover an older authenticated
session without a trainer, and continue the same account through Discord to
establish cross-surface acceptance. Check target-environment uniqueness and
physical-device behavior separately. Local evidence does not close those gates.
Deploy the supporting API before the client; an older ID-only API leaves the
trainer view unavailable with retry.

U3 next needs collection/detail design approval, server-enforced ownership and
bounded projections. Prove durable, replay-safe **5 EXP / 10 money** interaction
grants before enabling its rewarded explicit reads. Authentication, bootstrap,
polling and lifecycle refresh stay outside that grant boundary. Party/presets,
NPC starts and saved receipts follow their own plan units.
