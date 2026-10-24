# Discord battle continuation

`/continue-battle` lists the player's ongoing durable battles with pagination;
selecting one renders its current state. An optional battle ID opens it directly.
Both the slash and legacy message command reply in the invoking channel.
There is no persistence or interaction requirement for a DM. New picker and
pagination controls carry the requesting trainer's ID; another trainer gets a
private explanation and cannot replace that list. Opening a battle still checks
participant access, and its existing controls keep their turn/legality checks.

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
window. Successful Discord interactions retain their configured per-click
experience and money, including stale actions that only refresh the controls.
Error responses do not grant interaction rewards. Completion rewards are a
separate service-owned effect and are never processed again by the renderer.

`getStartTurnSend` is the shared renderer for both paths. The continuation module
only lists battles and opens this renderer. The unshipped experimental durable action event names were removed during
review. `durablePick` and `durablePage` still serve the
continuation list.

The `DURABLE_BATTLES_ENABLED` flag controls the cutover in supported live battle
starts (including PvE, PvP, dungeons and tower). Raids have a separate flag and
completion constraints; continuation lists battles created through the service.

## Auto battle

Auto uses the existing info-row button and `battleInfo` event. Each durable read
checks the trainer's current Darkrai unlock and Dream Card balance through
`BattleService.getAutoAvailability`; battle-start eligibility flags are not used
as current account state. The cost remains the battle's stored cost. Auto is
limited to a single human participant's non-PvP battle and their active turn.

Discord acknowledges the interaction before calculation and edits the message
once with the final result. The Instant Auto user setting and paced timer loop
are removed; older stored setting values are ignored. The shared service can
support a future web Auto command, but no HTTP route or web Auto button is added.

`BattleService.auto` follows this order:

1. Validate participant, observed revision, current turn and account eligibility.
2. Replay and simulate privately, yielding to the event loop every five actions,
   with a 300-action limit. No gameplay or currency writes occur during this step.
3. Atomically claim finalization only if the revision still matches, the battle
   is active, no other Auto owns the claim, and the inactivity/mode deadline has
   not passed. A manual action may win during calculation; then Auto is discarded
   without charge. Ordinary action writes also check for this claim atomically.
4. Conditionally decrement the current trainer's Dream Cards with `$inc`, checking
   the current unlock and sufficient balance. A known payment rejection releases
   the claim and discards the simulation; gameplay revision, actions and view are
   unchanged.
5. Under that same claim, append all generated actions/events with consecutive
   revisions and save the completed view in one battle-document update. Completed
   request metadata deduplicates retries, including after a restart.
6. Use the existing completion claim to record Auto quest usage and grant mode
   rewards once. Rendering the result does not repeat these effects.

The finalization claim covers only payment and the final write, not calculation.
Its acquisition is the deadline acceptance point: a claim accepted before expiry
can finish payment afterward. While claimed, Discord offers Refresh only and web
legal actions are empty. Claims do not expire automatically: a crash, ambiguous
payment error, or failed final write after payment requires manual reconciliation.
The saved `autoCommit` identifies the user, cost, request, original revision and
claim time, with an error when available. Inspect payment before deciding whether
to refund or complete/release an interrupted claim; blindly releasing and retrying
could charge twice. A known rejection leaves no claim. After successful commit,
`autoResult` retains the accepted request metadata and completion owns recovery.

The flag-off legacy in-memory Auto path retains its existing upfront payment and
in-memory execution. It now also yields and sends one final update, and local
controls cannot mutate that battle while Auto is running. Durable guarantees
above require `DURABLE_BATTLES_ENABLED=true`.

## Remaining parity work

Original mode-specific result/replay controls are preserved when their
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
picker/page ownership, selected-battle rendering and pagination.
`handlers/__tests__/battleInteractionRewards.test.js` checks that successful
battle clicks retain configured rewards while error responses do not. The
existing-handler tests cover current, stale and legacy battle paths.

`battle/service/__tests__/AutoBattle.test.js` covers private simulation, concurrent
manual/Auto writes, conditional payment rejection, expiry, bounded execution,
multi-turn replay and interrupted payment/finalization claims across restarts.
`events/battle/__tests__/autoBattleDiscord.test.js` checks current eligibility,
acknowledgement before calculation/payment, and one final reply. Service tests
also check the conditional currency query and production completion wiring.
These are unit tests with collection doubles; real MongoDB/Discord validation
remains a deployment gate.
