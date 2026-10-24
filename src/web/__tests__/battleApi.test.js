const express = require("express");
const { createBattleApi } = require("../battleApi");
const { WebSessionStore, SESSION_LIFETIME_MS } = require("../sessionStore");
const { DiscordOAuthError, OAUTH_STATE_LIFETIME_MS } = require("../discordOAuth");

const siteOrigin = "http://localhost:5173";
const apiOrigin = "http://localhost:3000";
const redirectUri = `${apiOrigin}/api/auth/discord/callback`;

const makeSessionStore = () => {
  const sessions = new Map();
  return new WebSessionStore({
    insertOne: async (session) => { sessions.set(session._id, session); },
    findOne: async ({ _id }) => sessions.get(_id) || null,
    deleteOne: async ({ _id }) => { sessions.delete(_id); },
  });
};

const startApi = async ({ sitePath = "/", redirectUri: callbackUri = redirectUri } = {}) => {
  const battleService = {
    listActive: jest.fn().mockResolvedValue([{ battleId: "battle-1", revision: 1 }]),
    get: jest.fn().mockResolvedValue({ found: true, revision: 1 }),
    act: jest.fn().mockResolvedValue({ accepted: true, revision: 2 }),
  };
  const exchangeCode = jest.fn().mockResolvedValue({ id: "123456789", username: "Player" });
  const sessionStore = makeSessionStore();
  const app = express();
  app.use(express.json());
  app.use("/api", createBattleApi({
    battleService,
    sessionStore,
    siteOrigin,
    sitePath,
    clientId: "client-id",
    clientSecret: "private-secret",
    redirectUri: callbackUri,
    exchangeCode,
    catalog: {
      rulesetVersion: 2,
      species: { sample: { description: "x".repeat(2000) } },
      moves: {}, effects: {}, abilities: {}, heldItems: {},
    },
  }));
  const server = await new Promise((resolve) => {
    const listener = app.listen(0, () => { resolve(listener); });
  });
  const url = `http://localhost:${server.address().port}`;
  return { server, url, battleService, exchangeCode, sessionStore };
};

const cookieFrom = (response, name) => {
  const match = response.headers.get("set-cookie")?.match(new RegExp(`${name}=([^;,]*)`));
  return match ? `${name}=${match[1]}` : null;
};

const beginLogin = async (url, returnTo = "/?battle=battle-1") => {
  const response = await fetch(`${url}/api/auth/discord/login?returnTo=${encodeURIComponent(returnTo)}`, { redirect: "manual" });
  return { state: new URL(response.headers.get("location")).searchParams.get("state"),
    cookie: cookieFrom(response, "pokestar_oauth_state") };
};

const login = async (url, { secure = false } = {}) => {
  const start = await fetch(`${url}/api/auth/discord/login?returnTo=%2Fbattle%3Fid%3Dbattle-1`, {
    redirect: "manual",
  });
  const authorization = new URL(start.headers.get("location"));
  const prefix = secure ? "__Host-" : "";
  const stateCookie = cookieFrom(start, `${prefix}pokestar_oauth_state`);
  const callback = await fetch(
    `${url}/api/auth/discord/callback?state=${authorization.searchParams.get("state")}&code=auth-code`,
    { redirect: "manual", headers: { Cookie: stateCookie } },
  );
  return { authorization, start, callback, sessionCookie: cookieFrom(callback, `${prefix}pokestar_session`) };
};

const expectCookie = (response, name, maxAgeMs, secure) => {
  const cookie = response.headers.getSetCookie().find(value => value.startsWith(`${name}=`));
  expect(cookie).toBeDefined();
  expect(cookie).toContain("; Path=/");
  expect(cookie).toContain("; HttpOnly");
  expect(cookie).toContain("; SameSite=Lax");
  expect(cookie).toContain(`; Max-Age=${Math.floor(maxAgeMs / 1000)};`);
  expect(cookie.includes("; Secure")).toBe(secure);
  expect(cookie).not.toMatch(/; Domain=/i);
  const expires = cookie.match(/; Expires=([^;]+)/)[1];
  expect(Math.abs(Date.parse(expires) - Date.now() - maxAgeMs)).toBeLessThan(5000);
};

const encodeCookieValue = (cookie) => cookie.replace(/=./, value =>
  `=%${value.charCodeAt(1).toString(16)}`);

describe("web battle API", () => {
  let api;
  beforeEach(async () => { api = await startApi(); });
  afterEach(async () => {
    api.server.closeAllConnections();
    await new Promise((resolve) => { api.server.close(resolve); });
  });

  it.each([false, true])("preserves cookie flags, lifetimes and clearing (secure: %s)", async (secure) => {
    const configured = await startApi({
      redirectUri: secure ? "https://api.example/api/auth/discord/callback" : redirectUri,
    });
    try {
      const { start, callback, sessionCookie } = await login(configured.url, { secure });
      const prefix = secure ? "__Host-" : "";
      expect(sessionCookie).toMatch(new RegExp(`^${prefix}pokestar_session=`));
      expectCookie(start, `${prefix}pokestar_oauth_state`, OAUTH_STATE_LIFETIME_MS, secure);
      expectCookie(callback, `${prefix}pokestar_oauth_state`, 0, secure);
      expectCookie(callback, `${prefix}pokestar_session`, SESSION_LIFETIME_MS, secure);
      const logout = await fetch(`${configured.url}/api/auth/logout`, {
        method: "POST",
        headers: { Origin: siteOrigin, Cookie: sessionCookie },
      });
      expect(logout.status).toBe(204);
      expectCookie(logout, `${prefix}pokestar_session`, 0, secure);
      const me = await fetch(`${configured.url}/api/me`, { headers: { Cookie: sessionCookie } });
      expect(me.status).toBe(401);
    } finally {
      configured.server.closeAllConnections();
      await new Promise(resolve => { configured.server.close(resolve); });
    }
  });

  it("decodes encoded OAuth and session cookies among unrelated cookies", async () => {
    const { state, cookie } = await beginLogin(api.url);
    const callback = await fetch(`${api.url}/api/auth/discord/callback?state=${state}&code=auth-code`, {
      redirect: "manual",
      headers: { Cookie: `unrelated=value; ${encodeCookieValue(cookie)}; ignored=other` },
    });
    const sessionCookie = cookieFrom(callback, "pokestar_session");
    expect(sessionCookie).toBeTruthy();
    const me = await fetch(`${api.url}/api/me`, {
      headers: { Cookie: `unrelated=value; ${encodeCookieValue(sessionCookie)}` },
    });
    expect(me.status).toBe(200);
    expect(await me.json()).toEqual({ discordUserId: "123456789" });
  });

  it.each(["%E0%A4%A", "j:%7B%22id%22%3A%22attacker%22%7D", "j:%5B%22attacker%22%5D", "j:null", "j:42"])(
    "rejects malformed or JSON cookie values without throwing: %s", async (value) => {
      const me = await fetch(`${api.url}/api/me`, {
        headers: { Cookie: `pokestar_session=${value}` },
      });
      expect(me.status).toBe(401);
      const callback = await fetch(`${api.url}/api/auth/discord/callback?state=forged&code=code`, {
        redirect: "manual",
        headers: { Cookie: `pokestar_oauth_state=${value}` },
      });
      expect(new URL(callback.headers.get("location")).searchParams.get("authError")).toBe("invalid_state");
      expect(api.exchangeCode).not.toHaveBeenCalled();
    },
  );

  it("uses Discord OAuth and a persisted opaque session for battle routes", async () => {
    const unauthenticated = await fetch(`${api.url}/api/battles`);
    expect(unauthenticated.status).toBe(401);
    const catalog = await fetch(`${api.url}/api/catalog`, {
      headers: { "Accept-Encoding": "gzip" },
    });
    expect(catalog.status).toBe(200);
    expect(catalog.headers.get("cache-control")).toBe("no-store");
    expect(catalog.headers.get("content-encoding")).toBe("gzip");
    expect((await catalog.json()).rulesetVersion).toBe(2);

    const { authorization, callback, sessionCookie } = await login(api.url);
    expect(authorization.origin).toBe("https://discord.com");
    expect(authorization.searchParams.get("scope")).toBe("identify");
    expect(callback.status).toBe(302);
    expect(callback.headers.get("location")).toBe(`${siteOrigin}/battle?id=battle-1&authComplete=1`);
    expect(sessionCookie).toMatch(/^pokestar_session=/);
    expect(api.exchangeCode).toHaveBeenCalledWith(expect.objectContaining({
      code: "auth-code", clientSecret: "private-secret", redirectUri,
    }));

    const me = await fetch(`${api.url}/api/me`, { headers: { Cookie: sessionCookie } });
    expect(await me.json()).toEqual({ discordUserId: "123456789" });
    const list = await fetch(`${api.url}/api/battles`, { headers: { Cookie: sessionCookie } });
    expect((await list.json()).battles).toHaveLength(1);
    expect(api.battleService.listActive).toHaveBeenCalledWith("123456789");

    const read = await fetch(`${api.url}/api/battles/battle-1?after=known-state`, {
      headers: { Cookie: sessionCookie },
    });
    expect(read.status).toBe(200);
    expect(api.battleService.get).toHaveBeenCalledWith({
      battleId: "battle-1", userId: "123456789", afterStateId: "known-state",
    });
    api.battleService.get.mockResolvedValueOnce({ found: true, unchanged: true });
    const unchanged = await fetch(`${api.url}/api/battles/battle-1?after=known-state`, {
      headers: { Cookie: sessionCookie },
    });
    expect(unchanged.status).toBe(204);
    expect(await unchanged.text()).toBe("");

    const action = await fetch(`${api.url}/api/battles/battle-1/actions`, {
      method: "POST",
      headers: {
        Cookie: sessionCookie,
        Origin: siteOrigin,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "forged-user",
        expectedRevision: 1,
        requestId: "request-1",
        action: { action: "skipTurn" },
      }),
    });
    expect(action.status).toBe(200);
    expect(api.battleService.act).toHaveBeenCalledWith({
      battleId: "battle-1",
      userId: "123456789",
      expectedRevision: 1,
      requestId: "request-1",
      action: { action: "skipTurn" },
    });
  });

  it("starts sign-in without navigating away when JSON is requested", async () => {
    const response = await fetch(`${api.url}/api/auth/discord/login?returnTo=%2F%3Fbattle%3Dbattle-1`,
      { headers: { Accept: "application/json" } });
    const { authorizationUrl } = await response.json();
    expect(new URL(authorizationUrl).origin).toBe("https://discord.com");
    expect(cookieFrom(response, "pokestar_oauth_state")).toBeTruthy();
    expect(api.exchangeCode).not.toHaveBeenCalled();
  });

  it("keeps missing-state recovery on the configured app base path", async () => {
    const nested = await startApi({ sitePath: "/pokestar/" });
    try {
      const response = await fetch(`${nested.url}/api/auth/discord/callback?code=code`, { redirect: "manual" });
      expect(response.headers.get("location")).toBe(`${siteOrigin}/pokestar/?authError=invalid_state`);
    } finally {
      nested.server.closeAllConnections();
      await new Promise(resolve => { nested.server.close(resolve); });
    }
  });

  it.each([
    ["error=access_denied", "cancelled"],
    ["error=server_error&error_description=private-secret", "discord_unavailable"],
    ["error=unknown&error_uri=https://attacker.example", "discord_unavailable"],
    ["code=", "invalid_callback"],
    ["code=one&code=two", "invalid_callback"],
  ])("redirects callback failure %s to a recoverable sign-in screen", async (query, reason) => {
    const { state, cookie } = await beginLogin(api.url);
    const response = await fetch(`${api.url}/api/auth/discord/callback?state=${state}&${query}`,
      { redirect: "manual", headers: { Cookie: cookie } });
    const destination = new URL(response.headers.get("location"));
    expect(response.status).toBe(302);
    expect(destination.origin).toBe(siteOrigin);
    expect(destination.searchParams.get("authError")).toBe(reason);
    expect(destination.searchParams.get("battle")).toBe("battle-1");
    expect(destination.href).not.toContain("private-secret");
    expect(destination.href).not.toContain("attacker.example");
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(cookieFrom(response, "pokestar_session")).toBeNull();
    expect(api.exchangeCode).not.toHaveBeenCalled();
  });

  it.each([false, true])("rejects mismatched or expired state before trusting cancellation (expired: %s)", async (expired) => {
    const { state, cookie } = await beginLogin(api.url);
    let callbackCookie = cookie;
    if (expired) {
      const stored = JSON.parse(Buffer.from(cookie.split("=")[1], "base64url").toString());
      stored.createdAt = Date.now() - OAUTH_STATE_LIFETIME_MS - 1000;
      callbackCookie = `pokestar_oauth_state=${Buffer.from(JSON.stringify(stored)).toString("base64url")}`;
    }
    const response = await fetch(`${api.url}/api/auth/discord/callback?state=${expired ? state : "wrong"}&error=access_denied`,
      { redirect: "manual", headers: { Cookie: callbackCookie } });
    expect(new URL(response.headers.get("location")).searchParams.get("authError")).toBe("invalid_state");
    expect(api.exchangeCode).not.toHaveBeenCalled();
  });

  it.each(["code_expired", "discord_unavailable", "session_failed"])("handles %s without exposing an internal error", async (reason) => {
    if (reason === "session_failed") jest.spyOn(api.sessionStore, "create").mockRejectedValue(new Error("private-secret"));
    else api.exchangeCode.mockRejectedValue(reason === "code_expired"
      ? new DiscordOAuthError(reason, "private-secret") : new Error("private-secret"));
    const { state, cookie } = await beginLogin(api.url);
    const response = await fetch(`${api.url}/api/auth/discord/callback?state=${state}&code=secret-code`,
      { redirect: "manual", headers: { Cookie: cookie } });
    const destination = new URL(response.headers.get("location"));
    expect(destination.searchParams.get("authError")).toBe(reason);
    expect(destination.searchParams.get("battle")).toBe("battle-1");
    expect(destination.href).not.toMatch(/private-secret|secret-code/);
    expect(cookieFrom(response, "pokestar_session")).toBeNull();
  });

  it.each(["//attacker.example", "/\\attacker.example", "/\n/attacker.example"])("keeps retry and success redirects on the site for %j", async (returnTo) => {
    const { state, cookie } = await beginLogin(api.url, returnTo);
    const response = await fetch(`${api.url}/api/auth/discord/callback?state=${state}&code=valid-code`,
      { redirect: "manual", headers: { Cookie: cookie } });
    expect(new URL(response.headers.get("location")).origin).toBe(siteOrigin);
  });

  it("rejects invalid OAuth state and cross-origin or malformed actions", async () => {
    const { sessionCookie } = await login(api.url);
    const badCallback = await fetch(`${api.url}/api/auth/discord/callback?state=forged&code=code`, {
      redirect: "manual",
    });
    expect(badCallback.status).toBe(302);
    expect(new URL(badCallback.headers.get("location")).searchParams.get("authError")).toBe("invalid_state");

    const request = (origin, body) => fetch(`${api.url}/api/battles/battle-1/actions`, {
      method: "POST",
      headers: {
        Cookie: sessionCookie,
        Origin: origin,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    expect((await request("https://attacker.example", {
      expectedRevision: 1, requestId: "request-2", action: { action: "skipTurn" },
    })).status).toBe(403);
    expect((await request(siteOrigin, {
      expectedRevision: 1, requestId: "request-3", action: { action: "useMove" },
    })).status).toBe(400);
    expect(api.battleService.act).not.toHaveBeenCalled();
  });
});
