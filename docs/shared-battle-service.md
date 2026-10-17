# Shared battle service

`BattleService` is the surface-neutral entry point for battle lists, current views, update history, and player actions. It checks participant IDs before returning a battle or accepting an action. Discord components and the HTTP battle API both call it with the authenticated Discord user ID. Clients send their observed revision and a request ID; stale or invalid actions receive the current view.

The service resolves NPC turns after a player action and records each as a separate revision with its own ordered combat events. It also advances an NPC that starts a battle. `chooseNpcAction` separates the existing NPC choice logic from execution so the service can persist the chosen action. The returned update list includes player and NPC actions in order; a web client can show an NPC turn indicator before animating the NPC update.

Feature flags route supported live Discord battle starts into the service, and `/continue-battle` opens their current state. The existing Discord battle handlers hydrate gameplay state from Mongo for each interaction and submit actions through the service. Their local cache holds UI context only. See [Discord battle continuation](discord-battle-continuation.md) for controls, compatibility and remaining parity work.

Durable completion owns reward processing; rendering a result must not run the legacy completion path. Reward writes across trainer, Pokémon and raid documents are not atomic on a standalone Mongo server. Completion failures need manual review rather than blindly retrying partial rewards. The service's public read methods omit the stored starting party and replay internals. Finished and expired results stop being readable after their retention window.
