import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { createElement } from "react";
import { JSDOM } from "jsdom";
import { SiteShell, UnavailablePage } from "./SiteShell";
import { AudioSettingsProvider } from "../settings/AudioSettings";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/pokestar/?battle=first" });
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, localStorage: dom.window.localStorage })) {
  Object.defineProperty(globalThis, key, { configurable: true, value });
}
dom.window.scrollTo = () => {};
const { render, cleanup, act, waitFor } = await import("@testing-library/react");
const userEvent = (await import("@testing-library/user-event")).default;
afterEach(() => { cleanup(); dom.window.localStorage.clear(); dom.reconfigure({ url: "https://example.test/pokestar/?battle=first" }); });

const shell = () => createElement(AudioSettingsProvider, { children: createElement(SiteShell, {
  children: route => route.page === "play"
    ? createElement("main", {}, createElement("h1", {}, route.battleId ? `Battle ${route.battleId}` : "Play"),
      createElement("a", { href: "/pokestar/?battle=second" }, "Open second battle"))
    : createElement(UnavailablePage, { page: route.page }),
}) });

describe("Jewel navigation", () => {
  it("navigates in place, restores a direct battle with Back, and follows another battle link", async () => {
    const page = render(shell());
    const user = userEvent.setup({ document: dom.window.document });
    assert.ok(page.getByRole("heading", { name: "Battle first" }));
    await user.click(page.getByRole("link", { name: "Pokémon" }));
    assert.equal(dom.window.location.pathname, "/pokestar/");
    assert.equal(dom.window.location.hash, "#pokemon");
    assert.equal(dom.window.location.search, "");
    assert.ok(page.getByRole("heading", { name: "Pokémon" }));
    assert.equal(dom.window.document.activeElement?.id, "site-content");
    await act(async () => { dom.window.history.back(); });
    await waitFor(() => assert.ok(page.getByRole("heading", { name: "Battle first" })));
    await user.click(page.getByRole("link", { name: "Open second battle" }));
    assert.ok(page.getByRole("heading", { name: "Battle second" }));
    assert.equal(dom.window.document.title, "Battle | Pokestar");
  });

  it("uses native keyboard links and truthful destinations without making requests", async () => {
    const originalFetch = globalThis.fetch;
    let requests = 0;
    globalThis.fetch = async () => { requests++; throw new Error("Unexpected request"); };
    try {
      const page = render(shell());
      const user = userEvent.setup({ document: dom.window.document });
      assert.deepEqual([...page.getByRole("navigation").querySelectorAll("a")].map(a => a.textContent?.replace("›", "")),
        ["Play", "Pokémon", "Catch", "Rewards", "More"]);
      page.getByRole("link", { name: "Rewards" }).focus();
      await user.keyboard("{Enter}");
      assert.ok(page.getByRole("heading", { name: "Rewards" }));
      assert.equal(page.getByRole("link", { name: "Rewards" }).getAttribute("aria-current"), "page");
      await user.click(page.getByRole("link", { name: "Skip to content" }));
      assert.equal(dom.window.location.hash, "#rewards");
      assert.equal(dom.window.document.activeElement?.id, "site-content");
      await user.click(page.getByRole("link", { name: "Bag" }));
      assert.ok(page.getByRole("heading", { name: "Bag" }));
      assert.equal(requests, 0);
    } finally { globalThis.fetch = originalFetch; }
  });

  it("keeps audio preferences under the cog, persists them and closes with Escape", async () => {
    const page = render(shell());
    const user = userEvent.setup({ document: dom.window.document });
    const cog = page.getByLabelText("Settings");
    await user.click(cog);
    await user.click(page.getByRole("checkbox", { name: "Mute all audio" }));
    assert.equal(JSON.parse(dom.window.localStorage.getItem("pokestar:audio-settings")!).muted, true);
    await user.keyboard("{Escape}");
    assert.equal(cog.parentElement?.hasAttribute("open"), false);
    assert.equal(dom.window.document.activeElement, cog);
  });

  it("reacts to hash navigation and recovers unknown destinations to Play", async () => {
    const page = render(shell());
    await act(async () => { dom.window.location.hash = "#catch"; });
    await waitFor(() => assert.ok(page.getByRole("heading", { name: "Catch" })));
    await act(async () => { dom.window.location.hash = "#unknown"; });
    await waitFor(() => assert.ok(page.getByRole("heading", { name: "Battle first" })));
    assert.equal(page.getByRole("link", { name: "Play" }).getAttribute("aria-current"), "page");
  });
});
