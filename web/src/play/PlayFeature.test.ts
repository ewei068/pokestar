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
  await waitFor(() => assert.equal(view.queryByRole("button", { name: /^Continue/ }), null));
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
