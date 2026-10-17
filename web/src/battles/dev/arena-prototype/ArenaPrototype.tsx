/** THROWAWAY: compare information placement around larger sprites on the existing battle stories.
 * ?previewBattle=1&arenaPrototype=1&variant=A|B|C; A is floating HUD, B is a ribbon HUD, C is current cards.
 */
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import './arena-prototype.css';

const variants = [
  { key: 'A', name: 'Floating HUD', description: 'Name + type above the bars. Status and effects beside the sprite.' },
  { key: 'B', name: 'Ribbon HUD', description: 'Effects above level + bars. Name + type below the platform.' },
  { key: 'C', name: 'Current cards', description: 'Existing layout for comparison.' },
];

export const arenaPrototypeEnabled = import.meta.env.DEV && new URLSearchParams(window.location.search).has('arenaPrototype');

export const ArenaPrototype = ({ children }: { children: ReactNode }) => {
  const [index, setIndex] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('variant');
    return Math.max(0, variants.findIndex(variant => variant.key === requested));
  });
  const choose = (delta: number) => setIndex(current => (current + delta + variants.length) % variants.length);
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variants[index].key); window.history.replaceState(null, '', url);
  }, [index]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest('input, textarea, select, button, a, [contenteditable="true"]') || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); choose(event.key === 'ArrowLeft' ? -1 : 1); }
    };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);
  return <div className="arena-prototype" data-variant={variants[index].key}>
    <div className="arena-prototype-question"><strong>Arena prototype</strong>
      <span>Which HUD gives the Pokémon room while keeping their state readable?</span></div>
    {children}
    <aside className="arena-prototype-switcher" aria-label="Arena design variants">
      <button type="button" aria-label="Previous arena variant" onClick={() => choose(-1)}>←</button>
      <div aria-live="polite"><strong>{variants[index].key} · {variants[index].name}</strong><span>{variants[index].description}</span></div>
      <button type="button" aria-label="Next arena variant" onClick={() => choose(1)}>→</button>
    </aside>
  </div>;
};
