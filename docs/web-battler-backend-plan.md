# Web battler backend implementation plan

Status: active plan. This run covers the engine, durable battle service, and Discord continuation. Discord OAuth, HTTP battle routes, and the web UI follow later.

## Review stack

Each branch builds on the preceding branch. Open a reviewable PR after its unit tests pass, then continue without waiting for review. The bottom PR targets `main`; each higher PR targets the branch below it.

1. **Safe battle actions and reproducible setup.** Preserve the generated battle ID as the replay seed. Reject invalid actions without consuming a turn. Make the engine return an action outcome. Cover normal-ID replay and invalid moves with Jest.
2. **Ordered combat outcomes.** Record plain-data events at actual engine mutations, including targets, misses, HP, effects, and turn transitions. Keep this recorder separate from mutable rule events. Unit test multi-target and chained outcomes.
3. **Durable battle records.** Save initial setup, mode context, version, revisions, actions, and outcomes in MongoDB. Recover under the same ruleset; reject stale and duplicate submissions. Unit test recovery and concurrency semantics with isolated fakes.
4. **Shared battle application service.** Route mode creation, player and NPC actions, completion, and rewards through one service. Make completion effects idempotent. Unit test each mode's distinct lifecycle.
5. **Discord continuation and cutover.** Add `/continue-battle` selection and fresh rendering. Change Discord actions to use the shared service and return the current view on stale input. Unit test handlers and run the full Jest suite.

## Validation

- Use Jest unit tests and the existing full Jest suite for this run. Do not build or exercise the web UI yet.
- Each PR must exercise behavior at its boundary: invalid actions do not mutate state; replay matches after restart; one of two concurrent actions wins; duplicate completion does not duplicate rewards; both Discord and resumed actions use the same battle ID.
- MongoDB integration and browser tests remain later gates before production deployment. Unit tests alone cannot establish real database atomicity, OAuth behavior, CORS, or browser animation.

## Working conventions

- Keep the existing JavaScript engine and use JSDoc/types where contracts help. A TypeScript migration is separate from this backend work.
- Keep Discord objects out of durable battle records and the shared action service.
- Keep battle views and combat outcomes serializable so a later HTTP API can expose them without changing combat logic.
- Do not deploy or clear production battles as part of this stack.
