import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { JSDOM } from "jsdom";
import { AudioSettingsProvider } from "../../settings/AudioSettings";
import { useBattleMusic } from "./useBattleMusic";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/" });
for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document,
  navigator: dom.window.navigator, localStorage: dom.window.localStorage }))
  Object.defineProperty(globalThis, key, { configurable: true, value });
const { act, cleanup, renderHook } = await import("@testing-library/react");

let hidden = false;
Object.defineProperty(document, "visibilityState", { configurable: true, get: () => hidden ? "hidden" : "visible" });
const clips: FakeAudio[] = [];
const contexts: FakeContext[] = [];
let play: () => Promise<void>;
const warnings: unknown[][] = [];
const originalWarn = console.warn;

class FakeAudio extends dom.window.EventTarget {
  paused = true;
  loop = false;
  preload = "";
  playCalls = 0;
  pauseCalls = 0;
  constructor(public src: string) { super(); clips.push(this); }
  async play() {
    this.playCalls++;
    await play();
    this.paused = false;
    this.dispatchEvent(new dom.window.Event("playing"));
  }
  pause() { this.pauseCalls++; this.paused = true; this.dispatchEvent(new dom.window.Event("pause")); }
  removeAttribute() {}
  load() {}
}

class FakeContext {
  state = "suspended";
  onstatechange: (() => void) | null = null;
  destination = {};
  currentTime = 0;
  resumeCalls = 0;
  constructor() { contexts.push(this); }
  createMediaElementSource() { return { connect: (node: unknown) => node }; }
  createGain() { return { gain: { setValueAtTime() {} }, connect() {} }; }
  async resume() { this.resumeCalls++; this.state = "running"; this.onstatechange?.(); }
  async close() { this.state = "closed"; }
}
Object.defineProperty(globalThis, "Audio", { configurable: true, value: FakeAudio });
Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: FakeContext });

const mount = async (autoPlay = true) => {
  const hook = renderHook(() => useBattleMusic("battle", null, { autoPlay }), { wrapper: AudioSettingsProvider });
  await act(async () => {});
  return hook;
};
const input = async (type: string) => { await act(async () => { window.dispatchEvent(new dom.window.Event(type)); }); };

beforeEach(() => {
  clips.length = 0;
  contexts.length = 0;
  warnings.length = 0;
  hidden = false;
  play = async () => {};
  console.warn = (...args) => { warnings.push(args); };
});
afterEach(() => { cleanup(); console.warn = originalWarn; });

describe("battle music recovery", () => {
  it("retries rejected autoplay on ordinary touch input without changing the track", async () => {
    play = async () => { throw new Error("NotAllowedError"); };
    const hook = await mount();
    assert.equal(hook.result.current.playing, false);
    assert.equal(warnings.length, 1);
    play = async () => {};
    await input("touchend");
    assert.equal(hook.result.current.playing, true);
    assert.equal(clips.length, 1);
    assert.equal(clips[0].playCalls, 2);
    await input("pointerup");
    assert.equal(clips[0].playCalls, 2);
  });

  it("pauses when hidden and resumes the same track and interrupted context on return", async () => {
    const hook = await mount();
    hidden = true;
    await act(async () => { document.dispatchEvent(new dom.window.Event("visibilitychange")); });
    assert.equal(clips[0].pauseCalls, 1);
    assert.equal(clips[0].paused, true);
    await input("focus");
    assert.equal(clips[0].playCalls, 1);
    contexts[0].state = "interrupted";
    await act(async () => { contexts[0].onstatechange?.(); });
    assert.equal(hook.result.current.playing, false);
    hidden = false;
    await act(async () => { document.dispatchEvent(new dom.window.Event("visibilitychange")); });
    assert.equal(contexts[0].resumeCalls, 2);
    assert.equal(clips[0].playCalls, 2);
    assert.equal(clips.length, 1);
    assert.equal(hook.result.current.playing, true);
  });

  it("resumes a suspended context even when the media element is not paused", async () => {
    const hook = await mount();
    contexts[0].state = "suspended";
    await input("pointerup");
    assert.equal(contexts[0].resumeCalls, 2);
    assert.equal(clips[0].playCalls, 1);
    assert.equal(hook.result.current.playing, true);
  });

  it("stops a pending play that completes after the tab becomes hidden", async () => {
    let resolve!: () => void;
    play = () => new Promise(done => { resolve = done; });
    const hook = await mount();
    hidden = true;
    await act(async () => {
      document.dispatchEvent(new dom.window.Event("visibilitychange"));
      resolve();
    });
    assert.equal(clips[0].paused, true);
    assert.equal(hook.result.current.playing, false);
  });

  it("recovers media paused by the browser on pageshow or focus", async () => {
    const hook = await mount();
    await act(async () => { clips[0].pause(); });
    await input("pageshow");
    assert.equal(hook.result.current.playing, true);
    await act(async () => { clips[0].pause(); });
    await input("focus");
    assert.equal(clips[0].playCalls, 3);
  });

  it("keeps stories manual even after input or returning to the page", async () => {
    const hook = await mount(false);
    await input("touchend");
    await input("pageshow");
    assert.equal(contexts.length, 0);
    await act(async () => { hook.result.current.toggle(); });
    assert.equal(hook.result.current.playing, true);
    await act(async () => { hook.result.current.toggle(); });
    await input("keydown");
    await input("focus");
    assert.equal(hook.result.current.playing, false);
    assert.equal(clips[0].playCalls, 1);
  });

  it("ignores an older failed attempt after a newer attempt succeeds and removes recovery listeners on unmount", async () => {
    let reject!: (error: Error) => void;
    play = () => new Promise((_resolve, fail) => { reject = fail; });
    const hook = await mount();
    play = async () => {};
    await input("pointerup");
    await act(async () => { reject(new Error("Older autoplay rejected")); });
    assert.equal(hook.result.current.playing, true);
    assert.equal(clips[0].paused, false);
    assert.equal(warnings.length, 0);
    hook.unmount();
    await input("touchend");
    await input("pageshow");
    assert.equal(clips[0].playCalls, 2);
    assert.equal(contexts[0].state, "closed");
  });
});
