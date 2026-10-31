# Web parity coverage audit

Audited **2026-10-28, America/Los_Angeles**. Phase 1 documentation and read-only
investigation are complete. This is a backlog assessment and release recommendation,
not release approval, a runtime acceptance record or authorization to create tickets.

Inspected checkout: `a6f74e07b6fa3a807f05dfec01411c66780b5ff1` (detached HEAD).
At intake, `docs/efforts/web-battler.md` was modified and
`docs/efforts/web-parity.md` was untracked; both supplied the expansion direction
and have been preserved and extended. No local runtime changes were present.
The [catalog](../user-journeys.md) describes bot behavior at `f2fc1f7`; this audit
uses the current checkout for implementation status and the current catalog for
reviewed priorities. Future code/catalog changes require reconciliation again.

## Phase 2 publication checkpoint

The maintainer-approved cut was published on **2026-10-29**. See the
[published ticket map and verification receipt](web-parity-tickets.md) for current
labels, priorities and decisions. All 106 eligible IDs have parity owners.
The original Phase 1 release recommendations below are historical input, not the
approved cut: Tower, trainer initialization/learning, polling and promotion were
subsequently selected. G23 was split into P0 initialization (#216) and P1 learning
(#217); journey impact ratings are unchanged. Primary row links now open their
published issue. Code coverage/evidence was not reverified in this publication.

## Outcome and limits

The browser is an authenticated **continuation surface** for durable battles
started in Discord. It can list, inspect, act and show a saved winner/end state;
it does not expose the stored itemized completion reward summary. It has
no web creation route for battles, collection management, acquisition, training,
shop, quests or mythical powers. Backend rules and storage often exist, but
several operations are interleaved with Discord handlers, embeds and temporary
state. Exposing those operations requires more than a screen port.

All **106 eligible journeys** retain individual rows below; all **23 exclusions**
are reconciled separately. The proposed work groups cover the complete parity
backlog, including P2/P3. First-release recommendations are a separate column;
P0/P1 impact is never used as automatic release membership or ticket urgency.

Evidence is static source inspection plus the existing dated verification
records. No tests, provider calls, database operations, production actions or
new browser acceptance were performed. Existing UI approval and the reported
working deployment do not verify every full journey. In particular, no row is
labelled end-to-end verified on that basis. Source absence is established from
the complete app/API entry points, not command filenames alone.

## Reading the assessment

- **IU** = implemented but unverified: the described web operation is reachable,
  but full current environment acceptance is missing.
- **Partial** = only named steps or consumers exist; missing initiation,
  completion, side effects or recovery are stated explicitly.
- **Absent** = no web entry/operation for this outcome. A reusable backend is
  not web coverage. **Unknown** would mean implementation status could not be
  established; no whole row requires it after the app/API census. Live behavior
  and named sub-paths below remain explicitly unverified/unknown.
- **Candidate**, **Later**, **Unresolved** are recommendations, not commitments.
  Candidate means proposed for the broader first release, not necessarily its
  first implementation slice. Later rows remain in the parity backlog.
- Effort **S/M/L** is relative remaining delivery work, not elapsed time. Row
  confidence **H/M/L** concerns the estimate; status is grounded separately.
  Each row inherits the cited evidence family's backend/coupling facts and its
  group's UI/service/persistence/product risks, dependencies and acceptance.
  Row notes add the journey-specific steps/effects. No mechanic implies a new screen.

Required now: complete ID accounting, evidence, side effects, issue reuse and
release choices. Preserve flexibility: stable journey/group IDs, shared operation
boundaries and existing saves/unlocks. Deferred: final navigation, API design,
transaction strategy, estimates in days, ticket publication and rollout; settle
those with the selected Phase 2 outcome and representative implementation slice.

## Evidence register and traced boundaries

These family references apply to every row citing them. Links locate inspected
sources; symbols identify the boundary more reliably than historical line numbers.

<a id="e01"></a>

### E01 — Complete current browser/API surface

[App.tsx](../../web/src/App.tsx) renders login, battle list/detail and local audio
settings. [BattleFeature](../../web/src/battles/BattleFeature.tsx) selects a battle
by query parameter. [battleApi.createBattleApi](../../src/web/battleApi.js)
mounts catalog, OAuth/session, battle list/read and `useMove`/`skipTurn` actions;
it exposes neither start nor Auto nor any economy/collection endpoint.
[BattleWebService](../../src/battle/service/BattleWebService.js) projects only
list/get/act. A catalog of species/moves is display metadata, not a Pokédex,
owned collection or build editor. All absent rows use this surface census in
addition to their domain evidence.

<a id="e02"></a>

### E02 — Identity, refresh, resources and interaction progression

[trainer](../../src/services/trainer.js): `getTrainer` creates through
`initTrainer`; `getTrainerFromId` explicitly does not create. Both existing
trainer reads can run `tryUpdateTrainerFields`, which writes refreshed fields
back to `users`. [trainerFields](../../src/config/trainerConfig.js) defines
starter money/balls, daily shop/NPC allowances, weekly powers, fortnightly tower
reset and five-minute Dream Card regeneration/cap. OAuth callback only stores
Discord ID in [WebSessionStore](../../src/web/sessionStore.js); `/me` returns
that ID. It does not initialize or refresh a trainer. A signed-in new Discord
account therefore has no supported browser route to start play.

[commandHandler](../../src/handlers/commandHandler.js) and
[eventHandler.handleEvent](../../src/handlers/eventHandler.js) award configured
EXP/currency after successful commands/clicks; Deact callbacks default to 5 EXP /
10 money. `trainer.addExpAndMoneyTrainer`, `getLevelRewards`, `updateTrainer` and
`emitTrainerEvent` persist balances, levels, claims and quest changes. Browser
battle completion uses the shared reward path, but browser reads/previews/clicks
do not inherit Discord handler rewards. Define semantic operation rewards before
porting so retrying, polling and switching surfaces cannot farm a second grant.
Whole-trainer `$set` updates and multiple-document effects need stale-write and
interruption checks; durable battle revision checks do not protect these writes.

<a id="e03"></a>

### E03 — Collection identity, protection and release

[PokemonList](../../src/elements/pokemon/PokemonList.js) →
[usePokemonList](../../src/hooks/usePokemonList.js) →
[pokemon.listPokemons / getPokemonFromUserId](../../src/services/pokemon.js) →
`LIST_POKEMON` view / `userPokemon` provides filters, sort, pagination and
owner-scoped reads. `listPokemons(userId, listOptions)` merges the supplied filter;
web must allowlist fields/operators and force authenticated ownership rather than
accept raw Mongo filters. Info renderers and search modals are Discord-specific.

`canRelease` checks ownership, mythical/lock/party restrictions; `toggleLock`
writes the supplied Pokémon and expects its caller to establish ownership.
[pokemonRelease](../../src/events/pokemon/pokemonRelease.js) validates stored
confirmation → deletes Pokémon → separately credits `calculateWorth` through
`addExpAndMoneyTrainer`. Partial deletion/credit failure is a recovery boundary,
not an atomic service. [pokemonReleasePage](../../src/events/pokemon/pokemonReleasePage.js)
uses captured page IDs, so a web confirmation needs exact reviewed IDs and fresh
eligibility, not whatever a changing filter returns later. Preserve `_id`,
`userId`, `originalOwner`, species/form, rarity/shiny, IV/EV/nature, moves, ability,
held item and equipment; battle projection alone exposes only a subset.

<a id="e04"></a>

### E04 — Party preparation and frozen battle setup

[PartyManage](../../src/elements/party/PartyManage.js) →
[party](../../src/services/party.js): `getPartyPokemons`,
`addOrMovePokemonToParty`, `removePokemonFromParty`, `updateParty` write the
trainer party; `validatePartyForBattle` uses layout, ownership, count and species
eligibility. [partyLoad](../../src/commands/battle/partyLoad.js) swaps active and
saved parties then writes the trainer; [partyAuto](../../src/commands/battle/partyAuto.js)
selects ranked Pokémon. Presets/auto presentation and some orchestration live
in commands. Verify missing IDs, duplicates/layout and stale concurrent edits at
the operation boundary instead of assuming the legacy validator is a complete
HTTP contract. [battleRecord](../../src/battle/persistence/battleRecord.js)
captures generated starting parties: later edits must not alter active battles.

<a id="e05"></a>

### E05 — Gacha and existing-owner bonuses

[bannerGacha](../../src/events/bannerGacha.js) →
[gacha.usePokeball](../../src/services/gacha.js) validates 1–10, banner, capacity,
ball balance, early guarantees and pity → writes trainer balls/pity/roll counts →
`giveNewPokemons` inserts generated `userPokemon` → emits `CAUGHT_POKEMON`.
The split debit/insert/event sequence leaves uncertain retries and partial writes.
`beginnerRoll` guarantees starter/Epic/Legendary milestones at 1/5/10 basic rolls.
`generateRandomPokemon` assigns original owner, shiny/IVs/ability/item/equipment;
`giveNewPokemons` reads existing `hasJirachi` for shiny odds. Banner embeds/buttons
and stored selection are Discord adapters. Acquisition must retain these effects
without requiring the lower-priority Jirachi unlock screen first.

<a id="e06"></a>

### E06 — Shop, locations, crafting and inventory

[buy command](../../src/commands/shop/buy.js) →
[shop.canBuyItem / buyItem](../../src/services/shop.js) → trainer balance,
backpack, purchase quotas and locations; reads configured prices, level limits
and caps. `buyItem` returns Discord-formatted result text; `buildShopSend` also
uses temporary selection state. `canCraftItem` / `craftItem` removes costs and
adds a recipe item through `updateTrainer`.
[locationConfig](../../src/config/locationConfig.js) and
[backpackConfig](../../src/config/backpackConfig.js) govern training/storage
and resource types; [BackpackEntryPoint](../../src/elements/trainer/BackpackEntryPoint.js)
and [BackpackList](../../src/elements/trainer/BackpackList.js) are Discord UI.
Refresh before quota/balance checks; validate quantities server-side, compare
concurrent spend/refresh, and return structured resulting balances. Computer Lab
capacity and Ilex Shrine access are effects of location purchases, not separate
stores. No independent passive-location income was found.

<a id="e07"></a>

### E07 — Training and build changes

[train](../../src/commands/pokemon/train.js) resolves owned Pokémon/location →
[pokemon.trainPokemon / addPokemonExpAndEVs](../../src/services/pokemon.js)
checks owned location, applies EXP/EV clamps and Celebi EXP multiplier, writes
Pokémon stats then emits `TRAINED_POKEMON`. Negative EV locations share this path.
`changeForm` charges trainer then transforms/writes Pokémon, with an attempted
refund on a failed write; atomicity is unproven. `evolvePokemon` transforms/writes
and emits `EVOLVED_POKEMON`; selection/requirement checks and cached choice are
spread through [evolution confirmation](../../src/events/pokemon/pokemonEvolveConfirm.js)
and its caller UI.
The web operation must revalidate permitted evolution and requirements on confirm.
[natureConfirm](../../src/events/natureConfirm.js) spends a mint before writing
nature/stats. A service filename does not establish a safe reusable mutation.

<a id="e08"></a>

### E08 — Equipment and held-item mutations

[pokemon](../../src/services/pokemon.js): `upgradeEquipmentLevel` and
`rerollStatSlot` check costs, debit trainer then write recalculated Pokémon;
`buildEquipmentListSend` / `buildEquipmentSwapSend` combine filtering, state,
embeds and two-Pokémon transfer/cost orchestration.
[equipmentSwap](../../src/events/equipment/equipmentSwap.js) calls that builder.
[equipmentConfig](../../src/config/equipmentConfig.js) supplies slot/quality/
upgrade rules. `changeHeldItem` / `removeHeldItem` owner-load Pokémon, return old
items to backpack and update trainer before Pokémon stats. Concurrent swap,
retry, stale balance and interruption can duplicate/lose resources unless the
new shared operation covers them. Build rules/costs belong with spend previews;
no separate mechanics screen is required.

<a id="e09"></a>

### E09 — Starts, mode progression and completion

[battle.buildPveSend / buildDungeonSend / buildBattleTowerSend](../../src/services/battle.js)
perform Discord selection → fresh trainer/party validation → generated NPC and
Battle → [durableBattle.getDurableBattleService](../../src/services/durableBattle.js)
→ `BattleService.start` → stored setup in `battles`, when flags permit. Otherwise
the legacy battle stays in temporary Discord state and is absent from web.
[DungeonNPC / TowerNPC](../../src/battle/engine/npcs.js), generated phase
queues and `processDurableBattleCompletion` carry dungeon phases/tower floor
progression. Extract a validated start operation, not `build*Send` as an HTTP
handler. NPC selection/difficulty, rewards eligibility, daily difficulty history
and next-floor start have no browser management screens.

`processBattleCompletionRewards` loads trainers/Pokémon, applies normal/daily
rewards and victory history, trainer/Pokémon EXP (including owned Celebi), and
quest/participation events. Durable `settleCompletion` owns the claim; display
must never regrant. The [completion boundary](../battle-completion-boundary.md)
and [durable record contract](../durable-battle-records.md) explicitly leave
partial writes/processing failures for reconciliation. Historical contract text
saying to keep starts disabled predates the overview's recorded enabled flags;
it is not evidence that those recovery gates passed. Reuse #186 and #185.

<a id="e10"></a>

### E10 — Current combat, continuation and recovery

[BattleService](../../src/battle/service/BattleService.js) →
[BattleStore](../../src/battle/persistence/BattleStore.js) and
[mongoBattleStore](../../src/battle/persistence/mongoBattleStore.js) enforce
participants, revision/request identity, replay, automatic NPC/forced turns,
expiry, result retention and completion claims.
[battleWebView](../../src/battle/service/battleWebView.js) projects own build and
public opponent state, legal moves/targets/footprints and ordered updates.
[useBattleSession](../../web/src/battles/useBattleSession.ts),
[useTargetConfirmation](../../web/src/battles/useTargetConfirmation.ts),
[BattleScreen](../../web/src/battles/BattleScreen.tsx) and
[useBattlePlayback](../../web/src/battles/useBattlePlayback.ts) render and submit
moves/skip; visibility polling and stale/error handling refresh current state.
Saved winner/end state is readable by retained link, not a general result-history
screen. `BattleStore.finishCompletion` stores `completionSummary`, but
`projectBattleRecord` returns only `completionStatus` and combat updates;
`BattleScreen` shows winner/pending/failed notices, not itemized reward or
progression receipts. G41 must provide a participant-safe completion receipt;
reusing the stored summary blindly could expose other recipients' details.

[Battle](../../src/battle/engine/Battle.js),
[BattlePokemon](../../src/battle/engine/BattlePokemon.js),
[data initialization](../../src/battle/data/initialize.js) and
[move data](../../src/battle/data/moves.js) own turn/cooldown, effect/status,
weather, damage/revive, passive/item and transformation/position mechanics.
They run on the server for either surface. Inspectors intentionally hide private
opponent details. Move-driven transformations imply no standalone control.
Legacy NPC Next Turn stays Discord-only; durable NPC turns advance automatically.

Evidence already recorded: [ordered results](../verification/event-results/README.md),
[status reactions](../verification/status-effect-results/README.md),
[mobile polish](../verification/mobile-polish/README.md),
[login recovery](../verification/login-recovery/README.md), and the overview's
local tests/builds and 2026-10-26 initial deployment checks. Those records are
scoped approvals, not comprehensive mode, engine-family or physical-device
acceptance. #190 reports touch targeting defects despite prior mobile approval.
#184–#187 retain restart, real Mongo/provider/device and recovery/security gates.

<a id="e11"></a>

### E11 — Auto and Dream Cards

[battleAuto](../../src/services/battleAuto.js) reads refreshed trainer entitlement,
conditionally debits cards and emits usage.
[BattleService.auto](../../src/battle/service/BattleService.js) simulates privately,
claims the original revision, charges and finalizes; known rejection/stale results
are discarded, uncertain claims retained. [Auto contract](../discord-battle-continuation.md#auto-battle)
requires recovery/rollback handling. Neither E01 web adapter exposes Auto nor
Dream balance. A browser read of a battle need not refresh trainer allowances;
Dream regeneration exists in trainer refresh, not a timer in the browser.
Preserve the catalog's aggregate P1 for J63 pending a maintainer split decision.

<a id="e12"></a>

### E12 — Learning, quests, reminders and preferences

[TutorialStage](../../src/elements/quest/TutorialStage.js) →
[quest.completeTutorialStageForTrainer](../../src/services/quest.js) checks
requirements, awards resources, marks completion/current lesson and persists.
[questConfig](../../src/config/questConfig.js) still teaches Discord commands;
several lessons are acknowledgement/completion-chain gates. Web learning needs
content and progress semantics, not just a render of command screenshots.
`claimQuestRewardsForUserAndUpdate` / `claimAllQuestRewardsForUserAndUpdate`
persist quest stage/reward changes and emit `COMPLETED_QUESTS`;
`registerAllQuestListeners` consumes gameplay events through
[gameEvent](../../src/services/game/gameEvent.js) and `trainer.emitTrainerEvent`.
Backend quest progress can already change from web battle completion; list,
claims, notifications and broad web operation events are missing.

[misc.sendUpsells](../../src/services/misc.js) compares completion, settings and
stored upsell state to send Discord replies/buttons.
[UserSettings](../../src/elements/trainer/UserSettings.js) →
[trainer.setUserSetting](../../src/services/trainer.js) → trainer `settings`;
HTTP must allowlist names/values and persist web-relevant settings only.
Current web audio preferences are local, not profile privacy or reminder settings.
[trainerInfo](../../src/commands/trainer/trainerInfo.js) checks `publicProfile`
before another trainer's extra info and party. Keep that check in a shared read
operation; battle opponent projection is a different privacy boundary.

<a id="e13"></a>

### E13 — PvP and trades

[pvp](../../src/commands/battle/pvp.js) writes a five-minute temporary challenge;
[pvpAccept](../../src/events/battle/pvpAccept.js) checks challenged actor, validates
party and starts durable PvP when enabled. Ongoing durable combat can be used on
web; challenge discovery/accept/decline cannot. Invitations need durable identity,
expiry and replay protection before cross-surface use; Auto stays disabled in PvP.

[trade add](../../src/commands/social/tradeAdd.js),
[trade remove](../../src/commands/social/tradeRemove.js) and
[trade](../../src/services/trade.js) save offers on trainers, then `getState`
holds request users, snapshots, accept/countdown/cancel state. `validateTrades`
rechecks level 40, caps (10 Pokémon/25,000 money), ownership/protection/balances;
`onTradeComplete` issues parallel Pokémon ownership and trainer money/reset
writes, with a rollback TODO. No durable exchange claim is established. Revisions,
authorization of every participant action, offer invalidation, timeout/cancel
race and partial transfer recovery are required before a browser trade port.
The trade Pokémon query also passes a trainer object to a user-ID parameter (E15);
current trade completion is therefore unverified even before durability concerns.
Existing #186 concerns battle rewards/Auto, not this exchange; propose a distinct group.

<a id="e14"></a>

### E14 — Raids and owned shiny effects

[raid.onRaidStart](../../src/services/raid.js) consumes a Raid Pass on trainer,
then inserts owner/instance raid in `raids`; failure can separate debit/creation.
`onRaidAccept` resolves instance, validates party and either starts durable battle
with deadline or legacy cached battle. `applyDurableRaidCompletion` updates
shared boss/contribution; `onRaidWin` grants rewards then deletes raid and sends
cached Discord messages; `checkTtl` / `cleanupRaids` expire instances.
`giveRaidRewards` applies `hasJirachi` shiny bonus and acquisition. Concurrent
boss/contribution and reward writes need #186 reconciliation, plus raid entry
and discovery. Durable raids remain recorded **off** in production; generic
combat support is not evidence of reachable current web raids. Server context
is a product decision, not a guild-keyed-storage requirement.

<a id="e15"></a>

### E15 — Mythical powers and gates

[mythic](../../src/services/mythic.js): `getMew` / `updateMew` checks New Island,
upserts an owned Mew and validates selected moves; `getCelebi` checks level/Ilex
Shrine, updates `hasCelebi` and upserts; `buildTimeTravelSend` spends balls/sets
daily allowance before acquisition. `getDeoxys` checks floor 20; `onFormSelect`
updates form/ability/stats. `getJirachi` checks Star Pieces and other original
owners, sets flag and upserts; `useWish` spends/marks weekly use then mutates
Pokémon or grants balls/money/materials/mints. `getDarkrai` counts at least 25
completed tutorial stages, sets entitlement and upserts; web OAuth is no substitute.

`getArceus` queries required species and five mythicals, then upserts;
`onArceusFormSelect` changes type, `arceusCreatePokemon` generates before marking
weekly use, while `arceusCreateItem` validates item and weekly use but **does not
call `getArceus` itself**. The UI gate is not a reusable authorization guarantee.
Some mythical and trade callers pass a trainer object to `listPokemons`, whose current
signature expects `userId` (E03): prerequisite behavior is unverified, not a
confirmed working gate. Validate these contracts when porting, without silently
changing requirements in this audit. Trainer flags and collection upsert are
separate writes; callers named `get*` can mutate/unlock. Never expose them as
uncontrolled polling reads. Owned Celebi/Jirachi bonuses belong with their core
consumers even while acquisition/powers remain Later.

<a id="e16"></a>

### E16 — Reference, discovery, standings and vote credit

[PokedexPokemon](../../src/elements/pokemon/PokedexPokemon.js) and
`pokemon.getPokemonOwnershipStats` provide species tabs/navigation and ownership
counts, beyond E01 display catalog. [Leaderboard](../../src/elements/social/Leaderboard.js)
→ [social.getLeaderboard](../../src/services/social.js) queries configured global
ranks; server scope uses `guild.members.cache` to select users. OAuth identify
alone supplies no guild context. [helpConfig](../../src/config/helpConfig.js),
[HelpCommand](../../src/elements/help/HelpCommand.js),
[events](../../src/commands/help/events.js) and
[changelog command](../../src/commands/help/changelog.js) supply reference content;
web navigation/help content and support links are absent.
[vote](../../src/commands/social/vote.js) → `trainer.getVoteRewards` consumes
persisted provider credit and writes backpack/money/voting state. Provider credit
J124 stays outside web scope; preserving existing credit is required regardless
of whether the P2 claim screen is shipped. No change to ingestion is proposed.

## Individual journey assessments

All Absent rows also cite E01. Evidence codes link to the register above; group
codes link to the backlog below. Dependencies describe **already available rules
and storage** versus **missing web/operation work**, not a request to port every
related acquisition screen. Effort/confidence is provisional remaining work.

| Journey | Web priority | Coverage and exact boundary | Backend/coupling; dependencies and effects | Evidence | Effort/confidence and reason | Work group | Phase 1 recommendation and reason (superseded by published cut) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [J01](../user-journeys.md#j01) — Learn to play | P0 | **Absent** — No lessons, progress or claim entry. | Lesson requirements/reward writes exist; missing web learning and completion mapping; feeds Darkrai. | [E12](#e12) | L/L: content and gate decision | [G23B / #217](https://github.com/ewei068/pokestar/issues/217) | **Unresolved** — Choose full onboarding versus bounded returning-player guidance. |
| [J02](../user-journeys.md#j02) — Claim daily rewards | P1 | **Absent** — No daily claim or result. | drawDaily exists; refresh users before claim; money/shards/balls and owned Celebi bonus. | [E02](#e02), [E05](#e05) | M/M: claim race and result UI | [G02 / #196](https://github.com/ewei068/pokestar/issues/196) | **Candidate** — Recurring supplies support repeat play. |
| [J03](../user-journeys.md#j03) — Obtain Pokémon through gacha | P0 | **Absent** — No banner browsing, roll or obtained-result flow. | usePokeball/generation exist; missing authenticated operation/UI; split debit/insert and quest events. | [E05](#e05) | L/M: spend plus acquisition recovery | [G09 / #203](https://github.com/ewei068/pokestar/issues/203) | **Candidate** — Closes acquire→prepare→battle loop. |
| [J04](../user-journeys.md#j04) — Find and inspect owned Pokémon | P0 | **Absent** — No owned list/filter/sort/detail. Battle inspection is a different snapshot. | Owner queries and stats exist; missing safe read DTO/query contract and web collection. | [E03](#e03) | M/H: reads and detail adapter | [G03 / #197](https://github.com/ewei068/pokestar/issues/197) | **Candidate** — Foundation for party and builds. |
| [J05](../user-journeys.md#j05) — Prepare a battle party | P0 | **Absent** — No active-party edit or preset UI. | Party rules/writes exist; command orchestration and Deact coupling; needs collection and fresh validation. | [E04](#e04) | L/M: formation and saved edits | [G05 / #199](https://github.com/ewei068/pokestar/issues/199) | **Candidate** — Core preparation including presets. |
| [J06](../user-journeys.md#j06) — Train a Pokémon | P0 | **Absent** — No training selection or gains result. | EXP/EV/location rules exist; missing web operation and event/reward integration. | [E07](#e07), [E02](#e02) | M/M: stats plus progression effects | [G10 / #204](https://github.com/ewei068/pokestar/issues/204) | **Candidate** — Strengthen owned teams. |
| [J07](../user-journeys.md#j07) — Improve equipment | P0 | **Absent** — No equipment upgrade preview/confirm/result. | Cost validation/debit/stat writes exist; separate trainer/Pokémon writes need recovery. | [E08](#e08) | L/M: spend and stat mutation | [G12 / #206](https://github.com/ewei068/pokestar/issues/206) | **Candidate** — Consumes dungeon materials in core loop. |
| [J08](../user-journeys.md#j08) — Complete an NPC battle | P0 | **Partial** — Continue a Discord-started durable NPC battle and reach result; no NPC/difficulty/start. | Start generation and shared completion exist; needs party/start UI and reward acceptance. | [E09](#e09), [E10](#e10) | L/M: extract start and verify settlement | [G16 / #210](https://github.com/ewei068/pokestar/issues/210) | **Candidate** — First new battle-entry mode. |
| [J09](../user-journeys.md#j09) — Resume an unfinished battle | P0 | **IU** — List/open durable battle and act after returning; legacy cached battles excluded. | Shared list/get/replay exists; real Mongo/restart and cross-surface acceptance remain. | [E10](#e10) | M/M: acceptance and recovery | [E185 / #185](https://github.com/ewei068/pokestar/issues/185) | **Candidate** — Keeps play continuous; reuse #185/#184. |
| [J10](../user-journeys.md#j10) — Battle another player | P1 | **Partial** — Can continue durable PvP; no browser issue/accept/decline challenge. | Temporary Discord invitations precede shared start; needs durable invitations and participant authorization. | [E13](#e13), [E10](#e10) | L/L: invitation lifecycle and abuse policy | [G30 / #225](https://github.com/ewei068/pokestar/issues/225) | **Later** — Manual PvE closes first loop; multiplayer can follow. |
| [J11](../user-journeys.md#j11) — Participate in a raid | P2 | **Partial** — Generic durable raid combat exists behind flags; no web discovery/join; live durable raids recorded off. | Raid instance/deadline and rewards exist; needs discovery/context, concurrent contribution safety and enabled-mode acceptance. | [E14](#e14), [E10](#e10) | L/L: mode rollout plus shared writes | [G32 / #227](https://github.com/ewei068/pokestar/issues/227) | **Later** — Reviewed web P2; preserve raid backlog. |
| [J12](../user-journeys.md#j12) — Complete a quest | P0 | **Partial** — Battle completion can progress quests; no objective list or reward claim. | Listeners and claim functions exist; missing web read/claim and all new operation events. | [E12](#e12), [E09](#e09) | L/M: quest views and claim recovery | [G22 / #215](https://github.com/ewei068/pokestar/issues/215) | **Candidate** — Make progression and earned rewards usable. |
| [J13](../user-journeys.md#j13) — Buy supplies | P0 | **Absent** — No shop browsing, quantity choice, purchase or receipt. | Prices/quota/balance operations exist; mixed text/UI, whole-trainer writes; needs resources and refresh. | [E06](#e06), [E02](#e02) | L/M: spend concurrency plus shop UI | [G08 / #202](https://github.com/ewei068/pokestar/issues/202) | **Candidate** — Supply acquisition and training. |
| [J14](../user-journeys.md#j14) — Trade with another player | P1 | **Absent** — No offer request, review, consent or exchange. | Stored offers plus transient confirmation; separate ownership/money writes lack durable recovery. | [E13](#e13) | L/L: multi-party durable exchange | [G31 / #226](https://github.com/ewei068/pokestar/issues/226) | **Later** — Independent high-risk P1 outcome. |
| [J15](../user-journeys.md#j15) — Check competitive standings | P2 | **Absent** — No ranking category/scope results. | Global query exists; server scope depends on Discord guild member cache; web scope choice missing. | [E16](#e16) | M/L: identity/context policy | [G38 / #233](https://github.com/ewei068/pokestar/issues/233) | **Later** — P2 discovery, independent of core play. |
| [J17](../user-journeys.md#j17) — Inspect a trainer profile | P1 | **Absent** — Discord ID header is not trainer/profile or other-player inspection. | Extra info/party query and publicProfile guard exist in command; need shared privacy-safe read. | [E12](#e12), [E02](#e02) | M/M: shared read and privacy | [G26 / #220](https://github.com/ewei068/pokestar/issues/220) | **Later** — Inventory/progression results suffice for initial self state. |
| [J18](../user-journeys.md#j18) — Inspect inventory | P0 | **Absent** — No money, item/material/consumable inventory page. | Trainer backpack/config reads exist; missing owner projection and browser categories/balances. | [E06](#e06), [E02](#e02) | M/H: read projection and UI | [G07 / #201](https://github.com/ewei068/pokestar/issues/201) | **Candidate** — Informed spending and reward visibility. |
| [J19](../user-journeys.md#j19) — Claim trainer level rewards | P1 | **Absent** — No available level-reward list or claim result. | getLevelRewards updates trainer claims/resources; result is Discord formatted; concurrent claim unverified. | [E02](#e02) | M/M: claim boundary | [G02 / #196](https://github.com/ewei068/pokestar/issues/196) | **Candidate** — Expose rewards earned through first loop. |
| [J20](../user-journeys.md#j20) — Research a species | P1 | **Partial** — Battle catalog supplies names/moves; no species browsing, tabs, counts or navigation. | Species config/ownership aggregation and Discord tabs exist; safe web projection missing. | [E16](#e16), [E01](#e01) | M/M: complete research DTO/UI | [G27 / #221](https://github.com/ewei068/pokestar/issues/221) | **Later** — Owned details cover first-release preparation. |
| [J21](../user-journeys.md#j21) — Evolve a Pokémon | P0 | **Absent** — No eligible evolution preview/confirmation/result. | Transform/write/event exists; requirement and allowed-target revalidation must move into operation. | [E07](#e07) | M/M: fresh eligibility and identity | [G11 / #205](https://github.com/ewei068/pokestar/issues/205) | **Candidate** — Core growth and collection. |
| [J22](../user-journeys.md#j22) — Change a Pokémon's form | P0 | **Absent** — No form selection/cost/confirmation. | Form whitelist/cost and attempted refund exist; trainer then Pokémon write; missing web operation/UI. | [E07](#e07) | M/M: charge/refund uncertainty | [G11 / #205](https://github.com/ewei068/pokestar/issues/205) | **Candidate** — Preserve critical build changes. |
| [J23](../user-journeys.md#j23) — Manage held items | P0 | **Absent** — No give/swap/remove held-item management. | Owner read and backpack/Pokémon effects exist; missing retry-safe operation and web selector. | [E08](#e08) | M/M: two-document item transfer | [G14 / #208](https://github.com/ewei068/pokestar/issues/208) | **Candidate** — Normal team preparation. |
| [J24](../user-journeys.md#j24) — Change a Pokémon's nature | P0 | **Absent** — No nature selection or mint confirmation/result. | Mutation remains in natureConfirm event; mint written before Pokémon; needs service extraction. | [E07](#e07) | L/M: handler extraction and payment recovery | [G11 / #205](https://github.com/ewei068/pokestar/issues/205) | **Candidate** — Critical build control with mint cost. |
| [J25](../user-journeys.md#j25) — Release Pokémon | P0 | **Absent** — No release selection/confirm/currency receipt. | canRelease/delete exist; credit lives in Discord event; recheck party/lock/owner and partial deletion. | [E03](#e03) | L/M: irreversible delete plus credit | [G04 / #198](https://github.com/ewei068/pokestar/issues/198) | **Candidate** — Capacity escape alongside acquisition. |
| [J26](../user-journeys.md#j26) — Compare and transfer equipment | P1 | **Absent** — No equipment list/filter/sort or two-Pokémon transfer. | Swap rules/cost/writes in send builder; needs new structured operation and concurrent-owner checks. | [E08](#e08) | L/M: two builds plus cost | [G13 / #207](https://github.com/ewei068/pokestar/issues/207) | **Later** — Useful P1 optimization after upgrades. |
| [J27](../user-journeys.md#j27) — Reroll equipment stats | P0 | **Absent** — No stat-slot choice, reroll cost or updated result. | rerollStatSlot exists; debit and Pokémon write separate; share equipment operation/UI. | [E08](#e08) | L/M: random spend recovery | [G12 / #206](https://github.com/ewei068/pokestar/issues/206) | **Candidate** — Co-deliver with critical equipment upgrades. |
| [J28](../user-journeys.md#j28) — Inspect and improve owned locations | P0 | **Absent** — No owned-location inspection or improvement purchase. | Location tiers/prices exist; shop mutation affects training, capacity and Shrine; missing web views. | [E06](#e06), [E07](#e07) | M/M: tier purchases and effects | [G08 / #202](https://github.com/ewei068/pokestar/issues/202) | **Candidate** — Support storage and EV/EXP progression. |
| [J29](../user-journeys.md#j29) — Craft an item | P0 | **Absent** — No recipe, quantity, cost confirmation or craft result. | canCraftItem/craftItem exist; trainer costs/backpack written together; stale spend/event policy needed. | [E06](#e06), [E02](#e02) | M/M: bounded spend operation | [G15 / #209](https://github.com/ewei068/pokestar/issues/209) | **Candidate** — Reviewed core resource conversion. |
| [J30](../user-journeys.md#j30) — Complete a dungeon | P0 | **Partial** — Fight Discord-started durable dungeon phases; no dungeon/difficulty/start. | Generated phase queue persists; shared completion grants materials; selection/start remains Discord. | [E09](#e09), [E10](#e10) | L/M: start plus multiphase acceptance | [G17 / #211](https://github.com/ewei068/pokestar/issues/211) | **Candidate** — Supplies first-release equipment progression. |
| [J31](../user-journeys.md#j31) — Climb the Battle Tower | P0 | **Partial** — Continue durable tower fight; no web floor entry/progression navigation. | Tower generation/reset/completion exist; next-floor start and gating need web operation. | [E09](#e09), [E02](#e02) | L/M: floor/reset and settlement | [G18 / #212](https://github.com/ewei068/pokestar/issues/212) | **Later** — P0 backlog retained; NPC+dungeon forms smaller first loop. |
| [J32](../user-journeys.md#j32) — Use Auto | P1 | **Absent** — No web Auto action, eligibility, cost or outcome controls. | BattleService.auto and conditional card debit exist only through Discord; claim recovery #186. | [E11](#e11) | L/M: new adapter plus uncertain charge | [G21 / #214](https://github.com/ewei068/pokestar/issues/214) | **Later** — Manual battles work; defer payment surface until recovery. |
| [J33](../user-journeys.md#j33) — Vote and claim rewards | P2 | **Absent** — No voting link/credit/claim flow. | Provider credits stored independently; claim updates voting/resources; do not port ingestion J124. | [E16](#e16), [E02](#e02) | M/M: consume existing credit once | [G39 / #234](https://github.com/ewei068/pokestar/issues/234) | **Later** — Web P2; retain accepted credit meanwhile. |
| [J35](../user-journeys.md#j35) — Change personal settings | P0 | **Partial** — Local audio controls exist; no shared account preferences inspection/save. | UserSettings/setUserSetting exist; add allowlisted privacy/reminder fields and cross-surface persistence. | [E12](#e12), [E01](#e01) | M/M: account versus device settings | [G25 / #219](https://github.com/ewei068/pokestar/issues/219) | **Candidate** — Critical personal controls. |
| [J36](../user-journeys.md#j36) — Get contextual help | P1 | **Absent** — No feature-specific guidance or help navigation. | Command help content exists; web context/copy requires adaptation, not command inventory replication. | [E16](#e16), [E12](#e12) | M/M: web learning content | [G24 / #218](https://github.com/ewei068/pokestar/issues/218) | **Candidate** — Help players use the delivered loop. |
| [J37](../user-journeys.md#j37) — Discover current events | P2 | **Absent** — No current-events browse entry. | Configured Discord event content exists; web content/display links missing. | [E16](#e16) | S/H: reference adaptation | [G37 / #232](https://github.com/ewei068/pokestar/issues/232) | **Later** — Reviewed P2 discovery. |
| [J38](../user-journeys.md#j38) — Read update notes | P3 | **Absent** — No update-note entry/read flow. | Changelog command/source exists; browser reference navigation missing. | [E16](#e16) | S/H: reference link/content | [G37 / #232](https://github.com/ewei068/pokestar/issues/232) | **Later** — Only eligible P3; retain full backlog. |
| [J40](../user-journeys.md#j40) — Customize Mew | P1 | **Absent** — No owned Mew move/nature editing. | getMew/updateMew and move validation exist; mutating getters and Discord tabs need separation. | [E15](#e15) | M/M: custom build constraints | [G28 / #222](https://github.com/ewei068/pokestar/issues/222) | **Later** — Specialized P1 after core builds. |
| [J41](../user-journeys.md#j41) — Use Celebi's powers | P2 | **Absent** — No Celebi power preview/cost/use/result. | Time travel spends balls/daily allowance then acquires; shared bonuses handled separately by consumers. | [E15](#e15), [E05](#e05) | L/M: random acquisition recovery | [G33 / #228](https://github.com/ewei068/pokestar/issues/228) | **Later** — P2 powers; does not defer owned P0 benefits. |
| [J42](../user-journeys.md#j42) — Change Deoxys's form | P2 | **Absent** — No Deoxys inspect/form selection/result. | getDeoxys/onFormSelect exist; unlock getter can upsert; web adapter and fresh gate checks missing. | [E15](#e15) | M/M: special form rules | [G34 / #229](https://github.com/ewei068/pokestar/issues/229) | **Later** — P2 specialized forms. |
| [J43](../user-journeys.md#j43) — Make a Jirachi wish | P2 | **Absent** — No Jirachi wish selection, target/cost or confirm. | useWish and weekly allowance exist; split trainer/Pokémon effects and prerequisite query need verification. | [E15](#e15) | L/L: multi-effect spend and gates | [G35 / #230](https://github.com/ewei068/pokestar/issues/230) | **Later** — P2; retain raid/trade prerequisites. |
| [J44](../user-journeys.md#j44) — Inspect Darkrai and Auto access | P2 | **Absent** — No Darkrai entitlement/resource explainer page. | Darkrai component/backend data exist; missing web dedicated information; concise Auto explanation can precede it. | [E15](#e15), [E11](#e11) | S/M: dedicated content/reads | [G29B / #224](https://github.com/ewei068/pokestar/issues/224) | **Later** — P2 dedicated inspection independent of Auto unlock. |
| [J45](../user-journeys.md#j45) — Use Arceus's powers | P2 | **Absent** — No Arceus power hub or completion. | Type/create helpers exist; shared weekly use and gate checks uneven; needs bounded authorized operations. | [E15](#e15) | L/L: authorization and partial effects | [G36 / #231](https://github.com/ewei068/pokestar/issues/231) | **Later** — P2 late-game system. |
| [J46](../user-journeys.md#j46) — Create a trainer and receive starting resources | P0 | **Absent** — OAuth creates session only; no trainer/starter-resource initialization. | initTrainer/defaults exist behind Discord getTrainer; needs authoritative user identity and duplicate-create handling. | [E02](#e02), [E01](#e01) | M/L: initialization race and product boundary | [G23A / #216](https://github.com/ewei068/pokestar/issues/216) | **Unresolved** — Required if first release admits brand-new players. |
| [J47](../user-journeys.md#j47) — Lock or unlock a Pokémon | P0 | **Absent** — No browser lock/unlock control. | toggleLock exists; trusted owner-load required; lock protects release/trade; stale confirmation needs check. | [E03](#e03) | M/M: owner-bound mutation | [G04 / #198](https://github.com/ewei068/pokestar/issues/198) | **Candidate** — Protect collection before destructive actions. |
| [J48](../user-journeys.md#j48) — Release a collection page | P0 | **Absent** — No reviewed-page bulk release/confirm/result. | Captured IDs and restrictions exist in legacy events; delete-credit split and changing filters matter. | [E03](#e03) | L/M: bulk identity and recovery | [G04 / #198](https://github.com/ewei068/pokestar/issues/198) | **Candidate** — Deliver together with collection capacity management. |
| [J49](../user-journeys.md#j49) — Expand collection capacity | P0 | **Absent** — No capacity purchase/blocked-acquisition recovery UI. | Computer Lab tier and checkNumPokemon exist; acquisition checks capacity; shop purchase raises it. | [E06](#e06), [E03](#e03) | M/M: shop tier and capacity refresh | [G08 / #202](https://github.com/ewei068/pokestar/issues/202) | **Candidate** — Prevent a dead end when acquisition fills storage. |
| [J50](../user-journeys.md#j50) — Receive beginner roll guarantees | P1 | **Absent** — No browser roll where beginner guarantees can apply. | beginnerRoll persists basic-ball milestones with gacha; no separate screen or new guarantee system. | [E05](#e05) | S/H: shared roll acceptance | [G09 / #203](https://github.com/ewei068/pokestar/issues/203) | **Candidate** — Retain P1 guarantees in P0 acquisition implementation. |
| [J51](../user-journeys.md#j51) — Understand banners, ball odds and pity | P0 | **Absent** — No banner/odds/rate-up/pity inspection or ball/quantity choice. | Banner config/pity accounting exist; current browser catalog lacks banner/economy contract. | [E05](#e05) | M/M: informed roll UI and pity write | [G09 / #203](https://github.com/ewei068/pokestar/issues/203) | **Candidate** — Required acquisition choice and fairness. |
| [J52](../user-journeys.md#j52) — Inspect newly obtained Pokémon and acquisition bonuses | P0 | **Absent** — No newly obtained collection receipt/detail. | Generated identity/bonuses exist; embeds only; needs retained acquisition outcome and owned-detail link. | [E05](#e05), [E03](#e03) | M/M: result projection and retry identity | [G09 / #203](https://github.com/ewei068/pokestar/issues/203) | **Candidate** — Make acquisition outcome inspectable. |
| [J53](../user-journeys.md#j53) — Automatically fill a party | P1 | **Absent** — No ranked automatic party fill. | partyAuto selection and trainer write exist in command; needs explicit replacement confirmation. | [E04](#e04) | M/M: command extraction | [G06 / #200](https://github.com/ewei068/pokestar/issues/200) | **Later** — P1 convenience; manual/presets ship first. |
| [J54](../user-journeys.md#j54) — Save and load party presets | P0 | **Absent** — No saved-slot browse/save/load/swap. | Nine slots and active↔saved swap exist in commands; needs shared operation, stale/missing IDs checks. | [E04](#e04) | M/M: preset operation and UI | [G05 / #199](https://github.com/ewei068/pokestar/issues/199) | **Candidate** — Explicit part of accepted core party outcome. |
| [J55](../user-journeys.md#j55) — Inspect and validate the active formation | P0 | **Partial** — Current battle shows frozen formation; no active-party inspect/validate before web start. | Party validators exist; add authoritative validation and friendly errors to shared start/edit. | [E04](#e04), [E10](#e10) | M/M: pre-start safety and UI | [G05 / #199](https://github.com/ewei068/pokestar/issues/199) | **Candidate** — Prevent unusable parties at new entry point. |
| [J56](../user-journeys.md#j56) — Complete daily quests | P0 | **Partial** — Web battle events can progress daily objectives; no daily list/claim. | Daily quest selection/reset/listeners exist; needs refresh and claim UI with retry/concurrency handling. | [E12](#e12), [E02](#e02) | M/M: daily claim correctness | [G22 / #215](https://github.com/ewei068/pokestar/issues/215) | **Candidate** — Recurring progression in delivered loop. |
| [J57](../user-journeys.md#j57) — Progress staged achievements | P0 | **Partial** — Shared battle events can progress achievements; no stage display/claim. | Achievement listeners and staged rewards exist; new actions must emit equivalent events. | [E12](#e12) | M/M: staged progress and events | [G22 / #215](https://github.com/ewei068/pokestar/issues/215) | **Candidate** — Preserve long-term earned progression. |
| [J58](../user-journeys.md#j58) — Claim all available quest rewards | P1 | **Absent** — No web claim-all action or aggregate receipt. | claimAllQuestRewardsForUserAndUpdate exists; stage iteration and retry safety need browser acceptance. | [E12](#e12) | M/M: aggregate claim boundary | [G22 / #215](https://github.com/ewei068/pokestar/issues/215) | **Candidate** — Coherent small extension of same claim outcome. |
| [J59](../user-journeys.md#j59) — Claim tutorial rewards and resume the next lesson | P0 | **Absent** — No lesson requirement check/claim/next-lesson flow. | Completion and reward ledger exist on trainer; missing web lesson semantics; affects Darkrai count. | [E12](#e12), [E15](#e15) | L/L: learning compatibility decision | [G23B / #217](https://github.com/ewei068/pokestar/issues/217) | **Unresolved** — Cannot drop earned tutorial claims by UI substitution. |
| [J60](../user-journeys.md#j60) — Receive progress reminders and return to the relevant objective | P1 | **Absent** — No contextual objective reminder or return-to-claim navigation. | sendUpsells uses Discord messages/state; backend completion data exists; web notification policy missing. | [E12](#e12) | M/L: notification and navigation semantics | [G24 / #218](https://github.com/ewei068/pokestar/issues/218) | **Candidate** — Bounded reminders for delivered objectives, respecting opt-out. |
| [J61](../user-journeys.md#j61) — Earn trainer EXP and currency through play | P0 | **Partial** — Shared battle settlement grants EXP/currency; web clicks lack Discord interaction grants. | Handler rewards and level notifications not shared; define semantic reward mapping and retry keys before more operations. | [E02](#e02), [E09](#e09) | L/L: progression policy and replay safety | [G40 / #235](https://github.com/ewei068/pokestar/issues/235) | **Candidate** — Cross-surface progression must not silently change. |
| [J62](../user-journeys.md#j62) — Refresh daily, weekly and seasonal allowances | P0 | **Partial** — Trainer reads during reward settlement may refresh allowances; /me/list does not. | Time refresh rules exist; expose a shared refresh boundary before reads/claims/spends, preserving concurrent writes. | [E02](#e02) | L/M: time boundary and stale writes | [G40 / #235](https://github.com/ewei068/pokestar/issues/235) | **Candidate** — Core quotas/rewards must work without visiting Discord. |
| [J63](../user-journeys.md#j63) — Replenish and inspect Dream Cards | P1 | **Partial** — Regeneration exists when shared trainer reads run; no web balance or replenishment entry. | Dream cap/time rules available; web needs refreshed balance and Auto usage contract; aggregate rating stays P1. | [E11](#e11), [E02](#e02) | M/M: refresh plus balance display | [G21 / #214](https://github.com/ewei068/pokestar/issues/214) | **Later** — Deliver with Auto; do not re-rate replenishment here. |
| [J64](../user-journeys.md#j64) — Earn NPC daily rewards and track defeated difficulties | P0 | **Partial** — Durable NPC completion applies daily bonus/victory history; no web eligibility/history/start UI. | Daily and permanent defeated difficulties are separate; reset/claim/retry acceptance missing. | [E09](#e09), [E02](#e02) | M/M: daily-history projection and recovery | [G16 / #210](https://github.com/ewei068/pokestar/issues/210) | **Candidate** — Complete NPC outcome includes rewards and progression. |
| [J65](../user-journeys.md#j65) — Repeat an encounter after its result | P1 | **Absent** — Saved result renders; no web start-another-encounter action. | Discord replay uses retained UI context; extract validated fresh PvE/dungeon start, never reward rendering. | [E09](#e09) | M/M: restart context and deduplication | [G19 / #213](https://github.com/ewei068/pokestar/issues/213) | **Later** — P1 convenience after mode entry works. |
| [J66](../user-journeys.md#j66) — Host a raid with a Raid Pass | P2 | **Absent** — No raid host selector/pass confirmation/create. | onRaidStart debits trainer then inserts raid; requires discovery and resource recovery. | [E14](#e14) | L/L: pass debit/create and context | [G32 / #227](https://github.com/ewei068/pokestar/issues/227) | **Later** — Reviewed web P2 host outcome. |
| [J67](../user-journeys.md#j67) — Track raid damage, defeat, rewards and expiry | P2 | **Partial** — Durable completion hooks exist; no web raid HP/contribution/deadline/reward lifecycle UI. | Raid instance writes and expiry available, flag off; concurrent damage/rewards unverified; #186 applies. | [E14](#e14) | L/L: shared boss writes and expiry | [G32 / #227](https://github.com/ewei068/pokestar/issues/227) | **Later** — Must accompany any future raid entry. |
| [J68](../user-journeys.md#j68) — Decline or cancel a trade | P1 | **Absent** — No web trade decline/cancel/countdown controls. | Transient state decline path exists; needs participant authorization, expiry and cancel/commit race resolution. | [E13](#e13) | L/L: durable consent lifecycle | [G31 / #226](https://github.com/ewei068/pokestar/issues/226) | **Later** — Ship atomically with trade acceptance safeguards. |
| [J69](../user-journeys.md#j69) — Build and revise a trade offer | P1 | **Absent** — No money/Pokémon offer editing or both-offer review. | Saved offers/limits and eligibility exist; edits must invalidate acceptance; cross-surface versioning missing. | [E13](#e13) | L/L: concurrent offers and ownership | [G31 / #226](https://github.com/ewei068/pokestar/issues/226) | **Later** — Essential acceptance scope of later exchange. |
| [J70](../user-journeys.md#j70) — Compare global and server standings | P2 | **Absent** — No global/server scope switch or six-category display. | Global query reusable; guild cache membership not available from identify-only OAuth. | [E16](#e16) | L/L: server membership/privacy policy | [G38 / #233](https://github.com/ewei068/pokestar/issues/233) | **Later** — Decide server context before full P2 parity. |
| [J71](../user-journeys.md#j71) — Control profile privacy | P0 | **Absent** — No shared profile-privacy read/save. | publicProfile flag exists; future profile reads must enforce it server-side, independently of battle projections. | [E12](#e12) | M/M: trusted read/write contract | [G25 / #219](https://github.com/ewei068/pokestar/issues/219) | **Candidate** — Critical setting usable across surfaces. |
| [J74](../user-journeys.md#j74) — Toggle tutorial and quest reminders | P0 | **Absent** — No shared tutorial/quest reminder opt-out controls. | enableQuestUpsell and reminder settings exist in trainer config; web prompts must consume same persisted choice. | [E12](#e12) | M/M: allowlist and consistent suppression | [G25 / #219](https://github.com/ewei068/pokestar/issues/219) | **Candidate** — Keep control alongside reminders. |
| [J75](../user-journeys.md#j75) — Inspect equipment rules and costs | P1 | **Partial** — Own battle stats are visible; no equipment quality/slot/cost explanation for spending. | equipmentConfig and builders contain rules; new upgrade/reroll preview must show costs and effects. | [E08](#e08), [E10](#e10) | S/H: integrated rules projection | [G12 / #206](https://github.com/ewei068/pokestar/issues/206) | **Candidate** — Acceptance requirement of informed equipment spending. |
| [J76](../user-journeys.md#j76) — Reduce or reset EV allocation | P0 | **Absent** — No Berry Bush/Farm EV reduction/reset selection/result. | Negative EV location path and clamps already shared with training; owned location prerequisite. | [E07](#e07), [E06](#e06) | M/M: negative-EV acceptance | [G10 / #204](https://github.com/ewei068/pokestar/issues/204) | **Candidate** — Include with core training, no separate screen. |
| [J77](../user-journeys.md#j77) — Unlock and obtain Mew | P1 | **Absent** — No browser Mew unlock/check/obtain receipt. | New Island victory prerequisite and upsert exist; owned customizer and grant need fresh validated operation. | [E15](#e15), [E09](#e09) | M/M: gate and grant recovery | [G28 / #222](https://github.com/ewei068/pokestar/issues/222) | **Later** — P1 specialized progression after dungeon entry. |
| [J78](../user-journeys.md#j78) — Unlock and obtain Celebi | P2 | **Absent** — No Celebi level/Shrine unlock/check/obtain. | getCelebi flag then Pokémon upsert exists; level/location facts reusable; no web operation. | [E15](#e15), [E06](#e06) | M/M: gate plus split ownership writes | [G33 / #228](https://github.com/ewei068/pokestar/issues/228) | **Later** — P2 unlock distinct from existing-owner bonuses. |
| [J79](../user-journeys.md#j79) — Receive Celebi EXP and daily reward bonuses | P0 | **Partial** — Owned Celebi EXP applies during shared battle rewards; no web training/daily claim consumers. | hasCelebi gives double Pokémon EXP and triple daily money/shards; preserve flag and all consumers. | [E07](#e07), [E05](#e05), [E09](#e09) | M/M: cross-consumer acceptance | [G40 / #235](https://github.com/ewei068/pokestar/issues/235) | **Candidate** — P0 owned benefit without P2 acquisition port. |
| [J80](../user-journeys.md#j80) — Unlock and obtain Deoxys | P2 | **Absent** — No floor-20 Deoxys unlock/obtain entry. | Tower victory check and mythical upsert exist; needs same shared boundary as special forms. | [E15](#e15), [E09](#e09) | M/M: gate query and grant | [G34 / #229](https://github.com/ewei068/pokestar/issues/229) | **Later** — P2 unlock; existing Discord progress may satisfy it. |
| [J81](../user-journeys.md#j81) — Unlock and obtain Jirachi | P2 | **Absent** — No Star Piece/other-owner Jirachi unlock/obtain entry. | Gate/flag/upsert exists; listPokemons caller mismatch leaves prerequisite behavior unverified. | [E15](#e15), [E13](#e13), [E14](#e14) | L/L: prerequisite contract and recovery | [G35 / #230](https://github.com/ewei068/pokestar/issues/230) | **Later** — P2; raid/trade progress can originate in Discord. |
| [J82](../user-journeys.md#j82) — Receive Jirachi shiny bonuses | P0 | **Absent** — No web acquisition or enabled raid reward flow to apply shiny bonus. | hasJirachi odds in giveNewPokemons/giveRaidRewards exist; no need for unlock UI to retain benefit. | [E05](#e05), [E14](#e14) | M/M: acquisition/raid consumer checks | [G40 / #235](https://github.com/ewei068/pokestar/issues/235) | **Candidate** — Acquisition portion now; raid portion explicit later acceptance. |
| [J83](../user-journeys.md#j83) — Wish for Power | P2 | **Absent** — No target-IV wish preview/spend/result. | useWish sets random non-perfect IV and writes stats plus weekly cost/flag separately. | [E15](#e15) | M/M: spend and targeted build mutation | [G35 / #230](https://github.com/ewei068/pokestar/issues/230) | **Later** — Variant of same P2 wish transaction. |
| [J84](../user-journeys.md#j84) — Wish for Rebirth | P2 | **Absent** — No alternate-ability wish preview/spend/result. | useWish excludes current ability and updates Pokémon then trainer; retry/partial write risk. | [E15](#e15) | M/M: random ability and spend recovery | [G35 / #230](https://github.com/ewei068/pokestar/issues/230) | **Later** — Variant of same P2 wish transaction. |
| [J85](../user-journeys.md#j85) — Wish for Allies | P2 | **Absent** — No Pokéball wish confirm/result. | useWish grants random balls and consumes Star Pieces/weekly flag on trainer. | [E15](#e15) | M/M: random grant and shared allowance | [G35 / #230](https://github.com/ewei068/pokestar/issues/230) | **Later** — Keep with same wish outcome and receipt. |
| [J86](../user-journeys.md#j86) — Wish for Wealth | P2 | **Absent** — No currency/shards/mints wish confirm/result. | useWish grants configured wealth resources with shared weekly cost/flag. | [E15](#e15) | M/M: grant and allowance concurrency | [G35 / #230](https://github.com/ewei068/pokestar/issues/230) | **Later** — Keep with same wish outcome and receipt. |
| [J87](../user-journeys.md#j87) — Unlock and obtain Darkrai | P1 | **Absent** — No 25-lesson gate inspection or Darkrai obtain. | getDarkrai uses persisted tutorial completion count, flag then upsert; web learning equivalence unresolved. | [E15](#e15), [E12](#e12) | L/L: learning compatibility and entitlement | [G29A / #223](https://github.com/ewei068/pokestar/issues/223) | **Later** — P1 Auto dependency; preserve existing entitlements meanwhile. |
| [J88](../user-journeys.md#j88) — Unlock and obtain Arceus | P2 | **Absent** — No required-species/mythical checklist or Arceus obtain. | getArceus queries owned species and upserts; signature mismatch and missing gate proof must be resolved. | [E15](#e15) | L/L: prerequisite queries and grant | [G36 / #231](https://github.com/ewei068/pokestar/issues/231) | **Later** — P2 late-game acquisition. |
| [J89](../user-journeys.md#j89) — Change Arceus type | P2 | **Absent** — No Arceus supported type/form edit. | onArceusFormSelect validates forms, resolves gate then transforms/stats; web owner operation missing. | [E15](#e15) | M/M: special type identity | [G36 / #231](https://github.com/ewei068/pokestar/issues/231) | **Later** — Variant of late-game power group. |
| [J90](../user-journeys.md#j90) — Create a chosen Pokémon with Arceus | P2 | **Absent** — No chosen eligible species creation/result. | canArceusCreatePokemon and giveNewPokemons exist; grant precedes weekly-use write; recovery missing. | [E15](#e15), [E05](#e05) | L/M: generated grant and allowance | [G36 / #231](https://github.com/ewei068/pokestar/issues/231) | **Later** — P2 creation under shared weekly allowance. |
| [J91](../user-journeys.md#j91) — Create a chosen item with Arceus | P2 | **Absent** — No chosen item creation/result. | arceusCreateItem checks item/use flag but not getArceus; shared operation must enforce entitlement. | [E15](#e15) | L/L: authorization gap before exposure | [G36 / #231](https://github.com/ewei068/pokestar/issues/231) | **Later** — P2; do not expose UI-gated helper directly. |
| [J92](../user-journeys.md#j92) — Choose and use a move | P0 | **IU** — Legal move choice and use available in current durable battle. | Server legal moves/cooldowns/actor checks shared; local controls exist; current mode/device acceptance pending. | [E10](#e10) | S/M: reuse acceptance, no port | [E185 / #185](https://github.com/ewei068/pokestar/issues/185) | **Candidate** — Existing core control; #185. |
| [J93](../user-journeys.md#j93) — Select and preview targets and affected tiles | P0 | **Partial** — Legal targets/footprints/confirmation exist; reported touch submit/confirm defect remains. | Server targeting shared; fix #190 and test touch/pen; do not port Discord preference J73. | [E10](#e10) | M/M: reported input defect | [E185 / #185](https://github.com/ewei068/pokestar/issues/185) | **Candidate** — Core input; reuse #190/#185. |
| [J94](../user-journeys.md#j94) — Skip a turn or advance legacy NPC turns | P0 | **IU** — Player Skip available; durable NPC turns automatic; legacy Next Turn not exposed. | Shared act/automatic progression persists revisions and status ticks; real cross-surface acceptance pending. | [E10](#e10) | S/M: acceptance of both progression paths | [E185 / #185](https://github.com/ewei068/pokestar/issues/185) | **Candidate** — Equivalent durable outcome; no legacy button port. |
| [J95](../user-journeys.md#j95) — Inspect teams, moves and battle state | P0 | **IU** — Board/team/own-move inspector and session log exist. | Own build projection/private opponent masking shared; full restored-history view not promised. | [E10](#e10) | S/M: privacy and device acceptance | [E185 / #185](https://github.com/ewei068/pokestar/issues/185) | **Candidate** — Current information foundation; #185/#191/#194. |
| [J96](../user-journeys.md#j96) — Resolve readiness, speed, cooldowns and extra turns | P0 | **IU** — Server resolves readiness/cooldown/forced/NPC turns during web actions. | Same engine and ordered revisions; no separate screen; restart/forced-turn acceptance unverified. | [E10](#e10) | M/M: representative mechanic acceptance | [E185 / #185](https://github.com/ewei068/pokestar/issues/185) | **Candidate** — Shared combat acceptance requirement. |
| [J97](../user-journeys.md#j97) — Resolve status, buffs, debuffs and damage over time | P0 | **IU** — Server status/effect ticks and browser reactions exist. | BattlePokemon/data rules shared; family edge cases and real-environment acceptance still unverified. | [E10](#e10) | M/M: representative effect acceptance | [E185 / #185](https://github.com/ewei068/pokestar/issues/185) | **Candidate** — Shared combat acceptance requirement. |
| [J98](../user-journeys.md#j98) — Resolve weather and its suppression | P0 | **IU** — Weather creation/ticks/suppression state can resolve and display. | Battle weather rules/events shared; no separate weather control; suppression edge acceptance pending. | [E10](#e10) | M/M: representative weather acceptance | [E185 / #185](https://github.com/ewei068/pokestar/issues/185) | **Candidate** — Shared combat acceptance requirement. |
| [J99](../user-journeys.md#j99) — Resolve damage, healing, fainting and revival | P0 | **IU** — Damage/heal/faint/revive state and ordered result playback exist. | Engine/type/stat and effect paths shared; real outcomes/ordering across surfaces pending. | [E10](#e10) | M/M: representative resolution acceptance | [E185 / #185](https://github.com/ewei068/pokestar/issues/185) | **Candidate** — Shared combat acceptance requirement. |
| [J100](../user-journeys.md#j100) — Resolve passive abilities and held-item triggers | P0 | **IU** — Ability/item triggers resolve in engine and event display. | Existing held build captured in setup; persistent reward modifiers need completion verification; no management UI. | [E10](#e10), [E09](#e09) | M/M: trigger and reward acceptance | [E185 / #185](https://github.com/ewei068/pokestar/issues/185) | **Candidate** — Rules stay shared; #185/#186. |
| [J101](../user-journeys.md#j101) — Resolve special moves, positioning and transformations | P0 | **IU** — Move-driven positioning/copy/transform mechanics run in shared battle. | Versioned data/replay/events exist; representative projection and footprint coverage unverified. | [E10](#e10) | M/M: special-mechanic acceptance | [E185 / #185](https://github.com/ewei068/pokestar/issues/185) | **Candidate** — No separate switch/transform feature implied. |
| [J102](../user-journeys.md#j102) — Receive a saved battle result and progression once | P0 | **Partial** — Saved winner/completion status shown; itemized reward/progression receipt absent; partial-write recovery not established. | Trainer/Pokémon/quest writes separate; receipt not projected; renderer never awards; claims need #186. | [E09](#e09), [E10](#e10) | L/L: recovery design and real Mongo | [G41 / #236](https://github.com/ewei068/pokestar/issues/236) | **Candidate** — Reuse #186/#185; cannot certify exactly-once yet. |
| [J103](../user-journeys.md#j103) — Reject stale or unauthorized battle actions and recover | P0 | **IU** — Participant/stale/wrong-actor checks and refresh/recoverable errors implemented. | Store CAS/request dedup and projected service shared; unauthorized/concurrent/live acceptance missing. | [E10](#e10) | M/M: real authorization/concurrency acceptance | [E185 / #185](https://github.com/ewei068/pokestar/issues/185) | **Candidate** — Reuse #185; retain private opponent projection. |
| [J104](../user-journeys.md#j104) — Progress through dungeon phases and tower floors | P0 | **Partial** — Durable dungeon phases/tower settlement can advance; next-run/floor entry missing. | Generated queues and floor completion/reset shared; need web mode navigation and acceptance. | [E09](#e09), [E10](#e10) | L/M: phase/floor and reset acceptance | [G17 / #211](https://github.com/ewei068/pokestar/issues/211) | **Candidate** — Dungeon portion now; tower portion G18 Later. |
| [J105](../user-journeys.md#j105) — Find support and community help | P2 | **Absent** — No support/community entry link in current shell. | Configured support invite reusable; missing discoverability and external-link presentation. | [E16](#e16) | S/H: reference link | [G37 / #232](https://github.com/ewei068/pokestar/issues/232) | **Later** — P2; may pull tiny support link into release without re-rating. |
| [J106](../user-journeys.md#j106) — Handle expired interactions and request cooldowns | P0 | **Partial** — Current API/client handles auth/expiry/429 and retry; nonbattle flows absent. | Rate limits/cancellation exist; new operations need equivalent recovery and uncertain-write status. | [E01](#e01), [E10](#e10) | M/M: shared recovery UX and operation retries | [G40 / #235](https://github.com/ewei068/pokestar/issues/235) | **Candidate** — Core shell contract; #185/#192 overlap current battle only. |
| [J107](../user-journeys.md#j107) — Sign in as the existing Discord trainer | P0 | **IU** — OAuth signs in Discord ID and opens participant battles; no new-trainer creation. | Session identity shared with existing trainer; provider/retained-cookie acceptance broader than reported deployment remains. | [E01](#e01), [E02](#e02) | M/M: real OAuth acceptance | [E185 / #185](https://github.com/ewei068/pokestar/issues/185) | **Candidate** — Existing access; reuse #185/#187. |
| [J108](../user-journeys.md#j108) — Sign out and recover an expired web session | P0 | **IU** — Sign-out/session expiry/retry and callback recovery screens exist. | Hashed sessions/revocation/origin checks shared; real-provider/browser expiry acceptance pending. | [E01](#e01) | M/M: real session recovery acceptance | [E185 / #185](https://github.com/ewei068/pokestar/issues/185) | **Candidate** — Existing access; reuse #185. |
| [J127](../user-journeys.md#j127) — Receive and spend all reward/resource types | P0 | **Partial** — Battle settlement grants supported rewards; no inventory or all-resource spend interfaces. | addRewards/backpack config cover types; other claims/spends and quest effects distributed across services. | [E02](#e02), [E06](#e06), [E09](#e09) | L/M: resource consumer reconciliation | [G40 / #235](https://github.com/ewei068/pokestar/issues/235) | **Candidate** — First-release consumers now; later sources/spends stay mapped below. |
| [J128](../user-journeys.md#j128) — Survive browser closure and compatible backend restart | P0 | **IU** — Browser reload resumes stored compatible durable battle; restart logic exists. | Mongo/replay/version checks shared; production reboot and real restart recovery unverified; excludes legacy cached battle. | [E10](#e10) | L/M: operational acceptance | [E185 / #185](https://github.com/ewei068/pokestar/issues/185) | **Candidate** — Reuse #184/#185; retain #186 claims across restart. |
| [J129](../user-journeys.md#j129) — Preserve ownership, rarity, shiny and build identity | P0 | **Partial** — Frozen battle preserves shiny/species and own build subset; no full owned-identity browser flow. | Generation/collection storage preserves ownership/rarity/build; new reads/mutations must retain originalOwner and IDs. | [E03](#e03), [E04](#e04), [E05](#e05), [E10](#e10) | M/M: identity contract across consumers | [G03 / #197](https://github.com/ewei068/pokestar/issues/197) | **Candidate** — Core acceptance for collection, mutation and later trade. |

## Existing issues to reuse

Read-only `gh issue list --state all --limit 300` returned **58 issues: nine open,
49 closed**, without an `agent` label filter. All nine open bodies/statuses and
Project memberships were read. `gh project view 3 --owner ewei068` confirmed
**Pokestar**, Project 3; each open issue's `projectItems` contains Pokestar.
No issues, labels, priorities, Project fields or memberships were changed.
The table records observed scope, not a proposed rewrite of those issues.

| Existing issue (all OPEN) | Reuse and limits | Groups / journeys |
| --- | --- | --- |
| [#184 — Verify production reboot recovery and backup restoration](https://github.com/ewei068/pokestar/issues/184) | Owns Mongo/PM2 boot, environment/flags, memory and isolated restore; maintenance window required later. Reuse as operational gate, not proof of continuity. | G20; J09/J128, supporting all durable player state |
| [#185 — Complete real-environment web battler acceptance](https://github.com/ewei068/pokestar/issues/185) | Owns real OAuth/session, enabled PvE/PvP/dungeon/tower continuation/completion, concurrency, Auto outcomes and physical-device/audio checks. New nonbattle operation acceptance belongs to its group; do not silently expand this ticket. Restart cases depend on #184. | G01/G20 and existing-mode portions of G16–G18/G21/G30 |
| [#186 — Design and verify reward and Auto claim recovery](https://github.com/ewei068/pokestar/issues/186) | Owns interruption inventory, per-effect reconciliation, uncertain Auto claims, concurrent raid updates and rollback compatibility. Needs recovery design and real Mongo; not unattended implementation-ready. Does not cover new shop, release or trade transaction recovery automatically. | G20/G21/G32/G41; J102, shared completion portions of J61/J64/J67/J79/J100/J127/J128 |
| [#187 — Assess and remediate remaining production dependency exposures](https://github.com/ewei068/pokestar/issues/187) | Owns fresh advisory/reachability inventory and Node/Mongo driver validation, scoped fixes/mitigations and checks. Security/runtime rollout gate; no new advisory scan was run here. | G01/G20; all new HTTP operations consume this foundation |
| [#190 — Tapping a target for a move on web devices occasionally instantly uses the move or doesn't bring up the confirm option](https://github.com/ewei068/pokestar/issues/190) | Reuse directly for reported J93 defect, with device/interaction reproduction and confirmation acceptance. Title-only report; not reproduced in this audit. | G20; J93, supports J92/J101 |
| [#191 — Web battler to auto-scroll to arena if off-screen upon entry](https://github.com/ewei068/pokestar/issues/191) | Existing title-only presentation request. Check entry/focus behavior within battle acceptance; distinct from new navigation architecture. | G20; J09/J95 |
| [#192 — Reduce polling and cut network traffic loads](https://github.com/ewei068/pokestar/issues/192) | Existing title-only performance request. Measure current visible/hidden/unchanged polling; preserve ordered updates and uncertain-action recovery. No evidence here that it blocks release on its own. | G20; J09/J103/J106/J128 |
| [#194 — Use icons on web interface](https://github.com/ewei068/pokestar/issues/194) | Owns custom emoji equivalents for items/Pokémon/types/NPCs. Reuse asset/display work for new feature groups; missing icons do not make domain rules absent. | G20 plus new G03/G07–G18/G27–G39 presentation |
| [#195 — Web interface upselling](https://github.com/ewei068/pokestar/issues/195) | Owns limited Discord command/battle-link promotion and disable setting/instructions. Related to G24/G25 but distinct from tutorial/quest reminders. Previous silent rollout remains the accepted direction until the maintainer chooses activation. | G24/G25; J60/J74 adjacency, battle entry/continuation discovery |

No open issue currently owns the overall nonbattle parity expansion. Recommend
new scoped groups below after Phase 2 approval; `web-parity` and `web-release-1`
remain proposed labels. Keep the Project Priority field authoritative and do
not infer ticket P0 from journey P0.

Closed #188 is catalog/triage provenance, not an active parity umbrella. Its body
and Project readme still say the catalog is deferred, despite the current
catalog's approved review; those tracker descriptions need a separately
authorized update. Historical closed issues such as #8 (expiry), #10 (state
storage), #19 (backups), #21 (tutorial), #29 (equipment swap), #34 (release), #37
(storage) and #46 (equipment search) are background only. Closure and overlapping
titles do not establish implementation or a reason to reopen them. The overview
records the 2026-10-26 stale-backlog retirement. Reuse the current open issues
above, not those historical requests as evidence of completed parity.

## Proposed coherent work groups

These are proposed ticket boundaries, **not created tickets**. Each new group
includes a usable shared operation, both adapters where applicable, browser UI,
required effects and acceptance; avoid separate API-only/UI-only tickets.
Groups marked Reuse are a coordination view over existing tickets, not requests
for duplicate umbrella implementation tickets. A group may yield a design task
and an implementation task when the recorded risk cannot be settled safely in
one unit; preserve its journey mapping in either case.

Estimates separate **U** (browser UI), **S** (service extraction/contract), **P**
(persistence/concurrency/recovery risk), **Q** (product uncertainty). U/S use
S/M/L; P/Q use low/medium/high. These are dimensions, not additive time estimates.
Existing prerequisites are described in E01–E16. “Depends” below identifies
missing delivery work and existing issue gates; an arrow orders outcomes, not
necessarily all investigation. Every group inherits authenticated caller identity,
owner/participant enforcement, allowlisted inputs, cross-surface stale/retry
checks, meaningful empty/error/loading states and narrow-screen/keyboard/touch
acceptance. Follow the [UI style guide](../web-ui-style-guide.md); Phase 3 owns
final navigation and reusable visual components.

<a id="g01"></a>

### G01 — Accept existing web access

- **Reuse; IDs:** J107, J108. **Release:** Candidate.
- **Estimate:** U S; S S; P medium; Q low. **Depends:** Reuse #185/#187; restart cases #184.
- **Outcome and acceptance:** Verify real sign-in/sign-out, retained cookies, cancelled/denied callback, expiry/retry and identity isolation. No trainer creation implied.
- **Grouping rationale:** Single existing session boundary; reuse acceptance instead of new auth implementation.

<a id="g02"></a>

### G02 — Claim daily and trainer-level rewards

- **New; IDs:** J02, J19. **Release:** Candidate.
- **Estimate:** U M; S M; P high; Q low. **Depends:** G40 refresh/effects; G07 balances; #186 only for battle-origin progress.
- **Outcome and acceptance:** List availability, claim and show exact persisted receipt; reject duplicate/concurrent claims; apply Celebi daily bonus and retain level-claim history.
- **Grouping rationale:** Both are trainer-owned claimable grants; share receipt/balance boundary, distinct eligibility checks.

<a id="g03"></a>

### G03 — Browse owned collection and build identity

- **New; IDs:** J04, J129. **Release:** Candidate.
- **Estimate:** U M; S M; P medium; Q low. **Depends:** G01; G40 identity/refresh contract; #194 icons reusable.
- **Outcome and acceptance:** Owner-scoped filter/sort/page/detail, full identity/build fields and stable Pokémon links; empty collection path. Read from collection, not battle snapshot.
- **Grouping rationale:** One collection read outcome; identity is its shared acceptance contract across later mutations.

<a id="g04"></a>

### G04 — Protect and release a reviewed selection

- **New; IDs:** J25, J47, J48. **Release:** Candidate.
- **Estimate:** U M; S L; P high; Q low. **Depends:** G03/G07/G40; fresh party references G05.
- **Outcome and acceptance:** Lock/unlock, select single/page, preview exact IDs/value, confirm restrictions, delete and credit with interruption/retry evidence. Decline leaves state intact.
- **Grouping rationale:** Lock and release safeguards co-deliver the capacity escape outcome; single/bulk use one operation family.

<a id="g05"></a>

### G05 — Edit and restore battle formations

- **New; IDs:** J05, J54, J55. **Release:** Candidate.
- **Estimate:** U L; S M; P medium; Q low. **Depends:** G03/G40; #185 for frozen-setup continuation.
- **Outcome and acceptance:** Inspect/edit positions, save/load nine presets using existing swap semantics, validate missing/duplicate/ineligible IDs at edit/start, refresh stale edits; active battles retain captured builds.
- **Grouping rationale:** Parent/preset/validation are one preparation loop; autofill kept independently shippable in G06.

<a id="g06"></a>

### G06 — Automatically fill a party

- **New; IDs:** J53. **Release:** Later.
- **Estimate:** U S; S M; P medium; Q low. **Depends:** G05/G03/G40.
- **Outcome and acceptance:** Preview ranked fill by combat power/IV/level and explicitly replace party with fresh owner validation.
- **Grouping rationale:** Independent convenience; can follow working manual/preset editing.

<a id="g07"></a>

### G07 — Inspect owned resources

- **New; IDs:** J18. **Release:** Candidate.
- **Estimate:** U M; S S; P medium; Q low. **Depends:** G01/G40; shared resource definitions already exist; #194 assets.
- **Outcome and acceptance:** Show money, balls, materials, consumables and current balances with empty categories; refresh after operations. Include Dream balance when G21 ships.
- **Grouping rationale:** One owner inventory projection; no invented screen per resource type.

<a id="g08"></a>

### G08 — Buy supplies and location improvements

- **New; IDs:** J13, J28, J49. **Release:** Candidate.
- **Estimate:** U M; S L; P high; Q medium. **Depends:** G07/G40; G03 capacity recovery link.
- **Outcome and acceptance:** Browse supplies/owned tiers, show price/quota, choose valid quantity, buy once and show balances; verify Computer Lab capacity, EV/EXP locations and Shrine effect.
- **Grouping rationale:** Shared shop spending and location tier operation; storage expansion is a purchase variant, not separate ticket.

<a id="g09"></a>

### G09 — Roll banners and inspect acquired Pokémon

- **New; IDs:** J03, J50, J51, J52. **Release:** Candidate.
- **Estimate:** U L; S L; P high; Q medium. **Depends:** G03/G04/G07/G08/G40; #194 icons reusable.
- **Outcome and acceptance:** Choose banner/ball/1–10, inspect odds/pity, roll with retained outcome and recover uncertain debit/insert; validate capacity, beginner milestones, Jirachi bonus and quest events.
- **Grouping rationale:** Parent, guarantees, odds and obtained details are one acquisition operation and its receipt.

<a id="g10"></a>

### G10 — Train and rebuild EV allocation

- **New; IDs:** J06, J76. **Release:** Candidate.
- **Estimate:** U M; S M; P medium; Q low. **Depends:** G03/G07/G08/G40; existing location/stat rules.
- **Outcome and acceptance:** Choose owned location/Pokémon, show EXP/EV delta and result; check clamps, Berry negative EVs, Celebi bonus and TRAINED_POKEMON plus trainer progression.
- **Grouping rationale:** Positive/negative EV paths share the same training operation; location purchases remain G08.

<a id="g11"></a>

### G11 — Evolve and change owned builds

- **New; IDs:** J21, J22, J24. **Release:** Candidate.
- **Estimate:** U M; S L; P high; Q low. **Depends:** G03/G07/G40; resources from G16/G02/G08.
- **Outcome and acceptance:** Expose valid evolution/form/nature choices and costs; revalidate target eligibility and ownership on confirmation, preserve identity, handle mint/charge/write/refund interruptions and emit evolution progress.
- **Grouping rationale:** Related Pokémon detail actions share confirmation/result/stat boundary; keep per-action validation and recovery explicit.

<a id="g12"></a>

### G12 — Upgrade and reroll equipment with costs

- **New; IDs:** J07, J27, J75. **Release:** Candidate.
- **Estimate:** U M; S L; P high; Q low. **Depends:** G03/G07/G17/G40; configured equipment rules.
- **Outcome and acceptance:** Inspect slots/quality/costs, upgrade level or reroll slot, persist debit and resulting build, reconcile partial/random outcomes and emit required progression.
- **Grouping rationale:** Rules/cost explanation is integrated acceptance of one equipment spend family; no separate help ticket.

<a id="g13"></a>

### G13 — Compare and transfer equipment

- **New; IDs:** J26. **Release:** Later.
- **Estimate:** U M; S L; P high; Q low. **Depends:** G03/G12/G40.
- **Outcome and acceptance:** Filter/sort equipment, compare source/destination, quote cost and atomically/recoverably transfer without duplicate equipment or stale ownership.
- **Grouping rationale:** Two-Pokémon transaction has independent risk and usefulness; do not enlarge upgrade ticket.

<a id="g14"></a>

### G14 — Give and recover held items

- **New; IDs:** J23. **Release:** Candidate.
- **Estimate:** U M; S M; P high; Q low. **Depends:** G03/G07/G40; item availability through existing inventory/G15.
- **Outcome and acceptance:** Give/swap/remove with exact backpack deltas and resulting stats; no duplicated old/new items under concurrent use or interrupted writes.
- **Grouping rationale:** One item↔Pokémon ownership transfer family; craft remains independent source.

<a id="g15"></a>

### G15 — Craft an item from owned resources

- **New; IDs:** J29. **Release:** Candidate.
- **Estimate:** U M; S M; P medium; Q low. **Depends:** G07/G40; recipes already configured.
- **Outcome and acceptance:** Browse recipes, validate quantity/material/currency cost and grant once; show receipt/balance and recheck concurrent spending.
- **Grouping rationale:** Separately useful recipe conversion; no need to couple to held-item editing.

<a id="g16"></a>

### G16 — Choose and start NPC battles with daily progress

- **New; IDs:** J08, J64. **Release:** Candidate.
- **Estimate:** U M; S L; P high; Q medium. **Depends:** G05/G07/G40; existing combat G20 and #185/#186.
- **Outcome and acceptance:** Choose opponent/difficulty, inspect daily bonus/permanent victory status, start with fresh party snapshot and retained start identity, play and observe settled reward/progression.
- **Grouping rationale:** NPC selection and daily-victory effects form one usable encounter loop; core mechanics reused.

<a id="g17"></a>

### G17 — Enter and finish multiphase dungeons

- **New; IDs:** J30, J104 (dungeon portion). **Release:** Candidate.
- **Estimate:** U M; S L; P high; Q medium. **Depends:** G16 start pattern/G20/G40; #185/#186.
- **Outcome and acceptance:** Select dungeon/difficulty, preserve generated phases across reload/restart, advance every phase, grant materials once and return to collection/equipment.
- **Grouping rationale:** Independent mode entry and phase acceptance; J104 tower portion deliberately belongs to G18 later.

<a id="g18"></a>

### G18 — Enter and advance the Battle Tower

- **New; IDs:** J31; J104 (tower portion). **Release:** Later.
- **Estimate:** U M; S L; P high; Q medium. **Depends:** G16/G20/G40; refresh/reset rules; #185/#186.
- **Outcome and acceptance:** Start current eligible floor, preserve run, settle/unlock next floor, show progress and handle fortnightly reset boundary.
- **Grouping rationale:** Distinct reset/floor lifecycle merits a mode ticket; keep P0 impact though deferred from recommended R1.

<a id="g19"></a>

### G19 — Start another encounter from its result

- **New; IDs:** J65. **Release:** Later.
- **Estimate:** U S; S M; P medium; Q low. **Depends:** G16/G17 and saved mode identity; G20 completion.
- **Outcome and acceptance:** Result action starts a new validated encounter with a new start key; never replays reward processing; handle missing/expired original context.
- **Grouping rationale:** Independently useful P1 shortcut; avoid coupling old Discord cache to durable results.

<a id="g20"></a>

### G20 — Accept and repair current shared combat and continuity

- **Reuse; IDs:** J09, J92, J93, J94, J95, J96, J97, J98, J99, J100, J101, J103, J128. **Release:** Candidate.
- **Estimate:** U M; S M; P high; Q low. **Depends:** Reuse #184/#185/#186/#187/#190/#191/#192/#194; rollout approval later.
- **Outcome and acceptance:** Use existing issue scopes: combat/input fixes; real provider/device/Mongo tests; mechanic-family representatives; two-surface stale/retry/privacy, completion and restart/restore. No new mechanics screens.
- **Grouping rationale:** Coordination/acceptance group only. Existing implementations need evidence or known fixes, not duplicate ports. Performance/icon polish is not automatically a gate.

<a id="g21"></a>

### G21 — Use Auto and inspect replenished cards

- **New; IDs:** J32, J63. **Release:** Later.
- **Estimate:** U M; S M; P high; Q medium. **Depends:** G20/#186; G07/G40; existing entitlement or G29A.
- **Outcome and acceptance:** Add browser projected eligibility/balance/cost and Auto command, preserve private simulation/CAS/conditional debit, reject PvP, recover uncertain payment/finalization; refresh elapsed regeneration and cap.
- **Grouping rationale:** One entitlement/resource/Auto operation; no card screen required. J63 rating/split remains a maintainer decision.

<a id="g22"></a>

### G22 — View quests and claim staged rewards

- **New; IDs:** J12, J56, J57, J58. **Release:** Candidate.
- **Estimate:** U M; S L; P high; Q low. **Depends:** G07/G40; action groups emit events before quest UI ships.
- **Outcome and acceptance:** Show daily/achievement requirements, current progress and stages; claim single/all and show exact once-only receipts across repeated/concurrent surfaces; refresh daily selection.
- **Grouping rationale:** Shared quest read/claim boundary; parents, stages and bulk claiming have coherent acceptance.

<a id="g23"></a>

### G23 — Initialize a trainer and preserve learning rewards

- **New; IDs:** J01, J46, J59. **Release:** Unresolved.
- **Estimate:** U L; S L; P high; Q high. **Depends:** G01/G40 plus delivered action groups; decision D1/D2 below.
- **Outcome and acceptance:** If onboarding selected, initialize once, deliver first-loop guidance, map completion/rewards to existing tutorial ledger, resume/claim on either surface and preserve Darkrai count. Returning-player alternative must state no new-player support.
- **Grouping rationale:** New-account entry and reward-bearing lessons depend on one product contract; G24 is bounded existing-player help, not a substitute for these rows.

<a id="g24"></a>

### G24 — Help players find delivered actions and objectives

- **New; IDs:** J36, J60. **Release:** Candidate.
- **Estimate:** U M; S M; P medium; Q medium. **Depends:** G22/G25 plus current feature destinations; coordinate #195 separately.
- **Outcome and acceptance:** Provide contextual guidance and objective/claim return links; show only relevant delivered objectives, respect persisted suppression. No browser push requirement inferred.
- **Grouping rationale:** Guidance and actionable reminders share destination contracts. Optional Discord web promotion is already #195; it is not tutorial progression.

<a id="g25"></a>

### G25 — Persist profile privacy and reminder preferences

- **New; IDs:** J35, J71, J74. **Release:** Candidate.
- **Estimate:** U M; S M; P medium; Q medium. **Depends:** G01/G40; coordinate #195 promotion opt-out; local audio already exists.
- **Outcome and acceptance:** Read/save allowlisted shared privacy/reminder choices, reflect changes across surfaces and honor suppression; keep local audio controls. Do not port J72/J73.
- **Grouping rationale:** One account-settings boundary; #195 may add a distinct promotion preference after maintainer activation.

<a id="g26"></a>

### G26 — Inspect self and permitted other trainer profiles

- **New; IDs:** J17. **Release:** Later.
- **Estimate:** U M; S M; P medium; Q medium. **Depends:** G25/G03/G05/G40.
- **Outcome and acceptance:** Read own profile/progress, lookup another trainer, enforce publicProfile before every extra-info/party projection and return non-disclosing errors.
- **Grouping rationale:** Distinct public read/privacy boundary; no need to ship before inventory and own-operation receipts.

<a id="g27"></a>

### G27 — Browse species research and ownership counts

- **New; IDs:** J20. **Release:** Later.
- **Estimate:** U M; S M; P medium; Q low. **Depends:** G03/G40; catalog/config and aggregation already exist.
- **Outcome and acceptance:** Browse species and Info/Growth/Moves/Abilities/Rarity tabs, navigation and owned/shiny counts; do not confuse display catalog with completion.
- **Grouping rationale:** Self-contained P1 reference outcome; owned details already meet first-release essentials.

<a id="g28"></a>

### G28 — Obtain and customize Mew

- **New; IDs:** J40, J77. **Release:** Later.
- **Estimate:** U M; S M; P high; Q low. **Depends:** G17/G03/G40; existing Discord victory may satisfy gate.
- **Outcome and acceptance:** Verify New Island eligibility, obtain once and customize legal move tiers/nature; repair/reject invalid builds explicitly and preserve identity on retries.
- **Grouping rationale:** Unlock and owned customization share one specialized Pokémon operation family.

<a id="g29a"></a>

### G29A — Obtain Darkrai with compatible learning credit

- **New; IDs:** J87. **Release:** Later.
- **Estimate:** U S; S M; P high; Q high. **Depends:** G23 learning decision or existing Discord completions; G03/G40.
- **Outcome and acceptance:** Inspect 25-stage gate, obtain once and persist Auto entitlement; interrupted flag/upsert must reconcile. Never silently award equivalent credit for unrelated web clicks.
- **Grouping rationale:** Unlock/grant affects P1 Auto; split from lower-priority dedicated reference page.

<a id="g29b"></a>

### G29B — Explain Darkrai ownership and Auto access

- **New; IDs:** J44. **Release:** Later.
- **Estimate:** U S; S S; P low; Q low. **Depends:** G21/G29A; read-only entitlement/resources.
- **Outcome and acceptance:** Dedicated Darkrai inspection/explanation and links to Auto/card sources. Essential concise eligibility copy stays in G21.
- **Grouping rationale:** P2 reference independently deferrable from unlock/Auto; explicit priority split avoids pulling a full page into R1.

<a id="g30"></a>

### G30 — Create and answer PvP challenges

- **New; IDs:** J10. **Release:** Later.
- **Estimate:** U M; S L; P high; Q high. **Depends:** G05/G20/G40; #185 covers existing combat, not invitations.
- **Outcome and acceptance:** Durable targeted invitation/list/accept/decline/expiry; validate both trainers/parties and actor on each action, deduplicate start and play to result; preserve opponent privacy and disable Auto.
- **Grouping rationale:** Challenge initiation is the missing lifecycle; combat already exists, so do not duplicate engine work.

<a id="g31"></a>

### G31 — Offer, consent to and complete a trade

- **New; IDs:** J14, J68, J69. **Release:** Later.
- **Estimate:** U L; S L; P high; Q high. **Depends:** G03/G04/G07/G40; choose durable exchange/recovery design.
- **Outcome and acceptance:** Edit both offers with level/count/value/lock/party checks; version offers, invalidate consent on change, cancel/expire safely, commit transfer/money once and recover partial writes across surfaces.
- **Grouping rationale:** One exchange must include all safeguards/consent; cannot ship an independently unsafe accept or cancel fragment. #186 is not its recovery ticket.

<a id="g32"></a>

### G32 — Host, join and settle raid instances

- **New; IDs:** J11, J66, J67. **Release:** Later.
- **Estimate:** U L; S L; P high; Q high. **Depends:** G16/G20/G40; #186 concurrent raid recovery/#185 separate mode acceptance; durable raid activation decision.
- **Outcome and acceptance:** Choose host/discovery context, consume pass/create once, join eligible instance, retain deadline/contribution, update boss concurrently, distribute rewards with Jirachi odds and expire without duplicate grants.
- **Grouping rationale:** One raid instance lifecycle; may split host/discovery from combat acceptance after product context is chosen, retaining all three ID links.

<a id="g33"></a>

### G33 — Obtain Celebi and use daily time travel

- **New; IDs:** J41, J78. **Release:** Later.
- **Estimate:** U M; S L; P high; Q medium. **Depends:** G08/G09/G03/G40; owned bonus consumers already ship without this group.
- **Outcome and acceptance:** Show level/Shrine requirements, obtain once, quote balls/daily allowance, time travel and retain random outcome; reconcile spend/flag/grant interruption.
- **Grouping rationale:** Specialized unlock/power family; explicitly excludes P0 owned bonus J79 from deferred scope.

<a id="g34"></a>

### G34 — Obtain and change Deoxys forms

- **New; IDs:** J42, J80. **Release:** Later.
- **Estimate:** U M; S M; P medium; Q low. **Depends:** G18 or existing Discord floor-20 progress; G03/G40.
- **Outcome and acceptance:** Show floor-20 gate, obtain once, select supported form, update ability/stats and preserve owned identity.
- **Grouping rationale:** Unlock/form are one special species lifecycle; tower stays independently useful.

<a id="g35"></a>

### G35 — Obtain Jirachi and choose a weekly wish

- **New; IDs:** J43, J81, J83, J84, J85, J86. **Release:** Later.
- **Estimate:** U M; S L; P high; Q medium. **Depends:** G03/G07/G40; raid/trade prerequisites via G31/G32 or Discord.
- **Outcome and acceptance:** Revalidate 200 Star Pieces/three non-original-owner Pokémon, fix caller contract before exposing gate, obtain once, choose Power/Rebirth/Allies/Wealth with target/cost preview and shared weekly allowance; reconcile effects.
- **Grouping rationale:** Wish variants share gate/allowance/receipt; owned shiny bonus J82 is not deferred with this group.

<a id="g36"></a>

### G36 — Obtain Arceus and use its powers

- **New; IDs:** J45, J88, J89, J90, J91. **Release:** Later.
- **Estimate:** U L; S L; P high; Q medium. **Depends:** G28/G29A/G33/G34/G35 or stored Discord prerequisites; G03/G07/G40.
- **Outcome and acceptance:** Validate complete species/mythical checklist, obtain once, change supported type or create eligible Pokémon/item under shared weekly allowance; all commands enforce entitlement, including item creation.
- **Grouping rationale:** One late-game entitlement/power family; individual creation effects require their own failure scenarios, not separate consumer screens.

<a id="g37"></a>

### G37 — Read events, updates and community support

- **New; IDs:** J37, J38, J105. **Release:** Later.
- **Estimate:** U S; S S; P low; Q low. **Depends:** Current help/changelog/support sources; Phase 3 navigation.
- **Outcome and acceptance:** Provide current-event content, changelog link and support destination with maintained copy/source ownership. Support link can be pulled forward cheaply without changing impact priority.
- **Grouping rationale:** Coherent low-cost reference/discovery surface; no gameplay persistence, so distinct from learning rewards.

<a id="g38"></a>

### G38 — Compare global and server standings

- **New; IDs:** J15, J70. **Release:** Later.
- **Estimate:** U M; S M; P medium; Q high. **Depends:** G01; decide authorized guild context/membership; existing global ranking queries.
- **Outcome and acceptance:** Six categories, global/server scope and empty results; define authorized server selection and privacy before exposing guild membership.
- **Grouping rationale:** Parent/scope variant are one ranking read outcome; OAuth scope design deferred until chosen.

<a id="g39"></a>

### G39 — Claim accepted vote credit on web

- **New; IDs:** J33. **Release:** Later.
- **Estimate:** U S; S M; P high; Q medium. **Depends:** G07/G40; existing J124 provider ingestion remains outside web scope.
- **Outcome and acceptance:** Link provider, show accepted credit, consume each claim once, retain credit through retries/cross-surface use and show resource receipt; no callback port.
- **Grouping rationale:** P2 voting/claim interface separated from existing credit durability and bot-growth promotion.

<a id="g40"></a>

### G40 — Define shared player-operation effects and prove them in the first slice

- **New; IDs:** J61, J62, J79, J82, J106, J127. **Release:** Candidate with explicit later consumers.
- **Estimate:** U S; S L; P high; Q high. **Depends:** G01; existing trainer/resource/quest rules; #186 for battle completion only.
- **Outcome and acceptance:** Define refreshed identity/resource projection, semantic reward/event mapping, retry/result identity and error/cooldown contract; prove collection→party→NPC→saved progression across surfaces. Each consumer group owns its integration and failure acceptance.
- **Grouping rationale:** Bounded foundation/first-slice contract, not a ticket to implement all economy operations. These mechanics must be attached to consumer acceptance, never invented as separate screens.


<a id="g41"></a>

### G41 — Show a saved, participant-safe completion receipt

- **New; IDs:** J102. **Release:** Candidate.
- **Estimate:** U M; S M; P high; Q low. **Depends:** existing saved completion record, #186 recovery outcome, G07/G40 projections; #185 for real completion acceptance.
- **Outcome and acceptance:** Expose the settled trainer/Pokémon/resource/quest outcome to the authorized participant and display a durable receipt after finish/reload. Distinguish pending/failed/uncertain from applied; do not infer an applied grant from winner state, replay reward writes to render it, or expose another participant's private rewards. Record any structured receipt needed at completion; the current stored summary alone is not a proven safe browser contract.
- **Grouping rationale:** Concrete missing browser result contract and presentation, distinct from #186's recovery design and #185's existing-mode acceptance. Reuse those gates without silently expanding them into implementation of a reward receipt.

### Explicit boundaries within supporting or mixed work

| Traced ID / contract | First-release portion | Complete-parity remainder and owner |
| --- | --- | --- |
| J102 | G41 exposes the participant-safe applied/pending/failed receipt and G20 reuses #186 recovery/#185 acceptance | Later mode groups consume the same receipt contract; winner rendering alone never proves rewards. |
| J104 | Dungeon phase navigation, persistence and completion in G17 | Tower entry/next-floor/reset in G18. J104 appears once in the journey table; both portions retain acceptance links. |
| J61/J62/J106 | G40 defines/proves shared semantics; G02–G05/G07–G17/G22/G24/G25 implement them with their operations. Reads/previews/polls earn no extra interaction grants; legitimate refresh and pending battle completion effects remain service-owned. | G06/G18/G19/G21/G23/G26–G39 apply the same contract when delivered. Full nonbattle cooldown/expiry parity is not claimed from current battle middleware. |
| J79 | Celebi EXP on training and battle completion plus boosted daily money/shards in G10/G16/G17/G02 | Later battle modes consume the same rule; acquiring Celebi/time travel stays G33. No duplicate entitlement based on UI exposure. |
| J82 | Owned Jirachi shiny odds on every G09 acquisition, independent of its unlock screen | Raid reward shiny odds in G32; mythical/time-travel/create paths that use acquisition helpers retain the rule in G33/G35/G36. No first-release claim of full raid coverage. |
| J127 | G07 resource catalog/projection plus each delivered grant/spend receipt; G02/G04/G08–G17/G22 implement their effects | Auto cards G21, trade money/Pokémon G31, raid passes/contribution/Star Pieces/shiny G32, mythical costs/grants G28–G36, vote credit/rewards G39; trainer initialization/tutorial grants G23. Existing Discord-held items/credits are retained and inspectable without new source screens. |
| J129 | Full collection identity projection G03; every delivered party/build/acquisition operation preserves identity | Trading changes current owner but preserves original owner in G31; later mythical grants/forms G28–G36 preserve identity too. Frozen battle setup remains G20. |
| J01/J46/J59 vs J36/J60 | G24 covers help/reminders for an existing player's delivered actions only | New trainer setup and reward-bearing learning remain G23 Unresolved. Do not close the three IDs from contextual help or mark them first-release accepted. |
| J87 vs J44 | Neither is required for a manual-battle release; existing Darkrai entitlement is retained | G29A supplies P1 unlock; G29B supplies P2 dedicated inspection. Concise eligibility explanation belongs to G21 when Auto ships. |
| J35/J71/J74 vs #195 | G25 supplies shared account choices; G24 respects objective reminder settings | #195 separately owns Discord web promotion and its opt-out. Activate only after the silent-rollout decision changes; do not conflate the two reminder types. |

No operation group is released solely because its UI works. Its required shared
effects, identity/authorization checks, cross-surface concurrency and recovery
scenarios belong in the same acceptance scope. G41 adds the missing saved receipt;
G20 reuses current combat acceptance and #186 recovery. Conversely, a later acquisition
screen is not a prerequisite to applying a benefit already stored on the trainer.

## Dependency order and first-release recommendation

### Recommended first implementation slice

Use an **existing trainer with at least one owned Pokémon**: sign in → inspect
collection/build (G03/J04/J129) → edit/validate active party and save/load a preset
(G05/J05/J54/J55) → choose NPC/difficulty and start (G16/J08/J64) → manually act,
leave/reopen and switch surfaces (G20) → finish → inspect persisted trainer,
Pokémon, resource and quest deltas (G03/G07/G41 and the G40 effects contract).

This slice proves a player-owned operation and battle start through shared backend
boundaries before duplicating the pattern. It is **not** a complete first release:
acquisition, capacity recovery, progression and accessible claims still follow.
Verify collection/selection previews do not edit builds or earn interaction
grants; legitimate trainer refresh and battle reads may advance pending turns
or settle completion under the existing claims. Use the same operation from
Discord and web, edit the party after start to prove the captured battle is stable, race
stale submissions, interrupt before/after writes, retry uncertain results and
show that rendering/reloading never charges or awards again. Reuse #185/#186/#184
for their existing acceptance/recovery responsibilities. New start/economy failure
cases stay with the new group; no production mutations are needed for this audit.

### Proposed delivery waves

1. **Foundation and proof:** G01/G40 and existing G20 repairs/gates; deliver the
   first slice G03/G05/G07/G16/G41. G40 defines the prerequisite contract first;
   its proof closes after those consumers, rather than imposing a dependency cycle. Define semantic rewards and refresh before porting
   additional mutations. Design #186 recovery alongside the slice, not after
   expansion. #184/#187 can be investigated independently; their applicable
   rollout gates remain.
2. **Repeatable acquisition and storage:** G02/G04/G08/G09. Include beginner
   guarantees, pity, shiny/owned bonuses and recovery from full collection.
3. **Build progression and materials:** G10/G11/G12/G14/G15/G17. Dungeons supply
   upgrade materials; training uses purchased location benefits. Validate all
   resource grants/spends before calling this a complete preparation loop.
4. **Visible progression, learning and control:** G22/G24/G25 may be designed
   alongside earlier waves. Gameplay quest events and shared settings contract
   must precede their consumers; the claim/help/preferences UI must be ready for
   release. Apply the G23 onboarding choice before inviting new players.
5. **Later parity:** useful independent conveniences G06/G13/G19/G26/G27/G28;
   tower G18; Auto G21 with G29A/G29B and #186; G23 if deferred; then raids G32,
   multiplayer G30/G31, specialized powers G33–G36, references G37, standings G38
   and vote claim G39. This is dependency guidance, not a fixed priority queue:
   e.g. G35 needs stored or delivered raid/trade progress, G34 needs tower progress,
   G36 needs five mythicals. Existing Discord progress can satisfy a gate without
   requiring every source interface on web first.

### First release versus the complete backlog

Recommend a **returning-player release candidate** containing G01–G05, G07–G12,
G14–G17, G20, G22/G24/G25/G40/G41. This is the **63 Candidate IDs** in the individual
table, including partial consumer portions explicitly listed above. All are
reviewed P0/P1. These are not 63 independent features or an approved release.
There are **40 Later IDs** and **three Unresolved IDs**. Counts do not sum ticket
sizes and do not imply the full outcome of a mixed ID is first-release complete.

P0 tower J31 and the tower portion of J104 remain later under this recommendation;
that is a proposed release tradeoff, not a priority downgrade. P1 Auto/Dream Cards,
PvP/trade, profiles/research, autofill/equipment transfers/repeat and Mew/Darkrai
flows remain later; their limits and dependencies stay explicit. Pulling tower or
Auto into R1 changes the candidate set and must update these rows. A small support
link (P2 J105) is inexpensive to pull forward, but it remains Later until selected.

| Alternative | What must be added/accepted | Benefit and consequence |
| --- | --- | --- |
| **Returning-player first (recommendation)** | Agree on eligibility/minimum existing progress, state it at entry, provide useful empty/new-account recovery rather than an unexplained battle list. G24 offers guidance, not new-trainer parity; G23 remains an acknowledged gap. Preserve tutorial claims via Discord until resolved. | Smaller first proof of service extraction and gameplay; brand-new users cannot complete the entire loop on web. A release advertised as a complete bot replacement would not meet this scope. |
| **New-player-capable first** | Promote G23/J01/J46/J59 after settling learning/reward semantics; add idempotent trainer creation from trusted identity, starter grants, first catch/party/help/claim path, resumable lessons and existing-Discord progress migration. Define Darkrai credit and routes for lessons referencing later features (events/voting/tower/etc.). | A first complete web-only entry loop; larger content, entitlement, initialization and recovery scope. Do not implicitly pull every later lesson feature into R1 or bypass the 25-stage gate. |

New-player support cannot be established by a successful OAuth callback. Nor can
an existing-player policy be inferred merely because this slice uses an existing
trainer. Both alternatives require a maintainer decision in Phase 2. Returning
players may still need unclaimed tutorial rewards or Darkrai progress; a Discord
handoff must be explicit until G23/G29A are delivered.

## Consequential decisions before Phase 2

- **D1 — Audience and promise:** choose returning players or new-player-capable
  first release. Recommend the returning-player first proof/release with clear
  entry requirements and an explicit new-account fallback. Decide minimum existing
  progress; do not silently restrict to tutorial-complete trainers.
- **D2 — Learning, claims and Darkrai:** retain a compatible completion ledger or
  define a reviewed mapping from web learning to legacy stage rewards/counts.
  Recommend preserving existing IDs/earned progress initially; a redesigned
  tutorial must not lose claims or mint entitlement from arbitrary acknowledgements.
  Full lesson/content design belongs after the chosen release boundary.
- **D3 — First-release boundary:** accept/adjust the candidate groups, especially
  deferring P0 tower, Auto and multiplayer while keeping acquisition/storage,
  training/builds/dungeon materials and quest claims usable. Decide whether to pull
  the low-cost support link forward. Journey priorities remain unchanged.
- **D4 — Semantic interaction rewards:** decide how web operations earn the
  EXP/money currently attached to Discord commands/clicks. Recommend a shared
  operation-level mapping, with no rewards for polling, previews or retry transport;
  quantify compatibility before implementation. This is a product/economy choice,
  not just handler extraction.
- **D5 — Safe mutation and completion recovery:** select a design for partial
  trainer/Pokémon/exchange effects against verified Mongo topology; reuse #186 for
  battle/Auto only. Recommend explicit replay/reconciliation and retained uncertain
  outcomes; do not assume transaction support or exactly-once effects from claims.
- **D6 — Labels, ownership and issue reuse:** approve the grouped backlog and
  separate `web-parity` / `web-release-1` markers (or an equivalent release field),
  retaining Project Priority as urgency. Confirm which new tickets are ready and
  which first need design. Refresh stale #188/Project descriptions only when authorized.
- **D7 — Surface context and rollout:** defer guild/server discovery for raids,
  leaderboards and invitations until those groups are selected; OAuth currently
  requests `identify` only. Keep #195 web promotion behind a deliberate change to
  the accepted silent rollout after applicable #184–#187/#190 acceptance gates.
  Do not make icon/polling polish automatic release blockers without evidence.
- **D8 — Dream Card decomposition:** retain J63 P1 as approved for now; decide
  replenishment versus inspection split when G21 is scoped. No rating was changed.

## Excluded web journeys

Every current web **Outside scope** ID is listed here; bot priority does not
change that exclusion. Backend dependencies may still support an eligible
consumer, without proposing a web screen or changing the catalog.

| Excluded ID | Catalog outcome | Reason / dependency treatment |
| --- | --- | --- |
| [J16](../user-journeys.md#j16) | Configure a server's spawns | Discord server spawn administration; no web port. |
| [J34](../user-journeys.md#j34) | Catch a wild spawn | Discord server spawn capture; no web encounter context. |
| [J39](../user-journeys.md#j39) | Invite the bot | Bot installation/invite; no player web operation. |
| [J72](../user-journeys.md#j72) | Choose Discord mobile or desktop layout | Discord layout preference; browser responsive layout is separate. |
| [J73](../user-journeys.md#j73) | Toggle target confirmation indicators | Discord target-indicator preference; browser targeting remains eligible J93. |
| [J109](../user-journeys.md#j109) | Check bot responsiveness | Bot diagnostic responsiveness; no public web tool. |
| [J110](../user-journeys.md#j110) | Echo diagnostic text | Diagnostic echo; no public web tool. |
| [J111](../user-journeys.md#j111) | Grant test Pokémon | Developer grant; no player acquisition shortcut. |
| [J112](../user-journeys.md#j112) | Grant test inventory items | Developer inventory grant; no public resource tool. |
| [J113](../user-journeys.md#j113) | Run the test interaction harness | Test interaction harness; no web port. |
| [J114](../user-journeys.md#j114) | Inspect player and guild records | Operator player/guild record inspection; no public administration. |
| [J115](../user-journeys.md#j115) | Reset a player account and collection | Operator reset; no player reset port. |
| [J116](../user-journeys.md#j116) | Reset quest or level reward progress | Operator progress reset; no web rewards tool. |
| [J117](../user-journeys.md#j117) | Reset a player’s timed allowances | Operator allowance reset; no browser bypass. |
| [J118](../user-journeys.md#j118) | Grant vote reward credit manually | Manual vote credit repair; preserve stored credits through J33 without a web grant tool. |
| [J119](../user-journeys.md#j119) | Reset guild configuration | Operator guild reset; no web port. |
| [J120](../user-journeys.md#j120) | Clear active raids | Operator raid cleanup; cleanup remains a backend prerequisite to G32. |
| [J121](../user-journeys.md#j121) | Remove the bot from a server | Bot server removal; no web player action. |
| [J122](../user-journeys.md#j122) | Register commands and initialize storage | Command registration/storage setup; existing backend prerequisite, not browser journey. |
| [J123](../user-journeys.md#j123) | Schedule wild encounters and expire old raids | Spawn scheduler and raid expiry; backend expiry supports G32, scheduler UI excluded. |
| [J124](../user-journeys.md#j124) | Receive authenticated external vote credit | Authenticated provider ingestion; retain accepted credit for J33, no callback/settings port. |
| [J125](../user-journeys.md#j125) | Report bot presence, directory stats and resource metrics | Presence/directory/resource metrics; no public web diagnostics. |
| [J126](../user-journeys.md#j126) | Maintain species, assets, enums and historical data | Species/assets/enums/data maintenance; backend/catalog prerequisite, no web editor. |

## Reconciliation and review receipt

The reconciliation was performed against the current catalog in this checkout,
not its historical reviewed totals or bot ratings. Row totals are derived from
catalog entries and checked against the authored tables/group ownership.

| Check | Observed result |
| --- | --- |
| Eligible catalog IDs versus individual assessment rows | 106 expected, 106 rows, 106 unique; no missing, duplicate or unexpected ID. |
| Eligible web-priority distribution | P0 60; P1 21; P2 24; P3 1. |
| Exclusions | 23 expected, 23 unique excluded rows; no eligible/excluded overlap; union covers all 129 catalog IDs. |
| Coverage status | Verified 0; IU 14; Partial 24; Absent 68; whole-row Unknown 0. Live/provider/device and specific backend gate behavior remain unverified as named above. |
| Release recommendations | Candidate 63 (P0/P1 only); Later 40; Unresolved 3 (J01/J46/J59). Mixed portions J104/J82/J127 and supporting effects are explicitly split without changing priorities. |
| Gap/group ownership | Every eligible row maps to one of 42 defined groups (two reuse coordination groups and 40 proposed new boundaries); all group IDs map back to eligible journeys; no outside-scope port. J104 has explicit dungeon/tower portions; foundational mechanics fan out to listed consumer acceptance. |
| Current issues and Project | 58 all-state issues inspected for overlap, nine open bodies read; all nine open are already in Pokestar Project 3. No ticket/priority/label/Project mutation. |
| Paths, symbols and links | Repository link destinations and local anchors checked; named boundary symbols checked against current code. Historical verification references labelled by their actual scope. |
| Direct review | Checked initiation, completion, side effects, cross-surface actions and uncertain retry/restart paths in the evidence/register and groups. Repaired references/wording and corrected the missing browser reward receipt (G41) during this pass. No independent reviewer was run; no suitable built-in documentation review was available. |
| Change scope | Only this audit, roadmap and overview documentation changed during the task; no runtime changes, acceptance tests or production actions. Existing local planning edits preserved. |

Representative read-throughs included OAuth→session versus trainer initialization;
collection→query→ownership; party load→trainer write→frozen battle setup;
banner confirmation→debit/pity→Pokémon insert→quest event; release confirmation→
restriction→delete→separate credit; training→stats→quest event; shop/location→
balance/quota writes; nature/equipment/held item→split writes; quest/tutorial
claim→stage/grant→trainer write; PvP invite→accept→durable start; trade consent→
parallel owner/money writes; raid host→pass→instance→completion/expiry; mythical
gates→flag/upsert/power costs; browser action→CAS/replay→completion effects.
This is the evidence basis for risk estimates, not an assertion that all legacy
paths work in production.

Phase 1 is complete as a documentation audit. Next: resolve D1–D6 and select the
first slice/release subset, then search the tracker again and establish/reuse
Phase 2 tickets within new authorization. D7/D8 have explicit revisit triggers.
No ticket creation, runtime implementation or standing monitoring is implied.
