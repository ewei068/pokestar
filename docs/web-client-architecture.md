# Web client architecture

Status: direction for incremental implementation, October 2026. This describes a
site that can eventually expose more of Pokestar than battles. It does not
commit us to a full bot migration or a visual design before those needs exist.

## Product and system constraints

- The site is a static build. The server owns identity, permissions, game rules,
  durable state, and accepted commands. The browser displays projections and
  submits user intent; it does not run the battle engine.
- Discord and web are two clients of the same domain behavior. A feature added
  to web should use an authenticated server interface, rather than call a
  Discord handler or reproduce its rules in TypeScript.
- Each feature can ship independently. Battles are the first feature; possible
  later features include Pokémon collection, team editing, inventory, quests,
  shop, raids, and account settings. Their exact navigation and workflows are
  open questions.
- A feature's public projection must be safe for its viewer. The browser's
  catalog is display data, versioned with the server's ruleset, and must not
  become a second source of game rules.

## Module map

| Module | Interface to its caller | Implementation hidden behind it |
| --- | --- | --- |
| Site shell | Authenticated identity, current location, and a feature page | Login/logout, top navigation, loading/error states, and route selection |
| HTTP transport | Authenticated request and typed error | API origin, credentials, JSON, 204, CORS/session details |
| Battle feature | A list page or a battle page for a battle ID | Its display catalog, listing, battle session, and screens |
| Battle session | Current authoritative state, playback frame, legal choices, status, and commands | Polling, revision/state IDs, stale responses, event queue, and action submission |
| Battle screen | Display model plus user callbacks | Layout, inspection, action controls, accessible feedback |
| Battle board | Projected scene plus selection/inspection callbacks | Continuous DOM field, floating HUDs and shared visual anchors |

The important seam is between the **battle session** and the **battle screen**.
The screen should not know how an action reaches the server, how often to poll,
what an HTTP 204 means, or which late response to discard. The session should
not know whether a board is drawn with DOM, canvas, or another renderer. This
gives the screen leverage from one small session interface and keeps network
and concurrency fixes local to the session.

The board's present interface is a plain projected view, the viewer's team
names, display catalog, highlights, and callbacks. DOM is the only adapter
today. A formal renderer registry would be a hypothetical seam with one
adapter, so it is deliberately deferred. If canvas becomes useful, implement a
second adapter to this scene interface and keep action authority in the session.

The production field uses `battles/arena/geometry.ts` to resolve occupied sprite
anchors and empty tile centers for movement, VFX, reactions and text. Stationary
and traveling sprites share `PokemonSprite` and cached alpha-bound placement;
this stays inside presentation and does not add asset metadata to the API.
The [arena design guide](arena-design-guide.md) defines layout and visual rules.

The battle feature owns its catalog and pages. The site shell should not fetch
Pokémon data merely to show another future feature. Shared transport belongs
outside the feature; feature-specific endpoints and types belong inside it.
Cross-feature state should be shared only when two real features need it.

## Battle session interface and invariants

The session exposes a current response-derived display state, one playback
frame at a time, recent readable events, loading/busy/error/notice states, and
commands to select a move, inspect a Pokémon, choose a legal target, skip, and
refresh. The screen may render these states but must not calculate whether an
action is legal. The server-supplied `availableActions` is authoritative.

Its interface also includes behavior, not just TypeScript fields:

1. A newly opened battle shows the current view immediately. Historical
   actions are not animated on initial load.
2. Updates after that point play in server order with their corresponding
   post-action views. The latest authoritative view remains available while
   playback is running.
3. A late response cannot move the session back to an older revision. A stale
   action response refreshes the view and asks the user to choose again.
4. The current battle state ID is sent on subsequent reads. An unchanged read
   has no new view; a changed read can contain several updates.
5. A command uses the current revision and an idempotent request ID. Hiding or
   closing the tab does not change server state.
6. A ruleset/catalog mismatch disables action controls and asks for reload.
7. Empty, expired, disconnected, and unauthorized states are visible to the
   user without exposing server internals.

The server may later deliver the same ordered update contract by SSE or
WebSockets. That transport change belongs inside the session module; the
screen interface should remain stable. Reconnect must fetch the current view
using the last state ID and deduplicate revisions. Polling remains the
implementation until latency or traffic measurements justify push.

The session's HTTP dependency is **remote but owned**. If the session logic
needs isolated tests, inject a narrow battle transport port with a production
HTTP adapter and an in-memory test adapter. Keep that as an internal seam:
screens should receive session state, not a transport adapter. Pure update and
playback calculations can be tested directly at their interface without a
browser. We should not add a global data framework just for this feature.

## Presentation and future animation

The battle screen may have several visual regions: board, actions, inspected
details, status, and history. It receives a frame with a semantic combat event
and the matching view. The first renderer uses text and tile emphasis. A later
animation catalog can resolve an event by custom move animation first, then a
template keyed by move type, physical/special/status kind, and target area.
That catalog should affect only presentation; animation completion must never
decide whether the server accepts a command. Reduced-motion users should get
an immediate readable result.

The implemented battle screen uses the facing formation on desktop and stacks
the teams on phones with their front rows toward each other. A participant
selects a move, previews a primary target's server-supplied geometric footprint
(including empty tiles) on hover or focus, then clicks a legal target to act.
Clicking the selected move again exits targeting. On phones, the command tray
can collapse while the board is inspected. The same board highlights
`moveStarted.patternTiles` during ordered playback; this executed footprint
drives VFX without putting targeting rules in the browser.
The motion renderer uses the executed `moveStarted` event for a
three-phase sequence: actor travel, VFX on every pattern tile, and actor return.
Physical actions stop short of their primary target; special and status actions
move into that target's lane at the board center. Self-targeted actions remain
in place. Travel depends on the action category, while tile VFX depends on the
move type and category. The 18 standard types each have three configured canvas
compositions, shared by live battles and development stories;
Unknown, Shadow, Stellar, and future type names resolve to Normal VFX until
they receive art. Result events display floating or central text alongside
supplied state observations and animated view differences. `playback.ts` owns
ordered frames and canonical action reconciliation; `useBattlePlayback` owns
timing, reached log entries and cancellation, shared by HTTP and stories.
The latest authoritative state is retained separately from the playing view.
HP begins changing as its announcement appears; the next event waits for both
text and state animations to finish. Fainting follows its own event. Unknown consequences reconcile before the next action. The virtualized log retains all reached session entries and preserves reading
position as new entries arrive. Compatible adjacent observations can share
presentation stages, while faint/phase/action boundaries preserve order.
State differences drive damage, healing and faint reactions. Client copy and
presentation semantics live in `eventPresentation.ts`; completion notices
cannot reveal future outcomes.
See [battle result playback](battle-result-playback.md) for settings and stories.
The session preserves event order and waits for shared artwork readiness.
The actor and board canvas share one epoch: approach 420 ms, effect 760 ms,
return 320 ms. `vfx/recipes/` holds editable settings; `renderTile.ts` owns
choreography; `BoardVfx` owns presentation geometry and frame cancellation.
Reduced-motion playback shows the static footprint. See the
[battle VFX guide](battle-vfx-guide.md) for authoring and verification.
The development-only `?previewBattle=1&story=...` route uses named fixture
scenarios for visual review and does not submit commands. Story data checks
guard the display contract, while component tests cover user interactions.

The agent-facing style guide records current visual and interaction rules.
Shared typography, colors, spacing, and components should emerge from this
guidance and at least a second feature. Extract tokens and reusable components
when their semantics are repeated and stable. A large design-system module or
canvas dependency now would add interface without useful behavior.

## Data and asset ownership

Feature endpoints return projections shaped for the viewer. A battle response
contains public state, that player's legal choices, ordered events, and
revision/state ID. It never contains an unprojected engine state. A display
catalog contains names, descriptions, types, and asset URLs, keyed by IDs and
ruleset version; image files load separately and can fail independently. A
future collection feature may reuse species display data, but should not force
the entire battle catalog into the site shell or main JS bundle. Split and
cache catalogs once measured load time or a second feature makes that useful.

The static site can be hosted separately from the API. The API's stable
hostname, cookie policy, allowed site origin, and OAuth callback are
deployment configuration. Browser URLs currently use a query parameter so
static hosting needs no path fallback. Choose a route library and URL scheme
when navigation grows beyond the battle list and detail view. Existing battle
links must keep working or redirect when that happens.

## Incremental implementation

Now: make the shell own login state and host the battle feature; let the battle
feature select its list/detail page and load its catalog only for battle detail.
Place battle transport decisions,
revision handling, commands, and playback in the battle session module. Give
the board a projected scene rather than the entire HTTP response. Preserve the
current appearance while visual direction is being developed.

The first visual guidance has been prototyped and carried into the battle
screen. Continue to refine information hierarchy, responsive layout, keyboard
access, reduced motion, and reusable visual tokens from actual screens.

When a second feature arrives: extract truly shared account/navigation/display
patterns and decide whether routing, cross-feature caching, or separate
catalog chunks earn their complexity. When measurements or experience demand
it: consider push updates, richer effect materials, and stronger offline/reconnect
behavior behind existing seams.

## Decisions left open

- Site information architecture and mobile priority.
- Whether other bot workflows are synchronous commands, multi-step drafts, or
  real-time views; design their server projections once a workflow is chosen.
- Route library, cross-feature cache, and asset CDN strategy.
- How custom move VFX are authored and whether a future effect needs shaders
  or a dedicated runtime beyond the current canvas renderer.
- PvP information reveal rules beyond the current participant projection.

The deletion test for today's battle session is useful: removing it would put
polling, revision ordering, stale action handling, and playback back into each
screen. Removing a generic future-feature registry would delete complexity
without moving meaningful behavior elsewhere. We build the former and defer
the latter.
