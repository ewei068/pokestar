import assert from "node:assert/strict";
import { afterEach, it } from "node:test";
import type { TestContext } from "node:test";
import { StrictMode, createElement } from "react";
import { JSDOM } from "jsdom";
import { ApiError } from "../http";
import type { TrainingContext, TrainingResult } from "../player/types";
import { useTrainingLoop } from "./useTrainingLoop";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, HTMLElement: dom.window.HTMLElement })) {
  Object.defineProperty(globalThis, key, { configurable: true, value });
}
Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" });
// CI compares Node 18's array API with Node 24's options API.
const enableTimers = (t: TestContext) => {
  const timers = t.mock.timers as unknown as { enable(options: { apis: ["setTimeout"] } | ["setTimeout"]): void };
  timers.enable(Number(process.versions.node.split(".")[0]) < 20 ? ["setTimeout"] : { apis: ["setTimeout"] });
};
const { renderHook, cleanup, act } = await import("@testing-library/react");
afterEach(() => { cleanup(); Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" }); });
const context = { pokemon: { id: "one", level: 100 }, locations: [{ id: "0", name: "Home", emoji: "", level: 0,
  owned: false, canTrain: true, nextGains: { exp: 2, evs: [0, 0, 0, 0, 0, 0] } }] } as TrainingContext;
const result = (exp = 2, evs = [0, 0, 0, 0, 0, 0], canTrain = true): TrainingResult => ({ ...context,
  discordUserId: "alice", trained: true, gains: { exp, evs }, locations: [{ ...context.locations[0], canTrain }] });
const flush = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };

it("waits 1000ms, never overlaps a slow tick, and waits from its completion", async t => {
  enableTimers(t);
  let calls = 0;
  let finish!: (result: TrainingResult) => void;
  const hook = renderHook(() => useTrainingLoop({ context, train: async () => {
    calls++; return new Promise(resolve => { finish = resolve; });
  }, refresh: async () => {}, onStop: () => {} }));
  act(() => { hook.result.current.toggle(); hook.result.current.toggle(); });
  // The second click is Stop, so no request is allowed to survive it.
  await act(async () => { t.mock.timers.tick(5000); await flush(); });
  assert.equal(calls, 0);
  act(() => hook.result.current.toggle());
  await act(async () => { t.mock.timers.tick(999); await flush(); });
  assert.equal(calls, 0);
  await act(async () => { t.mock.timers.tick(1); await flush(); });
  assert.equal(calls, 1);
  await act(async () => { t.mock.timers.tick(9000); await flush(); });
  assert.equal(calls, 1);
  await act(async () => { finish(result()); await flush(); });
  await act(async () => { t.mock.timers.tick(999); await flush(); });
  assert.equal(calls, 1);
  await act(async () => { t.mock.timers.tick(1); await flush(); });
  assert.equal(calls, 2);
  hook.unmount();
});

it("Stop during a request counts its signed gains once and cannot restart until it settles", async t => {
  enableTimers(t);
  let calls = 0;
  let finish!: (value: TrainingResult) => void;
  const hook = renderHook(() => useTrainingLoop({ context, train: async () => {
    calls++; return new Promise(resolve => { finish = resolve; });
  }, refresh: async () => {}, onStop: () => {} }));
  act(() => hook.result.current.toggle());
  await act(async () => { t.mock.timers.tick(1000); await flush(); });
  act(() => { hook.result.current.toggle(); hook.result.current.toggle(); hook.result.current.selectLocation("other"); });
  assert.equal(hook.result.current.pending, true);
  assert.equal(hook.result.current.locationId, "0");
  await act(async () => { finish(result(7, [0, -3, 2, 0, 0, 0])); await flush(); });
  assert.equal(hook.result.current.pending, false);
  assert.equal(hook.result.current.running, false);
  assert.deepEqual(hook.result.current.totals, { exp: 7, evs: [0, -3, 2, 0, 0, 0] });
  await act(async () => { t.mock.timers.tick(5000); await flush(); });
  assert.equal(calls, 1);
});

it("trusts server completion and counts only confirmed gains including warnings", async t => {
  enableTimers(t);
  let calls = 0;
  let refreshes = 0;
  const hook = renderHook(() => useTrainingLoop({ context, train: async () => {
    calls++; return { ...result(9, [1, 0, 0, 0, 0, 0]), warning: "event_failed" };
  }, refresh: async () => { refreshes++; }, onStop: () => {} }));
  act(() => hook.result.current.toggle());
  await act(async () => { t.mock.timers.tick(1000); await flush(); });
  assert.equal(hook.result.current.running, false);
  assert.equal(hook.result.current.totals.exp, 9);
  assert.match(hook.result.current.error || "", /saved/i);
  assert.equal(refreshes, 1);
  await act(async () => { t.mock.timers.tick(10000); await flush(); });
  assert.equal(calls, 1);
});

it("pauses on hidden/offline without resuming and ignores an unmounted result", async t => {
  enableTimers(t);
  let calls = 0;
  let guard!: () => boolean;
  let finish!: (value: TrainingResult) => void;
  const options = { context, train: async (_id: string, isCurrent: () => boolean) => {
    calls++; guard = isCurrent; return new Promise<TrainingResult>(resolve => { finish = resolve; });
  }, refresh: async () => {}, onStop: () => {} };
  const hook = renderHook(() => useTrainingLoop(options), { wrapper: ({ children }) => createElement(StrictMode, null, children) });
  act(() => hook.result.current.toggle());
  act(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "hidden" }); document.dispatchEvent(new dom.window.Event("visibilitychange")); });
  act(() => { Object.defineProperty(document, "visibilityState", { configurable: true, value: "visible" }); document.dispatchEvent(new dom.window.Event("visibilitychange")); });
  await act(async () => { t.mock.timers.tick(10000); await flush(); });
  assert.equal(calls, 0);
  act(() => { hook.result.current.toggle(); window.dispatchEvent(new dom.window.Event("offline")); });
  await act(async () => { t.mock.timers.tick(10000); await flush(); });
  assert.equal(calls, 0);
  act(() => hook.result.current.toggle());
  await act(async () => { t.mock.timers.tick(1000); await flush(); });
  assert.equal(calls, 1);
  hook.unmount();
  assert.equal(guard(), false);
  await act(async () => { finish(result()); await flush(); t.mock.timers.tick(10000); });
  assert.equal(calls, 1);
});

it("pauses unknown outcomes, refreshes without invented gains, and honors Retry-After", async t => {
  enableTimers(t);
  let now = 0;
  t.mock.method(Date, "now", () => now);
  let calls = 0;
  let refreshes = 0;
  const hook = renderHook(() => useTrainingLoop({ context, train: async () => {
    calls++; throw calls === 1 ? new TypeError("response lost") : new ApiError(429, "rate_limited", Date.now() + 60000);
  }, refresh: async () => { refreshes++; }, onStop: () => {} }));
  act(() => hook.result.current.toggle());
  await act(async () => { t.mock.timers.tick(1000); await flush(); });
  assert.equal(refreshes, 1);
  assert.equal(hook.result.current.totals.exp, 0);
  assert.match(hook.result.current.error || "", /may have completed/i);
  act(() => hook.result.current.toggle());
  await act(async () => { t.mock.timers.tick(1000); await flush(); });
  assert.equal(calls, 2);
  act(() => hook.result.current.toggle());
  await act(async () => { now += 59999; t.mock.timers.tick(59999); await flush(); });
  assert.equal(calls, 2);
  await act(async () => { now += 1; t.mock.timers.tick(1); await flush(); });
  act(() => hook.result.current.toggle());
  await act(async () => { t.mock.timers.tick(1000); await flush(); });
  assert.equal(calls, 3);
});

it("stops when the fresh server location is complete even if old context allows training", async t => {
  enableTimers(t);
  let calls = 0;
  const hook = renderHook(() => useTrainingLoop({ context, train: async () => { calls++; return result(0, [0, 0, 0, 0, 0, 0], false); }, refresh: async () => {}, onStop: () => {} }));
  act(() => hook.result.current.toggle());
  await act(async () => { t.mock.timers.tick(1000); await flush(); });
  assert.equal(hook.result.current.running, false);
  await act(async () => { t.mock.timers.tick(5000); await flush(); });
  assert.equal(calls, 1);
});


it("adds EXP-only, EV-only and reductions, then stops on an untrained completion", async t => {
  enableTimers(t);
  const responses = [result(5), result(0, [2, 0, 0, 0, 0, 0]), result(3, [-1, -2, 0, 0, 0, 0]),
    { ...result(0), trained: false }];
  let calls = 0;
  const hook = renderHook(() => useTrainingLoop({ context,
    train: async () => responses[calls++], refresh: async () => {}, onStop: () => {} }));
  act(() => hook.result.current.toggle());
  for (let i = 0; i < 4; i++) await act(async () => { t.mock.timers.tick(1000); await flush(); });
  assert.deepEqual(hook.result.current.totals, { exp: 8, evs: [1, -2, 0, 0, 0, 0] });
  assert.equal(hook.result.current.running, false);
  await act(async () => { t.mock.timers.tick(10000); await flush(); });
  assert.equal(calls, 4);
});
