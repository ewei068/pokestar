# NPC battle selection and start

2026-11-02, America/Los_Angeles. **Design approved by the maintainer, with horizontally scrolling phone tabs as the final refinement.**
This study covers [#210](https://github.com/ewei068/pokestar/issues/210), following the approved collection and party workspace.
The study performs no gameplay writes. The [production implementation and verification](../../verification/npc-battles-2026-11-02.md) now follow the simplified start contract below.
Three used item images are included in `web/public/images/items/`; the study and future production screen share those files.
The [implementation plan](../../plans/2026-11-02-1847-feat-npc-battle-start-plan.md)
reflects the maintainer’s simplified start behavior. The [earlier review](plan-review.md) is historical; no maintainer input is pending.

Open the [editable review](http://127.0.0.1:8130/docs/design/npc-battles/).
The existing repository-root study server on port 8130 serves this checkout.
If it is absent, run `python3 -m http.server 8130 --bind 127.0.0.1` from the repository root.

- [Continue tab](http://127.0.0.1:8130/docs/design/npc-battles/?width=phone&screen=continue&state=ready)
- [Desktop selection](http://127.0.0.1:8130/docs/design/npc-battles/?width=desktop&screen=detail&state=ready)
- [Phone browsing](http://127.0.0.1:8130/docs/design/npc-battles/?width=phone&screen=browse&state=ready)
- [Phone selected trainer](http://127.0.0.1:8130/docs/design/npc-battles/?width=phone&screen=detail&state=ready)
- [Start response lost](http://127.0.0.1:8130/docs/design/npc-battles/?width=phone&screen=detail&state=start-error)

The controls offer 1600/1280/900/390/320 px frames and named states.
Continue tabs, search, trainer selection, difficulty, horizontal species scrolling, party pop-outs and simulated start/pending/error states work in memory.
Edit party and opening a battle identify the existing destination; this study does not reproduce the party editor or battle screen.
The generated catalog contains all 17 actual NPCs; player identity, party, active battles and reward availability are fixtures.
Regenerate it with `node docs/design/npc-battles/generate-fixtures.cjs`; database access is blocked during generation.

## Approved interaction

On desktop, Trainer battles keeps a searchable trainer list, selected encounter and current party together.
Each trainer row shows one combined level range: the minimum level across its difficulties through the maximum actual opponent level, including the ace.
The list retains catalog order; no recommendation score or progression ordering is invented.
Difficulty buttons have subtle white/green/blue/red/black hues matching `difficultyConfig`'s Discord emoji map; the selected difficulty retains a gold border.
The selected encounter shows Pokémon count and level range, then one horizontally scrollable strip of unique possible species.
The ace appears first with a red border and small Ace marker; species names remain in accessible labels/tooltips rather than visible labels.
There is no separate ace card, expandable species grid or random-draw paragraph.

Daily Reward is a compact heading with an availability message only when needed, followed by icon/quantity/item-name rows.
Already claimed, None and Updating… remain distinct.
Permanent victory status, reset timing, variable-reward explanations, the caption below Start battle and the caption below Edit party are omitted at the maintainer's direction.
The three used Pokeball/Mint/Raid Pass assets are copied unchanged from the existing local `extra_data` into the browser public directory for version control; see its provenance README.
Additional icons are promoted when used, not imported as a speculative library.

Below 1191 px, Your party opens a pop-out instead of moving the formation beneath the encounter.
On tablets it appears at the right; on phones it is a bottom sheet above the main navigation.
Your party and Start battle share the phone action bar, with no explanatory footer.
The native dialog provides focus containment, Close and Escape; clicking the backdrop also dismisses it, restoring focus to Your party.
The party keeps its stored positions and established desktop/phone orientation; the phone front row remains at the top.
At phone widths, selecting a trainer still opens a dedicated detail view with All trainers and browser Back.

The action explicitly starts the selected trainer/difficulty with the saved party.
It does not open another confirmation dialog or make a formation draft.
Edit party opens the existing Pokémon workspace, preserving encounter selection on return.
Implementation must mount the controlled `PartyView` and reuse `PokemonInspection` for member inspection; the static study approximates them with the existing collection CSS, fixtures and arena sprite alignment.
It must not create a second party editor or Pokémon data store.

Continue is the first and default Play tab when at least one battle is ongoing.
Phone tabs scroll horizontally instead of shrinking or wrapping their labels; keyboard focus brings the focused tab into view. Continue remains one counted tab rather than adding one tab per battle.
It lists all ongoing battles, including battles started in Discord, with a count on the tab.
When there are none, omit Continue and default to Trainer battles.
Choose the default on entering Play; background refresh must not switch a player away from a trainer they are reviewing.
If the selected Continue tab becomes empty after a confirmed refresh, return to Trainer battles.
An unknown first load needs a loading state, and a failed refresh retains the known tab/list; do not interpret failure as zero battles.
The fixture has three ongoing battles plus a no-ongoing-battles state.
An ongoing battle does not lock new starts; current rules allow distinct battles.
Opening a list item uses the existing participant-authorized battle route.
NPC names/difficulties in list cards require the previously identified allowlisted summary projection addition; fixture timestamps do not establish a new live freshness guarantee.
Saved results has no link or screen in this scope.
Dungeons and Battle Tower remain visibly Later.

## Rules established by source discovery

| Concern | Observed behavior and design consequence |
| --- | --- |
| Availability | `src/services/battle.js`, `buildPveSend`: every configured NPC/difficulty is selectable. No trainer-level, previous-victory, event-time or daily lockout exists. The Volo Event label supplies no schedule. |
| Party | `src/services/party.js`, `validatePartyForBattle`: valid geometry, unique owned records, eligible species and 1–6 members. Six members are optional; there is no CP or level requirement. |
| Opponent | `src/battle/engine/npcs.js`, `BasicNPC.setPokemon`: random draws with replacement, random positions, plus the ace at maxLevel + 1. Show a pool, not a promised fixed formation. Displayed range includes the ace. |
| Permanent progress | `src/services/battle.js:209`: `defeatedNPCs` records wins per NPC/difficulty. Permanent clears still update through existing completion, but are not displayed on this screen. Do not invent a first-clear bonus. |
| Daily progress | `src/services/battle.js:197`: `defeatedNPCsToday` is written only when a configured bonus is granted. Display Daily Reward with Already claimed when appropriate; generic trainers show None rather than an invented daily win state. |
| Reset and claim | `src/config/trainerConfig.js`, `src/utils/utils.js`: daily data refreshes at UTC midnight. Eligibility is checked at victory completion, not reserved at start. Another battle may claim it first. |
| Reward amounts | `src/config/npcConfig.js` and battle engine: daily items are configured, but ordinary reward totals depend on the actual battle. Do not promise exact money or EXP on this screen. |
| Auto | Manual start has no Dream Card cost. Auto is an existing separate battle capability with Darkrai/card eligibility; no new start-time Auto toggle is proposed. |

For example, Blue Easy is four Pokémon, levels 15–19, Wartortle at 19 and a daily 1 Pokeball bonus.
Bug Catcher Very Easy is four Pokémon, levels 3–5, Kakuna at 5 and no daily bonus.
These are catalog facts, not balance proposals.

## Approved start contract

The maintainer accepts accidental duplicate battles because starting has no cost.
Disable Start immediately while its request is pending; release pending state when
it succeeds, fails or times out. After an ambiguous failure, show a short message,
refresh ongoing battles and let the player use Continue or start again. A failed
refresh does not block another attempt. Do not automatically retry the POST.

The shared start command authenticates the actor and validates their current saved
party with the existing ownership, eligibility and capacity rules. Use the current
server formation/build without comparing it to the preview or requiring a second
review. Extract construction from `buildPveSend`, reuse `BasicNPC` and
`validatePartyForBattle`, and call the existing `BattleService.start`.
On success, open the returned battle ID through the existing session. Later party
edits do not alter an existing battle’s frozen setup.

The former retained-start proposal is removed. No reservations, request identity,
input-conflict checks, expiry window, persisted rejected outcome, browser-storage
requirement, Check start action or Discord Replay protocol is needed. A retry,
second tab or reload may create another ordinary battle; that is accepted.
Revisit this only if starts gain a cost or duplicates become a demonstrated problem.

This uses the approved lightweight [architecture amendment](../owned-collection/architecture.md#revised-direction-after-maintainer-feedback).
Existing participant authorization, battle revisions, ordered events, frozen setup,
Auto and completion safety stay owned by the battle service/session.
Result rendering never awards battle rewards again. Explicit starts retain the
current best-effort participation policy; automatic reads grant nothing.

The account-scoped player cache owns party, trainer data and NPC progress, with
its existing polling/focus/reconnect behavior and stale-account response guards.
Keep selected NPC, difficulty, search and panel state local or in the current route.
Start needs ordinary in-memory mutation state with no retries or reload recovery.
After completion settles, refresh player/progress queries; pending or failed
completion must not be relabeled as a claimed bonus.

## Review states

| Fixture | Player-facing behavior |
| --- | --- |
| Ready / claimed | Compact Daily Reward rows; Already claimed appears beside the heading. Rematch remains possible. |
| No ongoing battles | Continue is absent; Trainer battles becomes the default. |
| Loading / read failed / empty | Bounded loading shell, retry, or no-trainers message; existing battles remain independently reachable. |
| Empty / ineligible party | Start disabled; Edit party provides recovery. |
| Cached refresh failure | Retain useful content and offer Refresh. Starting still uses current server data. |
| Start pending | Keep context readable, disable duplicate starts and encounter changes. |
| Start rejected | Show the server error; Start is available again after correcting invalid inputs. |
| Start response lost | Say the battle may have started. Offer Continue and leave Start enabled for another attempt. |
| Start succeeded | Open the returned battle through the existing session. |
| Selection unavailable | Retain context and let the player choose another trainer. This is changed configuration, not a new progression lock. |
| Completion pending / return after victory | Pending is not claimed. Refresh settled progress when returning; use the existing completion/result path. |
| Long title / missing art | Actual Volo title; readable fallback when trainer art is absent. |

## Scope and evidence

Required now: source-accurate rules, readable desktop/phone layout, keyboard and touch paths, visible pending/failure/unknown distinctions, and an approved design before production implementation.
Preserve flexibility through controlled party/inspection modules and a battle-specific start seam; these support later party preparation without duplicating rules.
Party presets, training, new Auto controls, detailed saved receipts, dungeon/tower starts and broader economy reliability are deferred to their existing tickets.
Revisit them when their respective journeys are implemented; this screen does not depend on presets.

Repository state was verified before design: clean `codex/web-collection-implementation` at pushed `09f1343444311e6bb2a420832b5fb2852cd4e5bf`; PRs #242/#243/#245/#246 open.
Design work uses the same checkout on separate `codex/web-npc-selection-design`; predecessor branches are preserved.
No worktree was created, and no merge, deployment, production API action or issue publication occurred.

### Simplified start checks

The maintainer removed the retained-start protocol after reviewing its tradeoffs.
The plan and study now use the ordinary start path with pending-button protection.
The study no longer contains party-change review, Check start or storage-recovery fixtures.

Browser checks observed Start become disabled with `aria-busy` during the simulated
request, followed by the successful battle handoff. In the response-lost fixture,
Start stayed enabled and Continue opened the existing three-battle list.
Server-rejection and cached-refresh-failure fixtures also left Start enabled.
The party preview retained six members. A [phone image](previews/start-error-phone.jpg)
records the response-lost state with an available Start button.

JavaScript syntax, local Markdown references and `git diff --check` passed.
This bounded change was reviewed directly. Only planning/docs and the design study
changed; production runtime tests were not rerun, and no production acceptance is claimed.

### Revised study checks

The maintainer's feedback is reflected in the current study: aggregate trainer levels, source-matched difficulty hues, one horizontal species strip, compact icon rewards, removed explanatory footers/clear status, party pop-outs and a conditional Continue tab.
The maintainer approved the revised design and Continue navigation, then requested the final scrolling-tab refinement before implementation planning.
This bounded revision was reviewed in the current context, without another independent review pipeline.

Browser observations covered 1280/900/390/320 px.
At 1280 px, the party remains beside the encounter and Start battle fits inside the 900 px viewport.
At 900 px, the 330 px right-side party pop-out keeps the three-column/four-lane desktop formation.
At 390 and 320 px, the bottom sheet keeps the four-column/three-row phone formation; Close, Escape and backdrop dismissal work and restore focus to Your party.
Member inspection still preserves all six members.
The 320×700 action bar ended at the same 632 px boundary as the main navigation; the document did not overflow horizontally.
At 390 px, keyboard arrows moved the 452 px species strip inside its 340 px viewport without horizontal document overflow, and exactly one species carried the Ace marker.

The Continue fixture displayed all three ongoing battles.
The no-ongoing fixture omitted Continue and selected Trainer battles.
Already claimed appeared next to Daily Reward while the item row remained readable.
The earlier revision exercised retained-start recovery states. Those states and their gates were subsequently removed at the maintainer’s request; see the approved start contract above.
Updated [desktop](previews/desktop.jpg), [phone](previews/phone.jpg), [party sheet](previews/party-phone.jpg) and [Continue](previews/continue-phone.jpg) images preserve the current presentation.

JavaScript syntax and static references were checked.
`npm run build --prefix web` passed, including the three new public item images; Rollup emitted the existing `virtua` pure-annotation warnings.
The icon files and built copies match their existing local sources byte for byte.
No backend logic or production React component changed, so backend/client runtime suites were not rerun for this design revision.

### Final approval refinement

Phone Play tabs now overflow horizontally with readable labels and the Continue count.
At 390 px the tab strip measured 470 px inside 364 px; keyboard focus on the last
tab moved its scroll position to 104 px and brought the control into view.
The 320 px frame also kept overflow within the tab strip, with no document overflow
beyond its existing 2 px viewport border. The updated phone image records this refinement.
JavaScript syntax and `git diff --check` passed. No production runtime changed.

The earlier implementation plan received one independent review and one repair pass.
Its retained-start findings are [superseded by the scope reduction](plan-review.md).
The simplified plan/study revision is checked directly in the current context.
No design approval or planning input is pending.

### Initial study checks

An independent source/screenshot review found three concrete study defects: inspecting a member changed the party fixture, the tablet formation used phone mapping, and phone tabs hid Later labels.
One repair pass separated inspection/open state from changed-party data, retained the existing desktop slot mapping through tablet widths and restored visible Later labels.
Browser checks confirmed those affected paths after repair; no second full review was run.

The in-app browser inspected the layout at 1440/1280/900/390/320 px, including the real Volo title and missing-art fallback.
DOM measurements observed no horizontal document overflow at 1280, 900, 390 and 320 px.
The 900 px formation retained three visual columns/four lanes, with stored position 1 at column 3/row 1.
At 390×844 and 320×700, the sticky start footer ended exactly above the 68 px phone navigation.
Desktop start remains reachable by ordinary page scrolling at short heights; full-page [desktop](previews/desktop.jpg) and viewport [phone](previews/phone.jpg) images are saved.

Driven paths included phone search → trainer → difficulty → browser Back, party expansion/member inspection preserving six members and pending start disabling submit.
The original fixture sweep included recovery/storage/conflict states that have since been removed; it is not verification of the simplified start behavior.
The initial study kept ongoing battles reachable during catalog errors; the revision moves that recovery path into Continue.
The preview scripts passed JavaScript syntax checks; generated fixtures were read from shared configuration with the database seam blocked.
No backend/client runtime suites were run for this documentation-only study.

The study establishes no API, MongoDB, restart, OAuth, Discord or physical-device acceptance.
Production implementation must verify current party authorization/validation, disabled submission while pending, re-enabled Start after failure/timeout, account isolation, ordinary durable battle continuation and existing completion behavior.
Run full backend tests after the shared-service change, preserve/report the existing checkJs baseline, lint changed backend files, and run client tests/build after implementation.
