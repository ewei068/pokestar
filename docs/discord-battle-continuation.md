# Discord battle continuation

`/continue-battle` lists the player's ongoing durable battles with pagination;
selecting one renders its current state. An optional battle ID opens it directly.
Slash replies are private, and the legacy message command sends it by DM.

## Preserve the Discord interface

The durable service changes where battles are stored and actions are submitted.
It does not require a new Discord layout. Reuse the legacy battle embed, move
and target menu builders, info controls and blocked-turn button. Changes to web
presentation must not redesign Discord as a side effect.

- Keep UUIDs and revision numbers in component metadata, not visible headers or
  battle-picker descriptions. The picker describes teams, mode and turn.
- Selecting a move keeps its dropdown on the same message alongside the target
  dropdown. Preserve move/type and target/species icons, cooldown/disabled
  labels, and selected defaults. A player can change moves without refreshing.
- Selecting a target shows the original footprint preview and Confirm button
  when the trainer's `showTargetIndicator` setting is enabled (default). With
  it disabled, choosing a target submits immediately. Selecting a move or target
  for preview does not advance the battle or write gameplay state.
- Teams and Moves/Hide info tabs preserve the selected controls and preview.
  Refresh resets selections to the latest state. Honor the trainer's mobile
  display setting in the battle embed.
- If the active Pokémon cannot move, show the original Next Turn control.
  Non-active viewers and retained results can refresh without submitting actions.

## Durable interaction contract

Confirmed moves and Next Turn submit through `BattleService`, with the Discord
interaction ID as the idempotent request ID. NPC turns still resolve automatically
as agreed for the shared battle lifecycle. The final state is the primary output.

The existing `battleMoveSelect`, `battleTargetSelect`, `battleTargetConfirm`
and `battleInfo` handlers call `loadBattleContext` before using battle state.
For durable battles, the loader checks participant access through the service,
reads the current Mongo record and restores the engine on every interaction.
The synchronous global `getState` API stays unchanged for other bot features.

The existing component `stateId` carries a compact battle ID and observed
revision. UUIDs are encoded as bytes to keep the original JSON component IDs
within Discord's 100-character limit. Move and target menu values remain the
original IDs. UI selections are recovered from the current message's selected
menu defaults, so confirmation survives a restart and selections cannot leak
between two messages showing the same battle revision.

Only transient UI/mode context is cached locally; a cached battle snapshot is
never authoritative. The loader returns a hydrated battle to the existing
handler. Confirmed actions call `submitBattleAction`, which uses the shared
service's revision check and interaction-ID deduplication, then reloads the
record. The service remains authoritative for participation, turn ownership,
legality and stale actions. Controls without a durable identity retain the
original in-memory behavior while the feature flag is disabled.

A stale selection/confirmation renders the current battle; a rejected submitted
action also explains the rejection. Old messages may stay stale until pressed
or refreshed. Completed and expired battles are read-only during their retention
window. Durable interactions suppress the original event handlers' per-click
experience and money; completion rewards belong to the service and are never
processed again by the Discord renderer.

`getStartTurnSend` is the shared renderer for both paths. The continuation module
only lists battles and opens this renderer. The old `durableMove`, `durableTarget`,
`durableConfirm`, `durableSkip`, `durableRefresh` and `durableInfo` event names
remain registered solely for messages posted before consolidation: pressing one
refreshes into the existing controls and asks the player to select again. They
do not execute the old action. `durablePick` and `durablePage` still serve the
continuation list.

The `DURABLE_BATTLES_ENABLED` flag controls the cutover in supported live battle
starts (including PvE, PvP, dungeons and tower). Raids have a separate flag and
completion constraints; continuation lists battles created through the service.

## Remaining parity work

Paid Auto battle is still missing from the durable adapter. Its legacy handler
spends Dream Cards and mutates an in-memory battle; routing a durable message
there would bypass the shared state. It needs a durable command covering the
payment and action sequence. The current adapter omits that control, as before
this UI repair. Track this explicitly rather than treating the Discord port as
complete. Original mode-specific result/replay controls are preserved when their
local menu context is still available. Reconstructing those controls after a
restart remains follow-up work; the battle itself can still be continued.

## Verification

`battle/discord/__tests__/durableBattleMessages.test.js` checks the continuation
entry point, original event names, hidden IDs, mobile formatting, component
limits, pagination and authorization.
`events/battle/__tests__/battleSession.test.js` exercises the original handlers
through the real service and an in-memory Mongo collection double: move → target
preview → confirmation, restart recovery, stale web/Discord controls, independent
message selections, instant-action settings, info tabs, legacy fallback, expiry
and once-only completion. `events/battle/__tests__/durableBattle.test.js` checks
that deprecated controls refresh without submitting actions.
`handlers/__tests__/battleInteractionRewards.test.js` checks that durable clicks
suppress per-click rewards while legacy clicks retain their configured rewards.
