import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { afterEach, describe, it } from "node:test";
import { JSDOM } from "jsdom";
import { useBattleSession } from "./useBattleSession";
import { makeBattleStory } from "./dev/battleStories";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://play.example/" });
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement, crypto: webcrypto })) {
  Object.defineProperty(globalThis, key, { configurable: true, value });
}
Object.defineProperty(dom.window.document, "visibilityState", { configurable: true, value: "visible" });
const { renderHook, cleanup, act, waitFor } = await import("@testing-library/react");
const originalFetch = globalThis.fetch;
const originalNow = Date.now;
const originalTimeout = globalThis.setTimeout;
const originalWindowTimeout = dom.window.setTimeout;
const originalInterval = dom.window.setInterval;
afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
  Date.now = originalNow;
  globalThis.setTimeout = originalTimeout;
  dom.window.setTimeout = originalWindowTimeout;
  dom.window.setInterval = originalInterval;
});
const story = makeBattleStory("result-sequence");
const initial = { ...story.battle, found: true, stateId: "state-1", updates: [] };
const json = (body: unknown, status = 200, headers = {}) => new Response(JSON.stringify(body), { status, headers });
const mount = () => renderHook(() => useBattleSession("battle-1", story.catalog));
const focus = () => dom.window.dispatchEvent(new dom.window.Event("focus"));

describe("battle transport recovery", () => {
  it("pauses manual, focus, visibility and interval reads until Retry-After, then resumes once", async () => {
    let now = 100000;
    Date.now = () => now;
    let poll = () => {}, retry = () => {};
    dom.window.setInterval = ((callback: () => void, delay?: number) => {
      if (delay === 3000) poll = callback;
      return originalInterval.call(dom.window, callback, delay);
    }) as typeof dom.window.setInterval;
    dom.window.setTimeout = ((callback: () => void, delay?: number) => {
      if (delay === 2000) retry = callback;
      return originalWindowTimeout.call(dom.window, callback, delay);
    }) as typeof dom.window.setTimeout;
    let reads = 0;
    globalThis.fetch = async () => ++reads === 1
      ? json({ error: "rate_limited" }, 429, { "Retry-After": "2" }) : json(initial);
    const hook = mount();
    await waitFor(() => assert.match(hook.result.current.error || "", /Too many requests/));
    await act(async () => {
      focus(); poll();
      dom.window.document.dispatchEvent(new dom.window.Event("visibilitychange"));
      await hook.result.current.refresh();
    });
    assert.equal(reads, 1);
    now += 2000;
    await act(async () => { retry(); focus(); poll(); });
    assert.equal(reads, 2);
    assert.equal(hook.result.current.battle?.revision, initial.revision);
    assert.equal(hook.result.current.error, null);
  });

  it("allows one read in flight and cancels it on unmount", async () => {
    let reads = 0;
    let signal: AbortSignal | null | undefined;
    globalThis.fetch = (_input, options) => {
      reads++; signal = options?.signal;
      return new Promise((_resolve, reject) => signal!.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError"))));
    };
    const hook = mount();
    await act(async () => { focus(); await hook.result.current.refresh(); });
    assert.equal(reads, 1);
    hook.unmount();
    assert.equal(signal?.aborted, true);
  });

  it("releases a timed-out poll so the next refresh can recover", async () => {
    let expire = () => {};
    globalThis.setTimeout = ((callback: (...args: unknown[]) => void, delay?: number, ...args: unknown[]) => {
      if (delay === 15000) expire = () => callback(...args);
      return originalTimeout(callback, delay, ...args);
    }) as typeof setTimeout;
    let reads = 0;
    globalThis.fetch = (_input, options) => ++reads === 1
      ? new Promise((_resolve, reject) => options!.signal!.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError"))))
      : Promise.resolve(json(initial));
    const hook = mount();
    await act(async () => { expire(); });
    assert.match(hook.result.current.error || "", /Couldn't load/);
    await act(async () => { await hook.result.current.refresh(); });
    assert.equal(reads, 2);
    assert.equal(hook.result.current.error, null);
  });

  it("does not retry a throttled write and requires a successful read before a deliberate new action", async () => {
    let now = 100000;
    Date.now = () => now;
    let posts = 0, reads = 0;
    globalThis.fetch = async (_input, options) => {
      if (options?.method === "POST") { posts++; return json({ error: "rate_limited" }, 429, { "Retry-After": "2" }); }
      reads++;
      return json(initial);
    };
    const hook = mount();
    await waitFor(() => assert.ok(hook.result.current.battle));
    await act(async () => { hook.result.current.skipTurn(); });
    assert.equal(posts, 1);
    await act(async () => { hook.result.current.skipTurn(); focus(); });
    assert.equal(posts, 1);
    assert.equal(reads, 1);
    now += 2000;
    await act(async () => { hook.result.current.skipTurn(); });
    assert.equal(posts, 1); // This attempt only refreshes; the POST is never replayed.
    assert.equal(reads, 2);
    await act(async () => { hook.result.current.skipTurn(); });
    assert.equal(posts, 2);
  });

  it("blocks a second write after an uncertain network failure until refreshed", async () => {
    let posts = 0, reads = 0;
    globalThis.fetch = async (_input, options) => {
      if (options?.method === "POST") { posts++; throw new Error("connection lost"); }
      reads++; return json(initial);
    };
    const hook = mount();
    await waitFor(() => assert.ok(hook.result.current.battle));
    await act(async () => { hook.result.current.skipTurn(); hook.result.current.skipTurn(); });
    assert.equal(posts, 1);
    assert.match(hook.result.current.error || "", /Couldn't confirm/);
    await act(async () => { hook.result.current.skipTurn(); });
    assert.equal(posts, 1);
    assert.equal(reads, 2);
  });

  it("ignores a late poll when a newer action has already returned", async () => {
    let reads = 0;
    let release: (response: Response) => void = () => {};
    const next = { ...initial, revision: initial.revision + 1, stateId: "state-2", accepted: true };
    const urls: string[] = [];
    globalThis.fetch = async (input, options) => {
      if (options?.method === "POST") return json(next);
      urls.push(String(input));
      if (++reads === 2) return new Promise<Response>(resolve => { release = resolve; });
      return json(reads === 1 ? initial : next);
    };
    const hook = mount();
    await waitFor(() => assert.ok(hook.result.current.battle));
    let poll: Promise<void>;
    await act(async () => { poll = hook.result.current.refresh(); });
    await act(async () => { hook.result.current.skipTurn(); });
    await act(async () => { release(json(initial)); await poll; });
    assert.equal(hook.result.current.battle?.revision, next.revision);
    await act(async () => { await hook.result.current.refresh(); });
    assert.match(urls.at(-1) || "", /after=state-2$/);
  });

  it("keeps session-expired and unavailable errors, and ignores older battle revisions", async () => {
    const responses = [json(initial), json({ ...initial, revision: initial.revision - 1, stateId: "older" }),
      json({ error: "login_required" }, 401), json({ error: "not_found" }, 404)];
    globalThis.fetch = async () => responses.shift()!;
    const hook = mount();
    await waitFor(() => assert.ok(hook.result.current.battle));
    await act(async () => { await hook.result.current.refresh(); });
    assert.equal(hook.result.current.battle?.revision, initial.revision);
    await act(async () => { await hook.result.current.refresh(); });
    assert.match(hook.result.current.error || "", /session has expired/);
    await act(async () => { await hook.result.current.refresh(); });
    assert.match(hook.result.current.error || "", /isn't available/);
  });
});
