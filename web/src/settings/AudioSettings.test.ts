import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readAudioSettings } from "./AudioSettings";

const storage = (values: Record<string, string>) => ({ getItem: (key: string) => values[key] || null });

describe("site audio preferences", () => {
  it("migrates the existing SFX level and mute preference", () => {
    assert.deepEqual(readAudioSettings(storage({ "pokestar:battle-sfx": '{"volume":0.4,"muted":true}' })),
      { sfxVolume: 0.4, musicVolume: 0.25, muted: true });
  });

  it("prefers site settings and rejects invalid saved levels", () => {
    assert.deepEqual(readAudioSettings(storage({ "pokestar:audio-settings":
      '{"sfxVolume":2,"musicVolume":0.1,"muted":false}' })),
      { sfxVolume: 0.55, musicVolume: 0.1, muted: false });
  });
});
