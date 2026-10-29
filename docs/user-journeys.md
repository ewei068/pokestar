# Pokestar user journeys

Reviewed **2026-10-28, America/Los_Angeles**. All **129 entries** have maintainer-approved bot and web priorities. The inventory includes overlapping journeys, variants, mechanics, enabling systems, server administration and operator/developer functions.

## Purpose and evidence

This is the maintained inventory of Pokestar's current journeys, mechanics and
supporting functions, with reviewed priorities. Planning to expand the web
battler into an interface for the Discord bot prompted this inventory. It is
input to a future PRD; defining that product, its release scope or its
implementation sequence is separate work.

Bot descriptions document the source behavior as of **2026-10-28**, commit
`f2fc1f70cdd4abacf70f26201d601abb78c264cb`. Web ratings record relative importance
for later planning, not a claim that those journeys already exist on web. The
existing web access and battle functions are included and identified separately.

- This document owns the maintained descriptions, IDs, priorities, rationale,
  dependencies, entry points and review notes. Update it when behavior or a
  prioritization decision changes.
- [Coverage audit](user-journeys/coverage.md): the historical scan method and
  command, event, component and mechanic-family mappings used to check omissions.
- [Original decision export](user-journeys/decisions.json): the unchanged review
  snapshot of all 129 approvals and notes. Keep it as provenance, not a second
  catalog to edit. It uses catalog version `2026-10-28-deep-scan-v1`; its SHA-256
  is `6ab574104d8bf0d6c3f0e2d03d77250f9454148356c87895760ea0c71f01994e`.
- [Web effort overview](efforts/web-battler.md): existing implementation,
  verification and known limitations.
- [Ticket priority rubric](agents/prioritization.md): how journey importance
  informs work-item urgency.

All 129 priority pairs were approved; 44 changed during the review. Priority
values and review notes are maintainer decisions. Rationale is editorial
interpretation. Descriptions summarize the supported flow; known limitations
are called out where source support falls short of the stated outcome. Static
inspection does not establish production acceptance or measure usage.

## Priority guide

| Priority | Working meaning |
| --- | --- |
| P0 | Critical gameplay or an essential function on the applicable surface. |
| P1 | Important normal play that the main loop can temporarily operate without. |
| P2 | Low-priority specialized/ancillary journeys or a lower priority on one surface. |
| P3 | Very-low-priority reference or diagnostic convenience. |
| Outside scope | No current commitment on that surface; this is not P3. |

Catching, managing, training and battling Pokémon form the critical loop.
Learning, settings, resource handling and progression also have reviewed P0
entries. Importance is distinct from measured frequency; this scan collected
no usage telemetry.

Equivalent production-facing bot/web journeys normally have matching priority
for now. This is a provisional guideline. Keep explicit exceptions when a flow
is invalid on one surface or works materially differently. Examples include
raids (bot P0 / web P2), voting and claims (bot P0 / web P2), and spawn
configuration (bot P0 / web outside scope). Discord layout and indicator
preferences are outside web scope; web targeting itself remains P0 under J93.
The reviewed values below take precedence over a general parity assumption.

### Dependencies and unresolved prioritization

Dependencies describe existing prerequisites or supporting behavior, not an
automatic rule for assigning priority. Parent links group overlapping outcomes;
they are not a complete dependency graph. When planning work, identify which
part of a dependency is needed and whether it already exists in the shared
backend. A related screen, acquisition flow and stored benefit can have
different priorities. No dependency-priority propagation policy is settled here.

| Case | Reviewed ratings and current relationship | Question for later planning |
| --- | --- | --- |
| Voting and retained credit | J33 is bot P0 / web P2; provider ingestion J124 is bot P1 / web outside scope. Provider callbacks store vote credit separately from the claim UI. | How should work that preserves accepted credit be prioritized independently of promoting voting or offering web claims? Do not infer a new rating for J124. |
| Mythical acquisition and owned benefits | Celebi/Jirachi unlocks J78/J81 are P2; owned bonuses J79/J82 are P0. | Which supporting behavior is needed for an existing owner without building the full acquisition flow on web? |
| Auto and learning | Auto J32 and Darkrai unlock J87 are P1; the current unlock requires 25 tutorial completions. | How would a different web learning flow count toward that existing gate? |
| Jirachi prerequisites | J81 requires raid-earned Star Pieces and Pokémon with another original owner; web raids are P2. | Which prerequisites can be satisfied through existing Discord progress when a web journey is scoped? |
| Dream Cards | Combined replenishment/inspection J63 remains P1/P1. The maintainer suggests P0 replenishment and P1/P2 inspection in the note below. | Should these be separate entries, and what is the final inspection rating? The approved aggregate remains unchanged. |

## Reviewed totals

| Priority | Bot | Web |
| --- | --- | --- |
| P0 | 68 | 60 |
| P1 | 23 | 21 |
| P2 | 22 | 24 |
| P3 | 4 | 1 |
| Outside scope | 12 | 23 |

Counts include overlapping parents, variants and systems; they do not represent independent screens, features or release commitments. The prioritization focuses on production-facing behavior. Developer/operator functions remain in the inventory for coverage; their presence does not imply public tooling requirements.

## Journey and function inventory

### Learning

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J01](#j01) | Learn to play | P0 | P0 |
| [J36](#j36) | Get contextual help | P1 | P1 |
| [J46](#j46) | Create a trainer and receive starting resources | P0 | P0 |
| [J59](#j59) | Claim tutorial rewards and resume the next lesson | P0 | P0 |
| [J60](#j60) | Receive progress reminders and return to the relevant objective | P1 | P1 |
| [J105](#j105) | Find support and community help | P2 | P2 |

### Trainer & economy

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J02](#j02) | Claim daily rewards | P1 | P1 |
| [J13](#j13) | Buy supplies | P0 | P0 |
| [J17](#j17) | Inspect a trainer profile | P1 | P1 |
| [J18](#j18) | Inspect inventory | P0 | P0 |
| [J19](#j19) | Claim trainer level rewards | P1 | P1 |
| [J61](#j61) | Earn trainer EXP and currency through play | P0 | P0 |
| [J62](#j62) | Refresh daily, weekly and seasonal allowances | P0 | P0 |
| [J127](#j127) | Receive and spend all reward/resource types | P0 | P0 |

### Collecting

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J03](#j03) | Obtain Pokémon through gacha | P0 | P0 |
| [J34](#j34) | Catch a wild spawn | P1 | Outside scope |
| [J50](#j50) | Receive beginner roll guarantees | P1 | P1 |
| [J51](#j51) | Understand banners, ball odds and pity | P0 | P0 |
| [J52](#j52) | Inspect newly obtained Pokémon and acquisition bonuses | P0 | P0 |

### Collection & research

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J04](#j04) | Find and inspect owned Pokémon | P0 | P0 |
| [J20](#j20) | Research a species | P1 | P1 |
| [J25](#j25) | Release Pokémon | P0 | P0 |
| [J47](#j47) | Lock or unlock a Pokémon | P0 | P0 |
| [J48](#j48) | Release a collection page | P0 | P0 |
| [J49](#j49) | Expand collection capacity | P0 | P0 |
| [J129](#j129) | Preserve ownership, rarity, shiny and build identity | P0 | P0 |

### Party

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J05](#j05) | Prepare a battle party | P0 | P0 |
| [J53](#j53) | Automatically fill a party | P1 | P1 |
| [J54](#j54) | Save and load party presets | P0 | P0 |
| [J55](#j55) | Inspect and validate the active formation | P0 | P0 |

### Progression

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J06](#j06) | Train a Pokémon | P0 | P0 |
| [J21](#j21) | Evolve a Pokémon | P0 | P0 |
| [J22](#j22) | Change a Pokémon's form | P0 | P0 |
| [J24](#j24) | Change a Pokémon's nature | P0 | P0 |
| [J28](#j28) | Inspect and improve owned locations | P0 | P0 |
| [J76](#j76) | Reduce or reset EV allocation | P0 | P0 |

### Equipment & items

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J07](#j07) | Improve equipment | P0 | P0 |
| [J23](#j23) | Manage held items | P0 | P0 |
| [J26](#j26) | Compare and transfer equipment | P1 | P1 |
| [J27](#j27) | Reroll equipment stats | P0 | P0 |
| [J29](#j29) | Craft an item | P0 | P0 |
| [J75](#j75) | Inspect equipment rules and costs | P1 | P1 |

### Battle modes

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J08](#j08) | Complete an NPC battle | P0 | P0 |
| [J30](#j30) | Complete a dungeon | P0 | P0 |
| [J31](#j31) | Climb the Battle Tower | P0 | P0 |
| [J64](#j64) | Earn NPC daily rewards and track defeated difficulties | P0 | P0 |
| [J65](#j65) | Repeat an encounter after its result | P1 | P1 |
| [J104](#j104) | Progress through dungeon phases and tower floors | P0 | P0 |

### Battle continuity

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J09](#j09) | Resume an unfinished battle | P0 | P0 |
| [J32](#j32) | Use Auto | P1 | P1 |
| [J63](#j63) | Replenish and inspect Dream Cards | P1 | P1 |
| [J102](#j102) | Receive a saved battle result and progression once | P0 | P0 |
| [J103](#j103) | Reject stale or unauthorized battle actions and recover | P0 | P0 |
| [J106](#j106) | Handle expired interactions and request cooldowns | P0 | P0 |
| [J128](#j128) | Survive browser closure and compatible backend restart | P0 | P0 |

### Multiplayer

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J10](#j10) | Battle another player | P1 | P1 |
| [J14](#j14) | Trade with another player | P1 | P1 |
| [J68](#j68) | Decline or cancel a trade | P1 | P1 |
| [J69](#j69) | Build and revise a trade offer | P1 | P1 |

### Raids

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J11](#j11) | Participate in a raid | P0 | P2 |
| [J66](#j66) | Host a raid with a Raid Pass | P0 | P2 |
| [J67](#j67) | Track raid damage, defeat, rewards and expiry | P0 | P2 |

### Quests

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J12](#j12) | Complete a quest | P0 | P0 |
| [J56](#j56) | Complete daily quests | P0 | P0 |
| [J57](#j57) | Progress staged achievements | P0 | P0 |
| [J58](#j58) | Claim all available quest rewards | P1 | P1 |

### Social & discovery

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J15](#j15) | Check competitive standings | P2 | P2 |
| [J33](#j33) | Vote and claim rewards | P0 | P2 |
| [J37](#j37) | Discover current events | P2 | P2 |
| [J38](#j38) | Read update notes | P3 | P3 |
| [J70](#j70) | Compare global and server standings | P2 | P2 |

### Server administration

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J16](#j16) | Configure a server's spawns | P0 | Outside scope |
| [J39](#j39) | Invite the bot | P0 | Outside scope |

### Preferences

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J35](#j35) | Change personal settings | P0 | P0 |
| [J71](#j71) | Control profile privacy | P0 | P0 |
| [J72](#j72) | Choose Discord mobile or desktop layout | P0 | Outside scope |
| [J73](#j73) | Toggle target confirmation indicators | P0 | Outside scope |
| [J74](#j74) | Toggle tutorial and quest reminders | P0 | P0 |

### Mythical Pokémon

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J40](#j40) | Customize Mew | P1 | P1 |
| [J41](#j41) | Use Celebi's powers | P2 | P2 |
| [J42](#j42) | Change Deoxys's form | P2 | P2 |
| [J43](#j43) | Make a Jirachi wish | P2 | P2 |
| [J44](#j44) | Inspect Darkrai and Auto access | P2 | P2 |
| [J45](#j45) | Use Arceus's powers | P2 | P2 |
| [J77](#j77) | Unlock and obtain Mew | P1 | P1 |
| [J78](#j78) | Unlock and obtain Celebi | P2 | P2 |
| [J79](#j79) | Receive Celebi EXP and daily reward bonuses | P0 | P0 |
| [J80](#j80) | Unlock and obtain Deoxys | P2 | P2 |
| [J81](#j81) | Unlock and obtain Jirachi | P2 | P2 |
| [J82](#j82) | Receive Jirachi shiny bonuses | P0 | P0 |
| [J83](#j83) | Wish for Power | P2 | P2 |
| [J84](#j84) | Wish for Rebirth | P2 | P2 |
| [J85](#j85) | Wish for Allies | P2 | P2 |
| [J86](#j86) | Wish for Wealth | P2 | P2 |
| [J87](#j87) | Unlock and obtain Darkrai | P1 | P1 |
| [J88](#j88) | Unlock and obtain Arceus | P2 | P2 |
| [J89](#j89) | Change Arceus type | P2 | P2 |
| [J90](#j90) | Create a chosen Pokémon with Arceus | P2 | P2 |
| [J91](#j91) | Create a chosen item with Arceus | P2 | P2 |

### Battle controls

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J92](#j92) | Choose and use a move | P0 | P0 |
| [J93](#j93) | Select and preview targets and affected tiles | P0 | P0 |
| [J94](#j94) | Skip a turn or advance legacy NPC turns | P0 | P0 |
| [J95](#j95) | Inspect teams, moves and battle state | P0 | P0 |

### Battle mechanics

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J96](#j96) | Resolve readiness, speed, cooldowns and extra turns | P0 | P0 |
| [J97](#j97) | Resolve status, buffs, debuffs and damage over time | P0 | P0 |
| [J98](#j98) | Resolve weather and its suppression | P0 | P0 |
| [J99](#j99) | Resolve damage, healing, fainting and revival | P0 | P0 |
| [J100](#j100) | Resolve passive abilities and held-item triggers | P0 | P0 |
| [J101](#j101) | Resolve special moves, positioning and transformations | P0 | P0 |

### Web access

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J107](#j107) | Sign in as the existing Discord trainer | Outside scope | P0 |
| [J108](#j108) | Sign out and recover an expired web session | Outside scope | P0 |

### Developer tools

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J109](#j109) | Check bot responsiveness | P3 | Outside scope |
| [J110](#j110) | Echo diagnostic text | P3 | Outside scope |
| [J111](#j111) | Grant test Pokémon | Outside scope | Outside scope |
| [J112](#j112) | Grant test inventory items | Outside scope | Outside scope |
| [J113](#j113) | Run the test interaction harness | Outside scope | Outside scope |
| [J126](#j126) | Maintain species, assets, enums and historical data | P2 | Outside scope |

### Operator tools

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J114](#j114) | Inspect player and guild records | Outside scope | Outside scope |
| [J115](#j115) | Reset a player account and collection | Outside scope | Outside scope |
| [J116](#j116) | Reset quest or level reward progress | Outside scope | Outside scope |
| [J117](#j117) | Reset a player’s timed allowances | Outside scope | Outside scope |
| [J118](#j118) | Grant vote reward credit manually | Outside scope | Outside scope |
| [J119](#j119) | Reset guild configuration | Outside scope | Outside scope |
| [J120](#j120) | Clear active raids | Outside scope | Outside scope |
| [J121](#j121) | Remove the bot from a server | P2 | Outside scope |
| [J122](#j122) | Register commands and initialize storage | P0 | Outside scope |

### Background systems

| ID | Outcome | Bot | Web |
| --- | --- | --- | --- |
| [J123](#j123) | Schedule wild encounters and expire old raids | P0 | Outside scope |
| [J124](#j124) | Receive authenticated external vote credit | P1 | Outside scope |
| [J125](#j125) | Report bot presence, directory stats and resource metrics | P3 | Outside scope |

## Journey details

<a id="j01"></a>

### J01 — Learn to play

a new player can learn what to do and how to progress.

- Entry points: `/tutorial`, tutorial stages and rewards.
- Category: Learning; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Some learning system is required; exact tutorial parity is undecided.
- Sources: [src/commands/help/tutorial.js:1](../src/commands/help/tutorial.js), [src/elements/quest/TutorialStage.js:1](../src/elements/quest/TutorialStage.js).

<a id="j02"></a>

### J02 — Claim daily rewards

collect the available daily grant and see its contents.

- Entry points: `/daily`.
- Category: Trainer & economy; type: Journey.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Important but players can go without.
- Sources: [src/services/gacha.js:68](../src/services/gacha.js).

<a id="j03"></a>

### J03 — Obtain Pokémon through gacha

browse banners, choose a Pokéball, roll and inspect the result.

- Entry points: `/gacha`, banner interactions.
- Category: Collecting; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Core game mechanic.
- Sources: [src/services/gacha.js:356](../src/services/gacha.js), [src/events/bannerGacha.js:1](../src/events/bannerGacha.js).

<a id="j04"></a>

### J04 — Find and inspect owned Pokémon

filter or sort the collection and inspect a Pokémon's stats, moves and progression.

- Entry points: `/list`, `/info`, collection interactions.
- Category: Collection & research; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Core game mechanic.
- Sources: [src/elements/pokemon/PokemonList.js:1](../src/elements/pokemon/PokemonList.js), [src/services/pokemon.js:1006](../src/services/pokemon.js).

<a id="j05"></a>

### J05 — Prepare a battle party

choose Pokémon, arrange positions and manage party presets.

- Entry points: `/party` command family, party manager.
- Category: Party; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Core game mechanic; the sample included saving and loading a party.
- Sources: [src/elements/party/PartyManage.js:1](../src/elements/party/PartyManage.js), [src/commands/battle/partyLoad.js:1](../src/commands/battle/partyLoad.js).

<a id="j06"></a>

### J06 — Train a Pokémon

choose a Pokémon and location and receive EXP and EV gains.

- Entry points: `/train`.
- Category: Progression; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Core game mechanic.
- Sources: [src/services/pokemon.js:676](../src/services/pokemon.js).

<a id="j07"></a>

### J07 — Improve equipment

inspect a Pokémon's equipment and upgrade it to improve its stats.

- Entry points: `/equipment`, upgrade interactions.
- Category: Equipment & items; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Core game mechanic.
- Sources: [src/services/pokemon.js:777](../src/services/pokemon.js).

<a id="j08"></a>

### J08 — Complete an NPC battle

choose an opponent and difficulty, fight and receive applicable rewards.

- Entry points: `/pve`, battle interactions.
- Category: Battle modes; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Core game mechanic.
- Sources: [src/services/battle.js:546](../src/services/battle.js).

<a id="j09"></a>

### J09 — Resume an unfinished battle

find an ongoing battle and continue its current state after leaving or switching surfaces.

- Entry points: `/continue-battle`, existing web battle list.
- Category: Battle continuity; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Core game mechanic.
- Sources: [src/commands/battle/continueBattle.js:1](../src/commands/battle/continueBattle.js), [src/battle/discord/battleContext.js:1](../src/battle/discord/battleContext.js).

<a id="j10"></a>

### J10 — Battle another player

issue or accept a challenge, take turns and reach a result.

- Entry points: `/pvp`, challenge and battle interactions.
- Category: Multiplayer; type: Journey.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Important but players can go without.
- Sources: [src/commands/battle/pvp.js:1](../src/commands/battle/pvp.js), [src/events/battle/pvpAccept.js:1](../src/events/battle/pvpAccept.js).

<a id="j11"></a>

### J11 — Participate in a raid

select a raid, battle and receive applicable rewards.

- Entry points: `/raid`, raid interactions.
- Category: Raids; type: Journey.
- Bot: **P0**; web: **P2**; maintainer approved.
- Rationale: Participating in a raid in one's server is critical; web has no server context.
- Sources: [src/services/raid.js:539](../src/services/raid.js).

<a id="j12"></a>

### J12 — Complete a quest

find an objective, check progress, meet its requirements and claim rewards.

- Entry points: `/quest`, daily and achievement quest interactions.
- Category: Quests; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Core game mechanic.
- Sources: [src/elements/quest/QuestList.js:1](../src/elements/quest/QuestList.js), [src/services/quest.js:509](../src/services/quest.js).

<a id="j13"></a>

### J13 — Buy supplies

browse the Pokémart, choose item and quantity, buy and receive the purchase.

- Entry points: `/pokemart`, `/buy`, shop interactions.
- Category: Trainer & economy; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Core game mechanic.
- Sources: [src/services/shop.js:150](../src/services/shop.js).

<a id="j14"></a>

### J14 — Trade with another player

prepare an offer, review the exchange and complete the trade.

- Entry points: `/trade` command family, trade confirmation interactions.
- Category: Multiplayer; type: Journey.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Important but players can go without.
- Sources: [src/services/trade.js:1](../src/services/trade.js), [src/events/trade/tradeRequestButton.js:1](../src/events/trade/tradeRequestButton.js).

<a id="j15"></a>

### J15 — Check competitive standings

choose a leaderboard category and scope and inspect rankings.

- Entry points: `/leaderboard`.
- Category: Social & discovery; type: Journey.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: Low priority.
- Sources: [src/elements/social/Leaderboard.js:1](../src/elements/social/Leaderboard.js).

<a id="j16"></a>

### J16 — Configure a server's spawns

an authorized server manager changes spawn mode and adds or removes channels.

- Entry points: `/spawn` command family, spawn manager.
- Category: Server administration; type: Journey.
- Bot: **P0**; web: **Outside scope**; maintainer approved.
- Rationale: Critical server management function, bot only.
- Sources: [src/elements/guild/SpawnManager.js:1](../src/elements/guild/SpawnManager.js), [src/services/guild.js:1](../src/services/guild.js).

<a id="j17"></a>

### J17 — Inspect a trainer profile

view level, currency and collection summary; inspect another trainer's profile where privacy allows.

- Entry points: `/trainerinfo`.
- Category: Trainer & economy; type: Journey.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Useful progress overview; core actions remain possible without a dedicated card.
- Sources: [src/commands/trainer/trainerInfo.js:1](../src/commands/trainer/trainerInfo.js).

<a id="j18"></a>

### J18 — Inspect inventory

see currency, Pokéballs, materials and consumables available to spend.

- Entry points: `/backpack`.
- Category: Trainer & economy; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Players need to see resources available for core purchases, training and collection.
- Sources: [src/elements/trainer/BackpackEntryPoint.js:1](../src/elements/trainer/BackpackEntryPoint.js), [src/elements/trainer/BackpackList.js:1](../src/elements/trainer/BackpackList.js).

<a id="j19"></a>

### J19 — Claim trainer level rewards

collect the rewards unlocked by trainer progression.

- Entry points: `/levelrewards`.
- Category: Trainer & economy; type: Journey.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Important progression reward source, but play can continue through other sources.
- Sources: [src/services/trainer.js:393](../src/services/trainer.js).

<a id="j20"></a>

### J20 — Research a species

browse the Pokédex to understand species, base stats and moves.

- Entry points: `/pokedex`.
- Category: Collection & research; type: Journey.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Supports informed team building; owned-Pokémon inspection already covers the essential flow.
- Source / scope notes: Includes Info, Growth, Moves, Abilities and Rarity tabs, species navigation and ownership/shiny counts.
- Sources: [src/elements/pokemon/PokedexPokemon.js:1](../src/elements/pokemon/PokedexPokemon.js), [src/services/pokemon.js:1124](../src/services/pokemon.js).

<a id="j21"></a>

### J21 — Evolve a Pokémon

meet requirements, choose a valid evolution and confirm the change.

- Entry points: `/evolve`, evolution selection and confirmation.
- Category: Progression; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Evolution is a primary route for strengthening and completing a collection.
- Sources: [src/services/pokemon.js:2245](../src/services/pokemon.js), [src/events/pokemon/pokemonEvolveConfirm.js:1](../src/events/pokemon/pokemonEvolveConfirm.js).

<a id="j22"></a>

### J22 — Change a Pokémon's form

choose an available form and pay its cost.

- Entry points: `/form`, form selection.
- Category: Progression; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Form changes are part of the maintainer’s critical Pokémon management and progression scope.
- Sources: [src/elements/pokemon/ChangeForm.js:1](../src/elements/pokemon/ChangeForm.js), [src/services/pokemon.js:2177](../src/services/pokemon.js).

<a id="j23"></a>

### J23 — Manage held items

give, swap or remove a Pokémon's held item.

- Entry points: `/helditem`.
- Category: Equipment & items; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Players need to equip and recover owned items for normal team preparation.
- Sources: [src/elements/pokemon/ChangeHeldItem.js:1](../src/elements/pokemon/ChangeHeldItem.js), [src/services/pokemon.js:2056](../src/services/pokemon.js), [src/services/pokemon.js:2100](../src/services/pokemon.js).

<a id="j24"></a>

### J24 — Change a Pokémon's nature

choose a nature and spend a mint to apply it.

- Entry points: `/nature`, nature confirmation.
- Category: Progression; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Nature changes are part of the maintainer’s critical Pokémon build management scope.
- Sources: [src/events/natureConfirm.js:1](../src/events/natureConfirm.js), [src/services/pokemon.js:1941](../src/services/pokemon.js).

<a id="j25"></a>

### J25 — Release Pokémon

choose unwanted Pokémon and release them for currency, freeing collection capacity.

- Entry points: `/release`, collection release interactions.
- Category: Collection & research; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: A full collection blocks further acquisition; releasing is a core capacity escape route.
- Sources: [src/services/pokemon.js:485](../src/services/pokemon.js), [src/services/pokemon.js:2020](../src/services/pokemon.js).

<a id="j26"></a>

### J26 — Compare and transfer equipment

filter or sort equipment and swap equipment between Pokémon.

- Entry points: `/equipmentlist`, `/equipmentswap`.
- Category: Equipment & items; type: Journey.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Important optimization and reuse; basic equipment upgrades can work without transfers.
- Source / scope notes: Browse/filter/sort equipment; transfers validate both Pokémon and charge the configured currency cost.
- Sources: [src/services/pokemon.js:1707](../src/services/pokemon.js), [src/events/equipment/equipmentSwap.js:1](../src/events/equipment/equipmentSwap.js).

<a id="j27"></a>

### J27 — Reroll equipment stats

choose an equipment stat slot, review the cost and reroll it.

- Entry points: `/equipment`, equipment slot and reroll interactions.
- Category: Equipment & items; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Equipment stat rerolls are included in critical equipment progression.
- Sources: [src/services/pokemon.js:858](../src/services/pokemon.js).

<a id="j28"></a>

### J28 — Inspect and improve owned locations

see location levels and buy location improvements that support training or storage.

- Entry points: `/locations`, `/pokemart`; location configuration.
- Category: Progression; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Locations unlock specialized training and storage, supporting confirmed core journeys.
- Source / scope notes: Training EXP/EV bonuses, EV reduction at Berry Bush/Farm, Computer Lab storage and Ilex Shrine unlock. Locations do not independently grant passive currency.
- Sources: [src/services/shop.js:150](../src/services/shop.js), [src/config/locationConfig.js:1](../src/config/locationConfig.js).

<a id="j29"></a>

### J29 — Craft an item

choose a recipe and spend money and materials to receive an item.

- Entry points: `/craft`.
- Category: Equipment & items; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Crafting is included in the critical game mechanics scope.
- Sources: [src/services/shop.js:480](../src/services/shop.js), [src/elements/shop/CraftItem.js:1](../src/elements/shop/CraftItem.js).

<a id="j30"></a>

### J30 — Complete a dungeon

select a dungeon and defeat it to earn equipment upgrade materials.

- Entry points: `/dungeons`, dungeon acceptance and battle interactions.
- Category: Battle modes; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Dungeons supply upgrade materials for the confirmed P0 equipment progression loop.
- Sources: [src/services/battle.js:791](../src/services/battle.js), [src/config/npcConfig.js:1362](../src/config/npcConfig.js).

<a id="j31"></a>

### J31 — Climb the Battle Tower

progress through tower battles and receive applicable rewards.

- Entry points: `/battletower`, tower interactions.
- Category: Battle modes; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Battle Tower is included in the critical battle and progression scope.
- Sources: [src/services/battle.js:1182](../src/services/battle.js), [src/config/npcConfig.js:1043](../src/config/npcConfig.js).

<a id="j32"></a>

### J32 — Use Auto

resolve an eligible battle automatically using the available entitlement and resources.

- Entry points: Battle Auto interactions, `/mythic darkrai`; shared completion and Auto contracts.
- Category: Battle continuity; type: Journey.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Time-saving battle convenience; manual completion remains available.
- Source / scope notes: Requires eligible mode, Darkrai access and sufficient Dream Cards. PvP disables Auto. Payment/finalization recovery remains a separately documented operational limitation.
- Sources: [src/services/battleAuto.js:1](../src/services/battleAuto.js), [src/battle/service/BattleService.js:18](../src/battle/service/BattleService.js).

<a id="j33"></a>

### J33 — Vote and claim rewards

visit an external voting site and claim the resulting rewards.

- Entry points: `/vote`, vote rewards interaction.
- Category: Social & discovery; type: Journey.
- Bot: **P0**; web: **P2**; maintainer approved.
- Rationale: Voting is P0 for the bot because it drives bot growth; the reviewed web voting/claim flow remains P2.
- Maintainer review note: P0 for the bot since it drives bot growth
- Sources: [src/commands/social/vote.js:1](../src/commands/social/vote.js), [src/services/trainer.js:563](../src/services/trainer.js).

<a id="j34"></a>

### J34 — Catch a wild spawn

respond to a server's wild encounter and catch the Pokémon.

- Entry points: Spawn service, wild Pokémon button; not a slash command.
- Category: Collecting; type: Journey.
- Bot: **P1**; web: **Outside scope**; maintainer approved.
- Rationale: Important server engagement mechanic; the current web scope has no server encounter context.
- Sources: [src/services/spawn.js:149](../src/services/spawn.js).

<a id="j35"></a>

### J35 — Change personal settings

inspect available settings and save preferences, including profile privacy.

- Entry points: `/settings`, settings configuration.
- Category: Preferences; type: Journey.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: The maintainer considers personal settings critical; individual surface-specific controls retain their explicit exceptions.
- Maintainer review note: Settings are very critical
- Sources: [src/elements/trainer/UserSettings.js:1](../src/elements/trainer/UserSettings.js), [src/config/trainerConfig.js:32](../src/config/trainerConfig.js).

<a id="j36"></a>

### J36 — Get contextual help

discover available commands or find instructions for a specific command.

- Entry points: `/help`.
- Category: Learning; type: Journey.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Useful contextual help; P0 onboarding is a separate outcome and need not copy command help.
- Sources: [src/elements/help/HelpCommand.js:1](../src/elements/help/HelpCommand.js).

<a id="j37"></a>

### J37 — Discover current events

browse event information.

- Entry points: `/events`.
- Category: Social & discovery; type: Journey.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: Useful discovery of limited content but not required to access core actions.
- Sources: [src/commands/help/events.js:1](../src/commands/help/events.js), [src/config/helpConfig.js:224](../src/config/helpConfig.js).

<a id="j38"></a>

### J38 — Read update notes

inspect recent game changes.

- Entry points: `/changelog`.
- Category: Social & discovery; type: Journey.
- Bot: **P3**; web: **P3**; maintainer approved.
- Rationale: Reference reading that can remain available elsewhere.
- Sources: [src/commands/help/changelog.js:1](../src/commands/help/changelog.js).

<a id="j39"></a>

### J39 — Invite the bot

obtain the invite link to add Pokestar to a Discord server.

- Entry points: `/invite`.
- Category: Server administration; type: Journey.
- Bot: **P0**; web: **Outside scope**; maintainer approved.
- Rationale: Inviting the bot is critical for the bot surface and outside the current web scope.
- Sources: [src/commands/social/invite.js:1](../src/commands/social/invite.js), [src/config/socialConfig.js:3](../src/config/socialConfig.js).

<a id="j40"></a>

### J40 — Customize Mew

view and modify the player's Mew.

- Entry points: `/mythic mew`, Mew interactions.
- Category: Mythical Pokémon; type: Journey.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Meaningful specialized team building once Mew is unlocked.
- Sources: [src/services/mythic.js:227](../src/services/mythic.js).

<a id="j41"></a>

### J41 — Use Celebi's powers

view Celebi and activate its time powers.

- Entry points: `/mythic celebi`, time travel interaction.
- Category: Mythical Pokémon; type: Journey.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: Celebi’s recurring powers are lower-priority specialized content on both surfaces.
- Sources: [src/services/mythic.js:523](../src/services/mythic.js).

<a id="j42"></a>

### J42 — Change Deoxys's form

inspect Deoxys and choose its form.

- Entry points: `/mythic deoxys`, form selection.
- Category: Mythical Pokémon; type: Journey.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: Deoxys form customization is lower-priority specialized content on both surfaces.
- Sources: [src/services/mythic.js:653](../src/services/mythic.js).

<a id="j43"></a>

### J43 — Make a Jirachi wish

choose a wish, select a target where needed and confirm its resource cost.

- Entry points: `/mythic jirachi`, wish interactions.
- Category: Mythical Pokémon; type: Journey.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: Jirachi wishes are lower-priority specialized content; their reviewed prerequisite and benefit distinctions remain explicit.
- Dependencies: J11, J14.
- Source / scope notes: Jirachi requires 200 Star Pieces and at least three Pokémon with another original owner. Lower web raid/trade priority leaves a progression dependency; existing Discord progress can satisfy it.
- Sources: [src/services/mythic.js:845](../src/services/mythic.js).

<a id="j44"></a>

### J44 — Inspect Darkrai and Auto access

understand Darkrai's Auto-related capabilities and resources.

- Entry points: `/mythic darkrai`.
- Category: Mythical Pokémon; type: Journey.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: The dedicated Darkrai/Auto information flow is lower priority than Auto use or unlocking Darkrai.
- Sources: [src/elements/pokemon/Darkrai.js:1](../src/elements/pokemon/Darkrai.js).

<a id="j45"></a>

### J45 — Use Arceus's powers

change Arceus's form/type or create a Pokémon or item through its available powers.

- Entry points: `/mythic arceus`, Arceus interactions.
- Category: Mythical Pokémon; type: Journey.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: Arceus’s dedicated powers flow is lower-priority late-game content.
- Dependencies: J40, J41, J42, J43, J44.
- Sources: [src/elements/pokemon/Arceus.js:1](../src/elements/pokemon/Arceus.js).

<a id="j46"></a>

### J46 — Create a trainer and receive starting resources

On first supported interaction, initialize the trainer, identity, starter currency and Pokéballs.

- Category: Learning; type: System.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Required to enter the core game loop.
- Sources: [src/services/trainer.js:56](../src/services/trainer.js), [src/config/trainerConfig.js:138](../src/config/trainerConfig.js).

<a id="j47"></a>

### J47 — Lock or unlock a Pokémon

Protect a Pokémon against release/trading, or explicitly remove that protection.

- Category: Collection & research; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Prevents accidental loss during normal collection management.
- Parent: J04.
- Sources: [src/services/pokemon.js:830](../src/services/pokemon.js), [src/services/pokemon.js:1006](../src/services/pokemon.js).

<a id="j48"></a>

### J48 — Release a collection page

Review the Pokémon on a filtered page and confirm a bulk release.

- Category: Collection & research; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Bulk collection release is included in critical collection management.
- Parent: J25.
- Sources: [src/events/pokemon/pokemonReleasePage.js:1](../src/events/pokemon/pokemonReleasePage.js), [src/events/pokemon/pokemonRelease.js:1](../src/events/pokemon/pokemonRelease.js).

<a id="j49"></a>

### J49 — Expand collection capacity

Buy Computer Lab upgrades and continue acquisition after hitting the storage limit.

- Category: Collection & research; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Maintains access to core acquisition as a collection grows.
- Parent: J28.
- Sources: [src/services/pokemon.js:2020](../src/services/pokemon.js), [src/config/locationConfig.js:16](../src/config/locationConfig.js).

<a id="j50"></a>

### J50 — Receive beginner roll guarantees

Receive starter, Epic and Legendary guarantees at the configured early basic-ball milestones.

- Category: Collecting; type: Mechanic.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Beginner guarantees are important but are rated separately from critical gacha access; this does not authorize removing existing guarantees.
- Parent: J03.
- Sources: [src/services/gacha.js:327](../src/services/gacha.js).

<a id="j51"></a>

### J51 — Understand banners, ball odds and pity

Inspect standard/rotating/special banners, available rate-ups and pity; roll 1–10 using chosen balls.

- Category: Collecting; type: Mechanic.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Meaningful acquisition choices and earned guarantees belong to core gacha behavior.
- Parent: J03.
- Sources: [src/services/gacha.js:356](../src/services/gacha.js), [src/services/gacha.js:511](../src/services/gacha.js), [src/config/gachaConfig.js:688](../src/config/gachaConfig.js).

<a id="j52"></a>

### J52 — Inspect newly obtained Pokémon and acquisition bonuses

See rarity, shiny state, IVs, ability, held item, generated equipment and collection identity after an acquisition.

- Category: Collecting; type: Mechanic.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Players must understand the outcome of a core acquisition action.
- Parent: J03.
- Sources: [src/services/gacha.js:187](../src/services/gacha.js), [src/embeds/pokemonEmbeds.js:105](../src/embeds/pokemonEmbeds.js).

<a id="j53"></a>

### J53 — Automatically fill a party

Replace the active party with selected Pokémon ranked by combat power, IVs or level.

- Category: Party; type: Variant.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Convenience for assembling a usable party; manual preparation is P0.
- Parent: J05.
- Sources: [src/commands/battle/partyAuto.js:1](../src/commands/battle/partyAuto.js).

<a id="j54"></a>

### J54 — Save and load party presets

Browse nine stored party slots and swap a preset with the active party.

- Category: Party; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: The user-confirmed party sample explicitly included saving and loading.
- Parent: J05.
- Sources: [src/commands/battle/partyList.js:1](../src/commands/battle/partyList.js), [src/commands/battle/partyLoad.js:1](../src/commands/battle/partyLoad.js).

<a id="j55"></a>

### J55 — Inspect and validate the active formation

See occupied positions and reject invalid, missing, duplicate or ineligible Pokémon before battle.

- Category: Party; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Required for a valid core battle party.
- Parent: J05.
- Sources: [src/commands/battle/partyInfo.js:1](../src/commands/battle/partyInfo.js), [src/services/party.js:212](../src/services/party.js).

<a id="j56"></a>

### J56 — Complete daily quests

View rotating daily objectives, progress them and claim each available stage reward.

- Category: Quests; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Direct specialization of the confirmed core quest loop.
- Parent: J12.
- Sources: [src/services/quest.js:318](../src/services/quest.js), [src/elements/quest/QuestList.js:1](../src/elements/quest/QuestList.js).

<a id="j57"></a>

### J57 — Progress staged achievements

Inspect persistent achievements and claim newly completed milestone stages.

- Category: Quests; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: The confirmed quest sample includes achievement rewards and progression.
- Parent: J12.
- Sources: [src/config/questConfig.js:1315](../src/config/questConfig.js), [src/services/quest.js:462](../src/services/quest.js).

<a id="j58"></a>

### J58 — Claim all available quest rewards

Collect available daily and achievement rewards across eligible stages with one action.

- Category: Quests; type: Variant.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Bulk convenience; individual claiming remains the core requirement.
- Parent: J12.
- Sources: [src/services/quest.js:596](../src/services/quest.js), [src/elements/quest/QuestList.js:1](../src/elements/quest/QuestList.js).

<a id="j59"></a>

### J59 — Claim tutorial rewards and resume the next lesson

Check a lesson requirement, claim its rewards once and continue learning.

- Category: Learning; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Core onboarding/progression outcome; web may implement a different learning system.
- Parent: J01.
- Sources: [src/services/quest.js:58](../src/services/quest.js), [src/elements/quest/TutorialStage.js:1](../src/elements/quest/TutorialStage.js).

<a id="j60"></a>

### J60 — Receive progress reminders and return to the relevant objective

Receive contextual tutorial/quest completion prompts and navigate back to claim rewards.

- Category: Learning; type: Variant.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Important discoverability; learning and claiming must also work without prompts.
- Parent: J01.
- Sources: [src/services/misc.js:98](../src/services/misc.js), [src/events/trainer/questUpsellButton.js:1](../src/events/trainer/questUpsellButton.js).

<a id="j61"></a>

### J61 — Earn trainer EXP and currency through play

Successful configured commands and interactions award trainer EXP/currency, level up and notify the player.

- Category: Trainer & economy; type: Mechanic.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Trainer EXP and currency are part of normal gameplay progression.
- Source / scope notes: Discord rewards depend on interaction routing; the current web battle implementation does not establish equivalent rewards for other bot actions.
- Sources: [src/handlers/commandHandler.js:305](../src/handlers/commandHandler.js), [src/handlers/eventHandler.js:1](../src/handlers/eventHandler.js), [src/services/trainer.js:336](../src/services/trainer.js).

<a id="j62"></a>

### J62 — Refresh daily, weekly and seasonal allowances

On trainer refresh, reset daily claims, shop quotas, NPC rewards, Mythical power cooldowns and tower progress at their configured intervals.

- Category: Trainer & economy; type: System.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Timed allowances govern recurring progression and eligibility.
- Sources: [src/services/trainer.js:91](../src/services/trainer.js), [src/config/trainerConfig.js:138](../src/config/trainerConfig.js).

<a id="j63"></a>

### J63 — Replenish and inspect Dream Cards

Regenerate Auto resources over elapsed time up to the trainer-level cap and inspect the available balance.

- Category: Battle continuity; type: Mechanic.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: The reviewed combined replenishment/inspection outcome remains P1/P1. The maintainer proposes treating replenishment as P0 and inspection as P1/P2; the split is unresolved.
- Parent: J32.
- Maintainer review note: I think "replenish" is P0 but inspect is probably closer to P1/P2. This is debateable rolled into other auto or inventory related journeys separately, too
- Sources: [src/config/trainerConfig.js:458](../src/config/trainerConfig.js), [src/elements/trainer/BackpackEntryPoint.js:1](../src/elements/trainer/BackpackEntryPoint.js).

<a id="j64"></a>

### J64 — Earn NPC daily rewards and track defeated difficulties

Complete an eligible opponent/difficulty for its daily bonus and retain permanent victory progress.

- Category: Battle modes; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Rewards and progression are part of the confirmed NPC battle outcome.
- Parent: J08.
- Source / scope notes: Includes special NPC reward sources such as mints and raid passes; not a new mode for each NPC.
- Sources: [src/services/battle.js:127](../src/services/battle.js), [src/config/npcConfig.js:51](../src/config/npcConfig.js).

<a id="j65"></a>

### J65 — Repeat an encounter after its result

Use the result-screen Replay action to start another PvE or dungeon run.

- Category: Battle modes; type: Variant.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Useful repeat-play convenience; starting again through mode selection remains possible.
- Parent: J08.
- Source / scope notes: Replay means another encounter, not historical event playback. Mode-specific buttons depend on retained Discord UI context.
- Sources: [src/services/battle.js:546](../src/services/battle.js), [src/services/battle.js:791](../src/services/battle.js).

<a id="j66"></a>

### J66 — Host a raid with a Raid Pass

Choose a boss/difficulty, consume a pass and create an active raid for others to fight.

- Category: Raids; type: Variant.
- Bot: **P0**; web: **P2**; maintainer approved.
- Rationale: Enables the server raid journey the user rated P0 bot / P2 web.
- Parent: J11.
- Sources: [src/services/raid.js:141](../src/services/raid.js).

<a id="j67"></a>

### J67 — Track raid damage, defeat, rewards and expiry

Accumulate shared boss damage, inspect remaining HP/deadline, distribute contribution rewards and handle expiry.

- Category: Raids; type: Mechanic.
- Bot: **P0**; web: **P2**; maintainer approved.
- Rationale: Essential lifecycle of the confirmed raid journey on its applicable surface.
- Parent: J11.
- Source / scope notes: Raid records are keyed by owner and instance, not a guild ID. The product reason for lower web priority is lack of server/social context, not a proven guild-keyed storage requirement. Durable raids remain behind a separate rollout flag.
- Sources: [src/services/raid.js:312](../src/services/raid.js), [src/services/raid.js:236](../src/services/raid.js), [src/services/raid.js:83](../src/services/raid.js).

<a id="j68"></a>

### J68 — Decline or cancel a trade

Reject a request or cancel during the confirmation/countdown rather than transfer the offer.

- Category: Multiplayer; type: Variant.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: A necessary control for the confirmed trading flow.
- Parent: J14.
- Sources: [src/events/trade/tradeRequestButton.js:1](../src/events/trade/tradeRequestButton.js), [src/services/trade.js:627](../src/services/trade.js).

<a id="j69"></a>

### J69 — Build and revise a trade offer

Add/remove money and eligible Pokémon, inspect both offers, and enforce level/quantity/value restrictions before acceptance.

- Category: Multiplayer; type: Variant.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Essential preparation and safeguards for trading.
- Parent: J14.
- Source / scope notes: At the source snapshot, trading uses level 40 eligibility, at most 10 Pokémon and 25,000 currency.
- Sources: [src/commands/social/tradeAdd.js:1](../src/commands/social/tradeAdd.js), [src/commands/social/tradeRemove.js:1](../src/commands/social/tradeRemove.js), [src/services/trade.js:637](../src/services/trade.js).

<a id="j70"></a>

### J70 — Compare global and server standings

Switch leaderboard scope across the six configured ranking categories.

- Category: Social & discovery; type: Variant.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: Keeps the confirmed low priority of competitive standings.
- Parent: J15.
- Source / scope notes: The bot exposes global and server views. The reviewed web priority does not settle a server-context design.
- Sources: [src/elements/social/Leaderboard.js:1](../src/elements/social/Leaderboard.js), [src/config/socialConfig.js:37](../src/config/socialConfig.js).

<a id="j71"></a>

### J71 — Control profile privacy

Choose whether other players may view the trainer profile.

- Category: Preferences; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Profile privacy is a critical personal setting.
- Parent: J35.
- Sources: [src/config/trainerConfig.js:32](../src/config/trainerConfig.js), [src/commands/trainer/trainerInfo.js:1](../src/commands/trainer/trainerInfo.js).

<a id="j72"></a>

### J72 — Choose Discord mobile or desktop layout

Save the device preference used to format Discord battle output.

- Category: Preferences; type: Variant.
- Bot: **P0**; web: **Outside scope**; maintainer approved.
- Rationale: The Discord mobile/desktop layout setting is critical for that surface; web uses its own layout and remains outside this setting’s scope.
- Parent: J35.
- Sources: [src/config/trainerConfig.js:50](../src/config/trainerConfig.js), [src/utils/trainerUtils.js:362](../src/utils/trainerUtils.js).

<a id="j73"></a>

### J73 — Toggle target confirmation indicators

Choose whether Discord previews a target and asks for confirmation before acting.

- Category: Preferences; type: Variant.
- Bot: **P0**; web: **Outside scope**; maintainer approved.
- Rationale: The Discord target-indicator setting is critical on the bot. Its direct web equivalent is outside scope because web targeting works differently.
- Parent: J35.
- Maintainer review note: Out of scope for web for now since web UI doesn't really do target indicators the same way as the bot
- Sources: [src/config/trainerConfig.js:67](../src/config/trainerConfig.js), [src/events/battle/battleTargetSelect.js:1](../src/events/battle/battleTargetSelect.js).

<a id="j74"></a>

### J74 — Toggle tutorial and quest reminders

Enable or suppress contextual completion and onboarding reminders.

- Category: Preferences; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Control of tutorial and quest reminders is a critical personal setting.
- Parent: J35.
- Sources: [src/config/trainerConfig.js:84](../src/config/trainerConfig.js), [src/services/misc.js:98](../src/services/misc.js).

<a id="j75"></a>

### J75 — Inspect equipment rules and costs

Understand primary/secondary/substat modifiers, qualities, upgrade levels and reroll costs before spending.

- Category: Equipment & items; type: Variant.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Supports informed spending; exact help presentation is flexible.
- Parent: J07.
- Sources: [src/config/equipmentConfig.js:440](../src/config/equipmentConfig.js), [src/services/pokemon.js:1544](../src/services/pokemon.js).

<a id="j76"></a>

### J76 — Reduce or reset EV allocation

Train at Berry Bush or Berry Farm to remove EVs and rebuild a Pokémon.

- Category: Progression; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: EV reduction/reset is part of critical training and build management.
- Parent: J06.
- Sources: [src/config/locationConfig.js:10](../src/config/locationConfig.js), [src/services/pokemon.js:575](../src/services/pokemon.js).

<a id="j77"></a>

### J77 — Unlock and obtain Mew

Defeat New Island and access Mew to add the Mythical Pokémon to the collection.

- Category: Mythical Pokémon; type: Variant.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Meaningful progression reward with a specialized build path.
- Parent: J40.
- Dependencies: J30.
- Sources: [src/services/mythic.js:186](../src/services/mythic.js).

<a id="j78"></a>

### J78 — Unlock and obtain Celebi

Reach the configured trainer level, buy Ilex Shrine and obtain Celebi.

- Category: Mythical Pokémon; type: Variant.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: Celebi acquisition is lower-priority specialized progression; applying existing Celebi bonuses remains a separate P0 outcome.
- Parent: J41.
- Dependencies: J28.
- Sources: [src/services/mythic.js:412](../src/services/mythic.js).

<a id="j79"></a>

### J79 — Receive Celebi EXP and daily reward bonuses

Apply Celebi ownership bonuses to Pokémon EXP and daily money/material rewards.

- Category: Mythical Pokémon; type: Mechanic.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Owned Celebi bonuses affect EXP and daily rewards in core flows.
- Parent: J41.
- Sources: [src/services/pokemon.js:575](../src/services/pokemon.js), [src/services/gacha.js:68](../src/services/gacha.js).

<a id="j80"></a>

### J80 — Unlock and obtain Deoxys

Defeat Battle Tower floor 20 and obtain Deoxys through its Mythical entry point.

- Category: Mythical Pokémon; type: Variant.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: Deoxys acquisition is lower-priority specialized progression even though Battle Tower itself is P0.
- Parent: J42.
- Dependencies: J31.
- Sources: [src/services/mythic.js:576](../src/services/mythic.js).

<a id="j81"></a>

### J81 — Unlock and obtain Jirachi

Meet Star Piece and traded-original-owner requirements and obtain Jirachi.

- Category: Mythical Pokémon; type: Variant.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: Jirachi acquisition is lower-priority specialized progression; preserve its raid/trade prerequisites.
- Parent: J43.
- Dependencies: J11, J14.
- Sources: [src/services/mythic.js:696](../src/services/mythic.js).

<a id="j82"></a>

### J82 — Receive Jirachi shiny bonuses

Apply the configured shiny-chance bonuses in acquisition and raid reward generation.

- Category: Mythical Pokémon; type: Mechanic.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Owned Jirachi bonuses affect shiny odds in acquisition and raid rewards.
- Parent: J43.
- Sources: [src/services/gacha.js:187](../src/services/gacha.js), [src/services/raid.js:236](../src/services/raid.js).

<a id="j83"></a>

### J83 — Wish for Power

Spend Star Pieces to set a random non-perfect IV on a selected Pokémon to 31.

- Category: Mythical Pokémon; type: Variant.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: The Power wish is lower-priority specialized endgame customization.
- Parent: J43.
- Source / scope notes: Wishes share the configured weekly usedWish allowance.
- Sources: [src/services/mythic.js:845](../src/services/mythic.js), [src/config/mythicConfig.js:205](../src/config/mythicConfig.js).

<a id="j84"></a>

### J84 — Wish for Rebirth

Spend Star Pieces to reroll the selected Pokémon to a different available ability.

- Category: Mythical Pokémon; type: Variant.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: The Rebirth wish is lower-priority specialized endgame customization.
- Parent: J43.
- Source / scope notes: Wishes share the configured weekly usedWish allowance.
- Sources: [src/services/mythic.js:845](../src/services/mythic.js), [src/config/mythicConfig.js:205](../src/config/mythicConfig.js).

<a id="j85"></a>

### J85 — Wish for Allies

Spend Star Pieces to receive a batch of random Pokéballs.

- Category: Mythical Pokémon; type: Variant.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: The Allies wish is lower-priority specialized resource conversion.
- Parent: J43.
- Source / scope notes: Wishes share the configured weekly usedWish allowance.
- Sources: [src/services/mythic.js:845](../src/services/mythic.js), [src/config/mythicConfig.js:205](../src/config/mythicConfig.js).

<a id="j86"></a>

### J86 — Wish for Wealth

Spend Star Pieces to receive currency, equipment shards and mints.

- Category: Mythical Pokémon; type: Variant.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: The Wealth wish is lower-priority specialized resource conversion.
- Parent: J43.
- Source / scope notes: Wishes share the configured weekly usedWish allowance.
- Sources: [src/services/mythic.js:845](../src/services/mythic.js), [src/config/mythicConfig.js:205](../src/config/mythicConfig.js).

<a id="j87"></a>

### J87 — Unlock and obtain Darkrai

Complete at least 25 tutorial stages and obtain Darkrai to unlock Auto access.

- Category: Mythical Pokémon; type: Variant.
- Bot: **P1**; web: **P1**; maintainer approved.
- Rationale: Darkrai access enables the reviewed P1 Auto flow; the current gate depends on tutorial completions.
- Parent: J44.
- Dependencies: J01.
- Sources: [src/services/mythic.js:761](../src/services/mythic.js).

<a id="j88"></a>

### J88 — Unlock and obtain Arceus

Collect the required Unown, creation/guardian species and five Mythical Pokémon, then obtain Arceus.

- Category: Mythical Pokémon; type: Variant.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: Arceus acquisition is lower-priority late-game collection progression.
- Parent: J45.
- Dependencies: J40, J41, J42, J43, J44.
- Sources: [src/services/mythic.js:964](../src/services/mythic.js).

<a id="j89"></a>

### J89 — Change Arceus type

Select one of Arceus’s supported forms/types and update its build.

- Category: Mythical Pokémon; type: Variant.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: Arceus type customization is lower-priority specialized content.
- Parent: J45.
- Sources: [src/services/mythic.js:1100](../src/services/mythic.js).

<a id="j90"></a>

### J90 — Create a chosen Pokémon with Arceus

Use the shared weekly creation allowance to create an eligible species.

- Category: Mythical Pokémon; type: Variant.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: Arceus Pokémon creation is lower-priority late-game acquisition.
- Parent: J45.
- Sources: [src/services/mythic.js:1157](../src/services/mythic.js), [src/services/mythic.js:1143](../src/services/mythic.js).

<a id="j91"></a>

### J91 — Create a chosen item with Arceus

Use the shared weekly creation allowance to receive one available item.

- Category: Mythical Pokémon; type: Variant.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: Arceus item creation is lower-priority late-game resource generation.
- Parent: J45.
- Sources: [src/services/mythic.js:1197](../src/services/mythic.js).

<a id="j92"></a>

### J92 — Choose and use a move

Identify the active Pokémon and choose an available move based on tier, type, damage and cooldown.

- Category: Battle controls; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Essential manual combat interaction.
- Parent: J08.
- Sources: [src/events/battle/battleMoveSelect.js:1](../src/events/battle/battleMoveSelect.js), [src/battle/engine/BattlePokemon.js:308](../src/battle/engine/BattlePokemon.js).

<a id="j93"></a>

### J93 — Select and preview targets and affected tiles

Choose a legal target, see the move footprint and confirm the action where applicable.

- Category: Battle controls; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Core spatial combat; web and Discord share the same targeting rules.
- Parent: J08.
- Sources: [src/events/battle/battleTargetSelect.js:1](../src/events/battle/battleTargetSelect.js), [src/events/battle/battleTargetConfirm.js:1](../src/events/battle/battleTargetConfirm.js), [src/battle/engine/BattlePokemon.js:979](../src/battle/engine/BattlePokemon.js).

<a id="j94"></a>

### J94 — Skip a turn or advance legacy NPC turns

Pass the active Pokémon’s turn, or use Next Turn on a legacy NPC turn.

- Category: Battle controls; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: A reachable manual battle action, including handling unusable moves.
- Parent: J08.
- Source / scope notes: Durable NPC turns advance automatically; legacy Discord requires a Next Turn action. Player skip is separate from legacy NPC turn advancement.
- Sources: [src/components/battleNextTurnRow.js:1](../src/components/battleNextTurnRow.js), [src/battle/engine/Battle.js:657](../src/battle/engine/Battle.js).

<a id="j95"></a>

### J95 — Inspect teams, moves and battle state

View team members, HP, active combatant, readiness, moves and recent battle output.

- Category: Battle controls; type: Variant.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Players need current state to make core combat decisions.
- Parent: J08.
- Sources: [src/events/battle/battleInfo.js:1](../src/events/battle/battleInfo.js), [src/embeds/battleEmbeds.js:1](../src/embeds/battleEmbeds.js).

<a id="j96"></a>

### J96 — Resolve readiness, speed, cooldowns and extra turns

Apply turn order, move availability and automatic NPC/forced-turn progression.

- Category: Battle mechanics; type: Mechanic.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Defines combat timing; preserving a battle requires these semantics.
- Parent: J08.
- Sources: [src/battle/engine/Battle.js:316](../src/battle/engine/Battle.js), [src/battle/engine/BattlePokemon.js:2355](../src/battle/engine/BattlePokemon.js), [src/battle/service/BattleService.js:54](../src/battle/service/BattleService.js).

<a id="j97"></a>

### J97 — Resolve status, buffs, debuffs and damage over time

Apply, resist, tick, dispel and expire battle modifiers and status conditions.

- Category: Battle mechanics; type: Mechanic.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Existing combat rules and visible consequences are essential to battle parity.
- Parent: J08.
- Sources: [src/battle/engine/BattlePokemon.js:1811](../src/battle/engine/BattlePokemon.js), [src/battle/engine/BattlePokemon.js:2030](../src/battle/engine/BattlePokemon.js), [src/config/battleConfig.js:241](../src/config/battleConfig.js).

<a id="j98"></a>

### J98 — Resolve weather and its suppression

Create, tick, replace, negate and clear supported weather conditions.

- Category: Battle mechanics; type: Mechanic.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Weather and its suppression affect normal move and ability resolution.
- Parent: J08.
- Sources: [src/battle/engine/Battle.js:717](../src/battle/engine/Battle.js), [src/battle/engine/Battle.js:864](../src/battle/engine/Battle.js).

<a id="j99"></a>

### J99 — Resolve damage, healing, fainting and revival

Apply type matchups, attack/defense, accuracy, critical hits, multi-target damage, healing and faint/revive outcomes.

- Category: Battle mechanics; type: Mechanic.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Core combat resolution.
- Parent: J08.
- Sources: [src/battle/engine/BattlePokemon.js:633](../src/battle/engine/BattlePokemon.js), [src/battle/engine/BattlePokemon.js:1409](../src/battle/engine/BattlePokemon.js), [src/battle/engine/BattlePokemon.js:1469](../src/battle/engine/BattlePokemon.js).

<a id="j100"></a>

### J100 — Resolve passive abilities and held-item triggers

Activate abilities and held items, including consumption, suppression, triggered healing/damage and reward modifiers.

- Category: Battle mechanics; type: Mechanic.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Abilities and held items are part of owned builds and normal battle resolution.
- Parent: J08.
- Sources: [src/battle/engine/BattlePokemon.js:1492](../src/battle/engine/BattlePokemon.js), [src/battle/engine/BattlePokemon.js:1519](../src/battle/engine/BattlePokemon.js), [src/battle/data/initialize.js:1](../src/battle/data/initialize.js).

<a id="j101"></a>

### J101 — Resolve special moves, positioning and transformations

Resolve footprint patterns, redirection/taunts, forced repositioning, move copying/disabling and species/ability transformations.

- Category: Battle mechanics; type: Mechanic.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Special moves, positioning and transformations are implemented combat mechanics in the shared engine.
- Parent: J08.
- Source / scope notes: These are move-driven mechanics; there are no standalone player switch/copy/transform buttons implied by this row. Data families are mapped in the coverage audit.
- Sources: [src/battle/engine/BattlePokemon.js:1187](../src/battle/engine/BattlePokemon.js), [src/battle/engine/BattlePokemon.js:209](../src/battle/engine/BattlePokemon.js), [src/battle/data/moves.js:1](../src/battle/data/moves.js).

<a id="j102"></a>

### J102 — Receive a saved battle result and progression once

Settle victory/loss, trainer/Pokémon rewards, daily bonuses and quest events; show results without granting them again.

- Category: Battle continuity; type: System.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Core completion correctness across Discord and web.
- Source / scope notes: The existing completion contract records unresolved partial-write recovery; source support is not proof of exactly-once production acceptance.
- Sources: [src/services/battle.js:127](../src/services/battle.js), [src/battle/service/BattleService.js:55](../src/battle/service/BattleService.js).

<a id="j103"></a>

### J103 — Reject stale or unauthorized battle actions and recover

Refresh changed battle state, enforce whose turn it is and participants-only access, and show recoverable expiry/errors.

- Category: Battle continuity; type: System.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Protects shared state and allows the confirmed resume journey to work.
- Parent: J09.
- Sources: [src/battle/discord/battleContext.js:1](../src/battle/discord/battleContext.js), [src/battle/service/BattleService.js:8](../src/battle/service/BattleService.js), [src/battle/persistence/BattleStore.js:1](../src/battle/persistence/BattleStore.js).

<a id="j104"></a>

### J104 — Progress through dungeon phases and tower floors

Advance configured NPC phases, retain the current run and unlock the next recurring tower stage after victory.

- Category: Battle modes; type: Mechanic.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Required mechanics of dungeon phases and tower floors; both dungeon and Battle Tower entry are reviewed P0.
- Source / scope notes: Dungeon and Battle Tower entry are both reviewed P0. This row describes correct phase/floor progression within those offered modes.
- Sources: [src/battle/engine/npcs.js:1](../src/battle/engine/npcs.js), [src/services/battle.js:1000](../src/services/battle.js), [src/config/npcConfig.js:1362](../src/config/npcConfig.js).

<a id="j105"></a>

### J105 — Find support and community help

Follow the configured support-server link when the player needs help beyond built-in instructions.

- Category: Learning; type: Variant.
- Bot: **P2**; web: **P2**; maintainer approved.
- Rationale: Useful support route, but the core learning system must stand on its own.
- Sources: [src/config/helpConfig.js:289](../src/config/helpConfig.js), [src/config/questConfig.js:41](../src/config/questConfig.js).

<a id="j106"></a>

### J106 — Handle expired interactions and request cooldowns

Interaction handlers check stored UI state and route errors or expiry responses; the bot also applies a per-user request cooldown.

- Category: Battle continuity; type: System.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Core flows need a usable recovery path; current bot handling varies by handler.
- Source / scope notes: Bot cooldowns can silently drop interactions. Error/expiry handling varies by handler; a consistent explanation and recovery path is not established.
- Sources: [src/services/state.js:1](../src/services/state.js), [src/services/bot/rateLimit.js:1](../src/services/bot/rateLimit.js), [src/handlers/eventHandler.js:1](../src/handlers/eventHandler.js).

<a id="j107"></a>

### J107 — Sign in as the existing Discord trainer

Authenticate through Discord OAuth and open the same player identity and progress.

- Category: Web access; type: System.
- Bot: **Outside scope**; web: **P0**; maintainer approved.
- Rationale: Enabling requirement for the web interface; not a standalone bot command.
- Availability: Web only.
- Sources: [src/web/discordOAuth.js:1](../src/web/discordOAuth.js), [src/web/battleApi.js:1](../src/web/battleApi.js).

<a id="j108"></a>

### J108 — Sign out and recover an expired web session

End a session or sign back in while retaining the intended destination and recoverable battle.

- Category: Web access; type: System.
- Bot: **Outside scope**; web: **P0**; maintainer approved.
- Rationale: Required access and recovery for the web surface.
- Availability: Web only.
- Sources: [src/web/sessionStore.js:1](../src/web/sessionStore.js), [src/web/battleApi.js:1](../src/web/battleApi.js).

<a id="j109"></a>

### J109 — Check bot responsiveness

Invoke ping and receive pong.

- Category: Developer tools; type: Developer.
- Bot: **P3**; web: **Outside scope**; maintainer approved.
- Rationale: Bot ping is a very-low-priority diagnostic convenience.
- Sources: [src/commands/heartbeat/ping.js:1](../src/commands/heartbeat/ping.js).

<a id="j110"></a>

### J110 — Echo diagnostic text

Return provided text in the alpha/beta bot.

- Category: Developer tools; type: Developer.
- Bot: **P3**; web: **Outside scope**; maintainer approved.
- Rationale: Development convenience.
- Availability: Alpha/Beta only.
- Sources: [src/commands/heartbeat/echo.js:1](../src/commands/heartbeat/echo.js).

<a id="j111"></a>

### J111 — Grant test Pokémon

In alpha, generate a Pokémon at the chosen level and equipment level.

- Category: Developer tools; type: Developer.
- Bot: **Outside scope**; web: **Outside scope**; maintainer approved.
- Rationale: Excluded from the current production-facing product scope in the maintainer review; retained in the source inventory for completeness.
- Maintainer review note: Dev-only stuff like this I'm going to say is out of scope for now. I'm going to constrain the scope to production-facing only for the time being
- Availability: Alpha only.
- Sources: [src/commands/heartbeat/give.js:1](../src/commands/heartbeat/give.js).

<a id="j112"></a>

### J112 — Grant test inventory items

In alpha, add a chosen item and quantity to the invoking trainer.

- Category: Developer tools; type: Developer.
- Bot: **Outside scope**; web: **Outside scope**; maintainer approved.
- Rationale: Excluded from the current production-facing product scope in the maintainer review; retained in the source inventory for completeness.
- Availability: Alpha only.
- Sources: [src/commands/heartbeat/giveItem.js:1](../src/commands/heartbeat/giveItem.js).

<a id="j113"></a>

### J113 — Run the test interaction harness

Invoke configured test output or its registered test event.

- Category: Developer tools; type: Developer.
- Bot: **Outside scope**; web: **Outside scope**; maintainer approved.
- Rationale: Excluded from the current production-facing product scope in the maintainer review; retained in the source inventory for completeness.
- Availability: Development / dormant test event.
- Sources: [src/commands/heartbeat/test.js:1](../src/commands/heartbeat/test.js), [src/events/testEvent.js:1](../src/events/testEvent.js).

<a id="j114"></a>

### J114 — Inspect player and guild records

Use existing read-only admin scripts to inspect persisted user or guild data.

- Category: Operator tools; type: Operator.
- Bot: **Outside scope**; web: **Outside scope**; maintainer approved.
- Rationale: Excluded from the current production-facing product scope in the maintainer review; retained in the source inventory for completeness.
- Sources: [scripts/database/admin/inspectUser.js:1](../scripts/database/admin/inspectUser.js), [scripts/database/admin/inspectGuild.js:1](../scripts/database/admin/inspectGuild.js).

<a id="j115"></a>

### J115 — Reset a player account and collection

Use the operator script to delete the selected trainer and owned Pokémon.

- Category: Operator tools; type: Operator.
- Bot: **Outside scope**; web: **Outside scope**; maintainer approved.
- Rationale: Excluded from the current production-facing product scope in the maintainer review; retained in the source inventory for completeness.
- Sources: [scripts/database/admin/resetUser.js:1](../scripts/database/admin/resetUser.js).

<a id="j116"></a>

### J116 — Reset quest or level reward progress

Use admin/migration scripts to reset selected reward progress.

- Category: Operator tools; type: Operator.
- Bot: **Outside scope**; web: **Outside scope**; maintainer approved.
- Rationale: Excluded from the current production-facing product scope in the maintainer review; retained in the source inventory for completeness.
- Sources: [scripts/database/admin/resetUserRewards.js:1](../scripts/database/admin/resetUserRewards.js), [scripts/database/migrations/resetLevelRewards.js:1](../scripts/database/migrations/resetLevelRewards.js).

<a id="j117"></a>

### J117 — Reset a player’s timed allowances

Use the admin script to reset last-corrected time and trigger configured allowance refresh.

- Category: Operator tools; type: Operator.
- Bot: **Outside scope**; web: **Outside scope**; maintainer approved.
- Rationale: Excluded from the current production-facing product scope in the maintainer review; retained in the source inventory for completeness.
- Sources: [scripts/database/admin/resetUserDaily.js:1](../scripts/database/admin/resetUserDaily.js).

<a id="j118"></a>

### J118 — Grant vote reward credit manually

Add voting reward boxes through the existing admin script.

- Category: Operator tools; type: Operator.
- Bot: **Outside scope**; web: **Outside scope**; maintainer approved.
- Rationale: Excluded from the current production-facing product scope in the maintainer review; retained in the source inventory for completeness.
- Sources: [scripts/database/admin/addVotingRewards.js:1](../scripts/database/admin/addVotingRewards.js).

<a id="j119"></a>

### J119 — Reset guild configuration

Delete the selected guild record through the existing admin script.

- Category: Operator tools; type: Operator.
- Bot: **Outside scope**; web: **Outside scope**; maintainer approved.
- Rationale: Excluded from the current production-facing product scope in the maintainer review; retained in the source inventory for completeness.
- Sources: [scripts/database/admin/resetGuild.js:1](../scripts/database/admin/resetGuild.js).

<a id="j120"></a>

### J120 — Clear active raids

Delete raid records with the existing operator script.

- Category: Operator tools; type: Operator.
- Bot: **Outside scope**; web: **Outside scope**; maintainer approved.
- Rationale: Excluded from the current production-facing product scope in the maintainer review; retained in the source inventory for completeness.
- Sources: [scripts/database/admin/clearRaids.js:1](../scripts/database/admin/clearRaids.js).

<a id="j121"></a>

### J121 — Remove the bot from a server

Use the operator script to leave a specified guild.

- Category: Operator tools; type: Operator.
- Bot: **P2**; web: **Outside scope**; maintainer approved.
- Rationale: Existing server operations function.
- Sources: [scripts/bot/leaveServer.js:1](../scripts/bot/leaveServer.js).

<a id="j122"></a>

### J122 — Register commands and initialize storage

Deploy stage-appropriate Discord commands or set up required database collections/views.

- Category: Operator tools; type: Operator.
- Bot: **P0**; web: **Outside scope**; maintainer approved.
- Rationale: Required bot provisioning functions, outside the player web port.
- Sources: [scripts/bot/deployCommands.js:1](../scripts/bot/deployCommands.js), [scripts/database/setupDatabase.js:1](../scripts/database/setupDatabase.js).

<a id="j123"></a>

### J123 — Schedule wild encounters and expire old raids

Run configured spawn scheduling, channel eligibility and raid cleanup while the bot is online.

- Category: Background systems; type: System.
- Bot: **P0**; web: **Outside scope**; maintainer approved.
- Rationale: Enables server encounters and avoids stale raids; current web has no server context.
- Source / scope notes: Wild spawning requires FFLAG_ENABLE_SPAWN; do not assume its live value.
- Sources: [src/index.js:1](../src/index.js), [src/services/spawn.js:423](../src/services/spawn.js), [src/services/raid.js:746](../src/services/raid.js).

<a id="j124"></a>

### J124 — Receive authenticated external vote credit

Handle configured provider callbacks, update voting streak/credits and make boxes claimable.

- Category: Background systems; type: System.
- Bot: **P1**; web: **Outside scope**; maintainer approved.
- Rationale: Enables external vote rewards; web claiming can reuse shared credits without a second provider webhook.
- Parent: J33.
- Sources: [src/web/voteWebhook.js:1](../src/web/voteWebhook.js), [src/services/trainer.js:462](../src/services/trainer.js), [src/config/socialConfig.js:21](../src/config/socialConfig.js).

<a id="j125"></a>

### J125 — Report bot presence, directory stats and resource metrics

Set the help/tutorial presence, post configured bot-directory counts and record resource/state diagnostics.

- Category: Background systems; type: System.
- Bot: **P3**; web: **Outside scope**; maintainer approved.
- Rationale: Operational visibility and discovery rather than a player game mechanic.
- Sources: [src/index.js:1](../src/index.js), [src/log.js:1](../src/log.js).

<a id="j126"></a>

### J126 — Maintain species, assets, enums and historical data

Run existing development/data/asset scripts and one-off migrations when maintaining the bot.

- Category: Developer tools; type: Developer.
- Bot: **P2**; web: **Outside scope**; maintainer approved.
- Rationale: Repository maintenance capabilities are accounted for, not proposed as public web tools.
- Source / scope notes: The scan included development scripts, historical migrations, image tools and statistics exports under scripts/. These are maintenance functions, not additional player journeys; presence does not establish safe modern execution.
- Sources: [scripts/dev/find-missing-pokemon.js:1](../scripts/dev/find-missing-pokemon.js), [scripts/fetchPokeApiData.js:1](../scripts/fetchPokeApiData.js), [scripts/database/migrations/calculatePokemonStats.js:1](../scripts/database/migrations/calculatePokemonStats.js).

<a id="j127"></a>

### J127 — Receive and spend all reward/resource types

Preserve money, four Pokéball types, shards, mints, Raid Passes, Star Pieces, Dream Cards and held-item rewards with their existing sources/sinks.

- Category: Trainer & economy; type: Mechanic.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Economy correctness underpins core collection and progression.
- Source / scope notes: A resource’s existence does not automatically prioritize every optional way to earn it.
- Sources: [src/config/backpackConfig.js:1](../src/config/backpackConfig.js), [src/config/gachaConfig.js:715](../src/config/gachaConfig.js), [src/utils/trainerUtils.js:234](../src/utils/trainerUtils.js).

<a id="j128"></a>

### J128 — Survive browser closure and compatible backend restart

Retain generated starting parties and revisioned durable state, and resume compatible ongoing battles.

- Category: Battle continuity; type: System.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Direct technical support for the confirmed P0 resume journey.
- Parent: J09.
- Source / scope notes: Feature flags and real restart/reward recovery acceptance are separately tracked; incompatible ruleset migration is maintenance work.
- Sources: [src/battle/persistence/battleRecord.js:1](../src/battle/persistence/battleRecord.js), [src/battle/persistence/mongoBattleStore.js:1](../src/battle/persistence/mongoBattleStore.js), [src/services/durableBattle.js:1](../src/services/durableBattle.js).

<a id="j129"></a>

### J129 — Preserve ownership, rarity, shiny and build identity

Retain original/current owner, unique ID, custom species/forms, growth curve, nature, IVs/EVs, ability, held item and equipment through relevant flows.

- Category: Collection & research; type: Mechanic.
- Bot: **P0**; web: **P0**; maintainer approved.
- Rationale: Persistent collection identity and stats are core data semantics.
- Parent: J04.
- Sources: [src/services/gacha.js:187](../src/services/gacha.js), [src/services/pokemon.js:167](../src/services/pokemon.js), [src/services/trade.js:1](../src/services/trade.js).

## Verification and remaining work

The decision export matches all 129 stable IDs, titles and catalog version; all entries are approved and their priority values and notes are incorporated without change. Source links and references are checked. The prior scan reconciled 65 command definitions (61 handlers), 58 event definitions (57 handlers), 33 Deact elements and the data-definition tables across 319 JavaScript files plus three Python development utilities.

Static coverage does not prove live behavior, usage frequency or correct implementation. A future PRD can use this inventory and its unresolved questions to define web scope and acceptance criteria. No runtime bot code, production state or GitHub priorities changed during this documentation work.
