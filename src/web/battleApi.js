const express = require("express");
const cors = require("cors");
const {
  OAUTH_STATE_LIFETIME_MS,
  newState,
  encodeState,
  validState,
  authorizationUrl,
  exchangeDiscordCode,
} = require("./discordOAuth");
const { SESSION_LIFETIME_MS } = require("./sessionStore");
const { logger } = require("../log");

const cookieValue = (request, name) => {
  const cookies = request.headers.cookie?.split(";") || [];
  const entry = cookies.find((cookie) => cookie.trim().startsWith(`${name}=`));
  return entry?.trim().slice(name.length + 1) || null;
};

const setCookie = (response, name, value, maxAgeMs, secure) => {
  const parts = [
    `${name}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
  ];
  if (secure) parts.push("Secure");
  response.append("Set-Cookie", parts.join("; "));
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
  clientId,
  clientSecret,
  redirectUri,
  exchangeCode = exchangeDiscordCode,
  catalog = null,
}) => {
  const router = express.Router();
  const secureCookies = new URL(redirectUri).protocol === "https:";
  const sessionCookie = secureCookies ? "__Host-pokestar_session" : "pokestar_session";
  const stateCookie = secureCookies ? "__Host-pokestar_oauth_state" : "pokestar_oauth_state";

  router.use(cors({ origin: siteOrigin, credentials: true }));
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
    const state = newState(request.query.returnTo);
    setCookie(response, stateCookie, encodeState(state), OAUTH_STATE_LIFETIME_MS, secureCookies);
    response.redirect(authorizationUrl({ clientId, redirectUri, state: state.nonce }));
  });

  router.get("/auth/discord/callback", asyncRoute(async (request, response) => {
    const returnTo = validState(cookieValue(request, stateCookie), request.query.state);
    setCookie(response, stateCookie, "", 0, secureCookies);
    if (!returnTo || typeof request.query.code !== "string") {
      response.status(400).json({ error: "invalid_oauth_callback" });
      return;
    }
    const user = await exchangeCode({
      code: request.query.code,
      clientId,
      clientSecret,
      redirectUri,
    });
    const session = await sessionStore.create(user.id);
    setCookie(response, sessionCookie, session.token, SESSION_LIFETIME_MS, secureCookies);
    response.redirect(new URL(returnTo, siteOrigin).toString());
  }));

  const requireSession = asyncRoute(async (request, response, next) => {
    const session = await sessionStore.get(cookieValue(request, sessionCookie));
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
      await sessionStore.delete(cookieValue(request, sessionCookie));
      setCookie(response, sessionCookie, "", 0, secureCookies);
      response.status(204).end();
    }));

  router.get("/battles", requireSession, asyncRoute(async (request, response) => {
    const battles = await battleService.listActive(request.discordUserId);
    response.json({ battles });
  }));
  router.get("/battles/:battleId", requireSession,
    asyncRoute(async (request, response) => {
      const { since } = request.query;
      const sinceRevision = since === undefined ? null : Number(since);
      if (sinceRevision !== null &&
          (!Number.isSafeInteger(sinceRevision) || sinceRevision < 0)) {
        response.status(400).json({ error: "invalid_revision" });
        return;
      }
      const result = await battleService.get({
        battleId: request.params.battleId,
        userId: request.discordUserId,
        sinceRevision,
      });
      response.status(result.found ? 200 : 404).json(result);
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
    response.status(500).json({ error: "internal_error" });
  });
  return router;
};

module.exports = { createBattleApi };
