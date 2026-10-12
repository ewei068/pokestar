import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { moveEventFootprint, targetPreviewFor } from "./presentation";
import type { BattleDisplay, BattleView } from "./types";

const view: BattleView = {
  battleId: "battle", ended: false, winner: null, turn: 1, activePokemonId: "own",
  weather: { duration: 0 }, teams: { own: { rows: 1, cols: 2 }, rival: { rows: 1, cols: 2 } },
  pokemon: {
    own: { id: "own", speciesId: "1", name: "Own", shiny: false, hp: 10, maxHp: 10,
      level: 1, isFainted: false, combatReadiness: 100, position: 1, teamName: "own",
      type1: "grass", status: {}, effectIds: {} },
    rival: { id: "rival", speciesId: "4", name: "Rival", shiny: false, hp: 10, maxHp: 10,
      level: 1, isFainted: false, combatReadiness: 0, position: 1, teamName: "rival",
      type1: "fire", status: {}, effectIds: {} },
  },
};
const choice: BattleDisplay["availableActions"]["moves"][number] = {
  moveId: "area", targetPokemonIds: ["rival"], targetPreviews: [{
    primaryTargetPokemonId: "rival", targetPattern: "all", random: false,
    patternTiles: [{ teamName: "rival", position: 1 }, { teamName: "rival", position: 2 }],
    affectedPokemonIds: ["rival"], emptyTileTargets: [{ teamName: "rival", position: 2 }],
  }],
};

describe("battle presentation footprints", () => {
  it("uses the server's full per-target pattern including empty cells", () => {
    assert.deepEqual(targetPreviewFor(view, choice, "rival"), choice.targetPreviews?.[0]);
    assert.equal(targetPreviewFor(view, choice, "own"), null);
  });

  it("falls back to a single occupied tile for an older battle API", () => {
    assert.deepEqual(targetPreviewFor(view, { moveId: "single", targetPokemonIds: ["rival"] }, "rival"), {
      primaryTargetPokemonId: "rival", targetPattern: "single", random: false,
      patternTiles: [{ teamName: "rival", position: 1 }],
      affectedPokemonIds: ["rival"], emptyTileTargets: [],
    });
  });

  it("uses the resolved event footprint for playback", () => {
    assert.deepEqual(moveEventFootprint(view, { type: "moveStarted", sequence: 0,
      primaryTargetId: "rival", targetIds: ["rival"],
      patternTiles: [{ teamName: "rival", position: 2 }] }), {
      primaryTargetPokemonId: "rival", affectedPokemonIds: ["rival"],
      patternTiles: [{ teamName: "rival", position: 2 }],
    });
    assert.equal(moveEventFootprint(view, { type: "hpChanged", sequence: 1 }), null);
  });
});
