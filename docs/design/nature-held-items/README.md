# Nature and held items

Design review started 2026-11-08, America/Los_Angeles. The maintainer accepted
the general design with the refinements below. Browser UI study for
J24 in [#205](https://github.com/ewei068/pokestar/issues/205) and J23 in
[#208](https://github.com/ewei068/pokestar/issues/208), with Bag entry points
[#250](https://github.com/ewei068/pokestar/issues/250) and
[#251](https://github.com/ewei068/pokestar/issues/251). No production feature,
API, inventory operation or gameplay persistence has been implemented here.

## Maintainer direction

The maintainer requested two related flows:

1. Add **one combined tab** beside Train to configure held item and nature for
   the inspected Pokémon. Keep the existing selected Pokémon and invoking
   collection context. This study calls the tab **Configure**; the name and
   arrangement remain proposals for review.
2. From Bag, using a Mint or held item opens an **active-party popover** over
   the current Bag screen. Selecting an occupied Pokémon opens confirmation.
   A Mint is generic, so the confirmation also includes the nature chooser.
   Confirming equips/swaps the item or changes nature. Cancelling spends
   nothing. This direction supersedes the older tickets' navigation-to-Pokémon
   detail; their inventory/reload requirements still apply.

The Bag picker is deliberately party-only. Owned Pokémon outside the party use
the Configure tab through collection inspection. Equipment, evolution/forms,
party editing, Shop and unrelated Bag destinations are deferred to their own
journeys. No fake future upgrade tabs are proposed.

## Editable review

The maintainer chose to keep the prototype in the worktree. Its local, ignored
source is:

`.context/compound-engineering/ce-prototype/2026-11-08-nature-held-items/01-configure-and-bag/screens/`

This directory contains `index.html`, `study.js`, `study.css`, a generated live
catalog snapshot, and verbatim copies of shared CSS and existing assets. It is
an independent in-memory prototype, never imported by production. The directory
is **machine-local**, not protected by a Git commit or available in a fresh
clone. Keep it with this worktree while design review is open. The run's
`decisions.md` records continuity and review status, not an implementation plan.

Start or reopen the annotation preview from the repository root:

```sh
node /Users/elviswei/.codex/plugins/cache/compound-engineering-plugin/compound-engineering/3.36.1/skills/ce-prototype/scripts/light-webserver.js start --root "$PWD/.context/compound-engineering/ce-prototype/2026-11-08-nature-held-items/01-configure-and-bag" --annotate
```

Open the returned local URL. The **Design study** menu switches entry point,
fixture and two desktop arrangements (side by side or stacked). Both arrangements
stack on phones. The page is unframed so the app's annotation tools can target
the actual screen. Use `?entry=configure`, `?entry=bag-item` or
`?entry=bag-mint` for review shortcuts; these are not proposed production routes.

## Proposed interaction

- Configure shows current identity, held item and nature. Choosing an owned
  held item immediately equips/swaps it; Remove directly returns the current
  item. Neither opens a review dialog. Nature shows all 25 names, current nature,
  stat direction and six before/after stats. Choosing nature only previews it;
  clicking **Change nature** applies it directly and spends 1 Mint. The existing
  preview and cost beside that action supply the decision context. There is no
  combined Save operation or repeated “1 Mint per change” header subtitle.
- Bag remains underneath one modal flow. Desktop uses an overlaid party panel;
  phones use a sheet above the main navigation. Preserve configured rows,
  columns, empty positions and slot identity. The fixture uses the existing
  3×4 geometry with six members. Empty slots cannot be selected. No party drag
  handles or management controls belong in this chooser.
- Selecting a Pokémon first loads its details, then replaces the panel with
  confirmation. The held-item confirmation shows current → selected, the new
  effect, without an old-item-return footer. Mint confirmation
  lets the player choose nature and inspect the stat preview before enabling
  Change nature. Its cost and Mint quantity change stay beside the actions.
  Neither flow includes a separate inventory-quantity panel.
- Back returns to the party without spending. Close/outside click/Escape returns
  to the selected Bag item and restores focus. If the last copy was spent, focus
  goes to the item heading because its Use action is disabled. On success,
  show the resulting state and allow return to the party; Bag context stays put.
- Current nature and already-held item remain no-ops. Configure's Change nature
  is disabled for the current nature; reselecting its held item does nothing.
  Bag confirmation is disabled for both.
  Already-held is a proposed cleanup of the legacy service's net-zero operation,
  not a verified backend rule change. Distinct neutral natures remain distinct
  paid choices, matching existing nature behavior.
- Pending prevents duplicate confirmation. Unknown responses pause further
  writes and offer Refresh Pokémon & Bag, including after closing the sheet.
  Configure's direct operations use inline pending/error/recovery state without
  opening a modal, and block its other writes until the pending result settles
  or uncertainty is refreshed.
  No automatic mutation replay or promised refund. A stale choice requires
  refresh and fresh review. The uncertain fixture demonstrates only the case
  where the operation had applied; it does not establish real recovery behavior.
- Switching away from Train stops its loop. The study's small Train panel is
  context for tab switching only; it does not replace or reapprove the existing
  training screen or simulate its actual EXP/EV loop.

## Source constraints for later planning

Required now: readable desktop/phone choices and consequences; all canonical
natures; correct cancellation, unavailable/no-op/pending/unknown presentation;
configured party geometry; keyboard focus; direct Configure actions and explicit
Bag confirmation. Validate
with rendered screens and driven fixture interactions. The maintainer's judgment
settles the design; fixture checks do not approve it.

Preserve flexibility: keep the selected Pokémon/return context in the existing
upgrade host, and let Configure own its state. Both entry points share operation
rules and resulting projections, while Configure submits directly and Bag owns
confirmation and its return context. Reuse
party rendering read-only with selection, not party editing. Avoid a general
upgrade registry or invented bulk-save contract.

The maintainer explicitly selected the same reliability scope as collection and
training: narrow guarded writes and straightforward compensation for detected
failures, with the existing rare cross-document/legacy-writer gaps accepted.
Do not add a transaction, durable journal/receipt, mutex/recovery framework or
broad writer migration. The implementation plan records the exact bounded write
sequence and its remaining limits.

| Source | Observed constraint |
| --- | --- |
| `src/config/pokemonConfig.js`, `natureConfig`; `src/events/natureConfirm.js` | One generic Mint buys any of 25 natures, no money fee; current nature is rejected before spending. Five names have neutral modifiers. |
| `src/services/pokemon.js`, `calculatePokemonStats` | Nature applies ×1.1/×0.9 with flooring. Nature preview must be server-derived in production. Stored/detail stats include nature and equipment, but not held-item battle modifiers. The fixture calculates an unequipped build for illustration. |
| `src/services/pokemon.js`, `changeHeldItem` / `removeHeldItem` | Equip debits one; swap returns old/debits new; remove returns old. Existing same-item operation has a spare-item check and net-zero inventory delta. Both flows write trainer before Pokémon. |
| `web/src/player/types.ts`; `src/services/player.js` | Party slots are summaries, with no nature or held-item detail. Load selected detail before confirmation. Stable nature IDs and allowed choices need an operation projection; the existing nature detail has no ID. Runtime detail exposes heldItemId but its client type omits it. |
| `web/src/player/PlayerData.ts`; `web/src/upgrades/` | Preserve account/write gating, affected-read reconciliation, no automatic mutation retry, departed-request cleanup and independent feature lifetimes. |

No issue, PR, production configuration or remote data was changed as part of
this study. Runtime tests are reserved for implementation; review evidence below
is about this isolated fixture only.

## Review status

The maintainer approved the refined general design and requested implementation
planning after two final copy changes: remove the held-item return footer from
confirmation, and label item quantities `Owned: {number}`. Those copy edits are
applied in the same study. Production implementation has not started.

Initial study checks: local headless Chrome rendered all three entry points at 1280, 900, 390 and
320 px without document overflow or browser script errors. Both desktop
arrangements were inspected. Driven fixture checks covered equip to an empty
holder, swap, removal, Mint selection, cancellation, exhausted stock, load failure,
pending confirmation and unknown response. Closing an unknown result kept
writes disabled; refresh displayed its simulated applied result. Tab departure
and keyboard switching stopped the study's training state. A 320×480 check
verified cost and confirmation above phone navigation; long content scrolls.
Desktop and phone screenshots were visually inspected.

The initial independent scoped source/desktop review found an impossible
`0 → -1` depleted-stock preview. That case was repaired and checked; the
maintainer's subsequent refinement removes the quantity panels altogether.
Unavailable choices remain blocked. The reviewer did not independently run
phone acceptance. No unresolved actionable study finding remains from that review.

These checks establish only fixture presentation/interaction. No backend/client
production suite, real HTTP operation, MongoDB/OAuth/Discord, persistence,
concurrency, restart or physical-device acceptance was performed.


## Maintainer refinement · 2026-11-08

- Removed the Configure inventory-change panel and nature header cost subtitle.
- Replaced Configure's Review nature change with a direct Change nature action;
  the stat preview and 1-Mint cost remain visible before submission.
- Removed Configure's review-swap action. Selecting an owned held item immediately
  equips/swaps it. Remove is direct under the same Configure interaction rule.
- Kept the party-first confirmation flow from Bag. Removed its redundant held-item
  inventory panel and Mint inventory panel; Mint usage remains by the confirm
  actions. The item comparison and effect description remain.

Refinement checks in local headless Chrome passed at 1280×900, 831×764
(the submitted review width), 390×844 and 320×480. Configure immediately
swapped/equipped from selection and removed directly, with no modal. Nature
selection alone left current nature and Mint count unchanged; Change nature
updated both without a modal. A swap-back restored exact item quantities.
Same-item selection and missing Mints remained no-ops; pending disabled competing
actions; stale/unknown results required refresh before another write.

Both Bag entry points still required confirmation. Back/Escape spent nothing;
confirmed operations updated the simulated Pokémon and quantities. The Mint cost
remained beside its confirmation action, without duplicate panels. No horizontal
document overflow or browser script errors occurred. Revised desktop and phone
screenshots were visually inspected. Previous review evidence describes the
original study, not these changed triggers. No production files are part of
this revision.


## Planning approval · 2026-11-08

The maintainer approved proceeding to implementation planning, requested removal
of the confirmation's old-item-return footer, and standardized item quantities
on `Owned: {number}`. The source edits passed a JavaScript syntax check; no new
production tests were run for those copy changes. The maintainer then selected
the existing web reliability level and explicitly asked not to invent a new
atomicity/recovery system.

The [implementation plan](../../plans/2026-11-08-1812-feat-web-nature-held-items-plan.md)
carries the approved behavior and bounded reliability scope.


## Implementation direction · 2026-11-08

The maintainer authorized implementation, replacing the tab name Configure with
clearer copy and rejecting a page-shaped backend service. The implementation
uses **Item & nature** for the tab and Pokémon domain operations for nature
changes and held-item transfers. Web projections compose those capabilities;
Discord calls the same domain operations. This supersedes the plan's proposed
`pokemonConfiguration.js` module, while preserving its approved behavior,
verification and existing reliability limits.


## Implementation acceptance · 2026-11-08

The production client now uses **Item & nature**, direct tab actions and the
approved Bag party/confirmation flow. Nature and held-item domains are shared
with Discord; the web layer composes their display data and participation policy.
[Local acceptance](../../verification/nature-held-items-2026-11-08.md) records
passing suites/builds, real disposable Mongo/HTTP and production-browser checks,
two repaired review findings, the remaining checkJs baseline and accepted
reliability limits. The earlier sections above describe fixture-only study work.
Published as [PR #261](https://github.com/ewei068/pokestar/pull/261), stacked on
training [PR #259](https://github.com/ewei068/pokestar/pull/259). No deployment
has been performed.
