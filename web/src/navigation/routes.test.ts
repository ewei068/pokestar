import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bagHref, readRoute, routeHref } from "./routes";
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
  it("keeps a bag item on Bag and drops it on every other page", () => {
    const url = new URL("https://example.test/pokestar/?item=0&campaign=friend#bag");
    assert.equal(routeHref(url, { page: "bag", battleId: null }), "/pokestar/?item=0&campaign=friend#bag");
    assert.equal(routeHref(url, { page: "play", battleId: null }), "/pokestar/?campaign=friend#play");
    assert.equal(routeHref(url, { page: "pokemon", battleId: null }), "/pokestar/?campaign=friend#pokemon");
    assert.equal(bagHref(new URL("https://example.test/pokestar/?campaign=friend#play"), "0"), "/pokestar/?campaign=friend&item=0#bag");
    assert.equal(bagHref(url, null), "/pokestar/?campaign=friend#bag");
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
it("keeps encounter context through party editing and battle links", async () => {
  const { readPlayRoute, playHref } = await import("./routes");
  const current = new URL("https://example.test/pokestar/?npc=blue&difficulty=hard&playView=trainers#pokemon");
  const returning = routeHref(current, { page: "play", battleId: null });
  assert.deepEqual(readPlayRoute(new URL(returning, current)), { view: "trainers", npcId: "blue", difficulty: "hard", dungeonId: null, floor: null });
  assert.equal(playHref(current, { view: "continue", npcId: "blue", difficulty: "hard", dungeonId: "mindTemple", floor: 7, battleId: "one" }),
    "/pokestar/?playView=continue&battle=one#play");
  assert.deepEqual(readPlayRoute(new URL("https://example.test/?playView=dungeons&npc=blue&difficulty=easy&floor=8&dungeon=mindTemple")),
    { view: "dungeons", npcId: null, difficulty: "easy", dungeonId: "mindTemple", floor: null });
  assert.deepEqual(readPlayRoute(new URL("https://example.test/?playView=dungeons&npc=blue&difficulty=easy")),
    { view: "dungeons", npcId: null, difficulty: null, dungeonId: null, floor: null });
  assert.equal(readPlayRoute(new URL("https://example.test/?playView=later&dungeon=missing&floor=nope")).view, null);
  assert.equal(playHref(current, { view: "tower", npcId: "blue", difficulty: "hard", dungeonId: "mindTemple", floor: 7 }),
    "/pokestar/?playView=tower&floor=7#play");
  assert.equal(playHref(current, { view: "dungeons", npcId: "blue", difficulty: "hard", dungeonId: null, floor: 7 }),
    "/pokestar/?playView=dungeons#play");
});
