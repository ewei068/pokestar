import assert from "node:assert/strict";
import { describe, it } from "node:test";
import catalog from "./musicCatalog.json";
import { chooseMusicTrack, trackVolume } from "./musicCatalog";

describe("battle music selection", () => {
  it("chooses one track from the default pool and accepts encounter overrides", () => {
    assert.equal(chooseMusicTrack(null, () => 0).id, "default-battle-1");
    assert.equal(chooseMusicTrack(null, () => 0.99).id, "default-battle-5");
    assert.equal(chooseMusicTrack("dungeon", () => 0).id, "dungeon-1");
    assert.equal(chooseMusicTrack("trainer-cynthia").id, "trainer-cynthia");
    assert.equal(chooseMusicTrack("raid-mewtwo").id, "raid-mewtwo");
    assert.equal(chooseMusicTrack("raid-kyogre-groudon").id, "raid-kyogre-groudon");
    assert.equal(chooseMusicTrack("missing-theme", () => 0).id, "default-battle-1");
  });

  it("keeps a file pointer for every track", () => {
    const tracks = Object.values(catalog.tracks);
    assert.equal(tracks.length, 20);
    assert.ok(tracks.every(track => track.title && track.file));
  });

  it("uses a quieter default and accepts a per-track scalar", () => {
    assert.equal(trackVolume(chooseMusicTrack(null, () => 0)), 0.6);
    assert.equal(trackVolume({ volume: 1.25 }), 1.25);
    assert.equal(trackVolume({ volume: -1 }), 0.6);
  });
});
