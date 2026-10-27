import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { newPlaybackFrames } from "./playback";
import type { BattleCatalog, BattleResponse, BattleView } from "./types";

const catalog: BattleCatalog = {
  rulesetVersion: 2, species: {}, moves: {}, effects: {}, abilities: {}, heldItems: {},
};
const view = (turn: number): BattleView => ({
  battleId: "battle", ended: false, winner: null, turn,
  activePokemonId: "p1", weather: { duration: 0 }, teams: {},
  pokemon: { p1: {
    id: "p1", speciesId: "1", name: "Bulbasaur", shiny: false,
    hp: 10, maxHp: 10, level: 1, isFainted: false, combatReadiness: 0,
    position: 1, teamName: "A", type1: "Grass", status: {}, effectIds: {},
  } },
});
const response: BattleResponse = {
  found: true, battleId: "battle", stateId: "state-3", rulesetVersion: 2,
  revision: 3, status: "active", completionStatus: "none", mode: {},
  myTeamNames: ["A"], isMyTurn: true, view: view(3),
  availableActions: { canSkip: true, moves: [] },
  updates: [
    { revision: 1, action: { action: "skipTurn" }, events: [
      { type: "turnStarted", sequence: 0, pokemonId: "p1" },
    ], log: [], view: view(1) },
    { revision: 2, action: { action: "skipTurn" }, events: [
      { type: "actionStarted", sequence: 0, pokemonId: "p1", action: "skipTurn" },
    ], log: [], view: view(2) },
    { revision: 3, action: { action: "skipTurn" }, events: [
      { type: "turnStarted", sequence: 0, pokemonId: "p1" },
    ], log: [] },
  ],
};

describe("battle playback", () => {
  it("opens at the current view without replaying old actions", () => {
    assert.deepEqual(newPlaybackFrames(null, response, catalog), []);
  });

  it("plays unseen updates in order against their post-action views", () => {
    const frames = newPlaybackFrames(1, response, catalog);
    assert.deepEqual(frames.map((frame) => [frame.view.turn, frame.text]), [
      [2, "Bulbasaur skipped its turn."],
      [3, "Bulbasaur's turn began."],
    ]);
    assert.deepEqual(newPlaybackFrames(3, response, catalog), []);
    assert.deepEqual(newPlaybackFrames(4, response, catalog), []);
  });
});
