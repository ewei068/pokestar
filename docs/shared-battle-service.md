# Shared battle service

`BattleService` is the surface-neutral entry point for battle lists, current views, update history, and player actions. It checks participant IDs before returning a battle or accepting an action. Discord components and a future HTTP API can both call it with the authenticated Discord user ID. Clients send their observed revision and a request ID; stale or invalid actions receive the current view.

The service resolves NPC turns after a player action and records each as a separate revision with its own ordered combat events. It also advances an NPC that starts a battle. `chooseNpcAction` separates the existing NPC choice logic from execution so the service can persist the chosen action. The returned update list includes player and NPC actions in order; a web client can show an NPC turn indicator before animating the NPC update.

This branch does not route live Discord battles into the service. Completion rewards, callback-backed modes, and Discord continuation still need durable implementations before cutover. The service's public read methods omit the stored starting party and replay internals. Finished and expired results stop being readable after their retention window.
