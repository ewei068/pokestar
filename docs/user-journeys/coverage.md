# Journey coverage audit

Source snapshot: **2026-10-28**; commit `f2fc1f70cdd4abacf70f26201d601abb78c264cb` (plus the current documentation edits).

Priority statements in this audit describe the initial scan before maintainer
review. All 129 entries were subsequently approved, with 44 changed priority
pairs. Use the [review summary](review-summary.md), [current catalog](catalog.json)
and [PRD](../pokestar-web-interface-prd.md) for the accepted ratings and current
product guidance. Source coverage below remains the historical scan evidence.

## Method and limits

Parsed all 319 non-test JavaScript files under `src/` and `scripts/` without executing bot code, loading credentials, connecting to Discord or MongoDB, or invoking operator scripts. Traced registered commands, legacy component handlers, Deact callbacks, service branches, game-event listeners, timers and data/configuration tables. Selected service/engine bodies were inspected to establish outcomes and prerequisites. The machine ledger retains every source path/hash and every mapped command, event, component and definition key.

This establishes static source coverage of known entry points and mechanic families. It does not prove every branch is reachable in production, every mechanic is bug-free, runtime flag values, or usage frequency. Enum IDs are not counted as implemented moves/abilities. Raw definition counts can include overrides/aliases and are not runtime registry totals. Each species/move/item is a data variant under its mapped journey, rather than a separate porting workflow.

The priority review includes parent journeys and their variants, mechanics, enabling systems and operator/developer functions. They overlap intentionally: do not sum them as independent product features. The initial proposals were provisional until the subsequent maintainer review linked above.

## Coverage totals

- journeys: **129**
- parsedSourceFiles: **319**
- commands: **65**
- executableCommands: **61**
- eventDefinitions: **58**
- eventHandlers: **57**
- deactElements: **33**

## Important scope and dependency findings

- At scan time, the user’s first 16 ratings were preserved and 113 additional entries were proposed. The subsequent review covers all 129.
- Jirachi unlock requires raid-earned Star Pieces and at least three Pokémon with another original owner. Its web use can depend on Discord-earned progress while web raids remain P2.
- Darkrai unlock depends on 25 completed tutorial stages. Replacing the web tutorial must account for access to Auto; exact tutorial parity remains undecided.
- Deoxys depends on tower floor 20; Mew on New Island; Celebi on level plus Ilex Shrine; Arceus on collection/Mythical prerequisites.
- Raid storage uses owner/instance identity rather than guild identity. The accepted bot/web priority difference reflects server participation context; no guild-keyed raid implementation is assumed.
- Locations affect training, EV reduction, storage and unlocks. Passive timed replenishment applies to Dream Cards; locations are not an independent passive-money system.
- Result-screen Replay starts a fresh encounter. It is distinct from viewing ordered combat events.
- Legacy Discord NPC turns require Next Turn; durable NPC turns advance automatically.
- Durable battles/raids, spawning and web access are feature-flagged. Real-provider, restart, reward and Auto recovery limitations remain in the existing web effort and contracts.
- Personal settings have four concrete controls: profile privacy, Discord device type, target indicator, and tutorial/quest reminders.
- The `pokemonIdSelect` event is a handlerless placeholder. `test` is a registered diagnostic handler without a current static producer. Other legacy handlers may be retained for old UI rather than emitted by current screens.
- Commented event dungeons/banners/tutorial copy are historical source, not proof of current playable content. Static AST extraction excludes comments.

## Commands

| Definition | Stage configuration | Handler or group | Journey IDs |
| --- | --- | --- | --- |
| `ping` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [ping.js](../../src/commands/heartbeat/ping.js) | J109 |
| `echo` | `[stageNames.ALPHA, stageNames.BETA]` | [echo.js](../../src/commands/heartbeat/echo.js) | J110 |
| `help` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [help.js](../../src/commands/help/help.js) | J36 |
| `trainerinfo` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [trainerInfo.js](../../src/commands/trainer/trainerInfo.js) | J17, J71 |
| `backpack` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [backpack.js](../../src/commands/trainer/backpack.js) | J18, J63 |
| `locations` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [locations.js](../../src/commands/trainer/locations.js) | J28 |
| `quest` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [quest.js](../../src/commands/trainer/quest.js) | J12, J56, J57, J58 |
| `daily` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [daily.js](../../src/commands/trainer/daily.js) | J02, J79 |
| `settings` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [userSettings.js](../../src/commands/trainer/userSettings.js) | J35, J71, J72, J73, J74 |
| `vote` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [vote.js](../../src/commands/social/vote.js) | J33, J124 |
| `levelrewards` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [levelRewards.js](../../src/commands/trainer/levelRewards.js) | J19 |
| `gacha` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [gacha.js](../../src/commands/pokemon/gacha.js) | J03, J50, J51, J52 |
| `list` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [list.js](../../src/commands/pokemon/list.js) | J04, J48 |
| `info` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [info.js](../../src/commands/pokemon/info.js) | J04, J47 |
| `pokedex` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [pokedex.js](../../src/commands/pokemon/pokedex.js) | J20 |
| `release` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [release.js](../../src/commands/pokemon/release.js) | J25 |
| `train` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [train.js](../../src/commands/pokemon/train.js) | J06, J76 |
| `evolve` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [evolve.js](../../src/commands/pokemon/evolve.js) | J21 |
| `form` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [form.js](../../src/commands/pokemon/form.js) | J22 |
| `equipment` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [equipment.js](../../src/commands/pokemon/equipment.js) | J07, J27, J75 |
| `equipmentlist` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [equipmentList.js](../../src/commands/pokemon/equipmentList.js) | J26 |
| `equipmentswap` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [equipmentSwap.js](../../src/commands/pokemon/equipmentSwap.js) | J26 |
| `helditem` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [heldItem.js](../../src/commands/pokemon/heldItem.js) | J23 |
| `nature` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [nature.js](../../src/commands/pokemon/nature.js) | J24 |
| `pokemart` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [pokemart.js](../../src/commands/shop/pokemart.js) | J13, J28, J49 |
| `buy` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [buy.js](../../src/commands/shop/buy.js) | J13, J28 |
| `craft` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [craft.js](../../src/commands/shop/craft.js) | J29 |
| `trade` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | Subcommand group | J14, J69 |
| `tradeadd` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [tradeAdd.js](../../src/commands/social/tradeAdd.js) | J69 |
| `traderemove` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [tradeRemove.js](../../src/commands/social/tradeRemove.js) | J69 |
| `tradeinfo` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [tradeInfo.js](../../src/commands/social/tradeInfo.js) | J69 |
| `traderequest` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [tradeRequest.js](../../src/commands/social/tradeRequest.js) | J14, J68 |
| `leaderboard` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [leaderboard.js](../../src/commands/social/leaderboard.js) | J15, J70 |
| `pvp` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [pvp.js](../../src/commands/battle/pvp.js) | J10 |
| `pve` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [pve.js](../../src/commands/battle/pve.js) | J08, J64, J65 |
| `continue-battle` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [continueBattle.js](../../src/commands/battle/continueBattle.js) | J09, J103, J128 |
| `dungeons` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [dungeons.js](../../src/commands/battle/dungeons.js) | J30, J104 |
| `battletower` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [battleTower.js](../../src/commands/battle/battleTower.js) | J31, J104 |
| `raid` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [raid.js](../../src/commands/battle/raid.js) | J11, J66, J67 |
| `party` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | Subcommand group | J05 |
| `partyinfo` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [partyInfo.js](../../src/commands/battle/partyInfo.js) | J55 |
| `partyadd` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [partyAdd.js](../../src/commands/battle/partyAdd.js) | J05 |
| `partyremove` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [partyRemove.js](../../src/commands/battle/partyRemove.js) | J05 |
| `partyauto` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [partyAuto.js](../../src/commands/battle/partyAuto.js) | J53 |
| `partylist` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [partyList.js](../../src/commands/battle/partyList.js) | J54 |
| `partyload` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [partyLoad.js](../../src/commands/battle/partyLoad.js) | J54 |
| `partymanage` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [partyManage.js](../../src/commands/battle/partyManage.js) | J05 |
| `mythic` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | Subcommand group | J40, J41, J42, J43, J44, J45 |
| `mew` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [mew.js](../../src/commands/pokemon/mew.js) | J40, J77 |
| `celebi` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [celebi.js](../../src/commands/pokemon/celebi.js) | J41, J78, J79 |
| `deoxys` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [deoxys.js](../../src/commands/pokemon/deoxys.js) | J42, J80 |
| `jirachi` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [jirachi.js](../../src/commands/pokemon/jirachi.js) | J43, J81, J82, J83, J84, J85, J86 |
| `darkrai` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [darkrai.js](../../src/commands/pokemon/darkrai.js) | J44, J87 |
| `arceus` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [arceus.js](../../src/commands/pokemon/arceus.js) | J45, J88, J89, J90, J91 |
| `tutorial` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [tutorial.js](../../src/commands/help/tutorial.js) | J01, J59 |
| `events` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [events.js](../../src/commands/help/events.js) | J37 |
| `changelog` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [changelog.js](../../src/commands/help/changelog.js) | J38 |
| `invite` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [invite.js](../../src/commands/social/invite.js) | J39 |
| `spawn` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | Subcommand group | J16 |
| `spawnmanage` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [spawnManage.js](../../src/commands/server/spawnManage.js) | J16 |
| `spawnaddchannel` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [spawnAddChannel.js](../../src/commands/server/spawnAddChannel.js) | J16 |
| `spawnremovechannel` | `[stageNames.ALPHA, stageNames.BETA, stageNames.PROD]` | [spawnRemoveChannel.js](../../src/commands/server/spawnRemoveChannel.js) | J16 |
| `give` | `[stageNames.ALPHA]` | [give.js](../../src/commands/heartbeat/give.js) | J111 |
| `giveitem` | `[stageNames.ALPHA]` | [giveItem.js](../../src/commands/heartbeat/giveItem.js) | J112 |
| `test` | `[stageNames.ALPHA]` | [test.js](../../src/commands/heartbeat/test.js) | J113 |

## Events

| Event | Classification | Journey IDs |
| --- | --- | --- |
| `pokemonScroll` | Registered handler | J04 |
| `pokemonRelease` | Registered handler | J25 |
| `pokemonSelect` | Registered handler | J04 |
| `pokemonEvolveSelect` | Registered handler | J21 |
| `pokemonEvolveConfirm` | Registered handler | J21 |
| `pokemonReleasePage` | Registered handler | J48 |
| `pokemonInfoButton` | Registered handler | J04 |
| `pokemonActionButton` | Registered handler | J04, J47, J05, J23, J06, J22 |
| `pokedexListButton` | Registered handler | J20 |
| `pokedexButton` | Registered handler | J20 |
| `wildPokemonButton` | Registered handler | J34 |
| `equipmentSelect` | Registered handler | J07 |
| `equipmentButton` | Registered handler | J07, J27, J75 |
| `equipmentUpgrade` | Registered handler | J07, J27 |
| `equipmentScroll` | Registered handler | J26 |
| `equipmentListSelect` | Registered handler | J26 |
| `equipmentSwap` | Registered handler | J26 |
| `natureSelect` | Registered handler | J24 |
| `natureConfirm` | Registered handler | J24 |
| `shopSelect` | Registered handler | J13 |
| `shopBuy` | Registered handler | J13, J28 |
| `helpSelect` | Registered handler | J36 |
| `back` | Registered handler | J36, J04, J08 |
| `pvpAccept` | Registered handler | J10 |
| `pveScroll` | Registered handler | J08 |
| `pveSelect` | Registered handler | J08 |
| `pveAccept` | Registered handler | J08, J65 |
| `dungeonSelect` | Registered handler | J30 |
| `dungeonAccept` | Registered handler | J30, J65 |
| `towerScroll` | Registered handler | J31 |
| `towerAccept` | Registered handler | J31 |
| `raidSelect` | Registered handler | J11 |
| `raidReturn` | Registered handler | J11 |
| `raidStart` | Registered handler | J66 |
| `raidAccept` | Registered handler | J11 |
| `battleInfo` | Registered handler | J95, J32, J103 |
| `battleMoveSelect` | Registered handler | J92 |
| `battleTargetSelect` | Registered handler | J93, J94 |
| `battleTargetConfirm` | Registered handler | J93 |
| `durablePick` | Registered handler | J09 |
| `durablePage` | Registered handler | J09 |
| `bannerScroll` | Registered handler | J03 |
| `bannerButton` | Registered handler | J51 |
| `bannerGacha` | Registered handler | J03 |
| `mewButton` | Registered handler | J40 |
| `mewSelect` | Registered handler | J40 |
| `celebiTimeTravel` | Registered handler | J41 |
| `deoxysFormSelect` | Registered handler | J42 |
| `tradeHelp` | Registered handler | J14 |
| `tradeRequestAccept` | Registered handler | J14 |
| `tradeRequestButton` | Registered handler | J14, J68 |
| `voteRewards` | Registered handler | J33 |
| `eventButton` | Registered handler | J37 |
| `tutorialButton` | Registered handler | J01 |
| `tutorialUpsellButton` | Registered handler | J60 |
| `questUpsellButton` | Registered handler | J60 |
| `pokemonIdSelect` | Enum/config placeholder; no handler | J04 |
| `test` | Registered handler; no current static eventNames producer found | J113 |

## Mechanics and content variants

Complete keys and source lines are retained in [coverage.json](coverage.json). These are static declaration counts, not production acceptance or deduplicated runtime registry totals.

| Source table | Definitions | Journey IDs |
| --- | --- | --- |
| `src/config/questConfig.js` / `newTutorialConfigRaw` | 43 | J01, J59 |
| `src/config/questConfig.js` / `dailyQuestConfigRaw` | 8 | J56 |
| `src/config/questConfig.js` / `achievementConfigRaw` | 17 | J57 |
| `src/config/trainerConfig.js` / `trainerFields` | 31 | J46, J61, J62, J63 |
| `src/config/trainerConfig.js` / `levelConfig` | 100 | J19 |
| `src/config/trainerConfig.js` / `userSettingsConfigRaw` | 4 | J35, J71, J72, J73, J74 |
| `src/config/pokemonConfig.js` / `canonicalPokemonConfig` | 406 | J129 |
| `src/config/pokemonConfig.js` / `fakePokemonConfig` | 66 | J129 |
| `src/config/pokemonConfig.js` / `natureConfig` | 25 | J24 |
| `src/config/pokemonConfig.js` / `types` | 20 | J99 |
| `src/config/pokemonConfig.js` / `growthRateConfig` | 6 | J06 |
| `src/config/battleConfig.js` / `moveConfig` | 283 | J92, J101 |
| `src/config/battleConfig.js` / `moveExecutes` | 283 | J101 |
| `src/config/battleConfig.js` / `abilityConfig` | 83 | J100 |
| `src/config/battleConfig.js` / `effectConfig` | 66 | J97 |
| `src/config/battleConfig.js` / `statusConditions` | 6 | J97 |
| `src/config/battleConfig.js` / `weatherConditions` | 4 | J98 |
| `src/config/battleConfig.js` / `targetTypes` | 3 | J93 |
| `src/config/battleConfig.js` / `targetPositions` | 5 | J93 |
| `src/config/battleConfig.js` / `targetPatterns` | 9 | J93 |
| `src/config/battleConfig.js` / `damageTypes` | 3 | J99 |
| `src/config/battleConfig.js` / `moveTiers` | 3 | J92 |
| `src/config/battleConfig.js` / `typeAdvantages` | 18 | J99 |
| `src/battle/data/moves.js` / `movesToRegisterRaw` | 71 | J101 |
| `src/battle/data/abilities.js` / `abilitiesToRegister` | 37 | J100 |
| `src/battle/data/effects.js` / `effectsToRegister` | 8 | J97 |
| `src/battle/data/heldItems.js` / `heldItemsToRegister` | 22 | J100 |
| `src/config/npcConfig.js` / `npcConfig` | 17 | J08, J64 |
| `src/config/npcConfig.js` / `dungeonConfig` | 5 | J30, J104 |
| `src/config/npcConfig.js` / `battleTowerConfig` | 20 | J31, J104 |
| `src/config/npcConfig.js` / `raidConfigRaw` | 4 | J11, J67 |
| `src/config/npcConfig.js` / `difficultyConfig` | 5 | J08 |
| `src/config/backpackConfig.js` / `backpackItemConfigRaw` | 10 | J127 |
| `src/config/backpackConfig.js` / `backpackHeldItemConfig` | 22 | J23, J29, J100 |
| `src/config/backpackConfig.js` / `craftableItemConfig` | 1 | J29 |
| `src/config/locationConfig.js` / `locationConfig` | 11 | J28, J49, J76 |
| `src/config/shopConfig.js` / `shopItemConfig` | 15 | J13, J28 |
| `src/config/gachaConfig.js` / `pokeballConfig` | 4 | J03, J51 |
| `src/config/gachaConfig.js` / `bannerTypeConfig` | 3 | J51 |
| `src/config/gachaConfig.js` / `rewardTypesConfigRaw` | 12 | J127 |
| `src/config/gachaConfig.js` / `voteRewardsConfigRaw` | 4 | J33 |
| `src/config/mythicConfig.js` / `mewMythicConfig` | 3 | J40 |
| `src/config/mythicConfig.js` / `celebiMythicConfig` | 2 | J41 |
| `src/config/mythicConfig.js` / `jirachiMythicConfig` | 2 | J43 |
| `src/config/mythicConfig.js` / `deoxysMythicConfig` | 1 | J42 |
| `src/config/mythicConfig.js` / `arceusMythicConfig` | 1 | J45 |
| `src/config/equipmentConfig.js` / `modifierConfig` | 18 | J75 |
| `src/config/equipmentConfig.js` / `modifierSlotConfig` | 5 | J75 |
| `src/config/equipmentConfig.js` / `equipmentConfig` | 6 | J07, J27 |
| `src/config/socialConfig.js` / `leaderboardConfig` | 6 | J15 |
| `src/config/gachaConfig.js` / `bannerConfigRaw` | 7 | J03, J51 |
| `src/config/helpConfig.js` / `gameEventConfig` | 1 | J37 |
| `src/config/helpConfig.js` / `tutorialConfig` | 12 | J01 |
| `src/config/socialConfig.js` / `voteConfig` | 2 | J33 |

## Additional development scripts

The three Python development utilities (image resizing, whitespace cropping and emoji printing) were also read and parsed without execution. Their hashes and mappings to J126 are in the ancillaryScripts ledger.

## Source ledger

[coverage.json](coverage.json) contains every scanned file, its role, mapped journey IDs and content hash, including all operator scripts and historical migrations. No test, production action, dependency install or code migration was run for this scan.
