import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { makeBattleStory } from "../dev/battleStories";
import { physicalScenes } from "./physical";
import { specialScenes } from "./special";
import { statusScenes } from "./status";
import { resolveVfxType, standardVfxTypes, vfxPalette } from "./types";

describe("tile VFX matrix", () => {
  it("provides a distinct SVG silhouette for every standard type and category", () => {
    const silhouettes = [physicalScenes, specialScenes, statusScenes].flatMap((scenes) =>
      standardVfxTypes.map((type) => {
        assert.ok(vfxPalette[type]);
        const markup = renderToStaticMarkup(scenes[type]);
        assert.ok(markup.includes("<path") || markup.includes("<circle") || markup.includes("<ellipse"));
        return markup;
      }));
    assert.equal(silhouettes.length, 54);
    assert.equal(new Set(silhouettes).size, 54);
  });

  it("uses Normal art for extra or future engine types", () => {
    const catalog = makeBattleStory("ready").catalog;
    for (const type of ["unknown", "shadow", "stellar", "new-type", 18, 19, 45]) {
      assert.equal(resolveVfxType(type, catalog), "normal");
    }
    assert.equal(resolveVfxType(9, catalog), "fire");
  });
});
