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
  assert.ok(view.getByRole("button", { name: /^Inspect Pikachu/ }) === tile);
  assert.ok(view.getByRole("button", { name: "Manage" }) === manage);
  await act(async () => finish(json({ pokemon: { ...pokemon, stats: [10,20,30,40,50,60], ivs: [], evs: [],
    nature: { name: "Hardy", raisedStat: null, loweredStat: null }, moves: [], ability: null, heldItem: null, exp: null } })));
  await waitFor(() => assert.ok(view.queryByText("Loading details…") === null));
  assert.ok(view.getByRole("heading", { name: "Pikachu" }) === identity);
  assert.ok(view.getByRole("table") === table);
  assert.ok(view.getByRole("button", { name: /^Inspect Pikachu/ }) === tile);
});

it("returns from training to the same collection controls and inspection", async () => {
  dom.reconfigure({ url: "https://example.test/?campaign=friend#pokemon" });
  dom.window.scrollTo = () => {};
  const detail = { ...pokemon, stats: [10,20,30,40,50,60], ivs: [31,31,31,31,31,31], evs: [0,0,0,0,0,0],
    nature: { name: "Hardy", raisedStat: null, loweredStat: null }, moves: [], ability: null,
    heldItem: null, exp: { current: 10, required: 100 } };
  globalThis.fetch = async (url, init) => {
    if (String(url).endsWith("/build")) return json({ pokemon: { ...detail, nature: { ...detail.nature, id: "0" }, heldItemId: null },
      natures: [{ id: "0", name: "Hardy", raisedStat: null, loweredStat: null, stats: detail.stats }], heldItems: [], mintQuantity: 0, mintCost: 1 });
    if (String(url).includes("/training")) return json({ pokemon: detail, locations: [
      { id: "0", name: "Home", emoji: "🏠", level: 0, owned: true, nextGains: { exp: 30, evs: [0,0,0,0,0,0] }, canTrain: true },
    ] });
    if (String(url).includes("/pokemon/") || (init?.body && JSON.parse(String(init.body)).kind === "inspect")) return json({ pokemon: detail });
    if (String(url).includes("/collection") || init?.method === "POST") return json({ items: [pokemon], page: 1, pageSize: 24, total: 1, totalPages: 1 });
    return json({ party: { rows: 1, cols: 1, capacity: 1, slots: [null], targets: { new: [{ kind: "add" }] } } });
  };
  const view = render(createElement(PlayerProvider, { userId: "alice", trainer: null, onAccountChanged() {}, children: createElement(TestFeature) }));
  fireEvent.click(await view.findByRole("button", { name: /^Inspect Pikachu/ }));
  await waitFor(() => assert.ok(view.queryByText("Loading details…") === null));
  const search = view.getByRole("textbox", { name: "Search Pokémon" });
  fireEvent.change(search, { target: { value: "Pika" } });
  await new Promise(resolve => setTimeout(resolve, 400));
  fireEvent.change(view.getByLabelText("Sort Pokémon"), { target: { value: "cp" } });
  fireEvent.change(view.getByLabelText("Tile labels"), { target: { value: "iv" } });
  fireEvent.click(view.getByRole("button", { name: "Moves" }));
  const tile = view.getByRole("button", { name: /^Inspect Pikachu/ });
  await waitFor(() => assert.equal((view.getByRole("button", { name: "Train" }) as HTMLButtonElement).disabled, false));
  fireEvent.click(view.getByRole("button", { name: "Train" }));
  assert.ok(await view.findByRole("heading", { name: "Train" }));
  assert.equal(new URL(dom.window.location.href).searchParams.get("owned"), "one");
  assert.equal(new URL(dom.window.location.href).searchParams.get("upgrade"), "train");
  assert.equal(view.queryByRole("textbox", { name: "Search Pokémon" }), null);
  assert.equal(tile.isConnected, true);
  const historyLength = window.history.length;
  const returnState = window.history.state.pokemonUpgradeFrom;
  fireEvent.click(view.getByRole("tab", { name: "Item & nature" }));
  assert.ok(await view.findByRole("heading", { name: "Item & nature" }));
  assert.equal(new URL(window.location.href).searchParams.get("upgrade"), "build");
  assert.equal(window.history.length, historyLength);
  assert.equal(window.history.state.pokemonUpgradeFrom, returnState);
  assert.equal(view.queryByRole("button", { name: "Train" }), null);
  assert.ok(view.getByRole("tab", { name: "Train" }));
  fireEvent.click(view.getByRole("button", { name: "‹ Pokémon" }));
  await waitFor(() => assert.ok(view.getByRole("textbox", { name: "Search Pokémon" })));
  assert.ok(view.getByRole("textbox", { name: "Search Pokémon" }) === search);
  assert.equal((search as HTMLInputElement).value, "Pika");
  assert.equal((view.getByLabelText("Sort Pokémon") as HTMLSelectElement).value, "cp");
  assert.equal((view.getByLabelText("Tile labels") as HTMLSelectElement).value, "iv");
  assert.equal(view.getByRole("button", { name: "Moves" }).getAttribute("aria-pressed"), "true");
  assert.equal(new URL(dom.window.location.href).searchParams.get("upgrade"), null);
  assert.equal(new URL(dom.window.location.href).searchParams.get("campaign"), "friend");
});
