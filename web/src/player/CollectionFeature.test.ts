import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import { createElement } from "react";
import { JSDOM } from "jsdom";
import { PlayerProvider, usePlayer } from "./PlayerProvider";
import { CollectionFeature } from "./CollectionFeature";
import type { PokemonSummary } from "./types";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/#pokemon" });
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, Element: dom.window.Element })) {
  Object.defineProperty(globalThis, key, { configurable: true, value });
}
const { render, cleanup, fireEvent, waitFor, act } = await import("@testing-library/react");
function TestFeature() {
  const data = usePlayer();
  data.client.setDefaultOptions({ queries: { ...data.client.getDefaultOptions().queries, gcTime: 0 } });
  return createElement(CollectionFeature);
}
const originalFetch = globalThis.fetch;
afterEach(() => { cleanup(); globalThis.fetch = originalFetch; });
const pokemon: PokemonSummary = { id: "one", speciesId: "25", speciesName: "Pikachu", name: "Pikachu",
  level: 20, shiny: false, rarity: "Rare", types: ["Electric"], combatPower: 123, ivPercent: 90,
  inParty: false, spriteUrl: null, battleEligible: true };
const json = (body: object) => new Response(JSON.stringify({ discordUserId: "alice", ...body }), { headers: { "Content-Type": "application/json" } });

it("keeps collection, Manage and summary identity mounted during a slow inspection", async () => {
  let finish!: (response: Response) => void;
  globalThis.fetch = async (url, init) => {
    if (init?.method === "POST") return new Promise(resolve => { finish = resolve; });
    if (String(url).includes("/collection")) {
      assert.match(String(url), /sort=recent/);
      assert.match(String(url), /order=asc/);
      return json({ items: [pokemon], page: 1, pageSize: 24, total: 1, totalPages: 1 });
    }
    return json({ party: { rows: 1, cols: 1, capacity: 1, slots: [null], targets: { new: [{ kind: "add" }] } } });
  };
  const view = render(createElement(PlayerProvider, { userId: "alice", trainer: null, onAccountChanged() {}, children: createElement(TestFeature) }));
  const tile = await view.findByRole("button", { name: /^Inspect Pikachu/ });
  const manage = view.getByRole("button", { name: "Manage" });
  fireEvent.click(tile);
  await waitFor(() => assert.equal(typeof finish, "function"));
  const identity = view.getByRole("heading", { name: "Pikachu" });
  const table = view.getByRole("table");
  assert.ok(view.getByText("Loading details…"));
  assert.equal(view.getByRole("button", { name: /^Inspect Pikachu/ }), tile);
  assert.equal(view.getByRole("button", { name: "Manage" }), manage);
  await act(async () => finish(json({ pokemon: { ...pokemon, stats: [10,20,30,40,50,60], ivs: [], evs: [],
    nature: { name: "Hardy", raisedStat: null, loweredStat: null }, moves: [], ability: null, heldItem: null, exp: null } })));
  await waitFor(() => assert.equal(view.queryByText("Loading details…"), null));
  assert.equal(view.getByRole("heading", { name: "Pikachu" }), identity);
  assert.equal(view.getByRole("table"), table);
  assert.equal(view.getByRole("button", { name: /^Inspect Pikachu/ }), tile);
});
