# Web battler feasibility

Status: exploratory design, 2026-10-10. This records the agreed direction and the remaining decisions; it is not an implementation specification.

## Product shape

- A participant signs in with Discord, sees their ongoing battles, and opens one in a static web app.
- The target is for every started battle mode to be viewable and playable on the web, though complete mode coverage is not a hard first-release requirement. Battle selection and challenge acceptance can remain in Discord.
- Discord and web use the same durable battle and action service. `/continue-battle` finds a participant's active battles and renders a fresh Discord view.
- Only participants may view a battle. Multiple ongoing battles per participant are allowed.
- The web displays current state immediately on entry and animates newly observed actions, including actions from another participant or an NPC.
- Completed battles leave the ongoing list but remain read-only for a limited period. Abandoned battles close without completion rewards; mode deadlines take precedence.
- The architecture should allow other bot features to gain web clients later, without porting them now.

## Feasibility and options

| Concern | Feasible first approach | Later option or trade-off |
| --- | --- | --- |
| Hosting | Build a TypeScript browser app and publish static files on GitHub Pages. Keep Express and MongoDB on GCP. | Serve both UI and API from Express for simpler same-origin sessions, or move the API to another host. |
| Discord login | Let Express perform Discord's authorization-code exchange and issue a Pokestar session. | A browser-only OAuth flow is possible, but token handling is less attractive for this authenticated API. |
| API hostname | Reserve a GCP static external IP and place an HTTPS domain in front of Express. | A proxy or managed service can replace the VM later without changing the client API hostname. |
| Web updates | POST actions over HTTP; poll for battle updates since a revision while the page is visible and refresh on focus. | SSE provides one-way push; WebSockets provide two-way push. A static site can connect to either. |
| Discord updates | `/continue-battle` and rejected stale actions render the latest view. Prior messages may remain stale. | Track message references and proactively edit them after web actions. |
| Rendering | CSS grid and DOM layers for tiles, sprites, selection, health, icons, and effects; use browser animations. | Canvas or a game framework only if future visual complexity warrants it. |

Browser requests to the API need correct CORS and session settings. If the site remains under `github.io` while the API uses another site, cross-site cookie behavior needs deliberate handling. A custom site domain and API subdomain would make session design easier. An HTTPS page needs an HTTPS API and `wss://` for WebSockets.

## Shared battle boundary

The bot command and HTTP route should both call a battle application service. This service owns participant authorization, legal-action checks, persistence, revision conflicts, NPC progression, and completion. Discord embeds and web view models are separate presentations of its result. Future web features can use the same pattern without importing Discord interactions into business logic.

A durable battle record needs an immutable starting setup (including generated Pokémon and phase inputs), the actual RNG seed, participant IDs, mode context, status, ruleset version, and a monotonic revision. An accepted action adds its actor, command, ordered combat events, and resulting revision. A current view can be stored for fast listing and reads, while the setup and actions support recovery. Periodic engine checkpoints are a possible optimization for long histories, but the engine currently has no general serializer for its live object graph.

Action submission should include the revision the client observed and an idempotency key. The service validates against the latest battle, accepts one action at a time, and returns the new events and authoritative view. A stale or invalid action returns the current revision and view. Web and Discord can both recover from that response. Battle revisions must be separate from turn numbers because dungeon phases can reset the turn counter.

Completion is a separate durable operation: reward and mode effects must run once even if a request retries or the process restarts. Raid boss updates and battle completion need coordinated rules because the raid is a separate shared record.

## Combat events and animations

The server resolves combat immediately. It returns an ordered sequence such as `actionAttempted`, `moveStarted` or `actionBlocked`, `targetsResolved`, `targetMissed`, `hpChanged`, `effectApplied`, `pokemonFainted`, and `turnStarted`, plus the final authoritative view. These are plain-data outcomes, distinct from the existing mutable engine rule-event callbacks. Event payloads use IDs, positions, move IDs, and post-change values; they do not expose live engine objects.

The client queues updates by revision, animates each sequence, and reconciles to the final view. After a player action, it can show an “NPC is taking its turn” indicator before playing the NPC update even if the server computed that update already. When reopening a battle, it renders the current view without replaying old animations. An overwhelmed or stale client can skip animation and use the latest view.

An animation registry can resolve a move in this order: custom animation by move ID; template by Pokémon type, damage type, and affected pattern; generic fallback. The MVP supplies templates only. VFX use actual resolved target positions, including misses, rather than inferring affected cells from the selected target. CSS transforms and overlays cover movement, projectiles, flashes, tile highlighting, and floating numbers. A custom move animation later changes presentation metadata, not combat rules.

Discord prioritizes the final state. It may show a compact chronological action summary when message space permits; the complete update remains available to the web view.

## Current repository seams and risks

- `src/services/state.js` holds interaction state in process memory with a refreshable TTL. Started battles in `src/services/battle.js` and `src/services/raid.js` are attached to that state, so restarts lose them.
- `src/index.js` currently exposes `/vote` on Express. It has no authenticated battle API, and its CORS setup is limited to preflight handling.
- `src/battle/engine/Battle.js` has seeded randomness, optional action recording, `cloneAndReset`, and `takeSnapshot`. The 100-case replay test in `src/battle/engine/__tests__/Battle.test.js` proves an in-memory case, not persisted recovery across all modes. Production battles normally do not enable action recording. `cloneAndReset` also fails to retain a generated ID when no ID was supplied, changing the RNG seed.
- Dungeon phases use function callbacks in `src/battle/engine/npcs.js`; raids and tower battles use completion callbacks in services. Those callbacks cannot be serialized as battle data. Generated later-phase Pokémon must be persisted or generated reproducibly.
- `getStartTurnSend` in `src/services/battle.js` mixes Discord rendering with completion rewards and clears the current text log. Completion needs to move behind the shared service and become idempotent.
- The current engine rule-event bus carries mutable objects and can alter combat. `performAction` returns no ordered client result. Presentation events should be recorded at state mutations, including multi-hit, reactive, delayed, and turn-end effects.
- Grid dimensions and targeting patterns already exist. Pokémon configuration supplies sprite URLs, but an explicit client display catalog and an asset review are needed before depending on those URLs in a public site.

## Suggested delivery order

1. Define battle IDs, revisions, view model, legal-action response, and ordered combat-event contract. Keep it independent of Discord and network transport.
2. Extract creation, action, NPC progression, completion, and mode-specific effects behind a shared battle service. Prove the seam with one representative battle, then add modes through the same boundary. Record any mode deferred from the first release explicitly.
3. Persist starting setup and actions in MongoDB, recover after a restart on the same ruleset, and make concurrent actions and rewards safe to retry.
4. Add the authenticated Express API and `/continue-battle`; return the current view when either surface submits a stale action.
5. Build the static battle list and battle UI, then add template animations driven by combat events. Poll for remote updates by revision.
6. Exercise recovery, each mode's completion path, cross-surface actions, multi-hit/AOE animations, and a restart during an active battle.

## Deferred decisions

- General inactivity duration and read-only result retention duration.
- The exact ruleset-version mechanism. A manually incremented version is simple; a generated fingerprint of the engine and rule-affecting data may catch missed bumps. Incompatible active battles are expected to be cleared through an explicit deploy or maintenance step; the procedure is not designed yet.
- Whether to add SSE or WebSockets after polling, and whether to proactively edit old Discord messages.
- Which moves receive custom animations and how sprite assets are hosted and curated.

## Platform references

- [GitHub Pages static hosting](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Discord OAuth2](https://docs.discord.com/developers/topics/oauth2)
- [GCP static external IPs](https://docs.cloud.google.com/compute/docs/ip-addresses/configure-static-external-ip-address)
- [CORS and credentials](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#including_credentials)
- [WebSocket clients](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_client_applications)
- [Server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events)
