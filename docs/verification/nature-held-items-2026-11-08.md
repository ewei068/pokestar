# Nature and held-item implementation acceptance

Local acceptance completed on 2026-11-08, America/Los_Angeles, for the
[approved design](../design/nature-held-items/README.md) and
[implementation plan](../plans/2026-11-08-1812-feat-web-nature-held-items-plan.md).
The maintainer's later direction governs the final name and module boundaries:
**Item & nature**, with domain operations rather than a page service.

## Delivered behavior

Collection inspection enters the existing Train workspace. The adjacent
Item & nature tab applies held-item selection and Remove directly. Selecting a
nature previews all six server-calculated stats; Change nature applies it for
one generic Mint. The tab has no extra confirmation. Bag Mint/Equip opens a
read-only active-party formation, then the selected Pokémon's confirmation.
Back, Close, outside click and Escape before submission spend nothing.
Quantity labels use `Owned: {number}`; duplicate inventory panels, the nature
header cost subtitle and old-item-return footer are absent.

Nature rules live in `src/services/pokemonNature.js`; held-item transfers extend
`src/services/pokemon.js`. A small backpack helper prepares exact inventory
changes and their guarded inverse. Discord and web call the same operations;
the web player service composes projections and handles its participation grant.
The domain operations themselves grant nothing. Changed web nature operations
award 10 trainer EXP / 25 money, held operations 5/10; no-ops and reads grant zero.
Existing Discord participation routing is retained.

Authenticated actor/origin checks and the existing read/action quotas cover the
new build read and nature/held-item routes. The browser shares an account write
gate, invalidates affected caches after settlement, discards departed results,
and never replays a mutation. An uncertain result requires explicit Pokémon/Bag
refresh. Authoritative absence reconciles a removed target without blocking
changes to other owned Pokémon. Train unmounts on tab departure and never resumes
itself when revisited.

## Automated checks

Node 24 was used for all checks.

| Check | Observed result |
| --- | --- |
| `npm test -- --runInBand` | 46 suites, 1,022 tests passed |
| `npm test --prefix web` | 223 tests passed, no forced exit |
| `npm run build --prefix web` | TypeScript and root production bundle passed |
| `WEB_BASE_PATH=/pokestar/ npm run build --prefix web` | TypeScript and subpath production bundle passed |
| ESLint on changed backend source/tests | Zero errors; three existing JSDoc warnings |
| `npm run typecheck` | Still fails: 478 diagnostics versus 498 before implementation; normalized comparison has zero additions and 20 removals |
| `git diff --check` | Passed |

New domain tests cover all 25 canonical previews, equipped stats, distinct
neutral natures, no-ops, ownership/stock, raw observed-state guards, narrow
patches, overlapping writes, compensation refusal and ambiguous outcomes.
Discord tests cover original-nature binding and the held-result envelope error
paths. Client tests cover direct/confirmed triggers, target/account lifetime,
shared pending gates, previews, no replay, tab/history/collection return,
last-copy detail and removed-target recovery.

## Real local persistence and browser acceptance

A separate standalone MongoDB on loopback port 27149 held disposable fixture
trainers/Pokémon. A local Express API and static root/subpath bundles used a
fixture session; no real account, production database or credentials were used.
Real HTTP checks reread persisted Pokémon, inventory and trainer money after
normal nature changes, give/swap/remove, current-choice no-ops, shortages,
actor/owner/origin rejection and stale choices.

Controlled interception of the Pokémon write returned a definitive no-match:
the real inventory write was compensated once, with no Pokémon change or grant.
A second interception persisted the Pokémon write and then threw, simulating a
lost database response: HTTP returned 503, the saved change and Mint debit
remained, no grant/refund/replay occurred, and GET exposed that saved state.
These are controlled outcome tests, not a claim of crash recovery.

Headless Chrome exercised the production bundles against that API:

- Direct nature preview/application, held swap and Remove; preview alone sent
  no mutation, and direct actions opened no confirmation.
- Train departure during a delayed submitted tick; competing controls stayed
  blocked until settlement, and revisiting Train did not restart it.
- Collection return retained inspected Pokémon and unrelated URL parameters.
- Bag cancel/confirm, read-only party selection, last held copy with explicit
  and implicit desktop selection, last Mint, zero-owned detail and focus fallback.
  Depleted items did not become owned-list rows.
- Lost-response Bag flow, close/reopen hold, explicit read-only refresh and no
  automatic replay; Escape restored focus to the invoking action.
- Expired authentication removed the editor after one rejected submission.
- 1280, 831, 390 and 320 px widths, including 320×480 confirmation scrolling:
  all stats remained reachable, actions stayed above phone navigation, and
  document width did not overflow. Root and `/pokestar/` mutation routes and
  subpath item artwork worked. No page script errors were observed.

A final visual check repaired shared control specificity so primary actions
inside `ui-controls` retain dark text on gold; disabled actions retain the
shared disabled palette. The browser verified both computed states. Native
dialog width and scroll bounds were checked at the short-phone size. A controlled
build response with a 32-character unbroken nickname and missing portrait exposed
confirmation-name overflow; scoped wrapping repaired it. That browser check and
desktop outside cancellation then passed.

[Desktop](nature-held-items-2026-11-08-assets/desktop.png) ·
[320×480 confirmation after scrolling](nature-held-items-2026-11-08-assets/phone-confirmation.png).
Machine-local harnesses/logs use `/tmp/pokestar-nature-*`; screenshots above are
preserved in the repository.

## Review and limits

A combined simplification pass applied three small reuse/clarity improvements
without pruning proof tests. One independent combined CE code review followed
the repository's routing preference. Completed receipt:
`/tmp/compound-engineering-501/ce-code-review/20261108-202402-426fa09b/review.json`.

Both P2 findings were accepted and fixed: capture Bag selection metadata before
cache settlement can remove the last copy, and distinguish definitive rejection
from uncertainty while allowing refresh to reconcile a subsequently removed
target. New regressions failed before each repair and passed afterward. The
production browser reproduced the Bag race before repair and passed explicit
and implicit selection afterward. No actionable finding remains; no second
review pipeline was run.

Cross-document crashes, ambiguous outcomes, refused compensation and legacy
writers can still leave partial state, as explicitly accepted. No transactions,
receipts, recovery worker, mutex or general writer migration were introduced.
No deployment, publishing, live Discord/OAuth, physical-device or process-crash
acceptance is claimed. Discord compatibility is covered by mocked adapter tests.
