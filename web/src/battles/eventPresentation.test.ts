import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { presentEvent, highlightedPokemonId } from "./eventPresentation";
import type { BattleCatalog, BattleView, PokemonView } from "./types";

const catalog: BattleCatalog = {
  rulesetVersion: 2,
  species: {},
  moves: { m1: { name: "Tackle", type: "Normal" } },
  effects: {},
  abilities: {},
  heldItems: {},
};
const pokemon = (id: string, name: string): PokemonView => ({
  id, name, speciesId: "1", shiny: false, hp: 10, maxHp: 10, level: 1,
  isFainted: false, combatReadiness: 0, position: 1, teamName: "A",
  type1: "Grass", status: {}, effectIds: {},
});
const view: BattleView = {
  battleId: "battle", ended: false, winner: null, turn: 1,
  activePokemonId: "p1", weather: { duration: 0 }, teams: {},
  pokemon: { p1: pokemon("p1", "Bulbasaur"), p2: pokemon("p2", "Eevee") },
};

describe("battle event text", () => {
  it("uses the resolved event order and display catalog", () => {
    assert.equal(presentEvent({ type: "moveStarted", sequence: 0, pokemonId: "p1", moveId: "m1" },
      view, catalog)?.text, "Bulbasaur used Tackle.");
    assert.equal(presentEvent({ type: "hpChanged", sequence: 1, pokemonId: "p2", amount: -9 },
      view, catalog)?.text, "Eevee lost 9 HP.");
    assert.equal(highlightedPokemonId({ type: "targetMissed", sequence: 2,
      pokemonId: "p1", targetPokemonId: "p2" }), "p2");
  });
  it("resolves short copy and narration from the same catalog context", () => {
    const result = presentEvent({ type: "effectApplied", sequence: 0, pokemonId: "p1", effectId: "focus" },
      view, { ...catalog, effects: { focus: { name: "Focus" } } });
    assert.equal(result?.text, "Bulbasaur gained Focus.");
    assert.equal(result?.cue.label, "Focus");
    assert.equal(result?.cue.subjectId, "p1");
    assert.equal(presentEvent({ type: "moveCompleted", sequence: 0 }, view, catalog), null);
  });
});
