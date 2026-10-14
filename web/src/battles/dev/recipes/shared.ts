/** Shared ingredient behavior. Distances are tile-radius units; times are milliseconds. */
export const sharedRecipes = {
  opacityEnvelope: { fadeInSpeed: 7, fadeOutSpeed: 4 },
  pressure: { count: 3, staggerMs: 57, lifetimeMs: 320, startRadius: .15, growth: .88,
    y: .13, outlineWidth: .065, highlightWidth: .026, opacity: .8 },
  slash: { lifetimeMs: 280, headSpeed: 1.8, tail: .8, fillWidth: .6, highlightWidth: .18 },
  debris: { birthJitterMs: 90, lifetimeMs: 290, lifetimeJitterMs: 150,
    spread: 2.2, rise: .5, riseJitter: .95, gravity: .8, size: .06, sizeJitter: .15 },
  wing: { x: .48, y: -.39, size: 1.2 },
  fireColumn: { baseY: .29 },
  tilePlayback: { durationMs: 760, finalFadeMs: 65, scale: .94, scaleJitter: .1,
    jitterX: .065, jitterY: .05, clockScale: .975, clockJitter: .05 },
};
