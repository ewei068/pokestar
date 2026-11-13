# Equipment upgrades and rerolls

Design study started 2026-11-08, America/Los_Angeles, and approved for
implementation on 2026-11-09, for
[#206](https://github.com/ewei068/pokestar/issues/206), “Upgrade and reroll
equipment with costs.” The maintainer requested equipment level upgrades and
stat-slot rerolls in the existing Pokémon upgrade workspace. The maintainer
approved the default Upgrade/Reroll presentation with the final refinements below. No production
equipment endpoint, persistence operation or browser feature has been added.

## Editable review

The isolated, in-memory study is machine-local under:

`.context/compound-engineering/ce-prototype/2026-11-08-equipment/01-level-and-reroll/screens/`

`index.html`, `study.js` and `study.css` are editable source. `fixtures.js` is
generated from current equipment/material/species configuration by
`generate-fixtures.cjs`; configuration imports prohibit database access. Shared
CSS and existing scenery/material assets are copied verbatim. Six equipment
sprites come from the [PokeAPI sprites repository](https://github.com/PokeAPI/sprites/tree/master/sprites/items)
(`power-weight.png`, `power-bracer.png`, `power-belt.png`, `power-lens.png`,
`power-band.png`, `power-anklet.png`). The configured Bulbagarden artwork endpoint
returned a challenge/403. Equipment and repository Shard images are embedded in
the generated fixture. The Pokémon sprite uses its configured external URL with
an artwork fallback.

Start the review helper from the repository root:

```sh
node /Users/elviswei/.codex/plugins/cache/compound-engineering-plugin/compound-engineering/3.36.1/skills/ce-prototype/scripts/light-webserver.js start --root "$PWD/.context/compound-engineering/ce-prototype/2026-11-08-equipment/01-level-and-reroll" --annotate
```

The helper returns a local URL. **Design study** switches fixtures, desktop
arrangements (choices on the left or above), and reroll interactions (a mode
switch or per-stat buttons). Both arrangements use a two-column equipment
chooser on phones. Query parameters `?layout=split`, `?layout=top`,
`?interaction=rows` and `?state=max` are review controls, not proposed production
routes. The ignored study depends on this Mac/worktree and is not recoverable
from a fresh checkout.

## Proposed interaction

- Add **Equipment** beside Train and Item & nature, retaining the inspected
  Pokémon and collection return context. Only the active feature mounts.
- Select one of the Pokémon’s six existing equipment pieces. Show its level,
  five slot modifiers, values and quality. Missing pieces are unavailable;
  reads must not generate equipment or spend resources.
- Show current → next equipment modifier values before **Upgrade level**.
  Its action directly buys one level, with money and
  matching Shard costs and `Owned: {number}` beside it. Level 10 disables
  level-up while leaving rerolls available.
- Choose one stat slot and **Confirm reroll** inline, with Cancel beside it.
  Selection itself spends nothing. Reroll
  replaces the slot immediately, without a keep-old choice; the result can be
  worse or the same. Primary has a fixed modifier and rerolls only its quality.
  A successful result shows old → new modifier/value/quality and changed Pokémon
  stats. Repeated rolls require a new click; there is no automatic loop.
- Use one compact action area. The default Upgrade/Reroll switch presents either
  level-up or slot selection/confirmation below the stats. An alternative puts
  ↻ beside each stat, selecting a slot for the same inline confirmation. The
  maintainer selected the switch for production; row buttons remain a study-only
  comparison. Neither opens a spend modal.
- **Equipment guide** opens a large optional modal: per-equipment/per-slot
  modifier pools, quality probabilities, level-1/level-10 ranges, a quality/level
  calculator and modifier-family rules. The inline Possible results and six-stat
  level-up preview were removed at the maintainer’s request.
- Pending prevents another equipment spend. An accepted submitted request can
  settle after departure; returning does not submit again. Shortages and caps
  disable the affected actions, with a reason. Definitive rejection, stale state
  and unknown outcome have distinct copy. Stale/unknown outcomes block further
  spending until **Refresh Pokémon & Bag** reconciles the current state.
- The study has Ready, Level 10, insufficient money/Shards, missing equipment,
  loading/load failure, slow operation, stale, unknown, definitive rejection and
  long-name/missing-art fixtures. These simulate presentation, not real recovery.

## Source mechanics and implementation constraints

| Source | Observed rule |
| --- | --- |
| `src/config/equipmentConfig.js` | Six equipment types; five slots each. Weight/Anklet use Emotion Shards, Bracer/Lens use Willpower Shards, Belt/Band use Knowledge Shards. Level cap 10; level `L` → `L+1` costs `L+1` Shards and `200 × (L+1)` money. Every reroll costs 5 Shards and 1,000 money. |
| `src/utils/pokemonUtils.js`, `getEquipmentSlotValue`; `src/services/pokemon.js`, `calculatePokemonStats` | Modifier value is `round((min + quality/100 × (max−min)) × level)` for Primary/Secondary; substats omit the level multiplier. Base, percent and flat modifiers affect the canonical Pokémon formula at different stages. Production stat previews must be server-derived. |
| `src/services/pokemon.js`, `rerollStatSlot`; `src/utils/gachaUtils.js` | One allowed modifier is selected with replacement; quality is an integer 0–100 inclusive. The old modifier can repeat. Primary’s one allowed modifier stays fixed. |
| `src/services/gacha.js`, `generateRandomEquipments` | New Pokémon normally get all six pieces at level 1. Existing reads do not synthesize missing pieces. |
| `src/events/equipment/equipmentUpgrade.js`; `src/config/eventConfig.js`; `src/handlers/eventHandler.js` | Successful operations emit `UPGRADED_EQUIPMENT` / `REROLLED_EQUIPMENT`. The configured participation grant is 15 trainer EXP, with default zero money. Preserve required quest events and choose the matching equipment grant for web operations rather than silently using generic web participation. |
| `web/src/upgrades/PokemonUpgradeWorkspace.tsx`; `web/src/player/PlayerData.ts` | Reuse the existing target/return host, account mutation gate, actor/epoch validation and affected-cache reconciliation. Equipment changes can affect detail, collection, party, training and nature previews. |

Required now: visible costs/reroll risk, exact current/next equipment values,
owner/input/stock/build validation before spending, quest/grant correctness,
keyboard focus and phone scrolling, pending/departure/recovery behavior. Verify
the study visually and by driving its fixtures; later implementation needs
backend/client checks and disposable-Mongo/HTTP evidence for spending and guards.

Preserve flexibility: equipment owns its mounted feature state; domain operations
must make sense without a web tab. Keep the existing reliability ceiling from
the nature/held-item work: narrow conditional writes and bounded compensation
for definitive rejection, with accepted cross-document/legacy-writer gaps.
No new transaction, durable receipt, mutex or recovery framework is proposed.

Deferred: equipment transfers/comparison belong to
[#207](https://github.com/ewei068/pokestar/issues/207). Bulk upgrades, automatic
reroll targeting and changes to equipment balance are outside the requested
single-level/single-slot operations.

### Concrete persistence risks for implementation

The existing `upgradeEquipmentLevel` and `rerollStatSlot` overwrite the whole
backpack and then save a broad Pokémon snapshot. They lack the observed-stock
and observed-build guards used by newer owned operations. `rerollStatSlot` also
trusts its Discord-selected slot; validate identifiers and slot existence before
any spend at the domain operation boundary.

A bounded independent source-discovery pass identified a reachable stale-money
write: equipment spends use Mongo `$inc` without updating `trainer.money` in
memory, then `equipmentUpgrade.js` calls `emitTrainerEvent`. Only training uses
its quest-only patch; equipment falls through to `updateTrainer` with
`{$set: trainer}`, which can restore the pre-spend money. This is a static source
finding, not a reproduced live-Mongo result. The owned equipment path must keep
progression writes narrow and avoid replaying stale resource snapshots; verify
both Discord and web paths when implementing shared rules.

## Observed study checks

Headless production Chrome rendered all 12 fixtures at 1280, 831, 390 and 320 px,
plus the alternate desktop arrangement at all four widths: 52 combinations
without document overflow or script errors. Desktop and phone screenshots were
visually inspected. A 320×480 check showed the reroll action can scroll fully
above phone navigation.

Driven fixture checks passed single level-up money/Shard/level changes, a changed
modifier and lower-quality reroll, all five selections on six pieces, max-level
reroll, shortages, missing equipment, load recovery, pending departure, unknown
result/refresh without replay, stale refresh, definitive rejection and restored
action focus. A load-failure refresh latch found during local inspection was
repaired before review.

These are isolated fixture observations. No production tests/build, authenticated
HTTP operation, real MongoDB/OAuth/Discord, reload persistence, concurrency,
restart or physical-device acceptance is established by those checks.
No issue/PR/deployment or live account was changed by the study.

## Maintainer refinement · 2026-11-09

Browser comments remove the inline Possible results disclosure and Pokémon stats
after level-up section, add artwork/base-stat subtitles, and specify the shorter
scaling sentence. The maintainer requested optional detailed rules in a large
modal and raised compact reroll interaction as the remaining question. Those
changes are applied; Equipment guide is the proposed button label.

The current comparison offers Upgrade/Reroll modes (recommended by the agent)
and per-stat ↻ buttons. Both use one inline spend confirmation with visible
costs and Cancel. At this review checkpoint neither was selected. After the original
annotation wait ended with exit 2, its helper was stopped. The revision is
available at `http://localhost:61802/` without that overlay; browser comments/chat
are the active feedback route. The source/decisions capsule remains in the same
ignored run directory. No ended annotation wait remains parked.

Revision checks: 70 fixture/width/interaction combinations at 1280, 831, the
maintainer’s 783, 390 and 320 px passed without document overflow or script
errors. Visual review covered the switch and row alternative, desktop/narrow
phone layouts and the guide. Driven checks cover both spend flows,
selection/cancel without spending, loaded equipment/Shard images, all six roll
pools and three slot families, guide calculations, substat level independence,
modal scrolling, Escape/focus return, caps/shortages, unknown refresh and
320×480 action scrolling. These remain fixture observations only.

## Implementation approval · 2026-11-09

The maintainer approved the default Upgrade/Reroll study and requested automatic
implementation after internal planning/review, with no further plan approval.
The final refinements remove the reroll subtitle and show the selected slot’s
value and quality as current → ???. Its modifier also shows current → ??? when
the slot has more than one configured option; a single-option modifier stays
named without an unknown replacement. The browser comment’s “quantity” refers
to the shown Quality column. These edits are applied to the study.

Implementation planning/progress stays machine-local for the implementing agents,
per maintainer direction. This document preserves the approved design and source
evidence; it is not an implementation plan or runtime acceptance record.


## Production implementation · 2026-11-10

The approved switch interaction and final refinements are implemented in the
Equipment tab. [Acceptance evidence](../../verification/equipment-2026-11-10.md)
records automated checks, disposable persistence/HTTP outcomes and production
Chrome observations separately from the historical fixture study above.
