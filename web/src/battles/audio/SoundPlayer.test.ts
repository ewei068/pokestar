import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { SoundPlayer } from "./SoundPlayer";

const originalFetch = globalThis.fetch;
const originalAudioContext = globalThis.AudioContext;
afterEach(() => {
  globalThis.fetch = originalFetch;
  Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: originalAudioContext });
});

describe("battle sound scheduling", () => {
  it("seeks past a late load to retain the approved move's contact timing", async () => {
    let time = 0;
    let release!: (response: Response) => void;
    const sources: { started?: [number, number]; stopped?: number; onended?: () => void }[] = [];
    class FakeContext {
      state = "running";
      destination = {};
      get currentTime() { return time; }
      createGain() { return { gain: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {} },
        connect() { return this; } }; }
      createBufferSource() {
        const source = { buffer: null, onended: () => {}, connect() { return this; },
          start(at: number, offset: number) { record.started = [at, offset]; },
          stop(at: number) { record.stopped = at; } };
        const record: (typeof sources)[number] = {};
        sources.push(record);
        return source;
      }
      async resume() {}
      async close() {}
      async decodeAudioData() { return { duration: 2 }; }
    }
    Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: FakeContext });
    globalThis.fetch = (() => new Promise(resolve => { release = resolve; })) as typeof fetch;
    const player = new SoundPlayer();
    assert.equal(await player.unlock(), true);
    const playing = player.play({ clip: { src: "/move.mp3", offsetSeconds: 0.25, delayMs: 420 },
      delayMs: 420, maxSeconds: 1.08 });
    time = 0.5;
    release({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) } as Response);
    assert.equal(await playing, true);
    assert.deepEqual(sources[0].started?.map(value => Number(value.toFixed(2))), [0.5, 0.33]);
    assert.equal(Number(sources[0].stopped?.toFixed(2)), 1.5);
    player.dispose();
  });

  it("discards a pending sound when playback is skipped", async () => {
    let release!: (response: Response) => void;
    let starts = 0;
    class FakeContext {
      state = "running";
      destination = {};
      currentTime = 0;
      createGain() { return { gain: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {} },
        connect() { return this; } }; }
      createBufferSource() { starts++; return { connect() { return this; }, start() {}, stop() {} }; }
      async resume() {}
      async close() {}
      async decodeAudioData() { return { duration: 1 }; }
    }
    Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: FakeContext });
    globalThis.fetch = (() => new Promise(resolve => { release = resolve; })) as typeof fetch;
    const player = new SoundPlayer();
    await player.unlock();
    const playing = player.play({ clip: { src: "/move.mp3", offsetSeconds: 0, delayMs: 420 },
      delayMs: 420, maxSeconds: 1 });
    player.stopAll();
    release({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) } as Response);
    assert.equal(await playing, null);
    assert.equal(starts, 0);
    player.dispose();
  });
});
