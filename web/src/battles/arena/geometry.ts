import type { BattleTile } from '../types';

/** One layout measurement shared by actor motion, tile VFX, reactions and labels. */
export const measureArena = (board: HTMLElement) => {
  const bounds = board.getBoundingClientRect();
  const key = (tile: BattleTile) => JSON.stringify([tile.teamName, tile.position]);
  const cells = new Map(Array.from(board.querySelectorAll<HTMLElement>('.arena-cell')).map(cell =>
    [key({ teamName: cell.dataset.teamName || '', position: Number(cell.dataset.position) }), cell]));
  const point = (element: Element) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2 - bounds.left, y: rect.top + rect.height / 2 - bounds.top };
  };
  const at = (tile?: BattleTile) => {
    const cell = tile && cells.get(key(tile)); if (!cell) return null;
    const rect = cell.getBoundingClientRect();
    const sprite = cell.querySelector<HTMLElement>('.arena-sprite');
    const anchor = sprite?.getBoundingClientRect() || rect;
    const compact = rect.width < 100;
    return { cell, sprite, rect, anchor,
      center: { x: anchor.left + anchor.width / 2 - bounds.left, y: anchor.top + anchor.height / 2 - bounds.top },
      radius: Math.min(rect.width * (compact ? .29 : .36), rect.height * (compact ? .43 : .52)) };
  };
  return { bounds, point, at };
};
