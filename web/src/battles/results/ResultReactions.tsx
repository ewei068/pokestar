import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { PlaybackFrame } from '../playback';
import type { BattleView } from '../types';
import { resultAnimationConfig as config } from './config';

// Presentation-only variation: stable per frame, Pokémon and particle, independent of battle RNG.
const variation = (identity: string, channel: number) => {
  let hash = channel;
  for (const character of identity) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0) / 4294967296;
};

/** Reactions belong to state differences, so canonical reconciliation gets them too. */
export const ResultReactions = ({ boardRef, frame, view, reducedMotion }: {
  boardRef: RefObject<HTMLDivElement>; frame: PlaybackFrame; view: BattleView; reducedMotion: boolean;
}) => {
  const layerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const board = boardRef.current, layer = layerRef.current;
    if (!board || !layer || reducedMotion) return;
    const animations: Animation[] = [];
    const animate = (element: HTMLElement, frames: Keyframe[], duration: number) => {
      if (element.animate) animations.push(element.animate(frames, { duration, fill: 'both', easing: 'ease-out' }));
    };
    const cells = Array.from(board.querySelectorAll<HTMLElement>('.arena-cell'));
    const resolve = (id: string) => {
      const pokemon = view.pokemon[id]; if (!pokemon) return null;
      return cells.find(cell => cell.dataset.teamName === pokemon.teamName && Number(cell.dataset.position) === pokemon.position)
        ?.querySelector<HTMLElement>('.arena-sprite') || null;
    };
    const mark = (sprite: HTMLElement, kind: string) => {
      const bounds = board.getBoundingClientRect(), box = sprite.getBoundingClientRect();
      const container = document.createElement('div');
      container.className = `arena-reaction is-${kind}`;
      container.style.left = `${box.left + box.width / 2 - bounds.left}px`;
      container.style.top = `${box.top + box.height / 2 - bounds.top}px`;
      layer.append(container); return container;
    };
    const fainting = new Set(frame.changes.fainted);
    for (const id of frame.changes.damaged) {
      const sprite = resolve(id); if (!sprite || fainting.has(id)) continue;
      const settings = config.reactions.damage, r = settings.recoilPx;
      const marker = mark(sprite, 'damage');
      animate(sprite, [
        { transform: 'translateX(0)', filter: 'brightness(1)' },
        { transform: `translateX(-${r}px)`, filter: `brightness(${settings.brightness})`, offset: .16 },
        { transform: `translateX(${r * .7}px)`, offset: .38 },
        { transform: `translateX(-${r * .4}px)`, offset: .65 },
        { transform: 'translateX(0)', filter: 'brightness(1)' },
      ], settings.durationMs);
      for (let index = 0; index < settings.rayCount; index++) {
        const angle = (index + variation(`${frame.id}:${id}`, 7)) * Math.PI * 2 / settings.rayCount;
        const ray = document.createElement('i'); marker.append(ray);
        Object.assign(ray.style, { width: `${settings.rayLengthPx}px`, height: `${settings.rayWidthPx}px`, background: settings.color });
        const pose = (radius: number, scale: number) => `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px) rotate(${angle}rad) scaleX(${scale})`;
        animate(ray, [{ opacity: 0, transform: pose(settings.innerRadiusPx, .25) },
          { opacity: 1, offset: .2 }, { opacity: 0, transform: pose(settings.outerRadiusPx, 1) }], settings.durationMs);
      }
    }
    for (const id of frame.changes.healed) {
      const sprite = resolve(id); if (!sprite) continue;
      const settings = config.reactions.heal, marker = mark(sprite, 'heal');
      animate(sprite, [{ filter: 'brightness(1)' },
        { filter: `brightness(${settings.brightness}) drop-shadow(0 0 ${settings.glowPx}px ${settings.color})`, offset: .35 },
        { filter: 'brightness(1)' }], settings.durationMs);
      for (let index = 0; index < settings.particleCount; index++) {
        const particle = document.createElement('i'); marker.append(particle);
        Object.assign(particle.style, { color: settings.color, width: `${settings.particleSizePx}px`, height: `${settings.particleSizePx}px` });
        const identity = `${frame.id}:${id}`;
        const x = ((index + .5) / settings.particleCount - .5) * settings.spreadPx + (variation(identity, index + 13) - .5) * settings.lateralJitterPx;
        // Each particle gets its own birth; all releases fit the transition deadline.
        const birth = Math.min(.82, (index * settings.staggerMs + variation(identity, index + 19) * settings.birthJitterMs) / settings.durationMs);
        const end = Math.min(1, birth + .62);
        animate(particle, [{ opacity: 0, transform: `translate(${x}px, 6px) scale(.5)` },
          { opacity: 0, offset: birth }, { opacity: 1, offset: Math.min(end, birth + .12) },
          { opacity: 0, transform: `translate(${x * 1.2}px, -${settings.risePx}px) scale(1)`, offset: end },
          { opacity: 0, offset: 1 }], settings.durationMs);
      }
    }
    for (const id of frame.changes.fainted) {
      const sprite = resolve(id); if (!sprite) continue;
      const settings = config.reactions.faint;
      mark(sprite, 'faint');
      animate(sprite, [{ opacity: 1, transform: 'translateY(0) scale(1)' },
        { opacity: .7, offset: .35 }, { opacity: 0, transform: `translateY(${settings.dropPx}px) scale(${settings.endScale})` }], settings.durationMs);
    }
    return () => { animations.forEach(animation => animation.cancel()); layer.replaceChildren(); };
  }, [boardRef, frame.id, view, reducedMotion]);
  return <div ref={layerRef} className="arena-result-reactions" aria-hidden="true" />;
};
