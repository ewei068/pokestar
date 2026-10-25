import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { createElement, StrictMode } from "react";
import { JSDOM } from "jsdom";
import { LoginScreen } from "./LoginScreen";
import { useAuth } from "./useAuth";
import { loginReturnTo } from "./loginState";
import { getMe, logout, startLogin } from "../http";

const dom = new JSDOM("<!doctype html><html><head><title>Pokestar Battles</title></head><body></body></html>", { url: "https://pokestar.example/" });
Object.defineProperty(globalThis, "window", { configurable: true, value: dom.window });
Object.defineProperty(globalThis, "document", { configurable: true, value: dom.window.document });
Object.defineProperty(globalThis, "navigator", { configurable: true, value: dom.window.navigator });
Object.defineProperty(globalThis, "HTMLElement", { configurable: true, value: dom.window.HTMLElement });
const { render, cleanup, waitFor, act } = await import("@testing-library/react");
const userEvent = (await import("@testing-library/user-event")).default;
const originalFetch = globalThis.fetch;
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
afterEach(() => {
  cleanup();
  Object.defineProperty(globalThis, "window", { configurable: true, value: dom.window });
  globalThis.fetch = originalFetch;
  dom.reconfigure({ url: "https://pokestar.example/" });
});

const AuthPage = () => {
  const auth = useAuth();
  if (auth.state.kind === "loading") return createElement("p", {}, "Loading");
  if (auth.state.kind === "ready") return createElement("div", {}, `Trainer ${auth.state.userId}`,
    createElement("button", { onClick: () => { void auth.signOut(); } }, "Sign out"));
  return createElement(LoginScreen, { error: auth.state.error, pending: auth.pending, onRetry: auth.retry, homeHref: "/" });
};

describe("sign-in recovery", () => {
  it("keeps the battle link and blocks repeated sign-in attempts until the rate limit resets", async () => {
    dom.reconfigure({ url: "https://pokestar.example/?battle=battle-1" });
    let starts = 0;
    const now = Date.now;
    let clock = now();
    Date.now = () => clock;
    globalThis.fetch = async input => {
      if (String(input).endsWith("/me")) return json({ error: "login_required" }, 401);
      starts++;
      assert.match(String(input), /returnTo=%2F%3Fbattle%3Dbattle-1/);
      return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { "Retry-After": "10" } });
    };
    try {
      const page = render(createElement(AuthPage));
      const user = userEvent.setup({ document: dom.window.document });
      await user.click(await page.findByRole("button", { name: "Sign in with Discord" }));
      await page.findByRole("heading", { name: "Please wait before signing in again" });
      await user.click(page.getByRole("button", { name: "Try again" }));
      assert.equal(starts, 1);
      assert.equal(dom.window.location.search, "?battle=battle-1");
      clock += 10000;
      await user.click(page.getByRole("button", { name: "Try again" }));
      assert.equal(starts, 2);
    } finally { Date.now = now; }
  });

  it("keeps sign-in locked during navigation and allows retry after a cached page return", async () => {
    const navigations: string[] = [];
    const location = { search: "", assign: (url: string) => { navigations.push(url); } };
    Object.defineProperty(globalThis, "window", { configurable: true, value: new Proxy(dom.window, {
      get: (target, key) => key === "location" ? location : Reflect.get(target, key, target),
    }) });
    let starts = 0;
    globalThis.fetch = async input => {
      if (String(input).endsWith("/me")) return json({ error: "login_required" }, 401);
      starts++;
      return json({ authorizationUrl: "https://discord.com/oauth2/authorize?state=first" });
    };
    const page = render(createElement(AuthPage));
    const user = userEvent.setup({ document: dom.window.document });
    await user.click(await page.findByRole("button", { name: "Sign in with Discord" }));
    await waitFor(() => assert.equal(navigations.length, 1));
    const pending = page.getByRole("button", { name: "Opening Discord…" });
    assert.equal(pending.hasAttribute("disabled"), true);
    await user.click(pending);
    assert.equal(starts, 1);
    await act(async () => { dom.window.dispatchEvent(new dom.window.PageTransitionEvent("pageshow", { persisted: true })); });
    await user.click(page.getByRole("button", { name: "Sign in with Discord" }));
    await waitFor(() => assert.equal(navigations.length, 2));
    assert.equal(starts, 2);
  });

  it("supports auth requests in browsers without AbortSignal.timeout", async () => {
    const descriptor = Object.getOwnPropertyDescriptor(AbortSignal, "timeout");
    Object.defineProperty(AbortSignal, "timeout", { configurable: true, value: undefined });
    const requests: string[] = [];
    globalThis.fetch = async (input, options) => {
      requests.push(String(input));
      assert.ok(options?.signal instanceof AbortSignal);
      if (String(input).includes("/login?")) return json({ authorizationUrl: "https://discord.com/oauth2/authorize?client_id=123" });
      if (String(input).endsWith("/logout")) return new Response(null, { status: 204 });
      return json({ discordUserId: "123" });
    };
    try {
      assert.equal((await getMe()).discordUserId, "123");
      assert.match(await startLogin(), /^https:\/\/discord.com\/oauth2\/authorize/);
      await logout();
      assert.equal(requests.length, 3);
    } finally {
      if (descriptor) Object.defineProperty(AbortSignal, "timeout", descriptor);
    }
  });

  it("keeps initial signed-out visits as an ordinary sign-in screen", async () => {
    globalThis.fetch = async () => json({ error: "login_required" }, 401);
    const page = render(createElement(AuthPage));
    await page.findByRole("button", { name: "Sign in with Discord" });
    assert.equal(page.queryByRole("alert"), null);
  });

  it("explains a missing session after a successful callback without losing the battle link", async () => {
    dom.reconfigure({ url: "https://pokestar.example/?battle=battle-1&authComplete=1" });
    globalThis.fetch = async () => json({ error: "login_required" }, 401);
    const page = render(createElement(AuthPage));
    await page.findByRole("heading", { name: "We couldn't keep you signed in" });
    assert.match(page.getByRole("alert").textContent || "", /same browser.*cookies/);
    assert.equal(dom.window.location.search, "?battle=battle-1");
    assert.equal(page.getByRole("link", { name: "Back to battles" }).getAttribute("href"), "/");
  });

  it("shows cancelled sign-in immediately, consumes the error marker and handles retry startup failure", async () => {
    dom.reconfigure({ url: "https://pokestar.example/?battle=battle-1&authError=cancelled" });
    const requests: string[] = [];
    globalThis.fetch = async input => { requests.push(String(input)); throw new Error("private internal error"); };
    const page = render(createElement(AuthPage));
    assert.ok(page.getByRole("heading", { name: "Sign-in cancelled" }));
    assert.deepEqual(requests, []);
    assert.equal(dom.window.location.search, "?battle=battle-1");
    await userEvent.setup({ document: dom.window.document }).click(page.getByRole("button", { name: "Try again" }));
    await page.findByRole("heading", { name: "Couldn't open Discord sign-in" });
    assert.match(requests[0], /returnTo=%2F%3Fbattle%3Dbattle-1/);
    assert.doesNotMatch(page.container.textContent || "", /private internal error/);
    assert.equal(page.getByRole("button", { name: "Try again" }).hasAttribute("disabled"), false);
  });

  it("retries a failed session check without starting another Discord authorization", async () => {
    const requests: string[] = [];
    globalThis.fetch = async input => { requests.push(String(input)); return requests.length === 1
      ? json({ error: "internal_error" }, 500) : json({ discordUserId: "123" }); };
    const page = render(createElement(AuthPage));
    await page.findByRole("heading", { name: "Can't connect to Pokestar" });
    await userEvent.setup({ document: dom.window.document }).click(page.getByRole("button", { name: "Try again" }));
    await page.findByText("Trainer 123");
    assert.deepEqual(requests, ["/api/me", "/api/me"]);
  });

  it("handles failed sign-out and treats an already-expired session as signed out", async () => {
    let signouts = 0;
    globalThis.fetch = async input => String(input).endsWith("/logout")
      ? json({ error: "internal_error" }, ++signouts === 1 ? 500 : 401) : json({ discordUserId: "123" });
    const page = render(createElement(AuthPage));
    await page.findByText("Trainer 123");
    const user = userEvent.setup({ document: dom.window.document });
    await user.click(page.getByRole("button", { name: "Sign out" }));
    await page.findByRole("heading", { name: "Couldn't sign out" });
    await user.click(page.getByRole("button", { name: "Try signing out again" }));
    await page.findByRole("button", { name: "Sign in with Discord" });
  });

  it("does not let a late failed identity check overwrite a newer successful one", async () => {
    let release: (value: Response) => void = () => {};
    const first = new Promise<Response>(resolve => { release = resolve; });
    let calls = 0;
    globalThis.fetch = async () => ++calls === 1 ? first : json({ discordUserId: "123" });
    const page = render(createElement(StrictMode, {}, createElement(AuthPage)));
    await page.findByText("Trainer 123");
    await act(async () => { release(json({ error: "internal_error" }, 500)); await first; });
    await waitFor(() => assert.ok(page.getByText("Trainer 123")));
    assert.equal(page.queryByRole("alert"), null);
  });

  it("uses a fixed fallback for unknown errors and disables pending actions", () => {
    const page = render(createElement(LoginScreen, {
      error: "<script>private-error</script>", pending: "login", onRetry() {}, homeHref: "/",
    }));
    assert.ok(page.getByRole("heading", { name: "Couldn't sign you in" }));
    assert.doesNotMatch(page.getByRole("alert").textContent || "", /private-error/);
    assert.equal(page.getByRole("button", { name: "Opening Discord…" }).hasAttribute("disabled"), true);
  });

  it("preserves a hosted base path and battle query while removing prior login outcomes", () => {
    assert.equal(loginReturnTo("/pokestar/", "?battle=battle-1&authError=invalid_state&authComplete=1"), "/pokestar/?battle=battle-1");
  });
});
