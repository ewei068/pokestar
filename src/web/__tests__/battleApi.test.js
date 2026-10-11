const express = require("express");
const { createBattleApi } = require("../battleApi");
const { WebSessionStore } = require("../sessionStore");

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

const startApi = async () => {
  const battleService = {
    listActive: jest.fn().mockResolvedValue([{ battleId: "battle-1", revision: 1 }]),
    get: jest.fn().mockResolvedValue({ found: true, revision: 1 }),
    act: jest.fn().mockResolvedValue({ accepted: true, revision: 2 }),
  };
  const exchangeCode = jest.fn().mockResolvedValue({ id: "123456789", username: "Player" });
  const app = express();
  app.use(express.json());
  app.use("/api", createBattleApi({
    battleService,
    sessionStore: makeSessionStore(),
    siteOrigin,
    clientId: "client-id",
    clientSecret: "private-secret",
    redirectUri,
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
  return { server, url, battleService, exchangeCode };
};

const cookieFrom = (response, name) => {
  const match = response.headers.get("set-cookie")?.match(new RegExp(`${name}=([^;,]*)`));
  return match ? `${name}=${match[1]}` : null;
};

const login = async (url) => {
  const start = await fetch(`${url}/api/auth/discord/login?returnTo=%2Fbattle%3Fid%3Dbattle-1`, {
    redirect: "manual",
  });
  const authorization = new URL(start.headers.get("location"));
  const stateCookie = cookieFrom(start, "pokestar_oauth_state");
  const callback = await fetch(
    `${url}/api/auth/discord/callback?state=${authorization.searchParams.get("state")}&code=auth-code`,
    { redirect: "manual", headers: { Cookie: stateCookie } },
  );
  return { authorization, callback, sessionCookie: cookieFrom(callback, "pokestar_session") };
};

describe("web battle API", () => {
  let api;
  beforeEach(async () => { api = await startApi(); });
  afterEach(async () => {
    api.server.closeAllConnections();
    await new Promise((resolve) => { api.server.close(resolve); });
  });

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
    expect(callback.headers.get("location")).toBe(`${siteOrigin}/battle?id=battle-1`);
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

  it("rejects invalid OAuth state and cross-origin or malformed actions", async () => {
    const { sessionCookie } = await login(api.url);
    const badCallback = await fetch(`${api.url}/api/auth/discord/callback?state=forged&code=code`, {
      redirect: "manual",
    });
    expect(badCallback.status).toBe(400);

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
