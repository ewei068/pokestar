import type { BattleCatalog, BattleDisplay, BattleEvent, BattleView } from "../types";
import { baseBattle, baseCatalog, enemyTargets, makePokemon, own, previews, rival } from "./baseBattleFixture";
import { makeResultStory } from "./resultStories";
import { storyFootprint } from "./storyFootprint";
import { storyDefinitions } from "./storyDefinitions";
import { defaultVfxLabSelection, makeVfxLabStory } from "./vfxLab";
import type { VfxLabSelection } from "./vfxLab";
export { storyDefinitions } from "./storyDefinitions";

export type BattleStory = {
  id: string;
  title: string;
  description: string;
  catalog: BattleCatalog;
  battle: BattleDisplay;
  selectedMoveId: string | null;
  inspectedPokemonId: string | null;
  playing: { event: BattleEvent; view: BattleView; text: string | null } | null;
  sequence?: { events: BattleEvent[]; finalView: BattleView };
  history: string[];
};

const motionStories: Record<string, { moveId: string; targetId: string; pattern: "Single" | "Row" | "Column" }> = {
  "motion-tackle": { moveId: "m33", targetId: `${rival}-94`, pattern: "Single" },
  "motion-giga-impact": { moveId: "m416", targetId: `${rival}-59`, pattern: "Column" },
  "motion-hyper-beam": { moveId: "m63", targetId: `${rival}-248`, pattern: "Column" },
  "motion-soft-boiled": { moveId: "m135", targetId: `${own}-448`, pattern: "Single" },
  "motion-sing": { moveId: "m47", targetId: `${rival}-350`, pattern: "Row" },
  "motion-recover": { moveId: "m105", targetId: `${own}-157`, pattern: "Single" },
};

export const makeBattleStory = (requestedId: string | null,
  labSelection: VfxLabSelection = defaultVfxLabSelection): BattleStory => {
  const definition = storyDefinitions.find((item) => item.id === requestedId) || storyDefinitions[0];
  const catalog = structuredClone(baseCatalog);
  const battle = structuredClone(baseBattle);
  const story: BattleStory = {
    ...definition, catalog, battle, selectedMoveId: null, inspectedPokemonId: null,
    playing: null, history: [],
  };

  if (definition.id.startsWith("result-")) return makeResultStory(story);

  if (definition.id === "vfx") return makeVfxLabStory(story, labSelection);

  const motionStory = motionStories[definition.id];
  if (motionStory) {
    const { moveId, targetId, pattern } = motionStory;
    const move = catalog.moves[moveId];
    const footprint = storyFootprint(battle.view, targetId, pattern);
    battle.availableActions = { canSkip: false, moves: [{ moveId, targetPokemonIds: [targetId],
      targetPreviews: [footprint] }] };
    battle.isMyTurn = false;
    const text = `${battle.view.pokemon[battle.view.activePokemonId || ""]?.name || "Pokémon"} used ${move.name}.`;
    story.playing = { view: battle.view, text, event: {
      type: "moveStarted", sequence: 0, pokemonId: battle.view.activePokemonId || undefined,
      moveId, moveType: String(move.type), damageType: move.damageType,
      primaryTargetId: targetId, targetIds: footprint.affectedPokemonIds,
      patternTiles: footprint.patternTiles,
    } };
    return story;
  }

  switch (definition.id) {
    case "area-target":
      story.selectedMoveId = "eruption";
      story.inspectedPokemonId = enemyTargets[0];
      break;
    case "effects":
      battle.view.pokemon[`${own}-448`].effectIds = {
        shield: { duration: 2 }, focus: { duration: 1 }, weakness: { duration: 3 },
      };
      battle.view.pokemon[`${rival}-94`].status = { statusId: "Poison", turns: 2 };
      story.inspectedPokemonId = `${own}-448`;
      break;
    case "waiting":
      battle.isMyTurn = false;
      battle.view.activePokemonId = `${rival}-94`;
      battle.availableActions = { canSkip: false, moves: [] };
      story.history = ["Typhlosion used Flamethrower.", "Gengar is preparing its turn."];
      break;
    case "playback": {
      battle.isMyTurn = false;
      battle.availableActions = { canSkip: false, moves: [] };
      const footprint = previews(battle.view, enemyTargets, true)[0];
      const text = "Typhlosion used Eruption.";
      story.playing = { view: battle.view, text, event: {
        type: "moveStarted", sequence: 0, pokemonId: `${own}-157`, moveId: "eruption",
        primaryTargetId: footprint.primaryTargetPokemonId,
        targetIds: footprint.affectedPokemonIds, patternTiles: footprint.patternTiles,
      } };
      break;
    }
    case "completed":
      battle.status = "completed";
      battle.completionStatus = "completed";
      battle.isMyTurn = false;
      battle.availableActions = { canSkip: false, moves: [] };
      battle.view.ended = true;
      battle.view.winner = own;
      battle.view.activePokemonId = null;
      Object.values(battle.view.pokemon).filter((entry) => entry.teamName === rival).forEach((entry) => {
        entry.hp = 0;
        entry.isFainted = true;
      });
      story.history = ["The rival team fainted.", `${own} won the battle.`];
      break;
    case "dense": {
      battle.view.pokemon[`${own}-157`].name = "Typhlosion of the Endless Horizon";
      battle.view.pokemon[`${rival}-248`].name = "Tyranitar with a Remarkably Long Name";
      for (const [id, team, position] of [
        ["143", own, 7], ["350", own, 8], ["157", rival, 6],
        ["131", rival, 7], ["143", rival, 8],
      ] as const) {
        const entry = makePokemon(id, team, position, 160, 200, 40);
        battle.view.pokemon[entry.id] = entry;
      }
      battle.view.pokemon[`${own}-143`].effectIds = { focus: { duration: 1 }, weakness: { duration: 3 } };
      battle.view.pokemon[`${rival}-143`].status = { statusId: "Poison", turns: 2 };
      catalog.species["350"].sprite = "";
      catalog.species["350"].shinySprite = "";
      const targets = Object.values(battle.view.pokemon).filter((entry) => entry.teamName === rival).map((entry) => entry.id);
      battle.availableActions.moves = battle.availableActions.moves.map((choice) => choice.moveId === "sunnyday" ? choice
        : { ...choice, targetPokemonIds: targets,
          targetPreviews: previews(battle.view, targets, choice.moveId === "eruption") });
      break;
    }
  }
  return story;
};
