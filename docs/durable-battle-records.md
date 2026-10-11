# Durable battle records

`BattleStore` writes one MongoDB document per battle in `battles`. The document ID is the engine's RNG seed and stable battle ID. `captureBattleSetup` stores the generated starting parties before `battle.start()`, along with the constructor parameters and team/user metadata. Recovery creates a fresh engine and replays the accepted action list. It compares the resulting snapshot with the stored view and fails loudly if they differ.

An accepted submission appends `{ revision, requestId, actorUserId, action, events, log, view }` and advances the document revision through a single conditional `updateOne` on the prior revision. Two submissions based on the same revision cannot both commit. A retry with the same request ID and action returns the committed update; a reused request ID with different content is rejected. Stale, invalid, expired, or wrong-actor submissions return the current revision and view. The application service must still authenticate the caller and decide whether NPC actions are permitted.

The record also contains participant IDs for active-battle listing, mode context, status, timestamps, and a ruleset version. Recovery currently requires the same manually maintained `BATTLE_RULESET_VERSION`. Incompatible records are rejected; this code does not delete them. The store sets a 24-hour inactivity expiry, capped by an optional mode deadline, and refreshes it after accepted actions. Completed and expired results are readable for seven days by default; callers may set both durations when starting a battle. Expiration marks a battle closed without running completion effects.

Callbacks for phase transitions or completion are deliberately rejected during capture. The next slice needs durable mode handlers that can reattach phase behavior and apply completion effects once. Until that exists, this store should only be used for ordinary callback-free battles.

The Jest tests use an isolated in-memory collection to prove the compare-and-swap and replay behavior. MongoDB integration, indexes on a real collection, and recovery across a process restart remain deployment gates.
