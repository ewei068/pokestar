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

Live battle creation still uses the in-memory path unless `DURABLE_BATTLES_ENABLED=true`. With this flag, PvE, PvP, dungeon, and tower starts and Discord actions use stored battle IDs; their completion effects use the strict handler and claim. Dungeon phase parties are generated and stored before the first turn. Tower progression is derived from a stored stage descriptor on completion. Raid still needs a durable completion handler. The flag should remain off in production until reward reconciliation and Discord feature parity are accepted.

## Remaining cutover steps

Each branch builds on the preceding branch. Open a reviewable PR after its unit tests pass, then continue without waiting for review. The bottom PR targets `main`; each higher PR targets the branch below it.

1. Make completion effects individually idempotent for trainer, Pokémon, and quest writes. The battle record now coordinates a single handler claim, but interrupted or failed claims require manual reconciliation. Verify behavior when an action is retried after completion or a process restart. Confirm production MongoDB topology before considering transactions; the local 6.0.18 server is standalone.
2. Validate opt-in `/pve` and `/pvp` starts and Discord actions against a real MongoDB process. `/continue-battle` uses the same battle ID after restart; stale legacy battle buttons can remain stale while a participant reopens the durable record. The old Discord auto-battle control is not yet in the durable renderer.
3. Replace the raid completion callback with durable mode data and a handler. Dungeon phases use generated phase queues, and tower progression uses a stored stage descriptor. Add focused raid tests before enabling continuation.
4. Run MongoDB integration and restart tests before production cutover. `/continue-battle` is registered in every stage; the start cutover remains behind `DURABLE_BATTLES_ENABLED`.

## Validation

- Use Jest unit tests and the existing full Jest suite for this run. Do not build or exercise the web UI yet.
- Each PR must exercise behavior at its boundary: invalid actions do not mutate state; replay matches after restart; one of two concurrent actions wins; duplicate completion does not duplicate rewards; both Discord and resumed actions use the same battle ID.
- MongoDB integration and browser tests remain later gates before production deployment. Unit tests alone cannot establish real database atomicity, OAuth behavior, CORS, or browser animation.

## Working conventions

- Keep the existing JavaScript engine and use JSDoc/types where contracts help. A TypeScript migration is separate from this backend work.
- Keep Discord objects out of durable battle records and the shared action service.
- Keep battle views and combat outcomes serializable so a later HTTP API can expose them without changing combat logic.
- Do not deploy or clear production battles as part of this stack.
