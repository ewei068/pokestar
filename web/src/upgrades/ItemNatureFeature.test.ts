import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import { createElement, StrictMode, useState } from "react";
import { JSDOM } from "jsdom";
import { PlayerProvider, usePlayer } from "../player/PlayerProvider";
import type { PlayerData } from "../player/PlayerData";
import type { PokemonBuildContext } from "../player/types";
import { TrainingFeature } from "./TrainingFeature";
import { ItemNatureFeature } from "./ItemNatureFeature";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/#pokemon" });
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, Element: dom.window.Element })) {
  Object.defineProperty(globalThis, key, { configurable: true, value });
}
const { render, cleanup, fireEvent, waitFor, act } = await import("@testing-library/react");
const originalFetch = globalThis.fetch;
afterEach(() => { cleanup(); globalThis.fetch = originalFetch; });
const item = { id: "h1", name: "Leftovers", description: "Restores HP.", category: "held", categoryName: "Held Items", quantity: 2, icon: null };
const context: PokemonBuildContext = {
  pokemon: { id: "one", speciesId: "25", speciesName: "Pikachu", name: "Pikachu", level: 20,
    shiny: false, rarity: "Rare", types: ["Electric"], combatPower: 123, ivPercent: 90, inParty: true,
    spriteUrl: null, battleEligible: true, stats: [10,20,30,40,50,60], ivs: [1,1,1,1,1,1], evs: [0,0,0,0,0,0],
    nature: { id: "0", name: "Hardy", raisedStat: null, loweredStat: null }, moves: [], ability: null, heldItem: null,
    heldItemId: null, exp: null },
  natures: [{ id: "0", name: "Hardy", raisedStat: null, loweredStat: null, stats: [10,20,30,40,50,60] },
    { id: "1", name: "Adamant", raisedStat: 1, loweredStat: 3, stats: [101,202,303,404,505,606] }],
  heldItems: [item], mintQuantity: 2, mintCost: 1,
};
const json = (body: object) => new Response(JSON.stringify({ discordUserId: "alice", ...body }), { headers: { "Content-Type": "application/json" } });
let data: PlayerData;
function Feature({ open = true }: { open?: boolean }) {
  data = usePlayer();
  data.client.setDefaultOptions({ queries: { ...data.client.getDefaultOptions().queries, gcTime: 0 },
    mutations: { ...data.client.getDefaultOptions().mutations, gcTime: Infinity } });
  return open ? createElement(ItemNatureFeature, { pokemonId: "one" }) : null;
}
const tree = (open = true) => createElement(PlayerProvider, { userId: "alice", trainer: null,
  onAccountChanged() {}, children: createElement(StrictMode, null, createElement(Feature, { open })) });

it("previews every server stat without a write; Change nature and held selection apply directly", async () => {
  const posts: { url: string; body: unknown }[] = [];
  globalThis.fetch = async (url, init) => {
    if (init?.method === "POST") {
      posts.push({ url: String(url), body: JSON.parse(String(init.body)) });
      return json({ ...context, changed: true, items: [item] });
    }
    return json(context);
  };
  const view = render(tree());
  await view.findByRole("heading", { name: "Pikachu" });
  assert.equal((view.getByRole("button", { name: "Change nature" }) as HTMLButtonElement).disabled, true);
  fireEvent.change(view.getByLabelText("New nature"), { target: { value: "1" } });
  for (const stat of [101,202,303,404,505,606]) assert.ok(view.getByText(String(stat), { exact: true }));
  assert.equal(posts.length, 0);
  fireEvent.click(view.getByRole("button", { name: "Change nature" }));
  await waitFor(() => assert.equal(posts.length, 1));
  assert.deepEqual(posts[0].body, { natureId: "1", expectedNatureId: "0" });
  assert.equal(view.queryByRole("dialog"), null);
  await waitFor(() => assert.equal(data.client.isMutating(), 0));
  fireEvent.change(view.getByLabelText("Give from Bag"), { target: { value: "h1" } });
  await waitFor(() => assert.equal(posts.length, 2));
  assert.deepEqual(posts[1].body, { heldItemId: "h1", expectedHeldItemId: null });
  assert.ok(view.getAllByText(/Owned: 2/).length >= 2);
});

it("keeps an uncertain result blocked across closing and reopening until explicit read-only refresh", async () => {
  let posts = 0;
  let reads = 0;
  globalThis.fetch = async (url, init) => {
    if (init?.method === "POST") { posts++; throw new TypeError("response lost"); }
    reads++;
    return String(url).endsWith("/bag") ? json({ items: [item] }) : json(context);
  };
  const view = render(tree());
  await view.findByRole("heading", { name: "Pikachu" });
  fireEvent.change(view.getByLabelText("Give from Bag"), { target: { value: "h1" } });
  await view.findByRole("alert");
  assert.equal(posts, 1);
  assert.equal(data.needsBuildRefresh, true);
  view.rerender(tree(false));
  view.rerender(tree());
  await view.findByRole("heading", { name: "Pikachu" });
  assert.equal((view.getByLabelText("Give from Bag") as HTMLSelectElement).disabled, true);
  await waitFor(() => assert.equal((view.getByRole("button", { name: "Refresh Pokémon & Bag" }) as HTMLButtonElement).disabled, false));
  fireEvent.click(view.getByRole("button", { name: "Refresh Pokémon & Bag" }));
  await waitFor(() => assert.equal(data.needsBuildRefresh, false));
  await waitFor(() => assert.equal((view.getByLabelText("Give from Bag") as HTMLSelectElement).disabled, false));
  assert.equal(posts, 1);
  assert.ok(reads >= 3);
});

it("blocks both editors while another account interaction is in flight", async () => {
  globalThis.fetch = async () => json(context);
  const view = render(tree());
  await view.findByRole("heading", { name: "Pikachu" });
  let finish!: () => void;
  const external = data.client.getMutationCache().build(data.client, { mutationKey: [...data.prefix, "interaction"],
    mutationFn: () => new Promise<void>(resolve => { finish = resolve; }) });
  let pending!: Promise<void>;
  await act(async () => { pending = external.execute(undefined); });
  await waitFor(() => assert.equal((view.getByLabelText("Give from Bag") as HTMLSelectElement).disabled, true));
  assert.equal((view.getByLabelText("New nature") as HTMLSelectElement).disabled, true);
  await act(async () => { finish(); await pending; });
});

it("tab departure keeps submitted Train/build writes exclusive and never resumes Train", async () => {
  let finish!: (response: Response) => void;
  const posts: string[] = [];
  const training = { pokemon: context.pokemon, locations: [{ id: "0", name: "Home", emoji: "", owned: true, level: 0,
    canTrain: true, nextGains: { exp: 2, evs: [0,0,0,0,0,0] } }] };
  globalThis.fetch = async (url, init) => {
    if (init?.method === "POST") { posts.push(String(url)); return new Promise(resolve => { finish = resolve; }); }
    return json(String(url).endsWith("/training") ? training : context);
  };
  function Tabs() {
    const [build, setBuild] = useState(false);
    const player = usePlayer();
    player.client.setDefaultOptions({ queries: { ...player.client.getDefaultOptions().queries, gcTime: 0 },
      mutations: { ...player.client.getDefaultOptions().mutations, gcTime: Infinity } });
    return createElement("div", null,
      createElement("button", { onClick: () => setBuild(!build) }, "Switch tab"),
      build ? createElement(ItemNatureFeature, { pokemonId: "one" }) : createElement(TrainingFeature, { pokemonId: "one" }));
  }
  const view = render(createElement(PlayerProvider, { userId: "alice", trainer: null,
    onAccountChanged() {}, children: createElement(Tabs) }));
  const settle = async (milliseconds = 0) => act(async () => { await new Promise(resolve => setTimeout(resolve, milliseconds)); });
  const train = await view.findByRole("button", { name: "Train" });
  fireEvent.click(train);
  await settle(1050);
  assert.equal(posts.length, 1);
  fireEvent.click(view.getByRole("button", { name: "Switch tab" }));
  await view.findByLabelText("Give from Bag");
  assert.equal((view.getByLabelText("Give from Bag") as HTMLSelectElement).disabled, true);
  await act(async () => finish(json({ ...training, trained: true, gains: { exp: 2, evs: [0,0,0,0,0,0] } })));
  await waitFor(() => assert.equal((view.getByLabelText("Give from Bag") as HTMLSelectElement).disabled, false));
  fireEvent.change(view.getByLabelText("Give from Bag"), { target: { value: "h1" } });
  await waitFor(() => assert.equal(posts.length, 2));
  fireEvent.click(view.getByRole("button", { name: "Switch tab" }));
  await view.findByRole("button", { name: "Train" });
  assert.equal((view.getByRole("button", { name: "Train" }) as HTMLButtonElement).disabled, true);
  await act(async () => finish(json({ ...context, changed: true, items: [item] })));
  await waitFor(() => assert.equal((view.getByRole("button", { name: "Train" }) as HTMLButtonElement).disabled, false));
  await settle(1100);
  assert.equal(posts.length, 2);
  assert.equal(view.queryByRole("button", { name: "Stop" }), null);
});

it("keeps a failed build read inline and retries only through a grantless refresh", async () => {
  let failing = true;
  let posts = 0;
  globalThis.fetch = async (url, init) => {
    if (init?.method === "POST") { posts++; throw new Error("unexpected write"); }
    if (failing) throw new TypeError("offline");
    return String(url).endsWith("/bag") ? json({ items: [item] }) : json(context);
  };
  const view = render(tree());
  const error = await view.findByRole("alert");
  assert.match(error.textContent || "", /Couldn't load Pokémon/);
  assert.equal(view.queryByLabelText("New nature"), null);
  assert.equal(data.needsBuildRefresh, false);
  failing = false;
  fireEvent.click(view.getByRole("button", { name: "Refresh Pokémon & Bag" }));
  await view.findByRole("heading", { name: "Pikachu" });
  assert.equal(posts, 0);
  assert.equal(view.queryByRole("alert"), null);
});
