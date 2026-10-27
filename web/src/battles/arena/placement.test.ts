import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { JSDOM } from 'jsdom';
import { measureArena } from './geometry';
import { spriteOffset } from './spriteLayout';

const pixels = (width: number, height: number, points: [number, number][]) => {
  const data = new Uint8ClampedArray(width * height * 4);
  for (const [x, y] of points) data[(y * width + x) * 4 + 3] = 255;
  return data;
};

describe('arena placement', () => {
  it('centers visible pixels and places feet at the platform anchor', () => {
    const offset = spriteOffset(pixels(100, 100, [[10, 20], [49, 69]]), 100, 100);
    assert.equal(offset.x, 20);
    assert.ok(Math.abs(offset.y - 17) < 1e-10);
  });
  it('accounts for contain padding on non-square custom sprites and empty images', () => {
    const offset = spriteOffset(pixels(100, 50, [[20, 10], [79, 39]]), 100, 50);
    assert.equal(offset.x, 0);
    assert.ok(Math.abs(offset.y - 22) < 1e-10);
    assert.deepEqual(spriteOffset(pixels(2, 3, []), 2, 3), { x: 0, y: 0 });
  });
  it('shares occupied sprite anchors and empty tile centers without ambiguous team names', () => {
    const dom = new JSDOM('<div id="board"><div class="arena-cell" data-team-name="Team:1" data-position="2"><span class="arena-sprite"></span></div><div class="arena-cell" data-team-name="Team" data-position="12"></div></div>');
    const board = dom.window.document.getElementById('board')!;
    const cells = board.querySelectorAll<HTMLElement>('.arena-cell');
    const rect = (left: number, top: number, width: number, height: number) => new dom.window.DOMRect(left, top, width, height);
    board.getBoundingClientRect = () => rect(20, 30, 600, 400);
    cells[0].getBoundingClientRect = () => rect(100, 100, 100, 120);
    cells[0].querySelector<HTMLElement>('.arena-sprite')!.getBoundingClientRect = () => rect(115, 140, 70, 70);
    cells[1].getBoundingClientRect = () => rect(300, 100, 80, 120);
    const geometry = measureArena(board);
    assert.deepEqual(geometry.at({ teamName: 'Team:1', position: 2 })?.center, { x: 130, y: 145 });
    const empty = geometry.at({ teamName: 'Team', position: 12 });
    assert.deepEqual(empty?.center, { x: 320, y: 130 });
    assert.equal(empty?.sprite, null);
    assert.equal(geometry.at({ teamName: 'missing', position: 2 }), null);
  });
});
