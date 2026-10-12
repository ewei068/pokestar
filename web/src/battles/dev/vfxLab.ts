import type { BattleStory } from "./battleStories";
import { storyFootprint } from "./storyFootprint";
import type { StoryPattern } from "./storyFootprint";
import { standardVfxTypes } from "../vfx/types";
import type { VfxKind } from "../vfx/types";

export const vfxLabTypes = [...standardVfxTypes, "unknown", "shadow", "stellar"] as const;
export type VfxLabType = typeof vfxLabTypes[number];
export const vfxLabKinds = ["physical", "special", "status"] as const;
export const vfxLabPatterns = ["single", "row", "column", "all"] as const;
export type VfxLabPattern = typeof vfxLabPatterns[number];
export type VfxLabSelection = { type: VfxLabType; kind: VfxKind; pattern: VfxLabPattern };

export const defaultVfxLabSelection: VfxLabSelection = { type: "fire", kind: "physical", pattern: "column" };

export const readVfxLabSelection = (params: URLSearchParams): VfxLabSelection => {
  const type = params.get("type");
  const kind = params.get("kind");
  const pattern = params.get("pattern");
  return {
    type: vfxLabTypes.find((value) => value === type) || defaultVfxLabSelection.type,
    kind: vfxLabKinds.find((value) => value === kind) || defaultVfxLabSelection.kind,
    pattern: vfxLabPatterns.find((value) => value === pattern) || defaultVfxLabSelection.pattern,
  };
};

export const vfxLabUrl = (selection: VfxLabSelection): string => {
  const params = new URLSearchParams({ previewBattle: "1", story: "vfx", ...selection });
  return `?${params.toString()}`;
};

/** Synthetic move data exercises the real event/renderer contract without a server action. */
export const makeVfxLabStory = (story: BattleStory, selection: VfxLabSelection): BattleStory => {
  const { battle, catalog } = story;
  const targetId = selection.pattern === "row" ? "Rival Team-350"
    : selection.pattern === "column" ? "Rival Team-59" : "Rival Team-94";
  const pattern = (selection.pattern[0].toUpperCase() + selection.pattern.slice(1)) as StoryPattern;
  const footprint = storyFootprint(battle.view, targetId, pattern);
  const moveId = `vfx-${selection.type}-${selection.kind}`;
  const damageType = selection.kind === "status" ? "Other"
    : selection.kind === "physical" ? "Physical" : "Special";
  const name = `${selection.type[0].toUpperCase()}${selection.type.slice(1)} ${selection.kind} study`;
  catalog.moves[moveId] = { name, type: selection.type, damageType, targetPattern: pattern };
  battle.availableActions = { canSkip: false, moves: [{ moveId, targetPokemonIds: [targetId],
    targetPreviews: [footprint] }] };
  battle.isMyTurn = false;
  const text = `Typhlosion used ${name}.`;
  story.playing = { view: battle.view, text, event: {
    type: "moveStarted", sequence: 0, pokemonId: battle.view.activePokemonId || undefined,
    moveId, moveType: selection.type, damageType, targetPattern: pattern,
    primaryTargetId: targetId, targetIds: footprint.affectedPokemonIds,
    patternTiles: footprint.patternTiles,
  } };
  story.history = [text];
  story.description = `${name} · ${selection.pattern} footprint · ${footprint.patternTiles.length} tiles`;
  return story;
};
