import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { createElement } from "react";
import { JSDOM } from "jsdom";
import { TrainerAccount, TrainerResources, TrainerStatus } from "./TrainerAccount";
import { SiteShell } from "../navigation/SiteShell";
import { AudioSettingsProvider } from "../settings/AudioSettings";
import type { TrainerProfile } from "./types";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/pokestar/" });
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, localStorage: dom.window.localStorage })) {
  Object.defineProperty(globalThis, key, { configurable: true, value });
}
dom.window.scrollTo = () => {};
const { render, cleanup, fireEvent } = await import("@testing-library/react");
const userEvent = (await import("@testing-library/user-event")).default;
afterEach(() => { cleanup(); dom.window.localStorage.clear(); });

const profile: TrainerProfile = { displayName: "Leaf", avatarUrl: null, level: 18, money: 12480,
  exp: { current: 560, required: 1800 } };
const accountPage = (options: Partial<Parameters<typeof TrainerAccount>[0]> = {}) => {
  const props = { profile, loading: false, userId: "123456789012345678", pending: false,
    onRetry() {}, onSignOut() {}, ...options };
  return render(createElement(AudioSettingsProvider, { children: createElement(SiteShell, {
    account: createElement(TrainerAccount, props), resources: createElement(TrainerResources, props),
    children: createElement("main", {}, "Play"),
  }) }));
};

describe("trainer header and account", () => {
  it("shows server resources and exact level progress, and closes with Escape to the account control", async () => {
    const page = accountPage();
    const user = userEvent.setup({ document: dom.window.document });
    assert.match(page.getByRole("group", { name: "Money" }).textContent || "", /12,480/);
    const control = page.getByLabelText("Trainer account");
    await user.click(control);
    const panel = page.getByRole("region", { name: "Trainer details" });
    assert.match(panel.textContent || "", /Leaf.*Lv\. 18.*560 \/ 1,800.*To level 19.*12,480.*123456789012345678/s);
    assert.equal(page.getByRole("progressbar", { name: "EXP toward next trainer level" }).getAttribute("max"), "1800");
    page.getByRole("button", { name: "Sign out" }).focus();
    await user.keyboard("{Escape}");
    assert.equal(control.parentElement?.hasAttribute("open"), false);
    assert.equal(dom.window.document.activeElement, control);
  });

  it("shows no unconfirmed balances while pending and still offers sign out", async () => {
    let signouts = 0;
    const page = accountPage({ profile: null, loading: true, onSignOut: () => { signouts++; } });
    assert.equal(page.queryByRole("group", { name: "Money" }), null);
    assert.ok(page.getByText("Loading trainer…"));
    const user = userEvent.setup({ document: dom.window.document });
    await user.click(page.getByLabelText("Trainer account"));
    assert.ok(page.getByText("Getting your trainer ready…"));
    assert.equal(page.queryByRole("button", { name: "Try again" }), null);
    await user.click(page.getByRole("button", { name: "Sign out" }));
    assert.equal(signouts, 1);
  });

  it("offers trainer retry separately from sign out on an authenticated failure", async () => {
    let retries = 0;
    const page = accountPage({ profile: null, onRetry: () => { retries++; } });
    const user = userEvent.setup({ document: dom.window.document });
    assert.ok(page.getByText("Trainer unavailable"));
    await user.click(page.getByLabelText("Trainer account"));
    await user.click(page.getByRole("button", { name: "Try again" }));
    assert.equal(retries, 1);
    assert.ok(page.getByRole("button", { name: "Sign out" }));
    assert.equal(page.queryByRole("progressbar"), null);
  });

  it("uses initial fallback after an avatar failure and exposes a complete long name without hover", async () => {
    const name = "AlexandriaTheEverlastingChampion";
    const page = accountPage({ profile: { ...profile, displayName: name,
      avatarUrl: "https://cdn.discordapp.com/avatars/123/avatar.png" } });
    for (const image of page.container.querySelectorAll("img")) fireEvent.error(image);
    assert.equal(page.container.querySelectorAll("img").length, 0);
    await userEvent.setup({ document: dom.window.document }).click(page.getByLabelText("Trainer account"));
    assert.ok(page.getByRole("heading", { name }));
    assert.equal(page.getByLabelText("Trainer account").querySelector(".account-mark")?.textContent, "A");
  });

  it("does not invent a next threshold or claim action at maximum level", async () => {
    const page = accountPage({ profile: { ...profile, level: 100, exp: null } });
    await userEvent.setup({ document: dom.window.document }).click(page.getByLabelText("Trainer account"));
    assert.ok(page.getByText("Max level"));
    assert.equal(page.queryByRole("progressbar"), null);
    assert.doesNotMatch(page.container.textContent || "", /level 101|Claim/);
  });

  it("keeps unavailable and pending setup messages distinct", async () => {
    let retries = 0;
    const retry = () => { retries++; };
    const page = render(createElement(TrainerStatus, { loading: false, pending: false, onRetry: retry }));
    assert.match(page.getByRole("alert").textContent || "", /Couldn't load your trainer/);
    await userEvent.setup({ document: dom.window.document }).click(page.getByRole("button", { name: "Try again" }));
    assert.equal(retries, 1);
    page.rerender(createElement(TrainerStatus, { loading: false, pending: true, onRetry: retry }));
    const pendingRetry = page.getByRole("button", { name: "Try again" });
    assert.equal(pendingRetry.hasAttribute("disabled"), true);
    await userEvent.setup({ document: dom.window.document }).click(pendingRetry);
    assert.equal(retries, 1);
    page.rerender(createElement(TrainerStatus, { loading: true, pending: false, onRetry: retry }));
    assert.match(page.getByRole("status").textContent || "", /Getting your trainer ready/);
    assert.equal(page.queryByRole("button"), null);
  });
});
