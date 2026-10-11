# Web battler client plan

Status: implementation in progress. The first release uses React, TypeScript,
Vite, CSS Grid, and Pokémon icons. Combat remains authoritative on the server.

## Browser contract

`BattleWebService` is the only battle service result intended for HTTP clients.
It returns the current projected view immediately; optional `sinceRevision`
returns ordered updates for actions observed after that revision. Each update
contains its accepted action, combat events, log, and projected resulting view.
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

- Build a small display catalog from checked-in Pokémon and battle configuration.
  It should contain only display metadata (names, types, sprite URLs, move and
  effect descriptions), not move execution callbacks or the full bot bundle.
- The repository already contains canonical sprite URLs in
  `data/pokemonData.json` and custom Pokémon URLs in `src/config/pokemonConfig.js`.
  Custom image files are already in `media/images/sprites`. Generate the catalog
  at build time; load images separately and provide a missing-image fallback.
- For the first public release, use a site subdomain on GitHub Pages and an API
  subdomain pointing to the GCP VM through a reserved static IP. Express owns
  Discord OAuth, the session, and battle routes. Local development can use the
  Vite proxy without either public hostname.
- Poll while the battle page is visible and refresh on focus. The event and
  revision contract also supports SSE or WebSockets later.
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
combat data from the versioned ruleset. The current record also stores one
latest view and a full view after every action. Keep that for MVP, measure long
battles, then consider compact action/event entries with periodic checkpoints.

## Next implementation steps

1. Add authenticated Express list/read/action endpoints that expose only the
   browser contract. Implement Discord OAuth code exchange on the server and
   an HTTP-only session with origin and CSRF controls.
2. Generate the display catalog and build the icon-based battle list and board.
3. Add polling, action submission, stale-response recovery, and simple event
   playback. Test API authorization and browser behavior before deployment.
4. Finish the backend's reward-recovery and real-MongoDB cutover gates before
   enabling durable starts in production.

The battle snapshot format now includes `shiny` and team grid dimensions.
`BATTLE_RULESET_VERSION` is 2; version 1 records must be completed or cleared
before this branch is deployed with durable starts enabled.
