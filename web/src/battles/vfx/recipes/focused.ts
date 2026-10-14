/** Effect settings: milliseconds, tile-radius units, radians, and unitless progress. */
export const focusedRecipes = {
  "fightingPhysical": {
    "focusStartMs": 20,
    "focusDurationMs": 160,
    "shakeStartMs": 160,
    "shakeDurationMs": 170,
    "shakeStrength": 0.035,
    "ringCount": 3,
    "ringStartMs": 170,
    "ringStaggerMs": 90,
    "ringLifetimeMs": 380,
    "startSize": 2.2,
    "contraction": 1.04,
    "fadeStartMs": 450,
    "fadeDurationMs": 240
  },
  "fightingSpecial": {
    "arrivalStartMs": 15,
    "arrivalDurationMs": 290,
    "impactStartMs": 270,
    "impactDurationMs": 180,
    "travel": 1.2,
    "size": 1.12,
    "growth": 0.38,
    "fadeInMs": 100,
    "fadeStartMs": 550,
    "fadeDurationMs": 210,
    "ringCount": 2,
    "ringStartMs": 290,
    "ringStaggerMs": 105,
    "ringLifetimeMs": 420
  },
  "fightingStatus": {
    "arrivalStartMs": 40,
    "arrivalDurationMs": 260,
    "fadeInMs": 80,
    "fadeStartMs": 555,
    "fadeDurationMs": 190,
    "startX": 0.97,
    "travelX": 1.38,
    "startY": 0.28,
    "travelY": 0.42,
    "size": 1.02,
    "guardStartMs": 235,
    "guardLifetimeMs": 500
  },
  "poisonPhysical": {
    "firstCutMs": 40,
    "secondCutMs": 145,
    "bubbleCount": 13
  },
  "poisonSpecial": {
    "arrivalStartMs": 10,
    "arrivalDurationMs": 280,
    "burstStartMs": 310,
    "burstDurationMs": 220,
    "travel": 1.22,
    "size": 1.45,
    "growth": 0.32,
    "fadeInMs": 100,
    "fadeStartMs": 360,
    "fadeDurationMs": 220,
    "ringCount": 2,
    "ringStartMs": 330,
    "ringStaggerMs": 100,
    "ringLifetimeMs": 370,
    "bubbleStartMs": 170,
    "bubbleCount": 17,
    "bubbleY": 0.48
  },
  "poisonStatus": {
    "spreadStartMs": 20,
    "spreadDurationMs": 350,
    "fadeStartMs": 570,
    "fadeDurationMs": 190,
    "baseY": 0.43,
    "opacity": 0.8,
    "width": 0.055,
    "startRadius": 0.22,
    "radiusGrowth": 0.83,
    "startHeight": 0.09,
    "heightGrowth": 0.34,
    "bubbleCount": 18
  },
  "poisonSlash": {
    "lifetimeMs": 290,
    "opacity": 0.95,
    "width": 0.12,
    "highlightWidth": 0.065,
    "dark": "#4b246a",
    "light": "#e57bdf"
  },
  "poisonBubbles": {
    "startMs": 70,
    "outwardStaggerMs": 28,
    "risingStaggerMs": 45,
    "birthJitterMs": 55,
    "lifetimeMs": 240,
    "lifetimeJitterMs": 230,
    "size": 0.055,
    "sizeJitter": 0.09,
    "opacity": 0.95
  },
  "auraSparks": {
    "count": 10,
    "startMs": 180,
    "birthJitterMs": 165,
    "lifetimeMs": 280,
    "startRadius": 0.29,
    "travel": 0.69,
    "opacity": 0.9,
    "width": 0.045
  }
};
export type FocusedRecipeSettings = typeof focusedRecipes;
