# Dungeons and Battle Tower

2026-11-04, America/Los_Angeles. **Proposal, waiting for maintainer feedback.** No production tab, start route or reward behavior was added.

Play already has Continue and Trainer battles. Dungeons and Battle Tower are the two remaining tabs, still marked Later in `web/src/play/PlayFeature.tsx`. This study replaces those placeholders with the live catalogs: five dungeons from `dungeonConfig`, in Discord’s menu order, and 20 tower floors from `battleTowerConfig`.

Open the [editable review](http://127.0.0.1:8130/docs/design/play-modes/). From the repository root, `python3 -m http.server 8130 --bind 127.0.0.1` serves it. The study performs no gameplay writes.

- [Selected dungeon](http://127.0.0.1:8130/docs/design/play-modes/?width=desktop&screen=dungeon-detail&state=ready)
- [Phone dungeon](http://127.0.0.1:8130/docs/design/play-modes/?width=phone&screen=dungeon-detail&state=ready)
- [Tower, floor 7 next](http://127.0.0.1:8130/docs/design/play-modes/?width=desktop&screen=tower-detail&state=ready)
- [Phone floors](http://127.0.0.1:8130/docs/design/play-modes/?width=phone&screen=tower-browse&state=ready)
- [Current floor already open](http://127.0.0.1:8130/docs/design/play-modes/?width=phone&screen=tower-detail&state=floor-open)
- [Tower complete](http://127.0.0.1:8130/docs/design/play-modes/?width=desktop&screen=tower-detail&state=tower-clear)

Regenerate fixtures with `node docs/design/play-modes/generate-fixtures.cjs`. Database access is blocked during generation. Player progress, the “Resets in 9 days” line and the party are fixtures.

## Proposed screens

Both tabs keep the approved Play chrome: scrolling phone tabs, list plus detail, current party, and Start beside Your party below 1191 px. Trainer battles stays the approved screen; this study does not redraw it. Edit party and a successful start hand off to the existing Pokémon workspace and battle screen.

Dungeons use a jade accent (`#287563`) and one row per dungeon. Each row’s subtitle comes from that dungeon’s `subtitle` in `src/config/npcConfig.js` and is copied into this catalog by the fixture generator. Mind Temple, Soul Cave and Spirit Altar name their shard. New Island says Catch Mew! with Mew’s menu icon. Mount Coronet says Event: All Shards with the star piece image. The selected dungeon shows one scrollable Pokémon strip for that difficulty. Bosses have the same red border trainers use for an ace. Phases stay in the battle; this screen does not list them. When a location image loads, the title and description sit on a dimmed, center-cropped cover that grows with the text. If the image fails, the header keeps the text without the picture.

The tower uses the trainer portrait treatment and an amethyst accent (`#793e8b`). Opening the tab lands on the current floor’s encounter. All floors remains available, and any floor can still be inspected. Each row says Cleared, Next or Locked. The gold action is only on the next floor, and its label is `Start floor N`. Cleared floors say Cleared. Later floors say `Clear floor N first`. After floor 20, the action says Tower complete. The header carries the illustrative fortnight reset.

The party shown is the saved party, the same one both modes already validate at start. Auto and Dream Cards stay off this screen, as they do on trainer battles.

## What the current game does

| Concern | Source and consequence |
| --- | --- |
| Dungeon list | `dungeons` order in `src/config/npcConfig.js`: Mind Temple, Soul Cave, Spirit Altar, New Island, Mount Coronet. Commented event dungeons stay out. |
| Dungeon fight | `DungeonNPC` uses the selected difficulty’s fixed phases in one battle. The player does not pick a phase. |
| Dungeon entry | `buildDungeonSend` accepts any configured dungeon and difficulty. No level, victory or daily lock was found. Rematches stay available. |
| Dungeon reward | The backpack reward on that difficulty is the clear reward. It is granted on victory, not reserved at start. New Island’s Mew `rewardString` is completion text, so it stays off this screen. `/mew` remains a later journey. |
| Tower entry | `lastTowerStage` starts at 0. Battle is enabled only when the viewed floor is `lastTowerStage + 1`. After floor 20, `/battletower` opens floor 20 with Battle disabled. |
| Tower opponent | `TowerNPC` draws from the linked NPC difficulty, including that difficulty’s ace, the same way a trainer battle does. The species strip is a pool, not a promised formation. |
| Tower reward | Configured money and items are granted only when victory advances that exact floor. |
| Tower reset | `lastTowerStage` uses the 14-day trainer refresh, which lands on the same UTC fortnight boundary Discord prints. The study’s “9 days” is not a live clock. A load after the boundary returns the trainer to floor 1. |
| Party | `validatePartyForBattle`: 1–6 unique eligible Pokémon. Empty or ineligible parties cannot start. |
| Ongoing names | Today’s Continue list can only say “Dungeon” or “Battle Tower” unless the mode id matches a trainer. The names in this study are the proposed list text. |

## Two decisions before implementation

**Floor levels.** Discord prints `battleTowerConfig`’s min and max. `TowerNPC.setPokemon` ignores those fields and generates from the linked NPC difficulty. All 20 floors disagree. Floor 1’s caption is 40–50 while the fight is 42–52; floor 20’s caption is 194–204 while the fight is 100–120. This study shows the generated range so the climb does not look smoother than the battle. It does not propose new levels. Choose whether the web should show the generated range, or the Discord caption, before building the screen.

**A floor that is already open.** A second tower start is not the same as a free NPC rematch. Completion advances the tower only when `lastTowerStage + 1` is still that floor, so a later victory can fail to count. The `floor-open` state makes the gold action `Continue floor` instead of starting another. Dungeon rematches do not have that gate, so Start dungeon stays available. This is a proposal, not a new reservation system. The accepted NPC duplicate-start choice does not transfer here.

Start still disables while its own request is pending, then returns after success, failure or a lost response. No request ids or automatic retries are proposed.

## Review states

| Fixture | What to look at |
| --- | --- |
| Ready | Mind Temple at Medium. Tower progress is floor 6, so floor 7 is Next. |
| First floor / tower complete | Floor 1 is the only start, or every floor is Cleared. |
| Current floor already open | Floor 7’s action is Continue floor, and Continue lists that battle. |
| Empty / ineligible party | Start is disabled. Edit party is the recovery. |
| Loading / read failed / stale | The list waits, retries, or keeps the last catalog. |
| Start pending / rejected / response lost | One start at a time. A lost response leaves Start available and points at Continue. |
| Start succeeded | Hands off to the existing battle screen. |
| Long title / missing art | Mount Coronet’s event title and a floor with no portrait. |

## Evidence

Required now: source-accurate catalogs, desktop and phone layout, and a reviewable proposal before production. Party presets, Auto, equipment, the Mew receipt and saved-result replay stay on their own tickets.

Checked locally in the study, not in production. At 1280 px the dungeon list and detail sit together without document overflow, floor 7 offers Start floor 7, and floor 8 is disabled with “Clear floor 7 first.” At 390 and 320 px the selected screen hides the list, the tabs scroll, and the document does not overflow. At 320 px a six-Pokémon phase strip scrolls inside itself, and the action bar meets the bottom navigation. Start becomes “Starting battle…”, marks the button busy, disables the difficulties, then becomes “Open battle.” The open-floor fixture says Continue floor. The party sheet opens. These checks do not approve the design.

Maintainer feedback is still open. This file is the proposal, not an approval.
