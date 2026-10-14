import { useEffect, useState } from 'react';
let settled = false;
let preparation: Promise<void> | undefined;
const supported = () => typeof window !== 'undefined' && !!window.requestAnimationFrame &&
  !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
/** Warm assets once; failed artwork must never stop battle state from advancing. */
export const prepareVfxAssets = () => preparation ??= import('./renderTile').then(renderer => renderer.loadTileVfxArt()).catch(error => {
  console.error('Battle VFX artwork failed to load', error);
}).then(() => { settled = true; });
export const useVfxAssets = () => {
  const [ready, setReady] = useState(() => settled || !supported());
  useEffect(() => {
    if (!supported()) return;
    let disposed = false;
    void prepareVfxAssets().then(() => { if (!disposed) setReady(true); });
    return () => { disposed = true; };
  }, []);
  return ready;
};
