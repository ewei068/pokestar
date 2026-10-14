import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { makeBattleStory } from "../dev/battleStories";
import { resolveVfxType } from "./types";

describe("tile VFX matrix", () => {
  it("uses Normal art for extra or future engine types", () => {
    const catalog = makeBattleStory("ready").catalog;
    for (const type of ["unknown", "shadow", "stellar", "new-type", 18, 19, 45]) {
      assert.equal(resolveVfxType(type, catalog), "normal");
    }
    assert.equal(resolveVfxType(9, catalog), "fire");
  });
});
