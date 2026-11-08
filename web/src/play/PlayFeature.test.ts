import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import { createElement } from "react";
import { JSDOM } from "jsdom";
import { PlayerProvider, usePlayer } from "../player/PlayerProvider";
import { PlayFeature } from "./PlayFeature";
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/#play" });
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, Element: dom.window.Element })) {
  Object.defineProperty(globalThis, key, { configurable: true, value });
}
const { render, cleanup, fireEvent, waitFor, act } = await import("@testing-library/react");
const originalFetch = globalThis.fetch;
afterEach(() => { cleanup(); globalThis.fetch = originalFetch; dom.window.history.replaceState(null, "", "/#play"); });
const npc = { id: "blue", name: "Blue", displayName: "Blue", catchphrase: "Smell ya later!", spriteUrl: null,
  minLevel: 15, maxLevel: 49, difficulties: [{ id: "easy", name: "Easy", minLevel: 15, maxLevel: 19, count: 4,
    dailyClaimed: false, rewards: [{ name: "Pokeball", quantity: 1, icon: "poke-ball.png" }],
    species: [{ id: "8", name: "Wartortle", spriteUrl: null, ace: true }] }] };
const json = (data: object) => new Response(JSON.stringify({ discordUserId: "alice", ...data }), { headers: { "Content-Type": "application/json" } });
const member = { id: "one", name: "Pikachu", level: 5, spriteUrl: null, battleEligible: true };
const read = (url: unknown, battles: object[] = []) => json(String(url).includes("/npcs") ? { npcs: [npc] }
  : String(url).includes("/battles") ? { battles } : { party: { rows: 1, cols: 1, capacity: 6, slots: [member], targets: {} } });
let currentData: ReturnType<typeof usePlayer>;
function TestFeature() {
  const data = usePlayer();
  currentData = data;
  data.client.setDefaultOptions({ queries: { ...data.client.getDefaultOptions().queries, gcTime: 0 } });
  return createElement(PlayFeature);
}
const mount = () => render(createElement(PlayerProvider, { userId: "alice", trainer: null, onAccountChanged() {}, children: createElement(TestFeature) }));
it("defaults to Continue only when active battles exist and preserves trainer selection during refresh", async () => {
  const battles = [{ battleId: "one", mode: { type: "pvp" }, turn: 3, updatedAt: "2026-11-02T12:00:00Z" }];
  globalThis.fetch = async url => read(url, battles);
  const view = mount();
  assert.ok(await view.findByRole("heading", { name: "Ongoing battles" }));
  fireEvent.click(view.getByRole("button", { name: "Trainer battles" }));
  assert.ok(await view.findByRole("heading", { name: "Blue" }));
  assert.equal(view.queryByRole("heading", { name: "Ongoing battles" }), null);
  fireEvent.click(view.getByRole("button", { name: "Continue 1" }));
  await view.findByRole("heading", { name: "Ongoing battles" });
  await act(async () => { currentData.client.setQueryData(currentData.battles().queryKey, []); });
  await waitFor(() => assert.ok(view.queryByRole("button", { name: /^Continue/ }) === null));
  assert.ok(view.getByRole("heading", { name: "Blue" }));
});
it("disables duplicate Start and allows another attempt after an ambiguous failure", async () => {
  let finish!: (response: Response) => void;
  let reject!: (error: Error) => void;
  let posts = 0;
  globalThis.fetch = async (url, init) => {
    if (init?.method === "POST") {
      posts++;
      return new Promise((resolve, rejectPromise) => { finish = resolve; reject = rejectPromise; });
    }
    return read(url);
  };
  const view = mount();
  const start = await view.findByRole("button", { name: "Start battle" });
  await waitFor(() => assert.equal(start.hasAttribute("disabled"), false));
  assert.equal(view.queryByRole("button", { name: /^Continue/ }), null);
  fireEvent.click(start);
  fireEvent.click(start);
  await waitFor(() => assert.equal(posts, 1));
  assert.equal(view.getByRole("button", { name: "Starting battle…" }).hasAttribute("disabled"), true);
  await act(async () => reject(new TypeError("response lost")));
  await waitFor(() => assert.equal(view.getByRole("button", { name: "Start battle" }).hasAttribute("disabled"), false));
  assert.ok(view.getByText(/may have started/));
  fireEvent.click(view.getByRole("button", { name: "Start battle" }));
  await waitFor(() => assert.equal(posts, 2));
  await act(async () => finish(json({ battleId: "new-battle" })));
  await waitFor(() => assert.equal(new URL(dom.window.location.href).searchParams.get("battle"), "new-battle"));
});

it("keeps the initial Trainer view when polling discovers another battle", async () => {
  globalThis.fetch = async url => read(url);
  const view = mount();
  await view.findByRole("button", { name: "Start battle" });
  fireEvent.change(view.getByRole("searchbox", { name: "Search trainers" }), { target: { value: "Blue" } });
  await act(async () => { currentData.client.setQueryData(currentData.battles().queryKey,
    [{ battleId: "appeared", revision: 0, expiresAt: "2026-11-03T12:00:00Z", mode: { type: "pvp" }, turn: 1, updatedAt: "2026-11-02T12:00:00Z" }]); });
  await waitFor(() => assert.ok(view.getByRole("button", { name: "Continue 1" })));
  assert.ok(view.getByRole("heading", { name: "Blue" }));
  assert.equal(view.queryByRole("heading", { name: "Ongoing battles" }), null);
});

it("names a dungeon and a tower floor from their catalogs and keeps a fallback without one", async () => {
  const battles = [
    { battleId: "temple", mode: { type: "dungeon", dungeonId: "mindTemple", difficulty: "hard" }, turn: 4, updatedAt: "2026-11-04T12:00:00Z" },
    { battleId: "floor", mode: { type: "tower", stage: 7 }, turn: 2, updatedAt: "2026-11-03T12:00:00Z" },
    { battleId: "missing", mode: { type: "dungeon", dungeonId: "gone", difficulty: "hard" }, turn: 1, updatedAt: "2026-11-02T12:00:00Z" },
    { battleId: "unstaged", mode: { type: "tower" }, turn: 1, updatedAt: "2026-11-01T12:00:00Z" },
  ];
  globalThis.fetch = async url => {
    const path = String(url);
    if (path.includes("/dungeons")) return json({ dungeons: [{ id: "mindTemple", name: "Mind Temple", displayName: "Mind Temple", difficulties: [{ id: "hard", name: "Hard" }] }] });
    if (path.includes("/tower")) return json({ floors: [{ stage: 7 }], lastTowerStage: 6 });
    return read(url, battles);
  };
  const view = mount();
  const links = await view.findAllByRole("link");
  const names = links.map(link => link.textContent || "");
  assert.ok(names.some(name => name.includes("Mind Temple") && name.includes("Hard")));
  assert.ok(names.some(name => name.includes("Battle Tower · Floor 7")));
  assert.ok(names.some(name => name.includes("Dungeon") && !name.includes("Mind Temple")));
  assert.ok(names.some(name => name.includes("Battle Tower") && !name.includes("Floor")));
});

const mindTemple = { id: "mindTemple", name: "Mind Temple", displayName: "Mind Temple", description: "An ancient sanctuary.", spriteUrl: "https://example.test/temple.png",
  subtitle: { icon: "knowledge-shard.png", text: "Knowledge Shards" }, difficulties: [{ id: "medium", name: "Medium", minLevel: 55, maxLevel: 60,
    species: [{ id: "377", name: "Regirock", spriteUrl: null, boss: true }], rewards: [{ kind: "item", id: "4", name: "Knowledge Shard", quantity: 10, icon: null }] }] };
const floor = (stage: number) => ({ stage, npcName: stage === 20 ? "Tower Tycoon Palmer" : "Bug Catcher", spriteUrl: null, difficultyName: "Hard",
  minLevel: stage === 1 ? 42 : 100, maxLevel: stage === 1 ? 52 : 120, species: [],
  rewards: stage === 20 ? [{ kind: "money", quantity: 10000, label: "₽10,000" }, { kind: "item", id: "3", name: "Masterball", quantity: 4, icon: "master-ball.png" }]
    : [{ kind: "money", quantity: 250, label: "₽250" }] });
const towerFloors = [5, 7, 8, 19, 20].map(floor);
const playFetch = (options: { dungeons?: object[]; tower?: object; battles?: object[]; party?: object; failStart?: "lost" | "stale" | Response }) => {
  const posts: unknown[] = [];
  globalThis.fetch = async (url, init) => {
    const path = String(url);
    if (init?.method === "POST") {
      posts.push(JSON.parse(String(init.body)));
      if (options.failStart === "lost") throw new TypeError("response lost");
      if (options.failStart === "stale") return json({ error: "tower_not_current" }) instanceof Response ? new Response(JSON.stringify({ error: "tower_not_current" }), { status: 400, headers: { "Content-Type": "application/json" } }) : json({});
      return json({ battleId: "started" });
    }
    if (path.includes("/dungeons")) return json({ dungeons: options.dungeons || [mindTemple] });
    if (path.includes("/tower")) return json(options.tower || { floors: towerFloors, lastTowerStage: 6 });
    if (path.includes("/battles")) return json({ battles: options.battles || [] });
    if (path.includes("/party")) return json({ party: options.party || { rows: 1, cols: 1, capacity: 6, slots: [member], targets: {} } });
    return read(url, options.battles || []);
  };
  return posts;
};

it("opens Mind Temple, falls back from an unknown dungeon, and drops a failed location image", async () => {
  playFetch({});
  const view = mount();
  fireEvent.click(await view.findByRole("button", { name: "Dungeons" }));
  const temple = await view.findByRole("button", { name: /Mind Temple/ });
  assert.equal(temple.getAttribute("aria-pressed"), "true");
  assert.match(temple.querySelector("img")?.getAttribute("src") || "", /knowledge-shard\.png/);
  assert.equal(temple.querySelector(".row-subtitle img"), null);
  assert.match(temple.textContent || "", /Knowledge Shards/);
  assert.ok(view.getByRole("heading", { name: "Mind Temple" }));
  cleanup();
  dom.window.history.replaceState(null, "", "/?playView=dungeons&dungeon=missing#play");
  playFetch({});
  const unknown = mount();
  assert.ok(await unknown.findByRole("heading", { name: "Mind Temple" }));
  const image = unknown.container.querySelector("img.dungeon-scene");
  assert.ok(image);
  fireEvent.error(image);
  assert.equal(unknown.container.querySelector("img.dungeon-scene"), null);
  assert.ok(unknown.getByRole("heading", { name: "Mind Temple" }));
  assert.ok(unknown.getByText("An ancient sanctuary."));
});

it("selects the next tower floor and refuses floors that are not next", async () => {
  const posts = playFetch({});
  dom.window.history.replaceState(null, "", "/?playView=tower#play");
  const view = mount();
  assert.equal((await view.findByRole("button", { name: /Floor 7/ })).getAttribute("aria-pressed"), "true");
  fireEvent.click(view.getByRole("button", { name: /Floor 5/ }));
  const cleared = view.getByRole("button", { name: "Cleared" });
  assert.equal(cleared.hasAttribute("disabled"), true);
  fireEvent.click(cleared);
  fireEvent.click(view.getByRole("button", { name: /Floor 8/ }));
  assert.ok(view.getByText("Clear floor 7 first."));
  fireEvent.click(view.getByRole("button", { name: "Locked" }));
  assert.equal(posts.length, 0);
  cleanup();
  dom.window.history.replaceState(null, "", "/?playView=tower&floor=20#play");
  playFetch({ tower: { floors: towerFloors, lastTowerStage: 20 } });
  const done = mount();
  assert.equal((await done.findByRole("button", { name: "Tower complete" })).hasAttribute("disabled"), true);
  assert.ok(done.getByRole("button", { name: /Floor 19/ }).textContent?.includes("Cleared"));
});

it("continues an open floor and starts only the next floor", async () => {
  const posts = playFetch({ battles: [{ battleId: "floor-7", mode: { type: "tower", stage: 7 }, turn: 2, updatedAt: "2026-11-04T12:00:00Z" }] });
  dom.window.history.replaceState(null, "", "/?playView=tower#play");
  const view = mount();
  const resume = await view.findByRole("link", { name: /Continue/ });
  assert.equal(posts.length, 0);
  assert.match(resume.getAttribute("href") || "", /battle=floor-7/);
  cleanup();
  const startPosts = playFetch({});
  dom.window.history.replaceState(null, "", "/?playView=tower#play");
  const fresh = mount();
  fireEvent.click(await fresh.findByRole("button", { name: /Start battle/ }));
  await waitFor(() => assert.deepEqual(startPosts, [{ kind: "tower.start", stage: 7 }]));
});

it("keeps a rejected floor definite, a lost start retryable, and an empty party from starting", async () => {
  let posts = playFetch({ failStart: "stale" });
  dom.window.history.replaceState(null, "", "/?playView=tower#play");
  const stale = mount();
  fireEvent.click(await stale.findByRole("button", { name: /Start battle/ }));
  await waitFor(() => assert.equal(stale.getByRole("alert").textContent?.includes("may have started"), false));
  assert.match(stale.getByRole("alert").textContent || "", /refreshed list/);
  assert.equal(stale.getByRole("button", { name: /Start battle/ }).hasAttribute("disabled"), false);
  cleanup();
  posts = playFetch({ failStart: "lost" });
  dom.window.history.replaceState(null, "", "/?playView=tower#play");
  const lost = mount();
  fireEvent.click(await lost.findByRole("button", { name: /Start battle/ }));
  await waitFor(() => assert.match(lost.getByRole("alert").textContent || "", /may have started/));
  fireEvent.click(lost.getByRole("button", { name: /Start battle/ }));
  await waitFor(() => assert.equal(posts.length, 2));
  cleanup();
  playFetch({ party: { rows: 1, cols: 1, capacity: 6, slots: [], targets: {} }, battles: [{ battleId: "other", mode: { type: "pvp" }, turn: 1, updatedAt: "2026-11-04T12:00:00Z" }] });
  dom.window.history.replaceState(null, "", "/?playView=tower#play");
  const empty = mount();
  assert.equal((await empty.findByRole("button", { name: /Start battle/ })).hasAttribute("disabled"), true);
  fireEvent.click(empty.getByRole("button", { name: /Continue/ }));
  assert.ok(await empty.findByRole("heading", { name: "Ongoing battles" }));
});

it("clears another tab's open row so Back returns to the list", async () => {
  playFetch({});
  const view = mount();
  fireEvent.click(await view.findByRole("button", { name: /Blue/ }));
  await waitFor(() => assert.match(dom.window.location.search, /npc=blue/));
  assert.match(view.container.querySelector("main")?.className || "", /npc-is-detail/);
  fireEvent.click(view.getByRole("button", { name: "Dungeons" }));
  await waitFor(() => assert.equal(new URL(dom.window.location.href).searchParams.get("playView"), "dungeons"));
  const arrived = new URL(dom.window.location.href).searchParams;
  assert.equal(arrived.get("npc"), null);
  assert.equal(arrived.get("difficulty"), null);
  assert.equal(arrived.get("floor"), null);
  assert.equal(view.container.querySelector("main")?.classList.contains("npc-is-detail"), false);
  assert.equal(view.container.querySelector(".npc-mobile-back"), null);
  fireEvent.click(view.getByRole("button", { name: /Mind Temple/ }));
  await waitFor(() => assert.equal(new URL(dom.window.location.href).searchParams.get("dungeon"), "mindTemple"));
  const back = view.container.querySelector<HTMLButtonElement>(".npc-mobile-back");
  assert.equal(back?.textContent, "‹ All dungeons");
  fireEvent.click(back!);
  await waitFor(() => assert.equal(new URL(dom.window.location.href).searchParams.get("dungeon"), null));
  assert.equal(view.container.querySelector("main")?.classList.contains("npc-is-detail"), false);
  dom.window.history.replaceState(null, "", "/?playView=tower&npc=blue&floor=7#play");
  dom.window.dispatchEvent(new dom.window.PopStateEvent("popstate"));
  await waitFor(() => assert.equal(view.container.querySelector(".npc-mobile-back")?.textContent, "‹ All floors"));
  fireEvent.click(view.container.querySelector(".npc-mobile-back")!);
  await waitFor(() => {
    const params = new URL(dom.window.location.href).searchParams;
    assert.equal(params.get("floor"), null);
    assert.equal(params.get("npc"), null);
    assert.equal(params.get("playView"), "tower");
  });
  assert.equal(view.container.querySelector("main")?.classList.contains("npc-is-detail"), false);
});

it("does not move the inspected dungeon when the battle list changes", async () => {
  playFetch({ dungeons: [mindTemple, { ...mindTemple, id: "soulCave", name: "Soul Cave", displayName: "Soul Cave" }] });
  dom.window.history.replaceState(null, "", "/?playView=dungeons&dungeon=soulCave#play");
  const view = mount();
  assert.ok(await view.findByRole("heading", { name: "Soul Cave" }));
  await act(async () => { currentData.client.setQueryData(currentData.battles().queryKey,
    [{ battleId: "appeared", revision: 0, expiresAt: "2026-11-03T12:00:00Z", mode: { type: "pvp" }, turn: 1, updatedAt: "2026-11-02T12:00:00Z" }]); });
  assert.ok(view.getByRole("heading", { name: "Soul Cave" }));
});
