import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import { createElement, StrictMode } from "react";
import { JSDOM } from "jsdom";
import { PlayerProvider, usePlayer } from "../player/PlayerProvider";
import type { PlayerData } from "../player/PlayerData";
import type { EquipmentSnapshot, PokemonEquipmentContext, PokemonEquipmentResult } from "../player/types";
import { usePokemonEquipment } from "./usePokemonEquipment";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/#pokemon" });
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, Element: dom.window.Element })) {
  Object.defineProperty(globalThis, key, { configurable: true, value });
}
const { render, cleanup, act, waitFor } = await import("@testing-library/react");
const originalFetch = globalThis.fetch;
afterEach(() => { cleanup(); globalThis.fetch = originalFetch; });
const snapshot: EquipmentSnapshot = { level: 4, slots: {
  primary: { modifier: "baseAtk", quality: 75 }, secondary: { modifier: "percentAtk", quality: 65 },
  substat1: { modifier: "flatHp", quality: 25 }, substat2: { modifier: "flatAtk", quality: 50 }, substat3: { modifier: "flatDef", quality: 60 },
} };
const context: PokemonEquipmentContext = {
  pokemon: { id: "one", speciesId: "25", speciesName: "Pikachu", name: "Pikachu", level: 41,
    shiny: false, rarity: "Rare", types: ["Electric"], combatPower: 123, ivPercent: 90, inParty: true,
    spriteUrl: null, battleEligible: true, stats: [10,20,30,40,50,60], ivs: [], evs: [],
    nature: { id: "0", name: "Hardy", raisedStat: null, loweredStat: null }, moves: [], ability: null,
    heldItem: null, heldItemId: null, exp: null },
  trainer: { displayName: "Alice", avatarUrl: null, level: 5, money: 5000, exp: null }, money: 5000,
  pieces: [{ id: "powerBracer", level: 4, expectedEquipment: snapshot,
    slots: Object.entries(snapshot.slots).map(([id, slot]) => ({ id, ...slot, value: 9, nextValue: 11 })),
    upgradeCost: { money: 1000, shards: 5 } }],
  materials: [{ id: "6", name: "Willpower Shard", description: "Equipment material", category: "1", categoryName: "Materials", quantity: 12, icon: "willpower-shard.png" }],
  catalog: { maxLevel: 10, moneyPerShard: 200, rerollCost: { money: 1000, shards: 5 },
    types: [{ id: "powerBracer", name: "Power Bracer", icon: "power-bracer.png", primaryStat: 1, materialId: "6",
      slots: Object.fromEntries(Object.entries(snapshot.slots).map(([id, slot]) => [id, [slot.modifier]])) }],
    slots: Object.keys(snapshot.slots).map(id => ({ id, name: id, scalesWithLevel: id === "primary" || id === "secondary" })),
    modifiers: [{ id: "baseAtk", name: "Base Atk", description: "Base Attack", type: "base", stat: 1, min: 1.5, max: 2.5 }] },
};
const json = (body: object, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const result = (warning?: string): PokemonEquipmentResult => ({ ...context, discordUserId: "alice", money: 4000,
  trainer: { ...context.trainer, money: 4000 }, materials: [{ ...context.materials[0], quantity: 7 }],
  items: [{ ...context.materials[0], quantity: 7 }], changed: true,
  change: { kind: "reroll", equipmentType: "powerBracer", slotId: "primary", previousEquipment: snapshot },
  ...(warning ? { warning } : {}) });
let data: PlayerData;
let latest: ReturnType<typeof usePokemonEquipment>;
function Probe({ pokemonId }: { pokemonId: string }) {
  data = usePlayer();
  data.client.setDefaultOptions({ queries: { ...data.client.getDefaultOptions().queries, gcTime: 0 },
    mutations: { ...data.client.getDefaultOptions().mutations, gcTime: Infinity } });
  latest = usePokemonEquipment(pokemonId);
  return createElement("div", null, createElement("output", { "data-testid": "target" }, latest.context?.pokemon.id || "unavailable"),
    latest.error ? createElement("p", { role: "alert" }, latest.error) : null);
}
const tree = (pokemonId = "one", open = true, userId = "alice") => createElement(PlayerProvider, {
  key: userId, userId, trainer: null, onAccountChanged() {},
  children: createElement(StrictMode, null, open ? createElement(Probe, { pokemonId }) : null),
});
const read = (url: string, userId = "alice", targetId = "one") => {
  if (url.endsWith("/trainer")) return json({ discordUserId: userId, trainer: context.trainer });
  if (url.endsWith("/bag")) return json({ discordUserId: userId, items: context.materials });
  const pokemon = { ...context.pokemon, id: targetId };
  return json({ discordUserId: userId, ...context, pokemon, natures: [], heldItems: [], mintQuantity: 2, mintCost: 1 });
};

it("uses the displayed piece expectation, accepts an identical paid result and blocks invalid or unaffordable choices", async () => {
  const posts: { url: string; body: unknown }[] = [];
  globalThis.fetch = async (url, options) => {
    if (options?.method === "POST") { posts.push({ url: String(url), body: JSON.parse(String(options.body)) }); return json(result()); }
    return read(String(url));
  };
  const view = render(tree()); await waitFor(() => assert.equal(latest.context?.pokemon.id, "one"));
  await act(async () => { await latest.upgrade("missing"); await latest.reroll("powerBracer", "missing"); });
  assert.equal(posts.length, 0);
  await act(async () => { await latest.reroll("powerBracer", "primary"); });
  assert.deepEqual(posts, [{ url: "/api/player/pokemon/one/equipment/reroll",
    body: { equipmentType: "powerBracer", slotId: "primary", expectedEquipment: snapshot } }]);
  assert.equal(latest.result?.changed, true);
  assert.deepEqual(latest.result?.pieces[0].expectedEquipment, snapshot);
  assert.equal(latest.context?.money, 4000);
  for (const blocked of [{ ...context, money: 0 }, { ...context, materials: [{ ...context.materials[0], quantity: 0 }] },
    { ...context, pieces: [{ ...context.pieces[0], level: 10, upgradeCost: null }] }]) {
    await act(async () => { data.client.setQueryData(data.equipment("one").queryKey, blocked); });
    await waitFor(() => assert.deepEqual(latest.context, blocked));
    await act(async () => { await latest.upgrade("powerBracer"); });
    if (blocked.money === 0 || blocked.materials[0].quantity === 0) {
      await act(async () => { await latest.reroll("powerBracer", "primary"); });
    }
  }
  assert.equal(posts.length, 1);
  view.unmount();
});

it("suppresses duplicate clicks and exposes the same pending gate to other account mutations", async () => {
  let posts = 0;
  let finish!: (response: Response) => void;
  globalThis.fetch = async (url, options) => options?.method === "POST"
    ? (posts++, new Promise(resolve => { finish = resolve; })) : read(String(url));
  render(tree()); await waitFor(() => assert.ok(latest.context));
  let first!: ReturnType<typeof latest.upgrade>;
  await act(async () => { first = latest.upgrade("powerBracer"); });
  await waitFor(() => assert.equal(latest.pending, true));
  await act(async () => { await latest.upgrade("powerBracer"); await latest.reroll("powerBracer", "primary"); });
  await assert.rejects(data.changeNature("one", "3", "0"), /interaction_pending/);
  assert.equal(posts, 1);
  await act(async () => { finish(json(result())); await first; });
  await waitFor(() => assert.equal(latest.pending, false));
});

it("a closed or retargeted feature never receives a submitted operation's old result or late error", async () => {
  let finish!: (response: Response) => void;
  globalThis.fetch = async (url, options) => options?.method === "POST" ? new Promise(resolve => { finish = resolve; })
    : read(String(url), "alice", String(url).includes("/two/") ? "two" : "one");
  const view = render(tree()); await waitFor(() => assert.ok(latest.context));
  let submitted!: ReturnType<typeof latest.upgrade>;
  await act(async () => { submitted = latest.upgrade("powerBracer"); });
  view.rerender(tree("two")); await waitFor(() => assert.equal(latest.context?.pokemon.id, "two"));
  assert.equal(latest.pending, true);
  await act(async () => { finish(json(result())); assert.equal(await submitted, undefined); });
  await waitFor(() => assert.equal(latest.pending, false));
  assert.equal(latest.result, undefined); assert.equal(latest.error, null);
  await act(async () => { submitted = latest.upgrade("powerBracer"); });
  view.rerender(tree("two", false));
  await act(async () => { finish(json({ error: "equipment_changed" }, 409)); assert.equal(await submitted, undefined); });
  view.rerender(tree("one")); await waitFor(() => assert.ok(latest.context));
  assert.equal(latest.result, undefined); assert.equal(latest.error, null);
});

it("unknown results survive reopening and a saved warning requires explicit read-only refresh", async () => {
  let posts = 0;
  let loseResponse = true;
  globalThis.fetch = async (url, options) => {
    if (options?.method === "POST") { posts++; if (loseResponse) throw new TypeError("response lost"); return json(result("Equipment saved, but quest progress is unconfirmed.")); }
    return read(String(url));
  };
  const view = render(tree()); await waitFor(() => assert.ok(latest.context));
  await act(async () => { await latest.reroll("powerBracer", "primary"); });
  await view.findByRole("alert"); assert.equal(data.needsBuildRefresh, true);
  view.rerender(tree("one", false)); view.rerender(tree());
  await waitFor(() => assert.ok(latest.context));
  await act(async () => { await latest.upgrade("powerBracer"); }); assert.equal(posts, 1);
  await act(async () => { await latest.refresh(); });
  await waitFor(() => assert.equal(latest.error, null)); assert.equal(data.needsBuildRefresh, false);
  loseResponse = false;
  await act(async () => { await latest.reroll("powerBracer", "primary"); });
  assert.equal(posts, 2); assert.equal(latest.result?.changed, true); assert.ok(latest.error);
  await act(async () => { await latest.reroll("powerBracer", "primary"); }); assert.equal(posts, 2);
  await act(async () => { await latest.refresh(); }); await waitFor(() => assert.equal(latest.error, null));
  assert.equal(latest.result, undefined); assert.equal(posts, 2);
});

it("removes authoritative missing-target context and keeps failed reads recoverable without a write", async () => {
  let missing = false;
  let posts = 0;
  globalThis.fetch = async (url, options) => {
    if (options?.method === "POST") { posts++; missing = true; return json({ error: "pokemon_not_found" }, 404); }
    return missing && String(url).includes("/pokemon/") ? json({ error: "pokemon_not_found" }, 404) : read(String(url));
  };
  const view = render(tree()); await waitFor(() => assert.ok(latest.context));
  await act(async () => { await latest.upgrade("powerBracer"); });
  await waitFor(() => assert.equal(latest.context, undefined)); assert.match(latest.error || "", /no longer/);
  await act(async () => { await latest.refresh(); });
  assert.equal(data.needsBuildRefresh, false); assert.equal(latest.context, undefined); assert.equal(posts, 1);
  view.unmount();
  let offline = true;
  globalThis.fetch = async url => { if (offline) throw new TypeError("offline"); return read(String(url)); };
  render(tree()); await waitFor(() => assert.match(latest.error || "", /Couldn't load/));
  assert.equal(latest.context, undefined);
  offline = false; await act(async () => { await latest.refresh(); });
  await waitFor(() => assert.ok(latest.context)); assert.equal(latest.error, null); assert.equal(posts, 1);
});

it("never applies an old account's submitted result to the newly mounted account", async () => {
  let finish!: (response: Response) => void;
  globalThis.fetch = async (url, options) => {
    if (options?.method === "POST") return new Promise(resolve => { finish = resolve; });
    const userId = (options?.headers as Record<string, string>)["X-Player-Id"];
    return read(String(url), userId);
  };
  const view = render(tree()); await waitFor(() => assert.ok(latest.context));
  let submitted!: ReturnType<typeof latest.upgrade>;
  await act(async () => { submitted = latest.upgrade("powerBracer"); });
  const oldData = data;
  view.rerender(tree("one", true, "bob")); await waitFor(() => assert.equal(data.userId, "bob"));
  await waitFor(() => assert.ok(latest.context));
  await act(async () => { finish(json(result())); assert.equal(await submitted, undefined); });
  assert.equal(oldData.client.getQueryCache().getAll().length, 0);
  assert.equal(latest.result, undefined); assert.equal(latest.error, null); assert.equal(latest.context?.money, 5000);
});
