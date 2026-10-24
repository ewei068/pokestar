# Shared battle service

`BattleService` is the surface-neutral entry point for battle lists, current views, update history, and player actions. It checks participant IDs before returning a battle or accepting an action. Discord components and the HTTP battle API both call it with the authenticated Discord user ID. Clients send their observed revision and a request ID; stale or invalid actions receive the current view.

The service resolves NPC turns after a player action and records each as a separate revision with its own ordered combat events. It also advances an NPC that starts a battle. `chooseNpcAction` separates the existing NPC choice logic from execution so the service can persist the chosen action. The returned update list includes player and NPC actions in order; a web client can show an NPC turn indicator before animating the NPC update.

Forced participant turns also advance automatically when the engine's
`canMove()` is false, including cooldown, disable/incapacitation and missing
eligible targets. A usable move always stops automatic participant progression.
Each skip uses the ordinary revision-checked action store, so its status ticks,
events and replay remain authoritative across Discord and web. Authorized reads
resume interrupted automatic progression.

The store derives `needsAutomaticTurn` from the engine and writes it atomically
with creation/action revisions. It is internal record metadata, outside the
replayed snapshot and browser projection; no ruleset change is needed. A matching
browser cursor does not suppress pending progression. Settled records avoid
replay on unchanged polls. Older records without the field are checked once and
cache the settled result only against the same revision, without changing their
public cursor. Auto finalization clears the marker on its completed record.

Feature flags route supported live Discord battle starts into the service, and `/continue-battle` opens their current state. The existing Discord battle handlers hydrate gameplay state from Mongo for each interaction and submit actions through the service. Their local cache holds UI context only. See [Discord battle continuation](discord-battle-continuation.md) for controls, compatibility and remaining parity work.

`BattleService.auto` simulates the remaining turns privately, then acquires a revision-checked finalization claim before conditionally charging Dream Cards and committing its full action/event batch. A stale simulation or known payment rejection changes no gameplay state and incurs no charge. Only the short payment/final-write phase excludes other writers. Successful Auto uses the normal completion claim; interrupted or ambiguous payment/final-write failures retain the Auto claim for manual review. `getAutoAvailability` derives current account eligibility separately from replayable gameplay. Discord exposes this command; a web command is deferred.

Durable completion owns reward processing; rendering a result must not run the legacy completion path. Reward writes across trainer, Pokémon and raid documents are not atomic on a standalone Mongo server. Completion failures need manual review rather than blindly retrying partial rewards. The service's public read methods omit the stored starting party and replay internals. Finished and expired results stop being readable after their retention window.
