import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bagHref, navigationHref, playHref, pokemonHref, pokemonUpgradeHref,
  readBagItem, readOwnedPokemon, readPlayRoute, readPokemonUpgrade, readRoute, routeHref } from "./routes";
import { loginReturnTo } from "../auth/loginState";

describe("site routes", () => {
  it("defaults to Play and keeps legacy direct battle links", () => {
    assert.deepEqual(readRoute(new URL("https://example.test/pokestar/")), { page: "play", battleId: null });
    assert.deepEqual(readRoute(new URL("https://example.test/pokestar/?battle=abc")), { page: "play", battleId: "abc" });
    assert.deepEqual(readRoute(new URL("https://example.test/pokestar/#unknown")), { page: "play", battleId: null });
    assert.deepEqual(readRoute(new URL("https://example.test/?battle=abc#rewards")), { page: "rewards", battleId: null });
  });

  it("builds top-level links using the destination and path only", () => {
    const url = new URL("https://example.test/pokestar/?battle=abc&campaign=friend&item=0&owned=one&upgrade=train&playView=trainers&npc=blue&difficulty=hard#play");
    for (const page of ["pokemon", "catch", "rewards", "more", "bag"] as const) {
      assert.equal(routeHref(url, { page, battleId: null }), `/pokestar/#${page}`);
      assert.equal(navigationHref(url, page), `/pokestar/#${page}`);
    }
    assert.equal(routeHref(url, { page: "play", battleId: "a b" }), "/pokestar/?battle=a+b#play");
    assert.equal(navigationHref(url, "play"), "/pokestar/?playView=trainers&npc=blue&difficulty=hard#play");
    assert.equal(navigationHref(new URL("/pokestar/?playView=trainers&npc=blue#pokemon", url), "play"), "/pokestar/#play");
  });

  it("keeps same-page owned or Bag selection while dropping stale keys", () => {
    const url = new URL("https://example.test/pokestar/?owned=one&upgrade=train&item=0&extra=x#pokemon");
    assert.equal(navigationHref(url, "pokemon"), "/pokestar/?owned=one#pokemon");
    assert.equal(pokemonHref(url, "another"), "/pokestar/?owned=another#pokemon");
    assert.equal(readOwnedPokemon(url), "one");
    assert.equal(readBagItem(url), null);
    const bag = new URL("/pokestar/?item=0&npc=blue&extra=x#bag", url);
    assert.equal(readBagItem(bag), "0");
    assert.equal(readOwnedPokemon(bag), null);
    assert.equal(navigationHref(bag, "bag"), "/pokestar/?item=0#bag");
    assert.equal(bagHref(bag, null), "/pokestar/#bag");
    assert.equal(bagHref(url, "0"), "/pokestar/?item=0#bag");
  });

  it("preserves the selected destination through sign-in on a hosted path", () => {
    assert.equal(loginReturnTo("/pokestar/", "?battle=abc&authComplete=1", "#play"), "/pokestar/?battle=abc#play");
    assert.equal(loginReturnTo("/pokestar/", "?authError=cancelled", "#rewards"), "/pokestar/#rewards");
  });
});

it("keeps upgrades inside the explicitly selected owned Pokémon on either hosting path", () => {
  for (const path of ["/", "/pokestar/"]) for (const feature of ["train", "build", "equipment", "transformation"] as const) {
    const current = new URL(`https://example.test${path}?owned=old&item=0&campaign=friend#pokemon`);
    const next = new URL(pokemonUpgradeHref(current, "one", feature), current);
    assert.deepEqual(readPokemonUpgrade(next), { pokemonId: "one", feature });
    assert.equal(next.pathname + next.search + next.hash, `${path}?owned=one&upgrade=${feature}#pokemon`);
  }
  for (const invalid of ["?upgrade=train#pokemon", "?owned=one&upgrade=nature#pokemon", "?owned=one&upgrade=train#play"]) {
    assert.equal(readPokemonUpgrade(new URL(invalid, "https://example.test/")), null);
  }
});

it("keeps only the current Play view and its own valid selection in Play and battle links", () => {
  const source = new URL("https://example.test/pokestar/?npc=blue&difficulty=hard&playView=trainers&unknown=1#play");
  const encounter = readPlayRoute(source);
  assert.equal(playHref(source, { ...encounter, battleId: "start" }), "/pokestar/?playView=trainers&npc=blue&difficulty=hard&battle=start#play");
  assert.equal(playHref(source, { ...encounter, view: "continue", dungeonId: "mindTemple", floor: 7, battleId: "one" }),
    "/pokestar/?playView=continue&battle=one#play");
  assert.equal(playHref(source, { ...encounter, view: "tower", floor: 7 }), "/pokestar/?playView=tower&floor=7#play");
  assert.equal(playHref(source, { ...encounter, view: "dungeons" }), "/pokestar/?playView=dungeons#play");
  assert.deepEqual(readPlayRoute(new URL("https://example.test/?playView=dungeons&npc=blue&difficulty=easy&floor=8&dungeon=mindTemple")),
    { view: "dungeons", npcId: null, difficulty: "easy", dungeonId: "mindTemple", floor: null });
  for (const invalid of ["0", "-7", "4.5", "9007199254740992"]) {
    assert.equal(readPlayRoute(new URL(`https://example.test/?playView=tower&floor=${invalid}`)).floor, null);
  }
  assert.equal(readPlayRoute(new URL("https://example.test/?playView=later&dungeon=missing&floor=nope")).view, null);
  assert.equal(readPlayRoute(new URL("https://example.test/?playView=dungeons&dungeon=mindTemple#bag")).view, null);
});
