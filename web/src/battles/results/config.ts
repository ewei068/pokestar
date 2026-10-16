/** Result presentation defaults. Time is milliseconds; travel and text size are CSS pixels. */
export const resultAnimationConfig = {
  text: {
    durationMs: 820, risePx: 34, entryRisePx: 5, fadeInEnd: .13, fadeStart: .58, startScale: .92,
    fontSizePx: 13, centralFontSizePx: 22, maxWidthPx: 290, edgePaddingPx: 8, targetOverhangPx: 24,
    easing: 'cubic-bezier(.2,.65,.35,1)',
  },
  transition: { meterMs: 420, cueMs: 260, faintMs: 440, easing: 'ease-in-out' },
  reducedMotion: { eventMs: 160, transitionMs: 0 },
  log: { viewportPx: 240, followThresholdPx: 32 },
  reactions: {
    damage: { durationMs: 300, recoilPx: 4, brightness: 1.8, rayCount: 5,
      innerRadiusPx: 4, outerRadiusPx: 19, rayLengthPx: 7, rayWidthPx: 2, color: '#fff8de' },
    heal: { durationMs: 400, glowPx: 5, brightness: 1.3, birthJitterMs: 25, lateralJitterPx: 5, color: '#76e8b4', particleCount: 5,
      staggerMs: 35, spreadPx: 28, risePx: 27, particleSizePx: 5 },
    faint: { durationMs: 440, dropPx: 14, endScale: .82 },
  },
};
