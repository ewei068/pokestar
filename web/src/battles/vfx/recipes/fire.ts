/** Effect settings: milliseconds, tile-radius units, radians, and unitless progress. */
export const fireRecipes = {
  "fireSpecial": {
    "tileDurationMs": 760,
    "birthJitterMs": 105,
    "flameCount": 5,
    "flameCountJitter": 3,
    "flameStaggerMs": 55,
    "flameBirthJitterMs": 38,
    "flameLifetimeMs": 450,
    "flameSize": 0.55,
    "flameSizeJitter": 0.3,
    "flameSpread": 0.35,
    "flameRise": 1.16,
    "flameOpacity": 0.67,
    "glowStrength": 0.5
  },
  "columnBody": {
    "bodySize": 1.6,
    "fadeInSpeed": 10,
    "fadeOutSpeed": 4,
    "opacity": 0.53,
    "bandCount": 16,
    "swaySpeed": 0.013,
    "swayPhase": 0.48,
    "swayStrength": 0.026,
    "stretchSpeed": 0.012,
    "stretchPhase": 0.2,
    "stretchStrength": 0.025
  },
  "foregroundEmbers": {
    "count": 14,
    "startMs": 55,
    "staggerMs": 29,
    "birthJitterMs": 45,
    "lifetimeMs": 250,
    "lifetimeJitterMs": 190,
    "spread": 0.52,
    "drift": 0.62,
    "rise": 0.95,
    "riseJitter": 0.58,
    "size": 0.23,
    "sizeJitter": 0.17
  }
};
export type FireRecipeSettings = typeof fireRecipes;
