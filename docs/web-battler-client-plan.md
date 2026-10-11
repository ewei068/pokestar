# Web battler client plan

Status: implementation in progress. The first release uses React, TypeScript,
Vite, CSS Grid, and Pokémon icons. Combat remains authoritative on the server.

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

## Stored action size

The accepted command is small. A measured 6-versus-6 sample attack produced
an 11,854-byte BSON update: 112 bytes for the `action` field, 860 bytes for
`events`, 157 bytes for `log`, and 10,643 bytes for the full resulting `view`
(field measurements include their own BSON wrappers). A synthetic battle with
100 accepted skips occupied 1,127,333 bytes as a single stored document.
These are examples, not a bound for raids or unusually long battles.

The immutable initial setup contains full generated party data, so edits to a
user's collection do not change an ongoing battle. Replay recomputes derived
combat data from the versioned ruleset. The current record stores one latest
view for quick reads and replay verification. New action entries store the
command, ordered events, and log, without a full view. Existing records with
older per-action views remain readable; those old fields are not removed by
this change. Measure long battles before considering true engine checkpoints.

## Next implementation steps

1. Test Discord OAuth, cookie/CORS behavior, icon loading, and the battle board
   in a real browser with a configured local or staging API.
2. Finish the backend's reward-recovery and real-MongoDB cutover gates before
   enabling durable starts in production.

The Express API now mounts only when `WEB_BATTLER_ENABLED=true`. Configure
`WEB_SITE_ORIGIN`, `WEB_DISCORD_REDIRECT_URI`, `CLIENT_ID`, and
`DISCORD_CLIENT_SECRET`; register the exact callback URL in Discord's developer
portal. `GET /api/auth/discord/login` starts login, `/api/auth/discord/callback`
sets an HTTP-only session, `GET /api/me` checks it, and `/api/battles` plus
`/api/battles/:id` list and read participant battles. POST
`/api/battles/:id/actions` requires the configured site origin, expected
revision, request ID, and action. Sessions are opaque tokens stored by hash in
MongoDB with a TTL. The API returns no unprojected battle records.

The battle snapshot format now includes `shiny` and team grid dimensions.
`BATTLE_RULESET_VERSION` is 2; version 1 records must be completed or cleared
before this branch is deployed with durable starts enabled.

The `web/` client is a static Vite build. It lists ongoing battles, displays
the current board with sprites, exposes legal attacks and skip, polls for
remote actions, and plays new combat events as a brief text/tile sequence.
The first load opens at current state without replaying old actions. Build and
unit tests are available now; browser behavior has not yet been validated.
