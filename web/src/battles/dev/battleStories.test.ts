import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { makeBattleStory, storyDefinitions } from "./battleStories";

describe("battle UI stories", () => {
  it("provides stable, internally consistent scenarios", () => {
    assert.equal(new Set(storyDefinitions.map((definition) => definition.id)).size, storyDefinitions.length);
    for (const definition of storyDefinitions) {
      const { id, catalog, battle } = makeBattleStory(definition.id);
      assert.equal(id, definition.id);
      assert.equal(battle.rulesetVersion, catalog.rulesetVersion);
      assert.ok(battle.myTeamNames.every((name) => battle.view.teams[name]));

      for (const entry of Object.values(battle.view.pokemon)) {
        assert.ok(catalog.species[entry.speciesId], `${id}: missing species ${entry.speciesId}`);
        const dimensions = battle.view.teams[entry.teamName];
        assert.ok(dimensions && entry.position >= 1 && entry.position <= dimensions.rows * dimensions.cols,
          `${id}: invalid position for ${entry.id}`);
      }
      for (const choice of battle.availableActions.moves) {
        assert.ok(catalog.moves[choice.moveId], `${id}: missing move ${choice.moveId}`);
        assert.deepEqual(choice.targetPreviews?.map((preview) => preview.primaryTargetPokemonId),
          choice.targetPokemonIds);
        for (const preview of choice.targetPreviews || []) {
          for (const tile of preview.patternTiles) {
            const dimensions = battle.view.teams[tile.teamName];
            assert.ok(dimensions && tile.position >= 1 && tile.position <= dimensions.rows * dimensions.cols,
              `${id}: invalid pattern tile`);
          }
          for (const tile of preview.emptyTileTargets) {
            assert.ok(preview.patternTiles.some((item) => item.teamName === tile.teamName &&
              item.position === tile.position));
            assert.ok(!Object.values(battle.view.pokemon).some((entry) => entry.teamName === tile.teamName &&
              entry.position === tile.position));
          }
        }
      }
    }
  });

  it("covers targeting, playback, waiting, and completed states", () => {
    assert.equal(makeBattleStory("area-target").selectedMoveId, "eruption");
    assert.ok(makeBattleStory("playback").playing?.event.patternTiles?.length);
    assert.equal(makeBattleStory("waiting").battle.availableActions.moves.length, 0);
    assert.equal(makeBattleStory("completed").battle.view.ended, true);
    assert.equal(makeBattleStory("dense").battle.view.pokemon["Star Team-143"].type1, "normal");
  });

  it("returns fresh fixtures and falls back to the ready story", () => {
    const first = makeBattleStory("ready");
    first.battle.view.pokemon["Star Team-157"].hp = 0;
    assert.equal(makeBattleStory("ready").battle.view.pokemon["Star Team-157"].hp, 168);
    assert.equal(makeBattleStory("unknown").id, "ready");
  });
});
