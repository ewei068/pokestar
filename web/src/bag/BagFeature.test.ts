import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, it } from "node:test";
import { createElement } from "react";
import { JSDOM } from "jsdom";
import { SiteShell, UnavailablePage } from "../navigation/SiteShell";
import { AudioSettingsProvider } from "../settings/AudioSettings";
import { PlayerProvider, usePlayer } from "../player/PlayerProvider";
import { BagFeature } from "./BagFeature";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/pokestar/#bag" });
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, Element: dom.window.Element,
  localStorage: dom.window.localStorage })) {
  Object.defineProperty(globalThis, key, { configurable: true, value });
}
dom.window.scrollTo = () => {};
const { render, cleanup, fireEvent, waitFor, act } = await import("@testing-library/react");
const originalFetch = globalThis.fetch;
const setDesktop = (desktop: boolean) => {
  Object.defineProperty(dom.window, "matchMedia", { configurable: true, value: (query: string) => ({
    matches: desktop ? query.includes("min-width") : query.includes("max-width"),
    addEventListener() {}, removeEventListener() {},
  }) });
};
afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
  dom.window.history.replaceState(null, "", "/pokestar/#bag");
});
const ball = { id: "0", name: "Pokeball", description: "A catching ball.", category: "0", categoryName: "Pokeballs", quantity: 24, icon: "poke-ball.png" };
const mint = { id: "7", name: "Mint", description: "Changes nature.", category: "1", categoryName: "Materials", quantity: 2, icon: "mint.png" };
const boots = { id: "h1178", name: "Heavy-Duty Boots", description: "Ignores hazards.", category: "3", categoryName: "Held Items", quantity: 1, icon: null };
const trainer = { displayName: "Player", avatarUrl: null, level: 1, money: 100, exp: { current: 0, required: 100 } };
const json = (data: object, status = 200) => new Response(JSON.stringify({ discordUserId: "alice", ...data }), { status, headers: { "Content-Type": "application/json" } });
let currentData: ReturnType<typeof usePlayer>;
function Harness() {
  const data = usePlayer();
  currentData = data;
  data.client.setDefaultOptions({ queries: { ...data.client.getDefaultOptions().queries, gcTime: 0 } });
  return createElement(BagFeature);
}
const mount = () => render(createElement(PlayerProvider, { userId: "alice", trainer, onAccountChanged() {}, children: createElement(Harness) }));
const itemRow = (view: { container: HTMLElement }, name: string) => {
  const found = [...view.container.querySelectorAll("button.item-row")].find(button => button.textContent?.includes(name));
  assert.ok(found, name);
  return found;
};

it("opens the first row on desktop without writing the item query", async () => {
  setDesktop(true);
  globalThis.fetch = async () => json({ items: [ball, mint] });
  const view = mount();
  assert.ok(await view.findByRole("heading", { name: "Pokeball" }));
  const row = itemRow(view, "Pokeball");
  assert.equal(row.getAttribute("aria-pressed"), "true");
  assert.ok(view.getByRole("heading", { name: "Pokeball" }));
  assert.equal(new URL(dom.window.location.href).searchParams.get("item"), null);
  assert.ok(view.container.querySelector(".item-rows"));
  assert.match(readFileSync(new URL("./bag.css", import.meta.url), "utf8"), /max-height:\s*calc\(100dvh - 285px\)/);
  assert.equal(view.queryByRole("button", { name: "‹ All items" }), null);
});

it("returns from a phone item to the list, including with the browser Back button", async () => {
  setDesktop(false);
  globalThis.fetch = async () => json({ items: [ball] });
  const view = mount();
  assert.ok(await view.findByRole("heading", { name: "Items" }));
  const row = itemRow(view, "Pokeball");
  assert.equal(row.getAttribute("aria-pressed"), "false");
  assert.equal(view.queryByRole("button", { name: "‹ All items" }), null);
  assert.equal(view.queryByRole("heading", { name: "Pokeball" }), null);
  fireEvent.click(row);
  await waitFor(() => assert.equal(new URL(dom.window.location.href).searchParams.get("item"), "0"));
  const back = view.getByRole("button", { name: "‹ All items" });
  const panel = view.container.querySelector(".bag-detail");
  assert.ok(panel);
  assert.equal(back.compareDocumentPosition(panel) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING, dom.window.Node.DOCUMENT_POSITION_FOLLOWING);
  assert.equal(back.closest(".bag-detail"), null);
  fireEvent.click(back);
  await waitFor(() => assert.equal(new URL(dom.window.location.href).searchParams.get("item"), null));
  assert.equal(view.queryByRole("button", { name: "‹ All items" }), null);
  fireEvent.click(itemRow(view, "Pokeball"));
  await waitFor(() => assert.equal(new URL(dom.window.location.href).searchParams.get("item"), "0"));
  await act(async () => { dom.window.history.back(); });
  await waitFor(() => assert.equal(new URL(dom.window.location.href).searchParams.get("item"), null));
  assert.equal(view.queryByRole("heading", { name: "Pokeball" }), null);
});

it("selects Poké Ball from item=0 and keeps a category that still shows it", async () => {
  setDesktop(true);
  dom.window.history.replaceState(null, "", "/pokestar/?item=0#bag");
  globalThis.fetch = async () => json({ items: [ball, mint] });
  const view = mount();
  assert.equal((await view.findByRole("heading", { name: "Pokeball" }), itemRow(view, "Pokeball")).getAttribute("aria-pressed"), "true");
  fireEvent.click(view.getByRole("button", { name: "Pokeballs" }));
  assert.equal(itemRow(view, "Pokeball").getAttribute("aria-pressed"), "true");
  assert.equal(new URL(dom.window.location.href).searchParams.get("item"), "0");
  fireEvent.click(view.getByRole("button", { name: "Materials" }));
  await waitFor(() => assert.equal(new URL(dom.window.location.href).searchParams.get("item"), null));
  assert.equal([...view.container.querySelectorAll("button.item-row")].some(button => button.textContent?.includes("Pokeball")), false);
  assert.equal(itemRow(view, "Mint").getAttribute("aria-pressed"), "true");
});

it("shows the study sentences for empty, category, loading, failure, and a stale refresh", async () => {
  setDesktop(true);
  let mode: "wait" | "fail" | "empty" | "ready" | "stale" = "wait";
  let releaseLoading!: (response: Response) => void;
  globalThis.fetch = async () => {
    if (mode === "wait") return await new Promise<Response>(resolve => { releaseLoading = resolve; });
    if (mode === "fail" || mode === "stale") return json({ error: "unavailable" }, 500);
    if (mode === "empty") return json({ items: [] });
    return json({ items: [ball] });
  };
  const loading = mount();
  assert.ok(await loading.findByRole("heading", { name: "Loading your bag…" }));
  assert.equal(loading.queryByRole("heading", { name: "Your bag is empty." }), null);
  assert.equal(loading.queryByRole("button", { name: "Try again" }), null);
  releaseLoading(json({ items: [ball] }));
  cleanup();
  mode = "fail";
  const failed = mount();
  assert.ok(await failed.findByRole("heading", { name: "Couldn't load your bag." }));
  assert.ok(failed.getByText("Your items are still in Discord."));
  mode = "ready";
  fireEvent.click(failed.getByRole("button", { name: "Try again" }));
  assert.ok(await failed.findByRole("heading", { name: "Pokeball" }));
  cleanup();
  mode = "empty";
  const empty = mount();
  assert.ok(await empty.findByRole("heading", { name: "Your bag is empty." }));
  assert.ok(empty.getByText("Catch, raid and shop rewards will land here."));
  cleanup();
  mode = "ready";
  const view = mount();
  assert.ok(await view.findByRole("heading", { name: "Pokeball" }));
  fireEvent.click(view.getByRole("button", { name: "Held Items" }));
  assert.ok(view.getByRole("heading", { name: "No items in this category." }));
  fireEvent.click(view.getByRole("button", { name: "All" }));
  mode = "stale";
  await act(async () => { await currentData.client.refetchQueries({ queryKey: currentData.bag().queryKey }); });
  await waitFor(() => assert.match(view.getByRole("alert").textContent || "", /Couldn't refresh your bag/));
  assert.equal(itemRow(view, "Pokeball").textContent?.includes("24"), true);
});

it("clears an open item the next payload no longer contains and draws a missing picture as a diamond", async () => {
  setDesktop(true);
  dom.window.history.replaceState(null, "", "/pokestar/?item=h1178#bag");
  globalThis.fetch = async () => json({ items: [ball, boots] });
  const view = mount();
  assert.ok(await view.findByRole("heading", { name: "Heavy-Duty Boots" }));
  assert.equal(view.container.querySelector(".bag-detail img"), null);
  assert.equal(view.container.querySelector(".item-detail-fallback")?.textContent, "◆");
  const image = view.container.querySelector(".item-row img");
  assert.ok(image);
  fireEvent.error(image);
  assert.equal(image.isConnected, false);
  await act(async () => { currentData.client.setQueryData(currentData.bag().queryKey, [ball]); });
  await waitFor(() => assert.equal(new URL(dom.window.location.href).searchParams.get("item"), null));
  assert.equal(view.queryByRole("heading", { name: "Heavy-Duty Boots" }), null);
});

it("shows owned rows for a signed-in trainer and leaves a signed-out bag unavailable", async () => {
  setDesktop(true);
  const calls: string[] = [];
  globalThis.fetch = async url => {
    calls.push(String(url));
    if (String(url).includes("/player/bag")) return json({ items: [ball] });
    return json({ trainer });
  };
  const shell = (signedIn: boolean) => createElement(AudioSettingsProvider, { children: createElement(SiteShell, {
    children: (route: { page: string }) => !signedIn || route.page !== "bag"
      ? createElement(UnavailablePage, { page: route.page as "bag" })
      : createElement(PlayerProvider, { userId: "alice", trainer, onAccountChanged() {}, children: createElement(Harness) }),
  }) });
  const signedIn = render(shell(true));
  assert.ok(await signedIn.findByRole("heading", { name: "Pokeball" }));
  assert.equal(signedIn.getByRole("link", { name: "Bag" }).getAttribute("aria-current"), "page");
  assert.deepEqual([...signedIn.getByRole("navigation").querySelectorAll("a")].map(link => link.textContent?.replace("›", "")),
    ["Play", "Pokémon", "Catch", "Rewards", "More"]);
  cleanup();
  calls.length = 0;
  const signedOut = render(shell(false));
  assert.ok(signedOut.getByText(/Use your items in Discord\./));
  assert.equal(signedOut.queryByRole("heading", { name: "Pokeball" }), null);
  assert.equal(calls.some(path => path.includes("/player/bag")), false);
  const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
  assert.match(app, /route\.page === "bag"\) return <BagFeature \/>/);
  assert.match(app, /route\.page !== "play" && route\.page !== "pokemon" \? <UnavailablePage page=\{route\.page\} \/>/);
});

const shard = { id: "4", name: "Knowledge Shard", description: "A shard.", category: "1", categoryName: "Materials", quantity: 3, icon: "knowledge-shard.png" };
const bootsUse = { ...boots, icon: "heavy-duty-boots.png" };

it("names a destination without spending the item or calling the server", async () => {
  setDesktop(true);
  let calls = 0;
  globalThis.fetch = async () => { calls += 1; return json({ items: [ball, mint, shard, bootsUse] }); };
  const view = mount();
  assert.ok(await view.findByRole("heading", { name: "Pokeball" }));
  const before = calls;
  fireEvent.click(view.getByRole("button", { name: "Catch" }));
  assert.match(view.getByRole("status").textContent || "", /This ball stays in your bag/);
  assert.equal(itemRow(view, "Pokeball").textContent?.includes("24"), true);
  assert.equal(calls, before);
  fireEvent.click(view.getByRole("button", { name: "Pokeballs" }));
  assert.equal(view.queryByRole("status"), null);
  fireEvent.click(view.getByRole("button", { name: "All" }));
  fireEvent.click(view.getByRole("button", { name: "Catch" }));
  fireEvent.click(itemRow(view, "Mint"));
  await waitFor(() => assert.equal(new URL(dom.window.location.href).searchParams.get("item"), "7"));
  assert.equal(view.queryByText(/This ball stays in your bag/), null);
  assert.ok(view.getByRole("button", { name: "Change nature" }));
  fireEvent.click(view.getByRole("button", { name: "Change nature" }));
  assert.match(view.getByRole("status").textContent || "", /This Mint stays in your bag/);
  assert.equal(calls, before);
  fireEvent.click(itemRow(view, "Heavy-Duty Boots"));
  await waitFor(() => assert.ok(view.getByRole("button", { name: "Equip" })));
  assert.equal(view.queryByText(/This Mint stays in your bag/), null);
  fireEvent.click(view.getByRole("button", { name: "Equip" }));
  assert.match(view.getByRole("status").textContent || "", /This item stays in your bag/);
  assert.equal(calls, before);
  fireEvent.click(itemRow(view, "Knowledge Shard"));
  await waitFor(() => assert.ok(view.getByRole("heading", { name: "Knowledge Shard" })));
  assert.equal(view.queryByRole("button", { name: "Catch" }), null);
  assert.equal(view.queryByRole("button", { name: "Change nature" }), null);
  assert.equal(view.queryByRole("button", { name: "Equip" }), null);
  cleanup();
  setDesktop(false);
  calls = 0;
  const phone = mount();
  assert.ok(await phone.findByRole("heading", { name: "Items" }));
  fireEvent.click(itemRow(phone, "Pokeball"));
  fireEvent.click(await phone.findByRole("button", { name: "Catch" }));
  assert.match(phone.getByRole("status").textContent || "", /This ball stays in your bag/);
  fireEvent.click(phone.getByRole("button", { name: "‹ All items" }));
  await waitFor(() => assert.ok(phone.queryByRole("status") === null));
  fireEvent.click(itemRow(phone, "Pokeball"));
  fireEvent.click(phone.getByRole("button", { name: "Catch" }));
  await act(async () => { currentData.client.setQueryData(currentData.bag().queryKey, [mint]); });
  await waitFor(() => assert.ok(phone.queryByText(/This ball stays in your bag/) === null));
  assert.equal(calls, 1);
});
