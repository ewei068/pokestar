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
      view, catalog)?.text, "Bulbasaur used Tackle!");
    assert.equal(presentEvent({ type: "hpChanged", sequence: 1, pokemonId: "p2", amount: -9 },
      view, catalog)?.text, "Eevee took 9 damage!");
    assert.equal(highlightedPokemonId({ type: "targetMissed", sequence: 2,
      pokemonId: "p1", targetPokemonId: "p2" }), "p2");
  });
  it("uses the matching semantic tone for buff and debuff labels", () => {
    for (const [type, tone] of [["Buff", "buff"], ["Debuff", "debuff"], ["Neutral", "neutral"]]) {
      assert.equal(presentEvent({ type: "effectApplied", sequence: 0, pokemonId: "p1", effectId: "focus" },
        view, { ...catalog, effects: { focus: { type } } })?.cue.tone, tone);
    }
  });
  it("resolves short copy and narration from the same catalog context", () => {
    const result = presentEvent({ type: "effectApplied", sequence: 0, pokemonId: "p1", effectId: "focus" },
      view, { ...catalog, effects: { focus: { name: "Focus" } } });
    assert.equal(result?.text, "Bulbasaur gained Focus!");
    assert.equal(result?.cue.label, "Focus");
    assert.equal(result?.cue.subjectId, "p1");
    assert.equal(presentEvent({ type: "moveCompleted", sequence: 0 }, view, catalog), null);
  });
  it("uses status-specific battle phrases without changing status identity or cue subjects", () => {
    for (const [statusId, applied, removed] of [
      ["Burn", "was burned!", "was cured of its burn!"],
      ["Freeze", "was frozen solid!", "thawed out!"],
      ["Paralysis", "is paralyzed! It may be unable to move!", "was cured of its paralysis!"],
      ["Poison", "was poisoned!", "was cured of its poison!"],
      ["Badly Poison", "was badly poisoned!", "was cured of its poison!"],
      ["Sleep", "fell asleep!", "woke up!"],
    ]) {
      for (const [type, phrase, tone] of [["statusApplied", applied, "status"], ["statusRemoved", removed, "heal"]]) {
        const result = presentEvent({ type, sequence: 0, pokemonId: "p2", statusId }, view, catalog);
        assert.equal(result?.text, `Eevee ${phrase}`);
        assert.equal(result?.cue.subjectId, "p2");
        assert.equal(result?.cue.tone, tone);
      }
    }
    assert.equal(presentEvent({ type: "statusApplied", sequence: 0, pokemonId: "p2", statusId: "Custom" },
      view, catalog)?.text, "Eevee was affected by Custom!");
    assert.equal(presentEvent({ type: "statusRemoved", sequence: 0, pokemonId: "p2" },
      view, catalog)?.text, "Eevee recovered from its status condition!");
  });
  it("distinguishes new weather, intensification, clearing and unknown weather", () => {
    const weather = (weatherId?: string, previousWeatherId?: string) => presentEvent({
      type: "weatherChanged", sequence: 0, weatherId, previousWeatherId,
    }, view, catalog);
    assert.equal(weather("Sun")?.text, "The sunlight turned harsh!");
    assert.equal(weather("Rain", "Sun")?.text, "It started to rain!");
    assert.equal(weather("Rain", "Rain")?.text, "The weather intensified!");
    assert.equal(weather(undefined, "Rain")?.text, "The rain stopped.");
    assert.equal(weather(undefined)?.text, "The weather cleared up!");
    assert.equal(weather("Custom")?.text, "Custom began.");
    assert.equal(weather("Sun")?.cue.subjectId, null);
  });
  it("keeps exact HP amounts and short cues while narrating healing", () => {
    const result = presentEvent({ type: "hpChanged", sequence: 0, pokemonId: "p2", amount: 9 }, view, catalog);
    assert.equal(result?.text, "Eevee healed 9 HP!");
    assert.equal(result?.cue.label, "+9 HP");
    assert.equal(result?.cue.tone, "heal");
  });
});
