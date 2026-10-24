# Login recovery and channel continuation

Local implementation and verification: **2026-10-22** on
`codex/battle-login-errors`, based on annotation polish #173. No new PR,
deployment or running-backend restart is part of this verification.

The [Discord continuation contract](../../discord-battle-continuation.md) and
[client architecture](../../web-client-architecture.md) own the behavior.

## Implemented cases

| Condition | Recovery |
| --- | --- |
| Ordinary signed-out or expired session at entry | Normal Sign in screen |
| Discord consent cancelled | Cancellation screen; start again |
| Missing, expired, mismatched or malformed state cookie/query | Verification error; fresh sign-in at configured site base path |
| Missing or repeated authorization code | Incomplete-link screen; start again |
| Expired/already-used authorization code | Expired-link screen; start again |
| Discord server/rate-limit, network, malformed token or user response | Safe Discord failure screen; retry |
| Session persistence failure | Session error screen; retry |
| Callback succeeded but `/me` returns 401 | Same-browser/cookie guidance; retry |
| Identity API unavailable, offline or timed out | Connection screen; recheck identity |
| Sign-in initiation unavailable, malformed or timed out | Startup error screen; retry |
| Sign-out fails | Explain session may remain active; retry sign-out |
| Unknown outcome code | Fixed generic screen, without reflecting URL text |

Valid callback outcomes and retries retain the original battle query. Untrusted
state falls back to the app home instead of trusting its return path. Outcome
markers are consumed without removing the battle link. API/Discord failures do
not expose raw provider descriptions or credentials in the screens. Starting
OAuth retains direct browser redirects and adds JSON negotiation for the app.
Auth requests are bounded at 15 seconds per HTTP request. Frontend timeouts use
`AbortController` for compatibility with older supported browsers.

Both `/continue-battle` forms now reply in the invoking channel. There was no
technical requirement for private delivery. Picker and pagination IDs bind the
list to its requester, including Discord's component-length limit. A different
trainer receives a private explanation; battle access/action authority remains
in the service.

## Evidence

- Full backend suite: **863 tests / 30 suites passed**. Covers command delivery,
  public picker ownership, callback outcomes, state/cookie clearing, same-origin
  redirects, nested hosting paths and Discord token/user-response failures.
- Full web suite: **105 tests / 23 suites passed**. Includes ten auth recovery
  tests through actual HTTP helpers, stale-response/StrictMode behavior,
  retained battle queries, retry/sign-out behavior, unknown errors and auth
  requests without `AbortSignal.timeout`.
- Production TypeScript/Vite build, scoped JavaScript ESLint and `git diff
  --check` passed.
- In-app browser: invalid-state screen at 375×667; missing-cookie screen at
  320×667; Discord failure at 1158×763. No horizontal overflow at these widths;
  primary buttons measured over 44px tall. Cancellation, session failure and
  generic fallback showed their intended text/actions. Back to battles restored
  the existing authenticated list without changing the user's session.
- Independent source/test review found a browser API compatibility issue; it
  was fixed and checked. No actionable findings remained. This was a focused
  correctness review, not a new full publishing review receipt.

The browser checked client screens against the running dev server. The backend
was not restarted, and no real Discord messages, OAuth authorizations, cookie
settings or battle writes were performed. Verify those paths after restarting
the bot/API, including public picker delivery and a cancelled/expired callback.
Physical-device cookie policies remain unverified. Set matching `WEB_BASE_PATH`
for backend and static builds when hosting below `/`.
Deploy the updated API before the static client; the client's JSON sign-in
initiation requires it, while older clients retain direct redirect support.

Errors owned by Discord before it redirects back (such as rejected application
configuration), and browser TLS/navigation failures, remain on those external
screens. The app can show a recovery screen once its own page/API is reachable;
this work does not replace provider or browser security pages.

## Publishing check — 2026-10-23

The user accepted the local changes. Publishing checks repeated the full
backend/web suites, production build and scoped lint. All 71 relative links
in the six touched guides/records resolved.

Full Compound Engineering review (`20261023-205434-9e1b634f`) completed all nine
local lenses. It confirmed one concurrency issue: clearing the sign-in lock
immediately after starting navigation allowed another request to replace the
OAuth state cookie. The fix keeps the control disabled through navigation and
unlocks it on a cached page return. The new hook regression failed before the
fix and passed afterward. A focused follow-up confirmed the final correction with no introduced issue;
the original full receipt remains an honest pre-fix record. No different-provider
review ran; a local adversarial pass covered that lens.
