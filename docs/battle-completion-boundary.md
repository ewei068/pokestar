# Battle completion boundary

`processBattleCompletionRewards` now owns the existing trainer, Pokémon, quest, and mode callback effects that previously ran inside Discord's `getStartTurnSend`. The Discord renderer still invokes it for legacy in-memory battles, preserving current behavior.

The function also has a strict mode for durable completion. Strict mode propagates database failures, runs participant updates sequentially, and rejects callback-backed battles until their effects have durable mode handlers. This makes it possible to put the reward writes and a processed marker in one transaction or an equivalent idempotent workflow. The new durable battle service does **not** invoke it yet, so live starts and reward-bearing battle actions should stay on the existing path until that workflow is complete.
