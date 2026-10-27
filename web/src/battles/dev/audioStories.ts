import type { BattleEvent } from "../types";
import type { BattleStory } from "./battleStories";
import { own, rival } from "./baseBattleFixture";
import { storyFootprint } from "./storyFootprint";
import { makeResultStory } from "./resultStories";

const scenarios = {
  "audio-rock-slide": { moveId: "m157", targetId: `${rival}-94`, pattern: "Row" },
  "audio-hyper-beam": { moveId: "m63", targetId: `${rival}-248`, pattern: "Column" },
  "audio-tackle": { moveId: "m33", targetId: `${rival}-94`, pattern: "Single" },
  "audio-recover": { moveId: "m105", targetId: `${own}-157`, pattern: "Single" },
} as const;

const resultScenarios = {
  "audio-status-burn": "result-status-burn",
  "audio-status-freeze": "result-status-freeze",
  "audio-status-paralysis": "result-status-paralysis",
  "audio-status-poison": "result-status-poison",
  "audio-status-toxic": "result-status-toxic",
  "audio-status-sleep": "result-status-sleep",
  "audio-effect-buff": "result-effect-buff",
  "audio-effect-debuff": "result-effect-debuff",
  "audio-effect-neutral": "result-effect-neutral",
} as const;

export const isMoveAudioStory = (id: string): id is keyof typeof scenarios => id in scenarios;
export const isAudioStory = (id: string) => isMoveAudioStory(id) || id in resultScenarios;

export const makeAudioStory = (story: BattleStory): BattleStory => {
  if (!isAudioStory(story.id)) return story;
  if (story.id in resultScenarios) {
    const result = makeResultStory({ ...story, id: resultScenarios[story.id as keyof typeof resultScenarios] });
    return { ...result, id: story.id, title: story.title, description: story.description };
  }
  if (!isMoveAudioStory(story.id)) return story;
  const { battle, catalog } = story;
  catalog.moves.m157 = { name: "Rock Slide", type: "rock", power: 75, accuracy: 90,
    damageType: "Physical", targetPattern: "Row", description: "Rock fragments strike a row." };
  const { moveId, targetId, pattern } = scenarios[story.id];
  const actor = `${own}-157`;
  const footprint = storyFootprint(battle.view, targetId, pattern);
  battle.isMyTurn = false;
  battle.availableActions = { canSkip: false, moves: [{ moveId, targetPokemonIds: [targetId],
    targetPreviews: [footprint] }] };
  story.inspectedPokemonId = targetId;

  const move = catalog.moves[moveId];
  const events: Omit<BattleEvent, "sequence">[] = [{ type: "moveStarted", pokemonId: actor,
    moveId, moveType: String(move.type), damageType: move.damageType,
    primaryTargetId: targetId, targetIds: footprint.affectedPokemonIds,
    patternTiles: footprint.patternTiles }];
  const finalView = structuredClone(battle.view);
  finalView.pokemon[actor].combatReadiness = 0;
  const hpChange = (pokemonId: string, amount: number) => {
    const previousHp = finalView.pokemon[pokemonId].hp;
    const hp = Math.max(0, Math.min(finalView.pokemon[pokemonId].maxHp, previousHp + amount));
    finalView.pokemon[pokemonId].hp = hp;
    events.push({ type: "hpChanged", pokemonId, sourcePokemonId: actor,
      previousHp, hp, amount: hp - previousHp });
  };
  if (story.id === "audio-rock-slide") {
    hpChange(`${rival}-94`, -38);
    hpChange(`${rival}-59`, -34);
  } else if (story.id === "audio-hyper-beam") {
    hpChange(targetId, -52);
  } else if (story.id === "audio-tackle") {
    hpChange(targetId, -battle.view.pokemon[targetId].hp);
    finalView.pokemon[targetId].isFainted = true;
    events.push({ type: "pokemonFainted", pokemonId: targetId, sourcePokemonId: actor });
  } else {
    hpChange(actor, 30);
  }
  story.sequence = { events: events.map((event, sequence) => ({ ...event, sequence })), finalView };
  return story;
};
