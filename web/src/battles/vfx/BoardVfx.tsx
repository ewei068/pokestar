import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { MOVE_APPROACH_MS, TILE_EFFECT_MS } from './timing';
import type { VfxKind, VfxType } from './types';
import type { VfxTile } from './renderTypes';
import type { BattleEvent, BattleTile, BattleView } from '../types';

export const tileVfxSeed = (event: BattleEvent, tile: BattleTile) => {
  let hash = 2166136261;
  for (const character of `${event.sequence}:${event.pokemonId}:${event.moveId}:${tile.teamName}:${tile.position}`)
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
};

/** A canvas draws a recipe on anchored tiles; moves include approach, status reactions start immediately. */
export const BoardVfx = ({ boardRef, event, view, tiles, type, kind, startedAt, delayMs = MOVE_APPROACH_MS }: {
  boardRef: RefObject<HTMLDivElement>; event: BattleEvent; view: BattleView; tiles: BattleTile[];
  type: VfxType; kind: VfxKind; startedAt: number; delayMs?: number;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const board = boardRef.current, canvas = canvasRef.current;
    if (!board || !canvas || !window.requestAnimationFrame ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let frame = 0, disposed = false, placements: VfxTile[] = [], density = 1;
    const measure = () => {
      const rect = board.getBoundingClientRect();
      density = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * density); canvas.height = Math.round(rect.height * density);
      ctx.setTransform(density, 0, 0, density, 0, 0); ctx.imageSmoothingEnabled = false;
      const cells = Array.from(board.querySelectorAll<HTMLElement>('.arena-cell'));
      const actor = event.pokemonId ? view.pokemon[event.pokemonId] : undefined;
      const source = cells.find(cell => cell.dataset.teamName === actor?.teamName && Number(cell.dataset.position) === actor?.position)
        ?.querySelector('.arena-sprite')?.getBoundingClientRect();
      const origin = source ? { x: source.left + source.width / 2 - rect.left, y: source.top + source.height / 2 - rect.top } : undefined;
      placements = tiles.flatMap(tile => {
        const cell = cells.find(cell => cell.dataset.teamName === tile.teamName && Number(cell.dataset.position) === tile.position);
        if (!cell) return [];
        const box = cell.getBoundingClientRect(), anchor = cell.querySelector('.arena-sprite')?.getBoundingClientRect() || box;
        const compact = box.width < 100;
        return [{ x: anchor.left + anchor.width / 2 - rect.left, y: anchor.top + anchor.height / 2 - rect.top,
          radius: Math.min(box.width * (compact ? .29 : .36), box.height * (compact ? .43 : .52)),
          seed: tileVfxSeed(event, tile), origin }];
      });
    };
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measure);
    observer?.observe(board); window.addEventListener('resize', measure); measure();
    let drawTileVfx: typeof import('./renderTile')['drawTileVfx'];
    const render = (now: number) => {
      if (disposed) return;
      ctx.clearRect(0, 0, canvas.width / density, canvas.height / density);
      const ms = now - startedAt - delayMs;
      if (ms > 0 && ms < TILE_EFFECT_MS) placements.forEach(tile => drawTileVfx(ctx, type, kind, tile, ms));
      if (ms < TILE_EFFECT_MS) frame = requestAnimationFrame(render);
    };
    void import('./renderTile').then(renderer => {
      if (disposed) return;
      drawTileVfx = renderer.drawTileVfx; frame = requestAnimationFrame(render);
    });
    return () => { disposed = true; cancelAnimationFrame(frame); observer?.disconnect(); window.removeEventListener('resize', measure); };
  }, [boardRef, event, view, tiles, type, kind, startedAt, delayMs]);
  return <canvas ref={canvasRef} className="arena-board-vfx" data-vfx-type={type} data-vfx-kind={kind}
    data-vfx-targets={JSON.stringify(tiles)} aria-hidden="true" />;
};
