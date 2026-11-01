# Shared player operations and client data

**Approved direction · 2026-10-31 · implementation pending.**

The [collection study](README.md) is approved. This proposal supplies the two
prerequisites for implementing it: one backend path called by Discord and HTTP,
and one client owner for current player data. It supplements the
[first-slice plan](../../plans/2026-10-30-1740-feat-web-first-playable-slice-plan.md);
it does not approve a database migration or establish runtime acceptance.

## Revised direction after maintainer feedback

**Maintainer-approved amendment; no second independent review.** This section supersedes
conflicting requirements in the original proposal below. That earlier design is
retained as review context, not an implementation-ready specification. In
particular, replica-set migration, universal revision counters and the broad
writer migration gate are no longer recommended prerequisites.

- **Geometry:** carry rows, columns and indexed slots in the party projection;
  keep member capacity separate from slot count. The current configuration is
  3×4 with six members. Components and target computation derive their dimensions
  from the projection. Arbitrary shaped boards are deferred until needed.
- **Transport:** GET remains appropriate for pure reads, including battle
  snapshots. HTTP has no GET-specific response-size ceiling; URL/request limits
  are a different concern. Bound collection pages and measure payloads. Existing
  battle routes already enable compression. POST remains appropriate for commands
  and reads that intentionally award an interaction grant.
- **Guarded writes:** prefer single-document conditional updates on current
  server state, with narrow patches and a bounded reread/recompute loop on a
  failed condition. Existing trainer lifecycle correction uses this pattern.
  Keep the helper limited to pure computation plus one guarded write; do not
  automatically retry callbacks containing grants, messages or other effects.
  Server-observed field values can guard a write without requiring every client
  request to carry a document revision. Preserve expected occupants for commands
  whose meaning changes if a target changed. Keep existing battle revisions.
- **Scope:** unify Discord and HTTP party operations and protect their touched
  writes. Audit direct conflicting writers to establish the remaining risk, but
  do not make a general trade/economy migration a collection prerequisite.
  Legacy whole-snapshot writes and cross-document ownership races remain possible
  until addressed; a guarded party write alone does not eliminate them. Ownership,
  authorization and capacity validation remain required on every operation.
- **Freshness:** use TanStack Query, refresh affected queries after mutations,
  and refetch active queries on focus/reconnect plus visible-tab polling (start
  at 15 seconds). Poll actual bounded queries initially; this avoids depending on
  every legacy writer maintaining global version counters. Retain cancellation,
  account isolation and protection from obsolete in-flight results. Universal
  client revision vectors are deferred.
- **Push later:** if polling delay or load becomes material, add authenticated
  post-commit invalidation hints and refetch through the same query layer. SSE
  suits one-way hints; WebSocket is reasonable if bidirectional needs emerge.
  Reconnect refresh and fallback polling cover missed hints and legacy writers
  that do not publish. Push does not replace write guards or battle revisions.

### Approved reliability scope

The maintainer explicitly accepts occasional duplicate participation EXP/money
and the existing rare concurrency/partial-write gaps. Durable exactly-once
interaction grants, operation receipts, replica-set migration and a general
transaction/concurrency framework are not prerequisites for collection or party.
This supersedes the earlier first-slice grant/replay requirements for these new
operations; existing battle safeguards and result handling remain unchanged.

Disable duplicate submission while an action is pending. Do not automatically
retry a mutation after an ambiguous network failure: refresh affected state and
explain that the operation may have completed. Reads may retry normally; granted
reads count as mutations for this retry policy. Use narrow conditional updates
where straightforward, while retaining authorization and business validation.
A process-local request-ID cache is deferred until a concrete operation warrants
it; it would not provide restart or multi-process guarantees.

### Approved implementation sequence

1. Shared owned collection/detail/party projections and party rule/service paths,
   used by Discord and HTTP. Scope persistence changes to participating operations;
   document bypass writers and residual risks rather than requiring global closure.
2. TanStack Query integration for current player data, with account isolation,
   refresh after mutations, focus/reconnect refresh and visible-query polling.
3. Approved collection and reusable inspector/party components, followed by party
   editing with pending-state controls and ambiguous-result refresh. Preserve
   configured geometry, mobile sheets and the study's presentation details.
4. Verify ownership/input validation, Discord compatibility, guarded writes,
   query/account races, ambiguous responses and responsive UI. Run the affected
   backend/client checks; report live acceptance separately from mocked tests.

The original delivery order and acceptance matrix below are historical where
they require universal revisions, transactional receipts, restart deduplication
or complete ownership-writer migration. Those are not release gates for this scope.

Evidence: [MongoDB atomic updates](https://www.mongodb.com/docs/v8.0/core/write-operations-atomicity/),
[transaction stale reads](https://www.mongodb.com/docs/manual/core/transactions-production-consideration/),
[HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html), and
[SSE](https://developer.mozilla.org/en-US/docs/Web/API/EventSource).
This is a documentation revision; no runtime behavior was changed or tested.

## Original proposal and review context (superseded where noted above)

1. Introduce a small shared PlayerService module. It owns owned-Pokémon reads,
   party commands, validation, durable operation results and the applicable
   interaction grant. Discord and HTTP adapters supply trusted actor/request
   context and format the result.
2. Use MongoDB transactions for operation receipts plus gameplay/resource
   changes. The runbook documents a **standalone** deployment. Replica-set
   capability is therefore a real infrastructure prerequisite, not an assumed
   feature of today's server.
3. Use **TanStack Query v5** as the client cache for trainer resources, collection
   queries, owned detail and party views. Feature hooks own query keys,
   reconciliation and commands. Local React state owns selection and sheets.
   The existing battle session continues to own combat snapshots and playback.
4. Save each completed party gesture immediately. Show a pending placement
   preview, serialize party commands and recover uncertain outcomes by their
   original operation ID. Do not introduce a separate Save/Discard draft flow.
5. Start with visible-tab version polling every 15 seconds in collection, plus
   focus/reconnect refresh. This gives eventual Discord-to-web freshness; every
   write still checks the current server revision.

Items 2 and 3 are new technical recommendations. Item 4 makes the accepted drag/
tap study's persistence behavior explicit. Exact polling/cache durations are
initial tuning values, not game rules.

## Source evidence and implications

| Observed code or contract | Consequence for this design |
| --- | --- |
| src/services/party.js: updateParty writes by userId only; canAddOrMovePokemonToParty already implements placement/swap rules | Reuse the rules; add a revision-checked commit used by every party writer. |
| src/commands/battle/partyLoad.js swaps active/saved formations then calls updateTrainer | Preserve swap semantics and record the outcome atomically; replay must not swap back. |
| src/services/trainer.js: updateTrainer sets a whole supplied snapshot; addExpAndMoneyTrainer increments money/EXP but derives level from a prior read | Narrow participating writers; calculate level from the same committed resource state. A web-only revision is insufficient. |
| src/services/pokemon.js: listPokemons spreads caller filters after userId; getPokemonFromUserId may refresh stats with a whole-record write | Compile an allowlisted query and enforce actor ownership. Replace read-side whole-record refresh with a defined derived-data policy. |
| src/config/databaseConfig.js: listPokemon adds Pokédex order; persisted combatPower/ivTotal drive existing queries | Backfill and maintain derived fields before relying on CP/IV sorting. A correct detail calculator alone cannot fix list order. |
| src/services/pokemon.js: canRelease checks active/saved parties; src/services/trade.js validates then performs separate ownership/trainer writes | Ownership changes must participate in the party/ownership concurrency protocol. Reading ownership inside a transaction alone does not prevent a concurrent release. |
| src/handlers/eventHandler.js and commandHandler.js grant after callbacks/commands | Migrated adapters must explicitly suppress their old post-handler grant. Preserve existing Discord grant policy for each invocation. |
| web/src/auth/useAuth.ts stores trainer in auth state; App.tsx passes that snapshot to header resources | Move current trainer data into the shared cache, retaining auth/session control and the existing initialization/error behavior. |
| web/src/http.ts already supports cancellation signals and typed transport errors; web/package.json has no server-data cache | Reuse transport, add the query cache at the application root, and keep error bodies bounded/typed. |
| runbook.md documents standalone MongoDB; database/mongoHandler.js exposes no session-aware transaction interface | Add transaction support and verify infrastructure before enabling transactional operations. |

These are source observations. The deployed server was not queried during this
design pass. Existing durable-battle and ordered-event ADRs remain in force.

## Backend modules and interface

~~~mermaid
flowchart LR
  D[Discord adapter] --> P[PlayerService]
  H[Authenticated HTTP adapter] --> P
  P --> R[Owned read and projection logic]
  P --> C[Party rules and command logic]
  P --> S[Session-aware persistence and operation receipts]
  S --> M[(MongoDB)]
  H --> Q[Player query cache]
  Q --> W[Collection / party / inspector]
  B[Battle session] --> V[Battle presentation]
~~~

The external seam is PlayerService's plain-data interface. Its implementation
hides query construction, current-state validation, transaction/replay handling
and display projection. It does not accept Express requests, Discord users,
embed builders or mutable trainer snapshots.

Directional interface (JavaScript implementation will use precise JSDoc):

~~~ts
readCollection(actor, query): Promise<CollectionPage>
readPokemon(actor, pokemonId): Promise<OwnedPokemonDetail>
readParty(actor): Promise<PartyView>
readVersions(actor): Promise<PlayerVersions>
executeInteraction(context, operation): Promise<OperationResult>
getOperation(actor, operationId): Promise<OperationStatus>
~~~

- actor is the authenticated account ID created by the adapter.
- context contains actor, stable operationId and a trusted invocation class.
  HTTP clients cannot supply a grant amount, another actor or a Discord class.
- operation is a closed discriminated union: collection.read, pokemon.read,
  party.read, party.place, party.remove, party.clear, party.autoFill,
  party.swapPreset. Existing Discord paths determine whether additional preset
  commands are required during the writer audit; no unused command framework.
- party.place takes pokemonId, targetSlot and expectedPartyRevision. Removal
  additionally names the expected occupant, so a changed slot cannot remove a
  different Pokémon. All slot indexes are zero-based in the interface.
- UI callbacks and retries preserve the original normalized operation. Choosing
  a new target after a conflict creates a new operation ID and revision.
- Public results use stable codes: INVALID_INPUT, NOT_OWNED_OR_MISSING,
  PARTY_CONFLICT, UNAVAILABLE, OPERATION_ID_REUSED, ACCOUNT_CHANGED and RATE_LIMITED. Foreign IDs
  and missing IDs have the same outward ownership error.

Both the ordinary read methods and rewarded read operations call the same
internal query/projection implementation, with an optional transaction session.
Discord list/detail rendering is adapted to these results in U3; it does not
continue an independent owned-read implementation.

HTTP generates an operation UUID once per submitted intent. Discord adapters use
the trusted interaction ID, or message ID plus command path, with a source
namespace. Bound and validate identifiers before storage. The trusted invocation
class includes the event/command identity needed to select its configured policy.
Receipt replay preserves the originally applied grant even if configuration
amounts later change.

Extract the pure party transform from the existing helper into a dependency-light
module. Both adapters use PlayerService, and both eligibility projection and
commit use that transform. The operation implementation accepts a narrow
persistence dependency so behavior tests cross the same interface as callers.
Do not add repositories that merely rename individual database methods.

### Reads, pagination and projections

CollectionQuery admits only search, rarity, type, shiny, party membership,
minimum IV percentage, sort, direction, offset and limit. Normalize strings,
escape literal search, reject unknown keys/operators and bound search length,
offset and limit. Start with limit 1–100; the measured viewport chooses it.
Always construct ownership from actor, outside caller-controlled filters.
Sort by the requested field plus stable ID as a tie-breaker.

Use offset pagination for this first screen. Return total, offset, limit,
hasMore, versions and bounded summaries; count and page come from one read
snapshot. Concurrent insertion/deletion can shift pages on refresh. Reset to a
valid page if a result shrinks; do not promise snapshot pagination across clicks.

OwnedPokemonSummary contains ID, identity/display fields, level, rarity, types,
sprite, shiny/lock cues, combat power and server-calculated IV percentage.
Detail adds six stats/IVs/EVs, nature modifiers, EXP progress, moves, ability,
held item, equipment and allowed provenance. No raw trainer or Mongo document
crosses the HTTP adapter. Party membership is derived from PartyView's IDs.

IV percentage is rounded sum(IVs)/186 × 100. Server sorting uses the integer
sum, and percentage filtering uses the same displayed-value policy. Detail and
list use the same saved, current derived stats. Before enabling CP/IV sorting,
backfill missing/outdated derived fields and ensure relevant build writers update
them with the source build. A ruleset change that changes calculations requires
a versioned backfill before that sort is served. Reads do not perform
whole-record writes; a bounded missing-data error is preferable to silently
mixing old list power and new detail power.

Display definitions come from shared server configuration. Bounded owned
projections may include resolved move/ability/item display fields; reuse the
existing catalog projection helpers where practical. Include catalogVersion.
This avoids loading the full battle catalog just to open collection. A separate
catalog endpoint/package is deferred until payload measurements justify it.

PartyView contains revision, configured rows/columns, an indexed array of
IDs/nulls and member summaries (currently 3×4, twelve slots). It also contains target outcomes for each existing member and for a
new member: move, swap, replace, add or disabled with a reason. There are at most
seven sets of twelve targets. The UI selects the appropriate set without
reimplementing capacity rules. Ownership is always rechecked at commit.
A full party permits replacement in an occupied slot; an empty slot is invalid
for a new member. Empty formations can be saved; battle-start eligibility remains
the existing separate rule.

### Transport and interaction grants

Use ungranted GET routes for reads and freshness:

| HTTP route | Shared operation |
| --- | --- |
| GET /api/player/collection | readCollection |
| GET /api/player/pokemon/:id | readPokemon |
| GET /api/player/party | readParty |
| GET /api/player/versions | readVersions |
| POST /api/player/interactions | executeInteraction |
| GET /api/player/operations/:id | getOperation |

All routes authenticate; POST retains existing origin/CSRF protections. GET
responses are private and must not enter a shared HTTP cache.

The accepted policy remains **5 EXP / 10 money for a successful explicit web
gameplay request**. Event handlers for search/page/detail requests call the
interaction route only when they actually need an explicit network request.
Initial bootstrap, resize-driven page-size adjustments, prefetch, polling,
focus/reconnect and invalidation use GET. A fresh cache hit or local tab change
creates no request and no grant. Opening a page by initial route load is bootstrap.
Debounce search into one submitted request after the user pauses; later transport
retries reuse that request's ID. Rate limits apply to explicit read interactions.

The shared runner selects the grant from trusted invocation policy. Migrated
Deact callbacks retain 5/10; legacy events retain their eventConfig amounts
(for example, POKEMON_LIST_SELECT is currently 10 EXP / 25 money); slash/message
commands retain their commandConfig amounts, including zero. An adapter result
marks that the interaction grant was handled, and the two legacy handlers skip their grant branch for that result.
No branch infers success/grant handling from an absent return value. Rendering
or sending Discord output occurs after commit; a failed send does not run the
operation again under a new ID.

## Durable commit, ownership and legacy writers

**Recommended persistence choice:** transactional operation receipts in a new
playerOperations collection, unique on (actorId, operationId). Bind each ID to
the normalized operation, expected revision and trusted invocation class.
Keep compact receipts without a TTL initially: removing the only deduplication
record would allow an old request to execute again. Storage/abuse limits and
retention must be measured; future archival must retain a non-executable
tombstone or an enforced identity-expiry protocol.

Use primary reads, snapshot read concern and majority write concern for the
operation transaction. Read-only projections use a snapshot that includes both
data and its counters. Deployment verification must prove those durability
settings and recovery behavior on the actual supported MongoDB topology.

Within one transaction:

1. Resolve an existing receipt first; reject an input/class mismatch.
2. For an ownership-sensitive command, write a guard on the actor trainer before
   reading ownership. Release/transfer paths write the same guard before their
   party/ownership checks. Transfers guard both trainers in deterministic ID
   order. These shared writes force conflicting transactions to retry and
   revalidate, preventing add-vs-release write skew.
3. Read and validate current actor-owned inputs and expected party revision.
4. Apply the narrowly scoped change and grant, calculate level from current EXP,
   advance the appropriate revisions and insert the terminal receipt.
5. Commit before reporting success or sending external messages.

A receipt contains operation fingerprint, status, affected IDs, resulting
revisions and the actual interaction grant. It need not retain a full collection
page or historical Pokémon builds. Replaying a successful read recovers the
same grant receipt and may return a fresh authorized projection separately;
that projection is explicitly current, not the original historical read result.
A replayed mutation never recomputes the command. Current projections returned
with recovery still enforce ownership.

Persist valid domain rejections as terminal results with no grant; reject malformed
or unauthenticated requests before receipt allocation. Record expected-revision
conflicts as rejected without silently retrying the user's placement against
the new party. Transient database failures abort the transaction and remain
retryable with the same identity. Driver transaction retries repeat only database
work. Unknown commit results use receipt lookup/original-ID resubmission; an
absent receipt while another request is in flight is not proof of rejection.

The unique receipt index arbitrates concurrent copies. If a duplicate-key
transaction loses, read the winning receipt and compare its fingerprint. Resource
and party revisions returned in a receipt can be older than the live state;
clients must never install them over a newer projection.

MongoDB supports atomic single-document changes, but the proposed receipt,
trainer and ownership changes span documents. Standalone deployments do not
support these transactions. See the official [atomicity documentation](https://www.mongodb.com/docs/v8.0/core/write-operations-atomicity/)
and [transaction requirements](https://www.mongodb.com/docs/manual/core/transactions-production-consideration/).
A production migration plan needs topology, backups, restart/rollback procedure
and transaction-capability checks. This proposal requests that direction; it
does not authorize performing the migration.

An alternative is a single-trainer atomic grant/party receipt with a durable
outbox and archival protocol. That can avoid transactions for trainer-only
effects, but still leaves ownership transfers and their recovery to coordinate.
I recommend the transactional design for this growing two-surface system.
An in-memory mutex or a separate “check receipt, update trainer, insert receipt”
sequence does not satisfy crash/replay requirements.

### Required migration closure

Transactions do not make stale whole-document writes safe. Before enabling the
affected feature, audit direct database writes as well as service callers:

| Writers | Required change / gate |
| --- | --- |
| updateTrainer callers, resource helpers, lifecycle refresh and relevant battle reward application | Preserve narrow update intent; atomically maintain trainer revisions for projected profile/resources and level/EXP consistency. Eliminate stale snapshot writes to protected fields before U3 rewarded reads. |
| updateParty, legacy buildPartyAddSend, PartyManage, partyAdd/Remove/Auto/Load | Migrate shared Discord commands and party revision participation before U3 cached party/membership views. U4 subsequently exposes browser editing. Preset operations share the party revision. |
| Release, trade and every ownership-changing path | Join trainer guards and transactions, recheck active/saved party membership and bump affected owners' collection revisions before the shared party commands or U3 version-based collection freshness are enabled. |
| Pokémon build/identity writers, acquisition, release and transfer | Maintain derived fields and collection revisions; replace whole-record refresh writes before U3 freshness/CP sorting is enabled. |
| commandHandler/eventHandler | Suppress only the grants already committed by migrated operations; preserve other behavior and amounts. |

A migration gate also applies to every deployed bot process: a rolling overlap
with old writers would bypass the new protocol. Ship compatible narrow writers
and counters first, stop/drain old processes, then enable the new consumers.

The implementation inventory must list every reachable writer and its conversion
or prove it cannot touch these fields. A central helper accepting an explicit
patch/current revision is preferable to silently stripping fields from old
updateTrainer calls: stripping would discard legitimate changes. Never retry a
stale replacement snapshot without recomputing its intended operation.

Introduce partyRevision, collectionRevision and trainerRevision on the trainer.
Missing fields migrate to zero with conditional initialization. Increment relevant
counters in the same transaction as their data; do not reconstruct versions from
timestamps. The ownership guard is an internal counter independent of these
public invalidation counters. An ownership transfer advances both owners'
collection revisions. A preset edit advances partyRevision. The trainerRevision
covers every projected trainer field, including display name/avatar and resources; internal timestamps
alone do not advance it. All counter participants must be migrated before a
consumer relies on that counter, including read-only U3 party views.

This prerequisite work may be larger than the screen implementation. Split it
into reviewable foundation changes; do not call U3/U4 ready while a bypass writer
can invalidate the promised guarantees. Existing battle effect application IDs
and completion recovery remain authoritative; threading revised resource writes
through them must not issue battle rewards again.

## Client ownership and freshness

Adopt one QueryClient for each authenticated account lifetime. TanStack Query
provides caching, targeted invalidation and cancellation; its defaults require
explicit tuning for this workflow. See [defaults](https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults),
[invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)
and [cancellation](https://tanstack.com/query/latest/docs/framework/react/guides/query-cancellation).
The policies below are proposed Pokestar behavior, not library guarantees.

| State | Owner |
| --- | --- |
| Session identity and sign-in/out/recovery | Existing auth module |
| Current trainer profile/resources | Player query cache; seeded once from /me |
| Collection pages and owned detail | Player query cache, keyed by normalized query or Pokémon ID |
| Party formation and target outcomes | One party query shared by all mounts |
| Selected ID, inspect tab, open phone panel, placement candidate, filter popover | Workspace/local React state |
| Label preference | Browser-local preference; does not invalidate server data |
| Battle authoritative view and ordered playback | Existing battle session |
| In-flight interaction identity and recovery state | Player interaction controller, shared across mounted views |

Representative keys:

~~~ts
['player', actorId, 'trainer']
['player', actorId, 'collection', normalizedQuery]
['player', actorId, 'pokemon', pokemonId]
['player', actorId, 'party']
['player', actorId, 'versions']
~~~

Use query result caching with targeted invalidation, not a second copied model
in Zustand/Context/component state. Summary and detail are distinct projections;
a summary never replaces a detail object. A new collectionRevision invalidates
both. Membership markers and Add availability derive from the party query rather
than a separately cached inParty flag. Party member summaries depend on both
collectionRevision and partyRevision.

The auth module's ready state should contain session identity, not a second
long-lived trainer copy. The header and feature screens use the same trainer
query. Preserve the current null-trainer initialization failure/retry flow.
Clear/cancel all player queries and reset the interaction controller on confirmed
logout or account change. Keying by actor is defense in depth, not a substitute
for clearing the previous account's data. Late responses from an old auth epoch
are discarded.

### Initial policy

- Active data is stale after 15 seconds. Unused queries are retained for five
  minutes, subject to a small collection-page cap (ten pages per account).
- One coordinator fetches versions every 15 seconds while collection is visible;
  elsewhere it checks visible trainer resources every 30 seconds. No hidden-tab
  polling. Focus, pageshow return and reconnect trigger an ungranted version/read
  check immediately.
- A changed counter invalidates every dependent query in the matrix below and
  refetches active ones. Inactive cached pages stay stale until requested.
  catalogVersion changes invalidate owned display projections; battle catalog handling stays battle-owned.
- Collection reads include collectionRevision; membership-filtered reads also
  include partyRevision. Party views include both. Trainer projections include
  trainerRevision. Read projections and their counters come from one coherent
  database snapshot.
- Maintain per-domain high-water revisions. Responses older than a known revision
  cannot replace cache data. Also use per-key fetch generation and the auth epoch;
  a slower old query cannot install after an explicit query/command has superseded
  it. Pass the library's AbortSignal through the existing transport, but do not
  rely on abort alone to establish ordering.
- Before installing an interaction result, cancel conflicting reads, invalidate
  their generation and merge only projections at current-or-newer revision vectors.
  Invalidate other affected keys, then refetch active ones through GET. A committed
  receipt remains successful even when its old projection is discarded.
- One party command may be pending per account in the client. Keep the last
  confirmed formation plus a visual pending target; disable further party
  commands until the result resolves. Independent tabs can race; server revision
  checks decide the winner.
- On a conflict, install/refetch current state and ask for a new target. On network
  uncertainty, retain operationId and normalized input, disable blind repetition
  and offer “Check update”. Store only unresolved operation identity/input in
  sessionStorage, scoped to actor, **before dispatch**, for reload recovery. If
  that write fails, do not dispatch the interaction; surface the recovery-storage
  failure rather than claiming reload recovery. Ordinary cached player
  data and offline mutation queues are not persisted.
- Automatic retries are for ungranted transient GET failures only: at most two
  with backoff, respecting Retry-After. Do not retry 401/403/404/validation errors.
  Interactions and recovery always preserve the original ID; no library mutation
  retry may allocate a fresh one. Clear private detail on definitive not-owned/
  missing responses and invalidate referring lists/party.
- Offline views may show their last data with an explicit stale state; editing
  requires a live server response. A failed refresh does not blank a useful
  confirmed view or invent confirmation of an uncertain write.

An explicit user read runs through the interaction controller, which seeds the
same query key used by automatic GETs. Query functions themselves never grant.
Mounts, React retries, cache invalidation and remounting an inspector therefore
cannot accidentally create rewarded requests.

Dependency matrix (also used when accepting responses):

| Changed counter | Invalidate / refetch active dependents |
| --- | --- |
| trainerRevision | Trainer profile/resources |
| partyRevision | Party view; collection queries with a membership filter |
| collectionRevision | Every collection query, owned detail and party member summaries |
| catalogVersion | Owned display projections and their derived-data compatibility |

Unfiltered collection membership markers update from the party query directly.
For a response with several counters, every relevant counter must be at least
the known high-water value. This includes definitive error responses: an old
404/not-owned result must not erase a newer authorized detail. Return the actor
and relevant snapshot counters with these errors. Extend the existing typed HTTP
error to carry only these allowlisted fields; it currently discards them. Auth
failures are handled by auth epoch instead; transient errors never clear
confirmed data. A discarded
response triggers a bounded ungranted re-read if the active key lacks a current
value. After two superseded re-reads, retain an explicit stale state and retry
on the next freshness event rather than spinning.

Every player request also sends its expected account ID as a consistency
assertion, never as authority. The server compares it with the session actor
before reading or applying anything and returns ACCOUNT_CHANGED on mismatch.
Successful responses identify their actor. The client checks actor plus auth
epoch before installing data or accepting a result. This prevents a stale tab
from issuing an old account's intent under a newly signed-in account's cookie.
A same-origin session-change broadcast is only a hint to suspend commands and
recheck /me. Revalidation, account mismatch or 401 resets the appropriate auth
epoch/cache; an old request's error cannot log out a newer epoch. Restore an
unresolved operation only after authenticating its recorded actor. Do not
resubmit it under a different account.

Freshness is eventual: while visible and healthy, Discord changes are normally
noticed within one polling interval plus request time. Background tabs refresh
on return. This is not a hard real-time SLA or an authorization guarantee.
An external change detected during placement invalidates its target map and
requires a fresh choice.

## Reusable presentation

PartyView and PokemonInspection are controlled display modules. They receive
projected data, selected/target states and callbacks; they do not fetch, write,
own dialogs or decide viewport placement. The host mounts them as a sidebar,
sheet or full page. The workspace owns the single-expanded-phone-panel rule.

Use the same party view for read-only previews and editing by supplying optional
intent callbacks/target states. Reuse arena sprite/geometry helpers, while battle
HUDs and live combat state remain battle presentation concerns.

Extract MoveInspection from the repeated battle/owned display: name, type,
category, power, accuracy, cooldown and description. Each adapter resolves its
source into the same display shape; the host supplies surface styling. Type
colors and nature cues follow the approved study. Train remains a future action.

## Delivery order and acceptance evidence

1. **Foundation within U3 preparation:** inventory writers, settle/verify the
   transaction-capable deployment plan, introduce versioned narrow persistence,
   close the participating writer set (including Discord party/ownership paths),
   and add durable interaction receipts. Prove grant concurrency and restart against
   a disposable transaction-capable MongoDB. Infrastructure changes require their
   own reviewed execution plan.
2. **U3 reads and cache:** shared owned read/projection paths for both adapters,
   derived-field migration, query cache/auth integration and approved collection/
   reusable inspection. U3 shows a read-only party using the future U4 projection;
   editing can be enabled with U4 without rearranging the workspace.
3. **U4 browser commands:** enable immediate party gestures using the already
   shared backend, preset compatibility and response-loss recovery on web.
   Recheck Discord compatibility and migration closure before publication.
4. **Then U5/U6:** NPC starts and result receipts. Reuse only the applicable pieces
   of this interface; do not rewrite battle sequencing into the player cache.

Required scenarios before claiming implementation acceptance:

| Scenario | Required observation |
| --- | --- |
| Hostile filters / foreign ID / invalid sort | No other owner's data; stable error; no grant. |
| Empty collection; neutral/changed nature; CP/IV sort | Correct bounded projection and stable order; list/detail agree. |
| Two simultaneous Discord/web party edits | One accepted revision; one explicit conflict; no lost unrelated resources. |
| Same preset-swap ID replayed after response loss/restart | One swap, one applicable grant and the original receipt. |
| Same ID with different actor/input/invocation class | No cross-account lookup; mismatch rejected within the actor's namespace. |
| Grant crosses a level threshold while another writer awards/spends | Correct final money/EXP/level and increasing trainer revision. |
| Add versus release or trade of that Pokémon | One valid serial outcome; no committed foreign/missing party member. |
| Kill before commit, after commit/before response, during driver retry | Receipt and effects agree; original-ID recovery; no duplicate grant. |
| Slow GET completes after party command/newer detail/account change | No cache rollback, summary clobber or prior-account display. |
| Cached inspect, explicit search, resize, focus, polling, remount | Only successful explicit network interactions grant. |
| Several inspector/party mounts | Shared current data; no duplicate network/grants from mounts. |
| Discord change while placement is open | Version refresh removes stale targets; commit still validates revision. |
| Reload during unknown write; missing receipt while request is active | Recover same ID safely; absence does not assert that the write failed. |

Use focused interface tests, client race tests, real-Mongo transaction/restart
tests and browser checks against the approved study. Existing test baselines
still apply; mocked tests alone do not establish real persistence or cross-surface
acceptance.

## Deferred and confidence limits

Push updates, normalized entity caching, offline writes, a general operation
registry, training UI and catalog splitting remain deferred until their concrete
need appears. Transaction infrastructure and participating writer coverage are
required now, not optional cleanup. Live topology, transaction behavior, writer
migration completeness and cache performance remain unverified by this document.

The maintainer review should decide the transactional infrastructure direction
and QueryClient adoption. The [independent review](architecture-review.md) found
three concrete gaps, now repaired, and identified durability/account/reload
details now specified above.
Its findings are design evidence, not runtime acceptance.
