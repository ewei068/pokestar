import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BattleInspector } from "./BattleInspector";
import { BattleGrid } from "./BattleGrid";
import { MovePanel } from "./MovePanel";
import type { BattleCatalog, BattleView } from "./types";

const catalog: BattleCatalog = {
  rulesetVersion: 2,
  species: { "4": { name: "Charmander", type: [9], sprite: "", shinySprite: "" } },
  moves: { m1: { name: "Ember", type: 9, damageType: "Special" } },
  effects: {}, abilities: {}, heldItems: {},
};

const view: BattleView = {
  battleId: "battle", ended: false, winner: null, turn: 1, activePokemonId: "own",
  weather: { duration: 0 }, teams: { own: { rows: 1, cols: 1 } },
  pokemon: { own: { id: "own", speciesId: "4", name: "Charmander", shiny: false,
    hp: 10, maxHp: 10, level: 1, isFainted: false, combatReadiness: 100,
    position: 1, teamName: "own", type1: 9,
    status: {}, effectIds: {}, moveIds: { m1: { cooldown: 0, disabledCounter: 0 } } } },
};

describe("live numeric Pokémon types", () => {
  it("renders a move choice with its type name and class", () => {
    const html = renderToStaticMarkup(createElement(MovePanel, {
      view, availableActions: { canSkip: true, moves: [{ moveId: "m1", targetPokemonIds: ["own"] }] },
      isMyTurn: true, catalog, selectedMoveId: null,
      preview: null, busy: false, collapsed: false, onToggleCollapsed: () => {},
      onSelectMove: () => {}, onHoverMove: () => {}, onSkip: () => {},
    }));
    assert.match(html, /arena-type-fire/);
    assert.match(html, />Fire</);
  });

  it("renders numeric move and Pokémon types in the inspector", () => {
    const html = renderToStaticMarkup(createElement(BattleInspector, {
      pokemon: view.pokemon.own, moveId: "m1", detail: null, catalog,
      onOpenDetail: () => {}, onBack: () => {},
    }));
    assert.match(html, /arena-type-fire/);
    assert.match(html, />Fire</);
  });
});

describe("facing battle formations", () => {
  it("places the player's team left of the opponent regardless of engine team order", () => {
    const reversedView = { ...view, teams: {
      NPC: { rows: 1, cols: 1 }, own: { rows: 1, cols: 1 },
    } };
    const html = renderToStaticMarkup(createElement(BattleGrid, {
      view: reversedView, ownTeamNames: ["own"], catalog,
      targetIds: [], primaryTargetId: null, patternTiles: [], affectedIds: [],
      playback: false, highlightedId: null,
      onChooseTarget: () => {}, onInspect: () => {}, onHover: () => {},
    }));
    assert.ok(html.indexOf('aria-label="own formation"') < html.indexOf('aria-label="NPC formation"'));
  });

  it("keeps numeric Normal type visible on the board", () => {
    const normalView = { ...view, pokemon: { own: { ...view.pokemon.own, type1: 0 } } };
    const html = renderToStaticMarkup(createElement(BattleGrid, {
      view: normalView, ownTeamNames: ["own"], catalog,
      targetIds: [], primaryTargetId: null, patternTiles: [], affectedIds: [],
      playback: false, highlightedId: null,
      onChooseTarget: () => {}, onInspect: () => {}, onHover: () => {},
    }));
    assert.match(html, /arena-type-normal/);
    assert.match(html, /arena-type-normal">Normal<\/span>/);
  });
});
