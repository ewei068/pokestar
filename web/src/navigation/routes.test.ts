import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readRoute, routeHref } from "./routes";
import { loginReturnTo } from "../auth/loginState";

describe("site routes", () => {
  it("defaults to Play and keeps legacy direct battle links", () => {
    assert.deepEqual(readRoute(new URL("https://example.test/pokestar/")), { page: "play", battleId: null });
    assert.deepEqual(readRoute(new URL("https://example.test/pokestar/?battle=abc")), { page: "play", battleId: "abc" });
    assert.deepEqual(readRoute(new URL("https://example.test/pokestar/#unknown")), { page: "play", battleId: null });
  });
  it("gives the selected tab precedence over an old battle query", () => {
    assert.deepEqual(readRoute(new URL("https://example.test/?battle=abc#rewards")), { page: "rewards", battleId: null });
  });
  it("preserves the hosting path and unrelated query while removing battle selection for tabs", () => {
    const url = new URL("https://example.test/pokestar/?battle=abc&campaign=friend#play");
    assert.equal(routeHref(url, { page: "pokemon", battleId: null }), "/pokestar/?campaign=friend#pokemon");
    assert.equal(routeHref(url, { page: "play", battleId: "a b" }), "/pokestar/?battle=a+b&campaign=friend#play");
  });
  it("preserves the selected destination through sign-in on a hosted path", () => {
    assert.equal(loginReturnTo("/pokestar/", "?battle=abc&authComplete=1", "#play"), "/pokestar/?battle=abc#play");
    assert.equal(loginReturnTo("/pokestar/", "?authError=cancelled", "#rewards"), "/pokestar/#rewards");
  });
});
