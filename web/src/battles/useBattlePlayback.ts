import { useCallback, useEffect, useReducer, useState } from 'react';
import { emptyPlayback, frameDuration, reducePlayback } from './playback';
import { useVfxAssets } from './vfx/useVfxAssets';
import type { BattleCatalog, BattleResponse } from './types';

/** Transport and development stories use the same presentation clock and progression. */
export const useBattlePlayback = (catalog: BattleCatalog, initial?: BattleResponse) => {
  const [state, dispatch] = useReducer(reducePlayback, initial, response => response
    ? reducePlayback(emptyPlayback(), { type: 'receive', response, catalog }) : emptyPlayback());
  const assetsReady = useVfxAssets();
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false);
  const frame = state.queue[0] || null;
  const waitingForArt = frame?.stage === 'event' && frame.event.type === 'moveStarted' && !reducedMotion && !assetsReady;
  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const change = () => { setReducedMotion(media?.matches || false); dispatch({ type: 'skip' }); };
    media?.addEventListener?.('change', change);
    return () => media?.removeEventListener?.('change', change);
  }, []);
  useEffect(() => {
    if (!frame || waitingForArt) return;
    dispatch({ type: 'begin', id: frame.id });
    const timer = window.setTimeout(() => dispatch({ type: 'advance', id: frame.id }), frameDuration(frame, reducedMotion));
    return () => window.clearTimeout(timer);
  }, [frame, waitingForArt, reducedMotion]);
  useEffect(() => {
    const change = () => { if (document.visibilityState === 'hidden') dispatch({ type: 'skip' }); };
    document.addEventListener('visibilitychange', change);
    return () => document.removeEventListener('visibilitychange', change);
  }, []);
  const receive = useCallback((response: BattleResponse) => {
    dispatch({ type: 'receive', response, catalog });
    if (document.visibilityState === 'hidden') dispatch({ type: 'skip' });
  }, [catalog]);
  const skipPlayback = useCallback(() => dispatch({ type: 'skip' }), []);
  return { battle: state.battle, playing: frame, history: state.history, receive, skipPlayback,
    waitingForArt, reducedMotion };
};
