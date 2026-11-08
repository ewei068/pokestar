import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import { createElement, StrictMode } from "react";
import { JSDOM } from "jsdom";
import { PlayerProvider, usePlayer } from "../player/PlayerProvider";
import type { PlayerData } from "../player/PlayerData";
import type { TrainingContext } from "../player/types";
import { TrainingFeature } from "./TrainingFeature";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/#pokemon" });
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, Element: dom.window.Element })) {
  Object.defineProperty(globalThis, key, { configurable: true, value });
}
Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
const { render, cleanup, fireEvent, act } = await import("@testing-library/react");
const originalFetch = globalThis.fetch;
afterEach(() => { cleanup(); globalThis.fetch = originalFetch; });
const pokemon = { id: "one", speciesId: "25", speciesName: "Pikachu", name: "Pikachu", level: 20,
  shiny: false, rarity: "Rare", types: ["Electric"], combatPower: 123, ivPercent: 90, inParty: false,
  spriteUrl: null, battleEligible: true, stats: [10,20,30,40,50,60], ivs: [1,1,1,1,1,1], evs: [0,0,0,0,0,0],
  nature: { name: "Hardy", raisedStat: null, loweredStat: null }, moves: [], ability: null, heldItem: null,
  exp: { current: 20, required: 100 } };
const context: TrainingContext = { pokemon, locations: [{ id: "0", name: "Home", emoji: "", owned: true, level: 0,
  canTrain: true, nextGains: { exp: 2, evs: [0,0,0,0,0,0] } }] };
const json = (body: object) => new Response(JSON.stringify({ discordUserId: "alice", ...body }), { headers: { "Content-Type": "application/json" } });
let data: PlayerData;
function Feature({ id }: { id: string }) {
  data = usePlayer();
  data.client.setDefaultOptions({ queries: { ...data.client.getDefaultOptions().queries, gcTime: 0 },
    mutations: { ...data.client.getDefaultOptions().mutations, gcTime: Infinity } });
  return createElement(TrainingFeature, { pokemonId: id });
}
const tree = (id = "one") => createElement(PlayerProvider, { userId: "alice", trainer: null,
  onAccountChanged() {}, children: createElement(StrictMode, null, createElement(Feature, { id })) });
const tick = async (milliseconds: number) => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, milliseconds));
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
};

it("renders accepted state and Stop totals without issuing a full-account refresh", async () => {
  let posts = 0;
  const reads: string[] = [];
  let finish!: (response: Response) => void;
  globalThis.fetch = async (url, init) => {
    if (init?.method === "POST") { posts++; return new Promise(resolve => { finish = resolve; }); }
    reads.push(String(url));
    return json(context);
  };
  const view = render(tree());
  await view.findByRole("button", { name: "Train" });
  fireEvent.click(view.getByRole("button", { name: "Train" }));
  assert.equal(view.getByRole("status").textContent, "Training…");
  await tick(100);
  assert.equal(posts, 0);
  await tick(1000);
  assert.equal(posts, 1);
  assert.equal(data.client.isMutating({ mutationKey: [...data.prefix, "interaction"] }), 1);
  fireEvent.click(view.getByRole("button", { name: "Stop" }));
  assert.equal((view.getByRole("button", { name: "Stopping…" }) as HTMLButtonElement).disabled, true);
  await act(async () => finish(json({ ...context, pokemon: { ...pokemon, level: 21 }, trained: true,
    gains: { exp: 11, evs: [0,-2,0,0,0,0] } })));
  await tick(0);
  assert.match(view.getByText("Lv. 21", { exact: false }).textContent || "", /Lv\. 21/);
  assert.equal(view.getByRole("status").textContent, "");
  assert.ok(view.getByText("+11"));
  assert.ok(view.getByText("−2 Attack"));
  await tick(1000);
  assert.equal(posts, 1);
  assert.ok(reads.every(url => url.endsWith("/training")));
});

it("a lost response pauses, refreshes through GET and requires manual Train", async () => {
  let posts = 0;
  let reads = 0;
  globalThis.fetch = async (_url, init) => {
    if (init?.method === "POST") { posts++; throw new TypeError("response lost"); }
    reads++;
    return json(context);
  };
  const view = render(tree());
  await view.findByRole("button", { name: "Train" });
  fireEvent.click(view.getByRole("button", { name: "Train" }));
  await tick(1000);
  assert.equal(posts, 1);
  assert.match(view.getByRole("alert").textContent || "", /may have completed/);
  assert.equal((view.getByRole("button", { name: "Train" }) as HTMLButtonElement).disabled, true);
  fireEvent.click(view.getByRole("button", { name: "Refresh Pokémon" }));
  await tick(0);
  assert.equal(view.queryByRole("alert"), null);
  await tick(1100);
  assert.equal(posts, 1);
  assert.ok(reads >= 2);
  assert.ok(view.getByText("+0"));
});

it("a delayed old Pokémon result cannot change a newly opened training feature", async () => {
  let finish!: (response: Response) => void;
  globalThis.fetch = async (url, init) => {
    if (init?.method === "POST") return new Promise(resolve => { finish = resolve; });
    return json(String(url).includes("/two/") ? { ...context, pokemon: { ...pokemon, id: "two", name: "Raichu" } } : context);
  };
  const view = render(tree());
  await view.findByRole("button", { name: "Train" });
  fireEvent.click(view.getByRole("button", { name: "Train" }));
  await tick(1000);
  view.rerender(tree("two"));
  await tick(0);
  await view.findByRole("heading", { name: "Raichu" });
  await act(async () => finish(json({ ...context, pokemon: { ...pokemon, level: 99 }, trained: true, gains: { exp: 100, evs: [0,0,0,0,0,0] } })));
  await tick(0);
  assert.ok(view.getByText("+0"));
  assert.equal(view.getByRole("status").textContent, "");
  assert.notEqual(data.client.getQueryData<{ level: number }>(data.pokemon("one").queryKey)?.level, 99);
  assert.equal(data.client.getQueryData<TrainingContext>(data.training("two").queryKey)?.pokemon.level, 20);
});
