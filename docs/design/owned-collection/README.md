# Collection, party and inspection workspace

2026-10-31. **Design approved by the maintainer after the visual refinements below.** This
replaces the initial large-card collection/separate-detail study after maintainer
feedback. Work stays on `codex/web-owned-collection`, based on PR #243 head
`4f471c1`. No production browser module, API, database, reward or party changed.
The [shared-service and client-data proposal](architecture.md) is ready for
maintainer review after an [independent review and repair pass](architecture-review.md).
It defines the prerequisites for implementing this approved design.

Open the [editable review](http://127.0.0.1:8130/docs/design/owned-collection/).
The repository-root study server is already running on port 8130. Restart only
when absent, from this worktree root:

```sh
python3 -m http.server 8130 --bind 127.0.0.1
```

Review controls choose workspace/full-page inspector, exact
1600/1280/900/390/320 px frames, and named states. Reset interactions restores
the current fixture. On a small outer window, scroll the review stage sideways
or choose Phone. All formation edits are in memory and disappear on reload.

- [Desktop workspace](http://127.0.0.1:8130/docs/design/owned-collection/?screen=collection&width=desktop&state=normal)
- [Phone workspace](http://127.0.0.1:8130/docs/design/owned-collection/?screen=collection&width=phone&state=normal)
- [Phone Add with six members](http://127.0.0.1:8130/docs/design/owned-collection/?screen=collection&width=phone&state=placing)
- [Full-page inspector](http://127.0.0.1:8130/docs/design/owned-collection/?screen=detail&width=desktop&state=normal)

## Proposed workspace

Desktop shows party, compact collection tiles and inspection together. Tiles
carry a sprite, optional bottom name, in-party marker and shiny cue. The review
contains 72 illustrative owned records with varied power and IVs. Tile labels
select Name (default), Combat power, IV perfection or None. IV perfection is
`sum(ivs) / (6 * 31) * 100`, rounded for display; 100% requires all six IVs to be
31. The full accessible name still identifies the Pokémon in every label mode.

Each page contains complete rows that fit the collection viewport, with a fixed
paging footer above the phone dock. Resizing recalculates the bounded page size;
the final page may naturally contain fewer records. The study slices fixtures;
production can request the calculated size within server limits. This removes
the previous 36-entry/five-column orphan row without repacking stored party
positions. Infinite scrolling and virtual rendering remain implementation options.

Search and sort stay visible in a compact toolbar. Sort choices are Pokédex,
name, combat power, IV perfection and level, with a direction toggle. Additional
rarity/type/shiny/party/minimum-IV filters open in a popover with an active-filter
count and Clear. Filtering never pushes paging controls out of the viewport;
opening filters collapses mobile party/inspection sheets.

The party uses arena scenery/platforms and the existing formation orientation:
three columns/four visual lanes facing right on desktop; four columns/three rows
with the front row at the top on phones. The same stored position numbers are
preserved. It shows twelve positions and at most six members; it invents no
current HP/readiness or battle effects for owned Pokémon.

The same inspector rendering function mounts in a desktop side panel, a tablet
side drawer, a phone bottom sheet and its own page. Identity and party actions
remain at the top. Build, Stats, Moves and Info reveal shared descriptions,
IVs/EVs, equipment and provenance without enlarging every collection tile.
The full-page view uses the same content, not a competing detail design.

On phones both party and inspection have persistent collapsed handles above
main navigation. Tapping a Pokémon opens inspection; Add opens
the party and collapses inspection to a selected-Pokémon strip. Party Manage
provides Move / Swap and Remove without adding them to inspection for members. Only one sheet
is expanded. Cancel returns to inspection; collapse and Escape preserve the
selection and restore a useful focus target.

## Interaction rules and source of truth

`src/elements/party/PartyManage.js` enables destinations using
`canAddOrMovePokemonToParty` from `src/services/party.js`.
`PartyButtons.js` retains stored row/column position identity. The older
`buildPartyAddSend` route independently confirms occupied replacement at six.
The pure helper was exercised locally with fixture IDs and database imports
blocked: a new member in a six-member party may target positions
1, 2, 5, 6, 9 and 10 (the occupied positions); the member in position 1 may target
all other eleven positions. This is source/helper evidence, not persistence proof.

| Action | Study behavior |
| --- | --- |
| Tap a collection tile or occupied party position | Inspect that Pokémon. |
| Add from inspection | Choose an eligible position; open party on phone. |
| Move / Swap from party Manage | Choose a member, then a different position without dragging. |
| Existing member onto occupied position | Swap the two members. |
| Existing member onto empty position | Move, leaving the old position empty. |
| New member onto occupied position | Replace; outgoing member stays owned. |
| New member onto empty position | Add when below six; otherwise reject. |
| Party member dragged onto the highlighted collection area | Remove from party, retaining ownership. |
| Drag released outside a valid destination | Cancel; formation remains unchanged. |
| Remove from party Manage | Choose a member to remove; retain ownership. |
| Train from inspection | Open a clearly marked future-action explanation; no training or resource changes occur. |

Eligible destinations have cyan oval rings. Unavailable positions are gray with
an unavailable reason in their accessible name/title. A current position cannot
be its own move destination. At six members, empty positions are invalid for a
new member; occupied replacements remain valid. An invalid drop changes no slots.
Drag highlighting does not insert content above the field or move its targets.

Mouse dragging starts after a movement threshold. Phone tiles/party members
have a small grip: hold it to drag; the rest of the tile scrolls normally. Every
party operation also has a tap/keyboard route through Add or party Manage. Touch hardware and long-press behavior
still need physical-device acceptance. Drag identity uses Pokémon IDs rather
than tile positions, so later pagination/virtual rendering can preserve it.

## Reusable production direction

Keep formation presentation and inspector content separate from placement,
persistence and layout ownership. A collection workspace should own selected ID,
placement intent, open sheet, request progress and conflict recovery. An inspector
host should own sidebar/sheet/page layout. A party renderer should consume slots,
selection, eligibility and action callbacks, without depending on battle playback
or collection fetching. The current battle renderer mixes these concerns with
turn targeting and VFX; extract only demonstrated shared presentation when the
production implementation is approved.

The study's shared rendering functions demonstrate composition; they are not a
new production abstraction or evidence that battle rendering has been refactored.
Frontend placement eligibility remains a hint; the shared server operation must
revalidate ownership, eligibility, six-member limit, revision and replay identity.
Visual composition crosses the collection and party design scope, while their
production work retains the accepted separate implementation/PR boundaries.

## Source discovery and proposed data boundary

| Display | Current authoritative source | Implementation direction |
| --- | --- | --- |
| Owned identity, level, EXP, IVs/EVs, nature, moves, ability, held item, equipment, lock and provenance | `Pokemon` in root `types.js`; `src/services/pokemon.js` | Explicit owner-scoped projection from saved collection records, not a battle snapshot. |
| Species name, types, rarity, art and description | `src/config/pokemonConfig.js` | Project shared metadata; keep form IDs intact and use a missing-art fallback. |
| Move, ability and held-item descriptions | `src/battle/data/*Registry.js`; existing projection in `src/web/battleCatalog.js` | Use registered shared descriptions; do not rewrite combat rules in React. |
| IV percentage and level progress | `src/utils/pokemonUtils.js`; `src/embeds/pokemonEmbeds.js` | Project server-derived values and maximum-level state. |
| Search/filter/sort precedent | `src/elements/pokemon/PokemonList.js` | Public scalar allowlist, literal search, stable ID tiebreaker; never accept a Mongo query or owner ID from the browser. |
| Party membership | Saved trainer formation, via `src/services/party.js` / `getPartyPokemonIds` | Resolve from current acting trainer. Do not infer from lock or prior battle membership. |

Source-confirmed implementation hazards:

1. `listPokemons` currently builds `{ userId, ...listOptions.filter }`; exposing
   its raw filter would let the caller replace the owner. The HTTP boundary must
   construct allowed filters itself and enforce authenticated ownership.
2. `getPokemonFromUserId` enforces owner/ID but invokes deprecated stat refresh,
   which can write the complete Pokémon snapshot. Collection reads must avoid
   overwriting concurrent training, equipment, form, ownership or release changes.
   Prefer a pure display calculation from the current owned record; retain
   canonical writes only through a deliberate conditional persistence boundary.
3. `addExpAndMoneyTrainer` increments resources but computes and sets level from
   a previously read trainer; it has no durable request identity. It is not the
   completed web interaction-grant boundary. `updateTrainer` still writes a
   whole snapshot, relevant if receipts are ever embedded in trainer documents.
4. A read-only `hello` against local MongoDB at `127.0.0.1:27017` reported a
   standalone server (no replica set or mongos). Multi-document transaction
   support must not be assumed from mock tests. Production topology was not
   inspected. Choose and prove atomic deduplication plus resource increment
   before enabling rewarded collection reads; no database configuration changed.

Proposed list DTO: bounded entries, page/hasNext (and total if affordable), current
filters/order; each entry contains owned ID/name, species display, level, power,
IV summary, shiny/locked and party membership. Detail extends it with exact
EXP progress, six stats/IVs/EVs, registered build descriptions, equipment
slots/modifiers and caught/original-owner identity. No full trainer, operational
reward state, foreign collection or browser-calculated combat rules are needed.
The DTO and URL extension remain implementation proposals; stable direct links,
Back/reload and non-root base-path handling must be verified in production code.

## Decisions required before production implementation

The maintainer explicitly called out two prerequisites, now recorded in the
[web effort](../../efforts/web-battler.md): shared backend operations with **one
path, two callers** (Discord and HTTP), and central client server-data ownership
with a deliberate freshness policy. This study does not choose a store library,
change service shape or establish cache/refresh acceptance. Automatic resize,
cache refresh and polling must not create interaction grants. Keep owned data
and the battle session's authoritative projected state distinct.

## Scope and verification

Required now: compact collection density, co-located formation/inspection,
consistent slot identity, inspect/add/move/remove/drag interactions, phone sheet
transitions and maintainer feedback. Preserve flexibility through ID-based
selection, shared inspector content and host-owned layout. Defer infinite scrolling/virtualization, training, presets and production party
persistence until their relevant implementation/design work. No new framework is needed for this
editable study.

Named fixture states include six-member party, four members, empty party, Add at
six members, empty collection, loading, read failure, no longer owned detail,
long name/missing art, maximum level, pending save, uncertain save and a party
changed in Discord. Pending, uncertain and stale states do not claim confirmed
success or make gameplay requests.

Catalog descriptions/art/growth values come from `generate-fixtures.cjs`; owned
build values and all party edits are illustrative. The generator blocks database
access. Regenerate the catalog fixtures with:

```sh
node docs/design/owned-collection/generate-fixtures.cjs
```

Observed browser verification: 130 screen/state/width combinations across
1600/1280/900/390/320 px, with no horizontal document overflow or blank main
content and no two expanded phone sheets. Mouse drags verified replacement at
six, swap, move to empty, removal, invalid full-party drop and outside-drop
cancellation. Earlier tap checks verified inspection, automatic party expansion and full-page
mounting. The current refinement additionally requires viewport paging, label,
filter/sort, Train and party Manage checks, recorded below after verification. JavaScript syntax and local
references were checked. Review screenshots are saved outside the shipped tree
at `/tmp/pokestar-collection-workspace-review/`. Phone-width browser checks used
mouse/keyboard input; physical touch/long-press and on-device scrolling remain
unverified. This study establishes no real API, reward concurrency/restart,
cross-surface or physical-device acceptance. No runtime source changed, so backend
and client runtime suites are not rerun for this design revision.

The pre-existing HTTPS setup edits in `web/README.md` and `web/.env.example`
remain untouched and uncommitted. No PR was opened, merged or deployed.
Follow the [accepted slice plan](../../plans/2026-10-30-1740-feat-web-first-playable-slice-plan.md),
[UI guide](../../web-ui-style-guide.md) and
[shared operation boundary](../../web-player-operations.md) during implementation.

## Current refinement verification · 2026-10-31

- 130 screen/state/width combinations at 1600/1280/900/390/320 px: no horizontal
  overflow, blank main content, hidden paging footer or overflowing ready tiles.
- Twenty label/viewport combinations, including 320×640 and 390×640: complete
  normal pages fit in rows, with the pager visible. Hiding labels can fit another
  row; no extra Pokémon or formation positions are invented.
- Power sorting, IV sorting, search, paging and 100% IV filtering were exercised.
  All six stat rows in an inspected 100% result displayed IV 31. Default labels,
  CP labels, IV percentage labels and no-label mode were checked.
- Existing-member inspection exposes Train without Move/Remove. Party Manage
  still supports tap-based swap and removal; the future Train explanation closes
  with Escape and retains inspection. Mouse dragging still replaces at six.
- These are fixture/browser observations. Physical touch dragging, API fetching,
  real saved state, cross-surface freshness and grant atomicity remain unverified.
  Current screenshots live at `/tmp/pokestar-collection-refinement-review/`.

## Visual polish · 2026-10-31

The study now uses centered SVG chevrons on collapse/expand and Manage controls,
and inset SVG backgrounds with reserved right padding on native selects. Panel
headers have tighter padding; search, sort, direction and Filters share one row.
Phone toolbar controls retain 44 px height while eliminating the second row.

Collection tiles use quiet rarity tints: neutral gray/white Common, blue Rare,
purple Epic, gold Legendary and red Mythical (the shared catalog's term for the
requested mythic tier). Rarity also remains in accessible names, hover titles
and inspection. The **All five rarities** review state shows real shared-catalog
examples, including Caterpie and Mew; it does not change any real owned record.

Party sprites use a generated browser module from the existing arena
`web/src/battles/arena/spriteLayout.ts`, refreshed by `generate-fixtures.cjs`.
Visible alpha bounds align the feet at the same 87% anchor as production, meeting
the platform center. The proportional sprite/platform unit is capped by slot
width and height, and mirrored X offsets follow the arena rule. This replaces
plain image-box centering in the study; the production renderer is unchanged.

Type badges now distinguish Fighting in reddish brown, Ice in light blue,
Ground in brown, Flying in near-white blue and Dark in near-black. Pale badges
use dark text. Pokémon identity and move details use the same study selectors.
Stats read the shared nature's six modifiers: raised stat names/values have a
subtle red cue and `+`; lowered ones have a blue cue and `−`. Accessible row
names explain the nature effect. Neutral natures receive no markers. These
cues do not recalculate or modify the illustrative stat values.

Move details now follow `web/src/battles/BattleInspector.tsx`: name and type,
then icon-marked Category, Power, Accuracy and Cooldown, followed by description.
Cooldown includes singular/plural turn units; missing power/accuracy stays `—`.
**Implementation requirement:** extract a shared move inspection component for
battle and owned inspection. It should consume move display data and let its
host supply panel placement/surface styling, without requiring a battle session.
This study aligns the content/layout; it does not extract production React code.

Browser checks covered 80 screen/state/viewport combinations across
1600/1280/900/390/320 px. A short-phone stale-party notice displaced the pager;
compact notice layout and spacing corrected it. Nine follow-up combinations
for pending/uncertain/conflict at 390×844, 390×640 and 320×640 kept tiles and
pager visible without horizontal overflow. The full-page placing fixture now
stays on inspection until Add returns to collection placement. Timid raised/
lowered rows, neutral Hardy rows and the five requested badge colors were
checked, along with move facts at 320 px. Updated review images are at
`/tmp/pokestar-collection-polish-review/`. Syntax and local-reference checks
remain study checks, with physical-device input and gameplay acceptance deferred.
The backend shared-operation and client data-store/freshness decisions remain
required before production work.

## Implementation authority

The maintainer approved the study and the lighter service/cache/reliability
scope in [architecture.md](architecture.md). Its approved amendment supersedes
earlier migration and durable interaction-grant requirements in this study.
