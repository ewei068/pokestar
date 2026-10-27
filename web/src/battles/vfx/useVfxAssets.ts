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
    let disposed = false;
    const sync = () => {
      setReady(settled || !supported());
      if (supported()) void prepareVfxAssets().then(() => { if (!disposed) setReady(true); });
    };
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    sync(); media?.addEventListener?.('change', sync);
    return () => { disposed = true; media?.removeEventListener?.('change', sync); };
  }, []);
  return ready;
};
