import type { BattleDisplay, BattleEvent, BattleTile, BattleView, TargetPreview } from "./types";

type MoveChoice = BattleDisplay["availableActions"]["moves"][number];

export const teamDisplayName = (view: BattleView, teamName: string): string =>
  view.teams[teamName]?.displayName || teamName;

/** The server owns targeting. A single-tile fallback keeps older API versions usable. */
export const targetPreviewFor = (
  view: BattleView,
  choice: MoveChoice | undefined,
  primaryTargetPokemonId: string | null,
): TargetPreview | null => {
  if (!choice || !primaryTargetPokemonId || !choice.targetPokemonIds.includes(primaryTargetPokemonId)) return null;
  const preview = choice.targetPreviews?.find((item) => item.primaryTargetPokemonId === primaryTargetPokemonId);
  if (preview) return preview;
  const pokemon = view.pokemon[primaryTargetPokemonId];
  if (!pokemon) return null;
  const tile = { teamName: pokemon.teamName, position: pokemon.position };
  return { primaryTargetPokemonId, targetPattern: "single", random: false,
    patternTiles: [tile], affectedPokemonIds: [primaryTargetPokemonId], emptyTileTargets: [] };
};

/** Playback uses the execution footprint, never the current choice preview. */
export const moveEventFootprint = (view: BattleView, event?: BattleEvent): {
  patternTiles: BattleTile[];
  affectedPokemonIds: string[];
  primaryTargetPokemonId: string | null;
} | null => {
  if (event?.type !== "moveStarted") return null;
  const patternTiles = event.patternTiles || (event.targetIds || []).flatMap((id) => {
    const pokemon = view.pokemon[id];
    return pokemon ? [{ teamName: pokemon.teamName, position: pokemon.position }] : [];
  });
  return { patternTiles, affectedPokemonIds: event.targetIds || [],
    primaryTargetPokemonId: event.primaryTargetId || null };
};
