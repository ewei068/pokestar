# Pokestar web client

The static React/Vite shell signs participants in through the bot's Discord OAuth API. Battle browsing and presentation are added in the following stack layers.

Run `npm ci`, `npm test`, and `npm run build` in `web/`. For local development, run the bot API with `WEB_BATTLER_ENABLED=true`, set the site and registered callback origins from `.env.in`, and run `npm run dev`. Vite proxies `/api` to the bot. Keep client secrets on the server.

`WEB_BASE_PATH` sets the static hosting base path; `VITE_API_ORIGIN` selects a separate API origin at build time. The site and API should use HTTPS subdomains of one domain for reliable cookies. Copy `.env.example` to `.env.local` for the optional local HTTPS settings.

Sign-in preserves the battle query through OAuth. Recoverable callback, cookie, network, and sign-out errors offer a retry without exposing internal provider errors. Live OAuth and physical-device checks remain deployment gates.
