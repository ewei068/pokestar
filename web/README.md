# Pokestar web battler

The web app is a static React/Vite client. Express on the bot host handles
Discord login, sessions, battle actions, and the display catalog.

## Local development

1. Set the bot environment values from `.env.in`, including
   `WEB_BATTLER_ENABLED=true`, `WEB_SITE_ORIGIN=http://localhost:5173`,
   `WEB_DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback`,
   and `DISCORD_CLIENT_SECRET`. Register that exact redirect URI with Discord.
2. Run the bot and its local MongoDB service.
3. In `web/`, run `npm ci` and `npm run dev`. Vite proxies `/api` to the bot.

For a visual review of the production battle screen without login, open
`http://localhost:5173/?previewBattle=1` while Vite runs. The story bar has
stable links for ready, area targeting, status and effects, NPC waiting, move
playback, completed, and dense/missing-art states. For example,
`http://localhost:5173/?previewBattle=1&story=playback` opens the event story
with a Replay action control. Stories use local display fixtures and never
submit server actions. In a live battle, select a move, hover a target to
preview all pattern tiles, then click it to use the move. Click the selected
move again to cancel. On a narrow screen, the command tray can collapse.

The agent-facing UI guidance is in `docs/web-ui-style-guide.md`, with a pointer
from `web/AGENTS.md`. Story data lives in `src/battles/dev/battleStories.ts`;
add scenarios there when a UI state needs repeatable review. Component tests
exercise interactions through React Testing Library. Story tests check fixture
contracts rather than recording markup or pixel snapshots.

Durable battle starts also need `DURABLE_BATTLES_ENABLED=true`. Keep the
separate raid flag off until the remaining raid cutover work is complete.

## Static build

Run `npm run build` in `web/`. The `dist/` directory can be published on
GitHub Pages. Set `VITE_API_ORIGIN=https://api.example.com` at build time for
the HTTPS API. For a GitHub Pages project URL with a repository path, also set
`WEB_BASE_PATH=/repository-name/`; a custom subdomain can keep `/`.

The battle ID is in a query parameter (`?battle=...`), so direct links work on
static hosts without a route rewrite. The site and API should use subdomains
of one domain for reliable session cookies. The API origin needs HTTPS, a
stable hostname, and a GCP reserved external IP pointing at the VM.

Run `npm test` for client unit tests. Browser validation and production
deployment are separate gates.
