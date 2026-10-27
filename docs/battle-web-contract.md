# Web battle browser and API contract

Status: implemented in the review stack. See [the effort overview](efforts/web-battler.md) for verification and production cutover gates.

## Browser contract

`BattleWebService` is the only battle service result intended for HTTP clients.
It returns the current projected view immediately with a battle state ID. The
browser sends that ID as `after` on later reads. An unchanged read returns HTTP
204 without replaying the engine; a changed read returns ordered updates after
the ID's revision. A malformed, foreign, or future ID requests all action
updates. The ID changes for action, completion, and expiry transitions, without
the server tracking client sessions. It is not based on the turn number because
several actions can occur in one turn cycle.

Each update contains its accepted action, combat events, and log. The server
replays actions to build intermediate post-action views for missed updates; the
last update uses the response's current view instead of repeating it.
The current response also provides legal move IDs and target Pokémon IDs. The
browser submits an action with its observed revision and a unique request ID;
stale submissions receive the latest view and updates.

The projection includes grid dimensions, sprite selection (`speciesId` and
`shiny`), public battle state, and full move and equipment data for the
participant's own team. It withholds opponent moves, ability, held item, and
private stat modifiers. More detailed PvP reveal rules can be added later.
Discord continues to use its existing battle renderer.
Each projected team's dimensions also carry a `displayName`: a solo trainer's
saved username, “You” for the viewer's solo team, or the team name for several
trainers or missing names. Current and intermediate views use the same labels;
canonical team keys and Pokémon `teamName` stay unchanged. The client falls
back to that key when an older backend omits the optional label.

The HTTP adapter must derive the Discord user ID from the authenticated session
and pass it to `BattleWebService`; it must not accept a user ID from request
parameters or send the unprojected `BattleService` result to the browser.

## Static app and assets

- Serve a small JSON display catalog at `GET /api/catalog`, generated from the
  running server's checked-in Pokémon and battle configuration. It contains
  names, types, sprite URLs, move and effect descriptions, but no execution
  callbacks or bot code. The catalog version matches the battle ruleset.
- The repository already contains canonical sprite URLs in
  `data/pokemonData.json` and custom Pokémon URLs in `src/config/pokemonConfig.js`.
  Custom image files are already in `media/images/sprites`. Load images
  separately and provide a missing-image fallback.
- For the first public release, use a site subdomain on GitHub Pages and an API
  subdomain pointing to the GCP VM through a reserved static IP. Express owns
  Discord OAuth, the session, and battle routes. Local development can use the
  Vite proxy without either public hostname.
- Poll while the battle page is visible and refresh on focus. The event and
  state ID contract also supports SSE or WebSockets later. JSON API responses
  use HTTP compression when the client supports it.
- Keep battle state, animation queue, and renderer separate. CSS/DOM can serve
  the initial UI; a canvas renderer can consume the same view and events later.

## Replay and storage

The immutable initial setup contains full generated party data, so edits to a
user's collection do not change an ongoing battle. Replay recomputes derived
combat data from the versioned ruleset. The current record stores one latest
view for quick reads and replay verification. New action entries store the
command, ordered events, and log, without a full view. Existing records with
older per-action views remain readable; those old fields are not removed by
this change. Measure long battles before considering true engine checkpoints.

## HTTP and deployment boundaries

The Express API mounts only when `WEB_BATTLER_ENABLED=true`. Configure
`WEB_SITE_ORIGIN`, `WEB_DISCORD_REDIRECT_URI`, `CLIENT_ID`, and
`DISCORD_CLIENT_SECRET`; register the exact callback URL in Discord's developer
portal. `GET /api/auth/discord/login` starts login, `/api/auth/discord/callback`
sets an HTTP-only session, `GET /api/me` checks it, and `/api/battles` plus
`/api/battles/:id` list and read participant battles. POST
`/api/battles/:id/actions` requires the configured site origin, expected
revision, request ID, and action. Sessions are opaque tokens stored by hash in
MongoDB with a TTL. The API returns no unprojected battle records.

Login initiation also supports JSON negotiation so the app can recover from
startup failures. Callback failures return to a fixed-copy recovery screen;
successful callbacks verify that the browser retained its session. The
[architecture guide](web-client-architecture.md#data-and-asset-ownership) owns
the state/redirect and retry boundaries, and the
[login recovery record](verification/login-recovery/README.md) lists checked
cases. Configure `WEB_BASE_PATH` on both the backend and static build for a
hosted subpath.

The battle snapshot format now includes `shiny` and team grid dimensions.
`BATTLE_RULESET_VERSION` is 2; version 1 records must be completed or cleared
before this branch is deployed with durable starts enabled.

The `web/` client is a static Vite build. It lists ongoing battles, displays
the current board with sprites, exposes legal attacks and skip, polls for
remote actions, and plays new combat events as a brief text/tile sequence.
The first load opens at current state without replaying old actions. Named
stories and mocked-HTTP browser flows have retained verification in
[the verification directory](verification/); current UI also includes configured
move/result VFX and a virtualized session log. Authenticated production behavior
and real MongoDB concurrency remain separate cutover gates.
