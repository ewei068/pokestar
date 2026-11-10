# Equipment implementation acceptance

Local acceptance on 2026-11-10, America/Los_Angeles, implements the
[approved equipment design](../design/equipment/README.md#implementation-approval--2026-11-09).
The maintainer authorized automatic execution after internal planning/review;
the internal implementation plan is not a reader-facing project artifact.

## Delivered behavior

The inspected Pokémon workspace now has Train, Item & nature, and Equipment
alongside the existing collection return path. Equipment uses actual item art,
base-stat subtitles and a six-piece selector. Upgrade and Reroll share one spend
section. Primary/secondary show the server's next-level values; reroll selection
shows unknown value and quality, and an unknown modifier only for a pool with
multiple options. Confirm reroll spends once; selection and Cancel spend nothing.
The removed risk subtitle, inline possible-results disclosure and six-stat
level-up preview are absent. Optional Equipment guide exposes configured pools,
quality probabilities, rounded ranges and a quality/level calculator.

`pokemonEquipment` owns shared Discord/web operations. It validates ownership,
complete persisted pieces, observed equipment and resources; debits money and
matching Shards together; saves a narrow guarded Pokémon patch; and emits quest
progress after confirmed persistence. An identical roll is a paid success.
Adapters award equipment participation (15 trainer EXP, zero money) once after
confirmed success. Quest/grant failure preserves the saved change as a warning.
A definitive Pokémon no-match permits one guarded inverse. An ambiguous write
never triggers a blind refund or mutation retry. This preserves the accepted
cross-document reliability limits; it adds no transaction, durable receipt or
legacy-writer migration.

Authenticated session actor, ownership, origin, input allowlists and existing
read/action quotas cover equipment endpoints. The client shares the account's
pending and uncertain-build gates, discards departed/account-old results,
invalidates affected data, and refreshes Pokémon, equipment, build, Bag and
trainer explicitly after uncertain results. Refresh performs reads only.

## Automated checks

| Check | Observed result |
| --- | --- |
| Full backend Jest | 48 suites, 1,069 tests passed |
| Full client tests | 243 tests passed, natural process exit |
| Root production build | TypeScript and bundle passed |
| `/pokestar/` production build | TypeScript and bundle passed |
| Scoped backend ESLint | Zero errors; two existing event-header JSDoc warnings |
| Backend checkJs | Still fails: 475 diagnostics versus 478 at the parent head; normalized comparison has zero additions and three removals |
| `git diff --check` | Passed |

Focused red checks preceded the domain, HTTP, client-data and panel implementations.
Regressions cover invalid/incomplete equipment, guards/inverses, same-value paid
results, adapter warning handling, account/departure lifecycle, cache invalidation,
unknown-response reconciliation, previews, caps/shortages, modal focus and routing.
The full backend evidence was reused after later client-only changes.

## Disposable persistence and production browser

A separate standalone MongoDB and local HTTP server used a disposable fixture
session/account. No real account, OAuth flow, production database or credentials
were involved. Persisted-state HTTP checks passed pure grantless reads,
auth/actor/owner/origin rejection, invalid input, exact money/Shard costs and
stats, quest progress and participation, stale expectations, random-roll reload,
identical paid primary rolls, quality endpoints, level 9→10 and capped rerolls.
Two concurrent last-stock requests produced exactly one success/debit/grant.

Controlled write outcomes exercised definitive rejection and compensation,
concurrent Pokémon changes, refused inverse after resource changes, applied-but-
lost debit/Pokémon responses, and saved quest/grant warnings. Refresh retained
actual persisted outcomes and did not replay purchases or grants. These are
bounded outcome tests, not crash-recovery guarantees.

Headless production Chrome against that real API passed:

- Upgrade and selected secondary reroll: exact request snapshot, resource deltas,
  15 EXP grant, persisted reload and no reload POST.
- Fixed-primary and multi-option modifier unknown previews; selection/Cancel
  without spending.
- Guide pools, quality/level calculation, substat independence, scrolling,
  Escape/Close and focus return.
- Desktop 1280px, maintainer 796px, phone 390px, narrow 320px and short 320×480px:
  no document overflow, reachable spend controls, readable long nickname and
  fallback fonts.
- Stale response and applied-but-lost response: blocked editors, read-only
  refresh, actual saved equipment and no replay.
- Pending-purchase departure and return refresh immediately on settlement, with
  exactly one POST and no automatic training. Shortages disable spending; controlled
  missing Pokémon art uses the fallback. Short-phone guide scrolling and Escape work.
- Root and `/pokestar/` routes, six loaded local equipment images, tab changes,
  direct-link return and expired-session account reset.

One independent combined source review covered spending/guards, authorization,
Discord expectations, client lifetime/cache recovery, UI and requirements. It
found no actionable issues. A separate executed browser check caught an active
replacement observer retaining old equipment after a departed purchase settled.
The repair refetches active affected queries only for departed operations; a new
client regression and real delayed-response browser check pass. The independent
reviewer also checked that repair. Current accepted responses retain their
installed result without a redundant refetch.

Raw run logs, disposable harnesses and browser screenshots remain in `/tmp` with
the `pokestar-equipment-` prefix. They are machine-local verification aids.
Physical-device interaction, real OAuth/Discord UI and process-crash acceptance
were not exercised. Transfers/comparison remain outside this change (#207).


The implementation is published as [PR #263](https://github.com/ewei068/pokestar/pull/263)
above Item & nature (#261). Disposable acceptance services were stopped and their
Mongo data and temporary bundle copies removed; scripts/logs/screenshots remain
machine-local. No deployment, merge or live-account mutation occurred. Standing
PR monitoring is disabled by repository configuration.
