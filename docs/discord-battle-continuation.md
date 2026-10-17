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

Menus carry battle ID and observed revision. Target/confirmation metadata uses
revision-scoped move/target ordinals to fit Discord's 100-character custom-ID
limit. Check the current revision **before** resolving those ordinals. Retain
compatibility with older target menus that carry a move ID. The service remains
authoritative for participation, turn ownership, legality and stale actions.

A stale selection/confirmation renders the current battle; a rejected submitted
action also explains the rejection. Old messages may stay stale until pressed
or refreshed. Completed and expired battles are read-only during their retention
window. New durable component events award no per-click experience or money.

The `DURABLE_BATTLES_ENABLED` flag controls the cutover in supported live battle
starts (including PvE, PvP, dungeons and tower). Raids have a separate flag and
completion constraints; continuation lists battles created through the service.

## Remaining parity work

Paid Auto battle is still missing from the durable adapter. Its legacy handler
spends Dream Cards and mutates an in-memory battle; routing a durable message
there would bypass the shared state. It needs a durable command covering the
payment and action sequence. The current adapter omits that control, as before
this UI repair. Track this explicitly rather than treating the Discord port as
complete. Mode-specific result/replay controls also need a parity audit against
the original battle messages.

## Verification

`durableBattleMessages.test.js` checks hidden IDs, same-message selectors, selected
values/icons, mobile formatting, component limits and read authorization.
`events/battle/__tests__/durableBattle.test.js` exercises move → target preview →
confirmation through the actual adapter and service, instant-action preferences,
old-menu compatibility, stale confirmation safety and info-tab preservation.
