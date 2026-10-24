import type { BattleView, TargetPreview } from "../types";

export type StoryPattern = "Single" | "Row" | "Column" | "All";

/** Mirror the engine's row-major footprint only for development fixtures. */
export const storyFootprint = (view: BattleView, targetId: string, pattern: StoryPattern): TargetPreview => {
  const target = view.pokemon[targetId];
  const dimensions = view.teams[target.teamName];
  const targetRow = Math.floor((target.position - 1) / dimensions.cols);
  const targetCol = (target.position - 1) % dimensions.cols;
  const patternTiles = Array.from({ length: dimensions.rows * dimensions.cols }, (_, index) => index + 1)
    .filter((position) => pattern === "All" ? true
      : pattern === "Single" ? position === target.position
        : pattern === "Row" ? Math.floor((position - 1) / dimensions.cols) === targetRow
          : (position - 1) % dimensions.cols === targetCol)
    .map((position) => ({ teamName: target.teamName, position }));
  const affectedPokemonIds = Object.values(view.pokemon).filter((entry) => patternTiles.some((tile) =>
    tile.teamName === entry.teamName && tile.position === entry.position)).map((entry) => entry.id);
  return { primaryTargetPokemonId: targetId, targetPattern: pattern, random: false,
    patternTiles, affectedPokemonIds,
    emptyTileTargets: patternTiles.filter((tile) => !Object.values(view.pokemon).some((entry) =>
      entry.teamName === tile.teamName && entry.position === tile.position)) };
};
