import { useEffect, useState } from 'react';
import { cachedSpriteOffset, loadSpriteOffset } from './spriteLayout';

/** The stationary Pokémon and moving actor share cached, source-specific foot placement. */
export const PokemonSprite = ({ src, flipped = false }: { src?: string; flipped?: boolean }) => {
  const [placement, setPlacement] = useState(() => ({ src, offset: cachedSpriteOffset(src || '') }));
  const [failed, setFailed] = useState<string | null>(null);
  useEffect(() => {
    let disposed = false;
    if (src) void loadSpriteOffset(src).then(offset => { if (!disposed) setPlacement({ src, offset }); });
    return () => { disposed = true; };
  }, [src]);
  if (!src || failed === src) return <span aria-hidden="true">?</span>;
  const offset = placement.src === src ? placement.offset : cachedSpriteOffset(src);
  return <img src={src} alt="" loading="lazy" style={{ scale: flipped ? '-1 1' : undefined, translate: `${flipped ? -offset.x : offset.x}% ${offset.y}%` }}
    onError={() => setFailed(src)} />;
};
