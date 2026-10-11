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

Live battle creation and reward processing still use the in-memory path. The next cutover gate is to make trainer, Pokémon, quest, and battle completion writes individually idempotent, then route callback-free starts and Discord actions through the service. Dungeon phase parties can now be prepared for replay, but their live mode completion handling and tower/raid handlers still need durable implementations before those modes can be cut over.

## Remaining cutover steps

Each branch builds on the preceding branch. Open a reviewable PR after its unit tests pass, then continue without waiting for review. The bottom PR targets `main`; each higher PR targets the branch below it.

1. Make completion effects durable with a processed marker and individually idempotent trainer, Pokémon, and quest writes. Verify behavior when an action is retried after completion or a process restart. Confirm production MongoDB topology before considering transactions; the local 6.0.18 server is standalone.
2. Route callback-free `/pve` and `/pvp` starts and Discord actions through the shared service. Keep old messages refreshable; prove that `/continue-battle` resumes the same battle ID after restart.
3. Replace dungeon phase callbacks and tower/raid completion callbacks with durable mode data and handlers. Add focused unit tests for each mode, then enable them for continuation.
4. Run MongoDB integration and restart tests before production cutover. Enable `/continue-battle` beyond alpha only after reward and mode gates pass.

## Validation

- Use Jest unit tests and the existing full Jest suite for this run. Do not build or exercise the web UI yet.
- Each PR must exercise behavior at its boundary: invalid actions do not mutate state; replay matches after restart; one of two concurrent actions wins; duplicate completion does not duplicate rewards; both Discord and resumed actions use the same battle ID.
- MongoDB integration and browser tests remain later gates before production deployment. Unit tests alone cannot establish real database atomicity, OAuth behavior, CORS, or browser animation.

## Working conventions

- Keep the existing JavaScript engine and use JSDoc/types where contracts help. A TypeScript migration is separate from this backend work.
- Keep Discord objects out of durable battle records and the shared action service.
- Keep battle views and combat outcomes serializable so a later HTTP API can expose them without changing combat logic.
- Do not deploy or clear production battles as part of this stack.
