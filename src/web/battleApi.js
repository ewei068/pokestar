const express = require("express");
const cors = require("cors");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const {
  OAUTH_STATE_LIFETIME_MS,
  newState,
  encodeState,
  validState,
  authorizationUrl,
  exchangeDiscordCode,
  DiscordOAuthError,
} = require("./discordOAuth");
const { SESSION_LIFETIME_MS } = require("./sessionStore");
const { logger } = require("../log");

const setCookie = (response, name, value, maxAgeMs, secure) => {
  response.cookie(name, value, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: maxAgeMs,
    secure,
  });
};

const asyncRoute = (handler) => (request, response, next) => {
  Promise.resolve(handler(request, response, next)).catch(next);
};

const validAction = (action) => {
  if (!action || typeof action !== "object" || Array.isArray(action)) return false;
  if (action.action === "skipTurn") return Object.keys(action).length === 1;
  return action.action === "useMove" &&
    typeof action.moveId === "string" && action.moveId.length <= 80 &&
    typeof action.targetPokemonId === "string" &&
    action.targetPokemonId.length <= 120 &&
    Object.keys(action).length === 3;
};

/**
 * @param {object} options
 * @param {object} options.battleService Browser-projected service
 * @param {object} options.sessionStore Persisted, opaque HTTP sessions
 * @param {string} options.siteOrigin Static app origin
 * @param {string=} options.sitePath Static app base path
 * @param {string} options.clientId Discord OAuth client ID
 * @param {string} options.clientSecret Discord OAuth client secret
 * @param {string} options.redirectUri Registered Discord callback URI
 * @param {Function=} options.exchangeCode Injectable Discord exchange
 * @param {object=} options.catalog Display-only Pokémon and move metadata
 */
const createBattleApi = ({
  battleService,
  sessionStore,
  siteOrigin,
  sitePath = "/",
  clientId,
  clientSecret,
  redirectUri,
  exchangeCode = exchangeDiscordCode,
  catalog = null,
}) => {
  const router = express.Router();
  const siteHome = new URL(sitePath, siteOrigin);
  if (siteHome.origin !== new URL(siteOrigin).origin) throw new Error("Invalid web site base path");
  const secureCookies = new URL(redirectUri).protocol === "https:";
  const sessionCookie = secureCookies ? "__Host-pokestar_session" : "pokestar_session";
  const stateCookie = secureCookies ? "__Host-pokestar_oauth_state" : "pokestar_oauth_state";
  const signInError = (response, code, returnTo = siteHome.pathname) => {
    const destination = new URL(returnTo, siteOrigin);
    destination.searchParams.set("authError", code);
    response.redirect(destination.toString());
  };

  router.use(cors({ origin: siteOrigin, credentials: true }));
  router.use(compression());
  router.use(cookieParser());
  router.use((request, response, next) => {
    response.set("Cache-Control", "no-store");
    next();
  });

  if (catalog) {
    router.get("/catalog", (request, response) => {
      response.json(catalog);
    });
  }

  router.get("/auth/discord/login", (request, response) => {
    const state = newState(request.query.returnTo ?? siteHome.pathname);
    setCookie(response, stateCookie, encodeState(state), OAUTH_STATE_LIFETIME_MS, secureCookies);
    const url = authorizationUrl({ clientId, redirectUri, state: state.nonce });
    if (request.accepts(["html", "json"]) === "json") response.json({ authorizationUrl: url });
    else response.redirect(url);
  });

  router.get("/auth/discord/callback", asyncRoute(async (request, response) => {
    const returnTo = validState(request.cookies[stateCookie], request.query.state);
    setCookie(response, stateCookie, "", 0, secureCookies);
    if (!returnTo) {
      signInError(response, "invalid_state");
      return;
    }
    if (request.query.error !== undefined) {
      signInError(response, request.query.error === "access_denied" ? "cancelled" : "discord_unavailable", returnTo);
      return;
    }
    if (typeof request.query.code !== "string" || !request.query.code) {
      signInError(response, "invalid_callback", returnTo);
      return;
    }
    let user;
    try {
      user = await exchangeCode({ code: request.query.code, clientId, clientSecret, redirectUri });
    } catch (error) {
      logger.error("Discord sign-in failed", error);
      signInError(response, error instanceof DiscordOAuthError ? error.code : "discord_unavailable", returnTo);
      return;
    }
    let session;
    try {
      session = await sessionStore.create(user.id);
    } catch (error) {
      logger.error("Web sign-in session creation failed", error);
      signInError(response, "session_failed", returnTo);
      return;
    }
    setCookie(response, sessionCookie, session.token, SESSION_LIFETIME_MS, secureCookies);
    const destination = new URL(returnTo, siteOrigin);
    destination.searchParams.delete("authError");
    destination.searchParams.set("authComplete", "1");
    response.redirect(destination.toString());
  }));

  const requireSession = asyncRoute(async (request, response, next) => {
    const session = await sessionStore.get(request.cookies[sessionCookie]);
    if (!session) {
      response.status(401).json({ error: "login_required" });
      return;
    }
    request.discordUserId = session.userId;
    next();
  });
  const requireSiteOrigin = (request, response, next) => {
    if (request.get("Origin") !== siteOrigin) {
      response.status(403).json({ error: "invalid_origin" });
      return;
    }
    next();
  };

  router.get("/me", requireSession, (request, response) => {
    response.json({ discordUserId: request.discordUserId });
  });
  router.post("/auth/logout", requireSiteOrigin, requireSession,
    asyncRoute(async (request, response) => {
      await sessionStore.delete(request.cookies[sessionCookie]);
      setCookie(response, sessionCookie, "", 0, secureCookies);
      response.status(204).end();
    }));

  router.get("/battles", requireSession, asyncRoute(async (request, response) => {
    const battles = await battleService.listActive(request.discordUserId);
    response.json({ battles });
  }));
  router.get("/battles/:battleId", requireSession,
    asyncRoute(async (request, response) => {
      const { after } = request.query;
      if (after !== undefined &&
          (typeof after !== "string" || after.length > 512)) {
        response.status(400).json({ error: "invalid_state_id" });
        return;
      }
      const result = await battleService.get({
        battleId: request.params.battleId,
        userId: request.discordUserId,
        afterStateId: after ?? null,
      });
      if (result.unchanged) response.status(204).end();
      else response.status(result.found ? 200 : 404).json(result);
    }));
  router.post("/battles/:battleId/actions", requireSiteOrigin, requireSession,
    asyncRoute(async (request, response) => {
      const { expectedRevision, requestId, action } = request.body || {};
      if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0 ||
          typeof requestId !== "string" || requestId.length < 1 ||
          requestId.length > 128 || !validAction(action)) {
        response.status(400).json({ error: "invalid_action_request" });
        return;
      }
      const result = await battleService.act({
        battleId: request.params.battleId,
        userId: request.discordUserId,
        expectedRevision,
        requestId,
        action,
      });
      let status = 409;
      if (result.reason === "battle_not_found") status = 404;
      else if (result.accepted || result.reason === "stale_revision") status = 200;
      response.status(status).json(result);
    }));

  router.use((error, request, response, next) => {
    logger.error("Web battle API request failed", error);
    if (response.headersSent) {
      next(error);
      return;
    }
    if (request.path === "/auth/discord/callback" ||
        (request.path === "/auth/discord/login" && request.accepts(["html", "json"]) !== "json")) {
      signInError(response, "login_unavailable");
      return;
    }
    response.status(500).json({ error: "internal_error" });
  });
  return router;
};

module.exports = { createBattleApi };
