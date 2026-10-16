/** Result presentation defaults. Time is milliseconds; travel and text size are CSS pixels. */
export const resultAnimationConfig = {
  text: {
    durationMs: 820, risePx: 34, entryRisePx: 5, fadeInEnd: .13, fadeStart: .58, startScale: .92,
    fontSizePx: 13, centralFontSizePx: 22, maxWidthPx: 290, edgePaddingPx: 8, targetOverhangPx: 24,
    easing: 'cubic-bezier(.2,.65,.35,1)',
  },
  transition: { meterMs: 420, cueMs: 260, faintMs: 440, easing: 'ease-in-out' },
  reducedMotion: { eventMs: 160, transitionMs: 0 },
  history: { maxEntries: 100 },
};
