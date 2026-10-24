import { TILE_EFFECT_MS } from '../vfx/timing';
import type { VfxType } from '../vfx/types';

/** Semantic effect colors are shared by reactions, board counters and inspector tags. */
export const effectColors = {
  buff: { main: '#b64343', light: '#fbe0dd', border: '#d6a09b' },
  debuff: { main: '#315d8c', light: '#d9eafa', border: '#96b5d7' },
  neutral: { main: '#9b7628', light: '#fff0bd', border: '#cbb578' },
};

/** Result presentation defaults. Time is milliseconds; travel and text size are CSS pixels. */
export const resultAnimationConfig = {
  text: {
    durationMs: 820, risePx: 34, entryRisePx: 5, fadeInEnd: .13, fadeStart: .58, startScale: .92,
    fontSizePx: 12, centralFontSizePx: 18, maxWidthPx: 290, edgePaddingPx: 8, targetOverhangPx: 24,
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
    miss: { durationMs: 420, distancePx: 12, opacity: .6, trailCount: 3, trailStepPx: 5, color: '#cce6ef' },
    status: { durationMs: TILE_EFFECT_MS, clearMs: 380, clearRadiusPx: 25, clearColor: '#c7f0e9',
      types: { Burn: 'fire', Freeze: 'ice', Paralysis: 'electric', Poison: 'poison',
        'Badly Poison': 'poison', BadPoison: 'poison', Toxic: 'poison', Sleep: 'psychic' } as Record<string, VfxType>,
      fallbackType: 'normal' as VfxType },
    effect: { durationMs: 620, count: 6, staggerMs: 55, travelPx: 28, spreadPx: 52, sizePx: 14,
      neutralRadiusPx: 25, colors: effectColors },
    faint: { durationMs: 440, dropPx: 14, endScale: .82 },
  },
};
