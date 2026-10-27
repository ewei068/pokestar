const express = require("express");
const { gzipSync } = require("node:zlib");

describe("HTTP JSON parser boundary", () => {
  let server;
  let url;
  let handler;
  beforeEach(async () => {
    const app = express();
    app.use(express.json());
    handler = jest.fn((request, response) => response.json(request.body));
    app.post("/api/battles/battle-1/actions", handler);
    app.use((error, request, response, next) => {
      if (response.headersSent) return next(error);
      response.status(error.status || 500).json({ error: error.type });
    });
    server = await new Promise(resolve => {
      const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    url = `http://127.0.0.1:${server.address().port}/api/battles/battle-1/actions`;
  });
  afterEach(async () => {
    server.closeAllConnections();
    await new Promise(resolve => { server.close(resolve); });
  });

  it("accepts compressed JSON without changing the action payload", async () => {
    const action = { expectedRevision: 1, requestId: "one", action: { action: "skipTurn" } };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Encoding": "gzip" },
      body: gzipSync(JSON.stringify(action)),
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(action);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it.each([
    ["malformed JSON", "{", {}, 400],
    ["oversized JSON", JSON.stringify({ data: "x".repeat(110000) }), {}, 413],
    ["oversized inflated JSON", gzipSync(JSON.stringify({ data: "x".repeat(110000) })),
      { "Content-Encoding": "gzip" }, 413],
    ["invalid gzip", Buffer.from("not gzip"), { "Content-Encoding": "gzip" }, 400],
  ])("rejects %s before route work", async (name, body, headers, status) => {
    const response = await fetch(url, {
      method: "POST", headers: { "Content-Type": "application/json", ...headers }, body,
    });
    expect(response.status).toBe(status);
    expect(handler).not.toHaveBeenCalled();
  });
});
