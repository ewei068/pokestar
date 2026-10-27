import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { makeBattleStory, storyDefinitions } from "./battleStories";
import { readVfxLabSelection, vfxLabKinds, vfxLabPatterns, vfxLabTypes, vfxLabUrl } from "./vfxLab";

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

  it("covers the six Normal motion cases with engine-shaped footprints", () => {
    const expected = [
      ["motion-tackle", "m33", [1]],
      ["motion-giga-impact", "m416", [2, 6]],
      ["motion-hyper-beam", "m63", [3, 7]],
      ["motion-soft-boiled", "m135", [2]],
      ["motion-sing", "m47", [5, 6, 7, 8]],
      ["motion-recover", "m105", [1]],
    ] as const;
    for (const [id, moveId, positions] of expected) {
      const story = makeBattleStory(id);
      assert.equal(story.playing?.event.moveId, moveId);
      assert.deepEqual(story.playing?.event.patternTiles?.map((tile) => tile.position), positions);
      assert.equal(story.playing?.event.moveType, "normal");
    }
    assert.equal(makeBattleStory("motion-recover").playing?.event.primaryTargetId,
      makeBattleStory("motion-recover").playing?.event.pokemonId);
    assert.equal(makeBattleStory("motion-sing").playing?.event.patternTiles?.length, 4);
  });

  it("builds audio studies with move, result, and faint barriers", () => {
    const rock = makeBattleStory("audio-rock-slide");
    assert.equal(rock.sequence?.events[0].type, "moveStarted");
    assert.equal(rock.sequence?.events[0].moveType, "rock");
    assert.ok(rock.sequence?.events[0].patternTiles?.length);
    assert.equal(rock.sequence?.events.filter((event) => event.type === "hpChanged").length, 2);

    const beam = makeBattleStory("audio-hyper-beam");
    assert.deepEqual(beam.sequence?.events.map((event) => event.type), ["moveStarted", "hpChanged"]);

    const tackle = makeBattleStory("audio-tackle");
    assert.deepEqual(tackle.sequence?.events.map((event) => event.type),
      ["moveStarted", "hpChanged", "pokemonFainted"]);
    assert.equal(tackle.sequence?.finalView.pokemon["Rival Team-94"].isFainted, true);

    const recover = makeBattleStory("audio-recover");
    assert.deepEqual(recover.sequence?.events.map((event) => event.type), ["moveStarted", "hpChanged"]);
    assert.ok(recover.sequence?.finalView.pokemon["Star Team-157"].hp! >
      recover.battle.view.pokemon["Star Team-157"].hp);
  });

  it("returns fresh fixtures and falls back to the ready story", () => {
    const first = makeBattleStory("ready");
    first.battle.view.pokemon["Star Team-157"].hp = 0;
    assert.equal(makeBattleStory("ready").battle.view.pokemon["Star Team-157"].hp, 168);
    assert.equal(makeBattleStory("unknown").id, "ready");
  });

  it("builds shareable lab scenarios across the full type/category/area matrix", () => {
    for (const type of vfxLabTypes) for (const kind of vfxLabKinds) for (const pattern of vfxLabPatterns) {
      const selection = { type, kind, pattern };
      assert.deepEqual(readVfxLabSelection(new URLSearchParams(vfxLabUrl(selection).slice(1))), selection);
      const story = makeBattleStory("vfx", selection);
      assert.equal(story.playing?.event.moveType, type);
      assert.ok(story.playing?.event.patternTiles?.length);
      assert.equal(story.playing?.event.targetPattern?.toLowerCase(), pattern);
      assert.ok(story.battle.availableActions.moves[0].targetPreviews?.[0].emptyTileTargets.every((tile) =>
        story.playing?.event.patternTiles?.some((item) => item.teamName === tile.teamName &&
          item.position === tile.position)));
    }
    assert.deepEqual(readVfxLabSelection(new URLSearchParams("type=bogus&kind=bogus&pattern=bogus")),
      { type: "fire", kind: "physical", pattern: "column" });
  });
});
