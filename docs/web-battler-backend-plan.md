# Web battler backend implementation plan

Status: active plan. This run covers the engine, durable battle service, and Discord continuation. Discord OAuth, HTTP battle routes, and the web UI follow later.

## Current review stack

1. [#116](https://github.com/ewei068/pokestar/pull/116): safe action outcomes and replay seed.
2. [#117](https://github.com/ewei068/pokestar/pull/117): ordered combat events.
3. [#118](https://github.com/ewei068/pokestar/pull/118): stored setup, replay, revision checks, and duplicate requests.
4. [#119](https://github.com/ewei068/pokestar/pull/119): participant-authorized service and NPC progression.
5. [#120](https://github.com/ewei068/pokestar/pull/120): inactivity expiry, mode deadlines, and result retention.
6. [#121](https://github.com/ewei068/pokestar/pull/121): alpha Discord continuation for durable records.
7. [#122](https://github.com/ewei068/pokestar/pull/122): completion rewards extracted from Discord rendering with a strict failure mode.
8. [#123](https://github.com/ewei068/pokestar/pull/123): preserve MongoDB index options when creating the battle TTL index.
9. [#126](https://github.com/ewei068/pokestar/pull/126): pre-generate dungeon phase parties for deterministic replay.
10. [#127](https://github.com/ewei068/pokestar/pull/127): claim completion once, record strict reward failures, and retain records needing review.
11. [#128](https://github.com/ewei068/pokestar/pull/128): opt-in PvE/PvP durable starts and Discord actions behind a flag.
12. [#129](https://github.com/ewei068/pokestar/pull/129): opt-in dungeon starts with generated phase queues.
13. [#130](https://github.com/ewei068/pokestar/pull/130): opt-in tower starts and completion progression from a stored stage.
14. [#131](https://github.com/ewei068/pokestar/pull/131): separately flagged durable raid starts and completion from stored context.

Live battle creation still uses the in-memory path unless `DURABLE_BATTLES_ENABLED=true`. With this flag, PvE, PvP, dungeon, and tower starts and Discord actions use stored battle IDs; their completion effects use the strict handler and claim. Dungeon phase parties are generated before the first turn. Tower progression uses a stored stage. Raid starts require the separate `DURABLE_RAIDS_ENABLED=true` flag as well. Raid completion reconstructs its callback from the raid instance ID, participant, and starting boss HP; its battle deadline follows the raid deadline. Both flags should remain off in production until reward reconciliation, concurrent raid writes, and Discord feature parity are accepted.

## Remaining cutover steps

Each branch builds on the preceding branch. Open a reviewable PR after its unit tests pass, then continue without waiting for review. The bottom PR targets `main`; each higher PR targets the branch below it.

1. Make completion effects individually idempotent for trainer, Pokémon, and quest writes. The battle record now coordinates a single handler claim, but interrupted or failed claims require manual reconciliation. Verify behavior when an action is retried after completion or a process restart. Confirm production MongoDB topology before considering transactions; the local 6.0.18 server is standalone.
2. Validate opt-in `/pve` and `/pvp` starts and Discord actions against a real MongoDB process. `/continue-battle` uses the same battle ID after restart; stale legacy battle buttons can remain stale while a participant reopens the durable record. Discord Auto now uses a shared revision-checked command with conditional payment and one final result; include payment/finalization failure reconciliation in the cutover checks.
3. Make raid instance updates safe when multiple battles complete at once. The stored raid mode now contains enough data to reconstruct its callback after a restart, and strict reward failures leave the battle claim for manual review. A concurrent raid completion can still overwrite another participant's raid document update.
4. Run MongoDB integration and restart tests before production cutover. `/continue-battle` is registered in every stage; the start cutover remains behind `DURABLE_BATTLES_ENABLED`.

## Validation

- Use Jest unit tests and the existing full Jest suite for this run. Do not build or exercise the web UI yet.
- Each PR must exercise behavior at its boundary: invalid actions do not mutate state; replay matches after restart; one of two concurrent actions wins; duplicate completion does not duplicate rewards; both Discord and resumed actions use the same battle ID.
- A unit test recreates `BattleService` and `BattleStore` over the same stored collection, then lists, reads, and submits another action on the original battle ID. It validates process-independent service state but is not a real MongoDB restart test.
- MongoDB integration and browser tests remain later gates before production deployment. Unit tests alone cannot establish real database atomicity, OAuth behavior, CORS, or browser animation.

## Working conventions

- Keep the existing JavaScript engine and use JSDoc/types where contracts help. A TypeScript migration is separate from this backend work.
- Keep Discord objects out of durable battle records and the shared action service.
- Keep battle views and combat outcomes serializable so a later HTTP API can expose them without changing combat logic.
- Do not deploy or clear production battles as part of this stack.
