# Web player operations: first-slice discovery

2026-10-30. Bounded source inspection for #235, #216, #197, #199, #210 and #236.
This records existing behavior and the proposed implementation boundary. No live
MongoDB, provider, concurrency or recovery acceptance was performed.

## Existing behavior and required changes

| Boundary | Observed source behavior | First-slice direction |
| --- | --- | --- |
| Identity / initialization | `src/web/battleApi.js` receives a trusted OAuth profile but stores only the ID in its session. `src/services/trainer.js` reads then inserts a missing trainer; duplicate-key races can fail rather than re-read the winner. Refresh with an id-only profile can overwrite stored profile fields with undefined. | Initialize the acting user from trusted OAuth data, or the trusted session ID when an older valid session has no trainer. Missing optional profile fields use a neutral display fallback and never erase stored fields; refresh them on a later trusted OAuth login. Recover the unique-key creation race by returning the winner. Preserve defaults and existing progress; never create a target account from an inspection request. Keep identity lookup separate from optional profile refresh. |
| Resource refresh | `getTrainerFromId` and `getTrainer` can refresh interval fields through whole-trainer writes. | Classify these as lifecycle refresh, not a gameplay interaction. Narrow refresh writes so a stale read cannot overwrite a simultaneous party or progression update. |
| Owned collection | `src/services/pokemon.js` has paginated listing and owner/id detail lookup. Listing spreads caller filters after userId; detail may update deprecated stats. | Accept only explicit public filters/sorts, enforce owner in the server query, and project a bounded DTO. Account for legacy refresh writes; do not call these helpers pure reads. |
| Party / presets | `src/services/party.js` validates slots, ownership, duplicates and six-Pokémon limit. Default geometry is 3×4. Battle validation requires at least one eligible Pokémon. `src/commands/battle/partyLoad.js` swaps the active and saved parties, then writes a whole trainer snapshot. | Shared save/swap operations used by both surfaces, supported geometry fixed by server configuration, conditional writes and replay-safe swap. Preserve slot order and swap semantics. Avoid broad trainer writes. |
| NPC start | `src/services/battle.js` constructs NPC battles inside `buildPveSend`. `BattleService.start` persists a generated battle ID; turn request deduplication does not cover creating that ID. | Extract construction/validation from Discord rendering. Bind a durable start intent to actor and normalized input; replay recovers the same battle. Confirm availability and current owned party on the server. |
| Battle continuation | `BattleWebService.get` authorizes and projects a coherent participant view. Reads may advance NPC turns and settle completion. | Reuse this behavior. Lifecycle work is distinct from an interaction grant; viewing a result must not independently grant battle rewards. |
| Receipt | Completion stores summary/status. Rewards touch trainer, Pokémon, quests and mode documents; the browser lacks an itemized participant receipt. | Persist receipt data from actual effect outcomes and expose only the participant's data. Keep applied, pending, failed and uncertain separate. Never parse Discord prose into authoritative amounts. #186 still owns completion recovery. |

## Interaction grants: selected boundary

The maintainer selected a constant reward and delegated the boundary to the
simplest server-side implementation. Use **5 EXP / 10 money per successful,
authenticated user-triggered gameplay API request**, matching the existing Deact
callback amounts in `src/handlers/eventHandler.js`. This includes explicit reads
such as collection search or pagination; no per-operation amount table is needed.
Local navigation, authentication/bootstrap, automatic polling, lifecycle refresh
and React rerenders do not create grants. One user request retains one interaction
ID across transport retries; internal server calls do not each earn a grant.

Keep this policy in one HTTP boundary. The server owns amounts and validates the
actor and successful outcome. Introduce durable grant identity/recovery before
rewarded reads in U3; deduplicate the grant and resource increment atomically.
For writes, coordinate the grant with the recorded successful operation outcome
so an interruption cannot silently lose or duplicate it. Preserve battle rewards
and configured bonuses independently; avoid double grants from Discord's handler
when extracting shared operations. Authentication and automatic requests cannot
become an award path merely because they return HTTP 200.

## Proposed operation contract

These are engineering directions to verify in the owning implementation PRs,
not descriptions of an existing generic operation framework.

- Derive the actor from the authenticated session or trusted Discord invocation.
  Validate ownership, eligibility, supported inputs and resource constraints at
  the operation boundary. Do not trust browser trainer IDs, prices or grants.
- For state-changing operations, bind request identity to actor, operation and
  normalized payload. Store enough outcome identity to recover after response
  loss and page reload. Reusing an ID with different input is a conflict.
- Party save/preset swap must check the current party version and update only
  the affected fields. Every Discord writer participating in this boundary must
  honor the same version. A web-only version check is insufficient.
- NPC start must recover a persisted start before constructing another battle.
  Store/recover the battle ID even if automatic opening turns complete it before
  the first response. Revalidate current party ownership and freeze its build
  snapshot at start, preserving the shared battle contract.
- Return current resource/party state and a durable result identity when relevant.
  Do not infer authoritative deltas by comparing two browser snapshots; unrelated
  actions may occur between them.
- Distinguish rejected input, unavailable/forbidden ownership, stale state,
  cooldown, confirmed success, confirmed failure and unknown outcome. An unknown
  write disables blind repetition and offers a result lookup using the original
  identity. Present cooldown availability from server time/state.
- Implement only the persistence needed for these operations. Reuse existing
  battle action identity/revision machinery for turns; do not pretend it already
  provides start, party or economy idempotency.

## Evidence required before calling the slice proved

1. Concurrent OAuth/Discord first use yields one trainer and one starter grant;
   existing trainer profile/progress survives id-only operations. An older valid
   session with no trainer initializes from its trusted ID without re-login.
2. Owned listing/detail reject cross-owner IDs and hostile filters. Loading,
   empty and error projections contain no other trainer's data.
3. Simultaneous party edits produce one accepted version and one conflict;
   replaying a preset swap cannot swap back or overwrite unrelated resources.
4. A start accepted before response loss is recoverable after reload/restart;
   the same request returns the same battle, while altered input is rejected.
5. Continue the same battle on both surfaces. Party edits made after start do
   not change its frozen combat builds.
6. Each successful interaction grants the agreed constant once. Failure,
   transport replay and background refresh do not duplicate it. Verify the
   interaction ledger and gameplay effect cannot silently diverge on interruption.
7. Completion receipt shows only recorded participant effects. Reload/poll does
   not award battle rewards again; partial failure remains honest and recoverable
   through the completion policy rather than optimistic UI arithmetic.

Extend existing `battleApi`, `durablePveStart`, `BattleStore`, `BattleService`,
`BattleWebService` and completion tests; add trainer/party operation suites.
Mocked tests establish behavior in isolation. Real MongoDB races, restart and
cross-surface flows need separate evidence before #235/#236 acceptance.

## Follow-on boundaries

#217 owns tutorial completion IDs and the 25-stage Darkrai gate. Initialization
has no tutorial prerequisite. Existing entitlement/bonus rules follow their
consuming operations. New-player acquisition and reward-claim screens remain
required release work, even when the first proving journey uses an existing
trainer. Navigation alone does not establish their delivery.
