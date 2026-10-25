const express = require("express");
const { createApiRateLimits, configureHttpProxy } = require("../rateLimits");
const { createBattleApi } = require("../battleApi");

const origin = "https://play.example.com";
const action = { expectedRevision: 1, requestId: "request-1", action: { action: "skipTurn" } };

describe("API rate limits", () => {
  let server;
  let url;
  let service;
  let sessions;
  let exchangeCode;
  const start = async (limits = {}, proxy = {}) => {
    service = {
      listActive: jest.fn().mockResolvedValue([]),
      get: jest.fn().mockResolvedValue({ found: true }),
      act: jest.fn().mockResolvedValue({ accepted: true }),
    };
    sessions = {
      get: jest.fn(async (token) => ({ a: { userId: "user-a" }, a2: { userId: "user-a" }, b: { userId: "user-b" } })[token]),
      delete: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue({ token: "a" }),
    };
    exchangeCode = jest.fn().mockResolvedValue({ id: "user-a" });
    const app = express();
    configureHttpProxy(app, proxy);
    app.use(express.json());
    app.use("/api", createBattleApi({
      battleService: service, sessionStore: sessions, siteOrigin: origin,
      clientId: "client", clientSecret: "secret", redirectUri: "http://localhost/api/auth/discord/callback",
      exchangeCode, rateLimits: createApiRateLimits({ limits }),
    }));
    app.post("/vote", (request, response) => response.sendStatus(200));
    server = await new Promise((resolve) => {
      const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    url = `http://127.0.0.1:${server.address().port}`;
  };
  const request = (path, token = "a", options = {}) => fetch(`${url}/api${path}`, {
    redirect: "manual", ...options,
    headers: { Origin: origin, Cookie: `pokestar_session=${token}`, ...options.headers },
  });
  /** @param {object} [body] */
  const postAction = (body = action) => request("/battles/one/actions", "a", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  afterEach(async () => {
    if (server) {
      server.closeAllConnections();
      await new Promise(resolve => { server.close(resolve); });
    }
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("shares reads across list/detail/HEAD and sessions, isolates users, and resets", async () => {
    jest.useFakeTimers({ doNotFake: ["nextTick", "setImmediate", "clearImmediate", "setInterval", "clearInterval", "setTimeout", "clearTimeout", "queueMicrotask", "performance", "hrtime"] });
    await start({ reads: 2 });
    expect((await request("/battles")).status).toBe(200);
    expect((await request("/battles/one", "a2", { method: "HEAD" })).status).toBe(200);
    const denied = await request("/battles/another", "a2");
    expect(denied.status).toBe(429);
    expect(await denied.json()).toEqual({ error: "rate_limited" });
    expect(denied.headers.get("access-control-allow-origin")).toBe(origin);
    expect(denied.headers.get("access-control-expose-headers")).toContain("Retry-After");
    expect(denied.headers.get("cache-control")).toBe("no-store");
    expect(Number(denied.headers.get("retry-after"))).toBeGreaterThan(0);
    expect(denied.headers.get("ratelimit")).toContain("reads");
    expect(denied.headers.get("x-ratelimit-limit")).toBeNull();
    expect(service.get).toHaveBeenCalledTimes(1);
    expect((await request("/battles", "b")).status).toBe(200);
    jest.setSystemTime(Date.now() + 60001);
    expect((await request("/battles")).status).toBe(200);
  });

  it("counts invalid actions, stops mutations, and leaves logout and reads available", async () => {
    await start({ actions: 1 });
    expect((await postAction({})).status).toBe(400);
    expect((await postAction()).status).toBe(429);
    expect(service.act).not.toHaveBeenCalled();
    expect((await request("/battles")).status).toBe(200);
    expect((await request("/auth/logout", "a", { method: "POST" })).status).toBe(204);
    expect(sessions.delete).toHaveBeenCalledTimes(1);
  });

  it("checks origin and session before consuming action quota", async () => {
    await start({ actions: 1 });
    expect((await request("/battles/one/actions", "a", { method: "POST", headers: { Origin: "https://other.example" } })).status).toBe(403);
    expect((await request("/battles/one/actions", "missing", { method: "POST" })).status).toBe(401);
    expect((await postAction()).status).toBe(200);
    expect((await postAction()).status).toBe(429);
    expect(service.act).toHaveBeenCalledTimes(1);
  });

  it("keeps login and callback independent and throttles callback before changing state", async () => {
    await start({ login: 1, callback: 1 });
    const login = await request("/auth/discord/login");
    expect(login.status).toBe(302);
    expect((await request("/auth/discord/login")).status).toBe(429);
    const state = new URL(login.headers.get("location")).searchParams.get("state");
    const cookie = login.headers.get("set-cookie").split(";")[0];
    const path = `/auth/discord/callback?state=${state}&code=valid`;
    expect((await request(path, "a", { headers: { Cookie: cookie } })).status).toBe(302);
    const denied = await request(path, "a", { headers: { Cookie: cookie } });
    expect(denied.status).toBe(429);
    expect(denied.headers.get("set-cookie")).toBeNull();
    expect(await denied.json()).toEqual({ error: "rate_limited" });
    expect(exchangeCode).toHaveBeenCalledTimes(1);
    expect(sessions.create).toHaveBeenCalledTimes(1);
  });

  it("counts failed auth against general ceiling, exempts preflight and vote, ignores forged IPs", async () => {
    // The library correctly warns about forwarded headers with trust disabled.
    jest.spyOn(console, "error").mockImplementation(() => {});
    await start({ general: 1 });
    expect((await request("/battles", "missing", { method: "OPTIONS", headers: { "Access-Control-Request-Method": "GET" } })).status).toBe(204);
    expect((await request("/battles", "missing", { headers: { "X-Forwarded-For": "192.0.2.1" } })).status).toBe(401);
    expect((await request("/battles", "a", { headers: { "X-Forwarded-For": "192.0.2.2" } })).status).toBe(429);
    expect(sessions.get).toHaveBeenCalledTimes(1);
    expect((await fetch(`${url}/vote`, { method: "POST" })).status).toBe(200);
  });

  it("groups IPv6 addresses by subnet and separates real clients behind the configured proxy", async () => {
    await start({ general: 1 }, { HTTP_HOST: "127.0.0.1", HTTP_TRUST_LOOPBACK_PROXY: "true" });
    const forwarded = address => request("/me", "a", { headers: { "X-Forwarded-For": address } });
    expect((await forwarded("2001:db8:1234:5600::1")).status).toBe(200);
    expect((await forwarded("2001:db8:1234:56ff::2")).status).toBe(429);
    expect((await forwarded("2001:db8:1234:5700::1")).status).toBe(200);
    expect((await forwarded("192.0.2.1")).status).toBe(200);
    expect((await forwarded("192.0.2.2")).status).toBe(200);
    // Additional unverified forwarded hops cannot invent a different client.
    expect((await forwarded("203.0.113.9, 192.0.2.2")).status).toBe(429);
  });
});

it("requires explicit loopback binding and trusts only the immediate loopback peer", () => {
  const app = express();
  configureHttpProxy(app, {});
  expect(app.get("trust proxy")).toBe(false);
  expect(() => configureHttpProxy(app, { HTTP_TRUST_LOOPBACK_PROXY: "yes" })).toThrow();
  expect(() => configureHttpProxy(app, { HTTP_TRUST_LOOPBACK_PROXY: "true", HTTP_HOST: "0.0.0.0" })).toThrow();
  configureHttpProxy(app, { HTTP_TRUST_LOOPBACK_PROXY: "true", HTTP_HOST: "127.0.0.1" });
  const trust = app.get("trust proxy");
  expect(trust("127.0.0.1", 0)).toBe(true);
  expect(trust("::ffff:127.0.0.1", 0)).toBe(true);
  expect(trust("::1", 0)).toBe(true);
  expect(trust("127.0.0.1", 1)).toBe(false);
  expect(trust("192.0.2.1", 0)).toBe(false);
});
