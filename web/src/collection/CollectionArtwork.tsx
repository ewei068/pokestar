import { useState } from "react";

/** Plain contained art for cards and identity; party feet use arena PokemonSprite. */
export function CollectionArtwork({ src }: { src: string | null }) {
  const [failed, setFailed] = useState<string | null>(null);
  return src && src !== failed ? <img src={src} alt="" draggable={false} loading="lazy" onError={() => setFailed(src)} /> : <span className="collection-art-fallback" aria-hidden="true">?</span>;
}
