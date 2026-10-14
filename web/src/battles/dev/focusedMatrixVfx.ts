/** Focused Poison and Fighting tile studies. All times are relative to the tile VFX window. */
import type { MatrixTile } from "./matrixVfxArt";
import type { VfxKind, VfxType } from "../vfx/types";
import { drawPixelMotif } from "./pixelMotifs";

type Point = { x: number; y: number };
export type FocusTile = MatrixTile & { origin?: Point };
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => 1 - Math.pow(1 - clamp(value), 3);
const fade = (value: number) => Math.sin(Math.PI * clamp(value));
const random = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};
const approach = (tile: FocusTile) => {
  const dx = tile.x - (tile.origin?.x ?? tile.x - 100);
  const dy = tile.y - (tile.origin?.y ?? tile.y);
  const length = Math.hypot(dx, dy) || 1;
  return { x: dx / length, y: dy / length };
};
const pressureRing = (ctx: CanvasRenderingContext2D, tile: FocusTile,
  age: number, color: string, dark: string, size = 1) => {
  if (age < 0 || age > 1) return;
  const radius = tile.radius * (.19 + age * .83) * size;
  ctx.save();
  ctx.globalAlpha = fade(age) * .83;
  ctx.lineWidth = Math.max(2, tile.radius * .11 * (1 - age * .42));
  ctx.strokeStyle = dark;
  ctx.beginPath(); ctx.arc(tile.x, tile.y, radius, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth *= .46;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
};
const bubble = (ctx: CanvasRenderingContext2D, x: number, y: number,
  radius: number, alpha: number) => {
  ctx.save();
  ctx.globalAlpha = clamp(alpha);
  const fill = ctx.createRadialGradient(x - radius * .3, y - radius * .35, 0, x, y, radius);
  fill.addColorStop(0, "#f2caff");
  fill.addColorStop(.42, "#af62ce");
  fill.addColorStop(1, "#542473");
  ctx.fillStyle = fill;
  ctx.strokeStyle = "#4d2468";
  ctx.lineWidth = Math.max(1, radius * .16);
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#fff0ff";
  ctx.beginPath(); ctx.arc(x - radius * .3, y - radius * .35, radius * .18, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
};
const poisonBubbles = (ctx: CanvasRenderingContext2D, tile: FocusTile,
  ms: number, count: number, outward: boolean, originY = 0) => {
  for (let i = 0; i < count; i++) {
    const seed = tile.seed + i * 109;
    const birth = 70 + i * (outward ? 28 : 45) + random(seed + 3) * 55;
    const age = (ms - birth) / (240 + random(seed + 7) * 230);
    if (age < 0 || age > 1) continue;
    const angle = random(seed + 11) * Math.PI * 2;
    const distance = tile.radius * (outward ? .16 + age * (.55 + random(seed + 13) * .45) :
      .25 + random(seed + 13) * .72);
    const x = tile.x + Math.cos(angle) * distance;
    const y = tile.y + (outward ? tile.radius * originY + Math.sin(angle) * distance * .65 :
      tile.radius * .43 - age * tile.radius * 1.22);
    const radius = tile.radius * (.055 + random(seed + 17) * .09) * (1 - age * .26);
    bubble(ctx, x, y, radius, fade(age) * .95);
  }
};
const auraSparks = (ctx: CanvasRenderingContext2D, tile: FocusTile, ms: number) => {
  for (let i = 0; i < 10; i++) {
    const seed = tile.seed + i * 71;
    const age = (ms - 180 - random(seed + 3) * 165) / 280;
    if (age < 0 || age > 1) continue;
    const angle = random(seed + 5) * Math.PI * 2;
    const distance = tile.radius * (.29 + age * .69);
    const x = tile.x + Math.cos(angle) * distance;
    const y = tile.y + Math.sin(angle) * distance * .75;
    ctx.save(); ctx.globalAlpha = fade(age) * .9;
    ctx.strokeStyle = i % 3 ? "#8be9fb" : "#fff8d2";
    ctx.lineWidth = Math.max(1.5, tile.radius * .045);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(angle) * tile.radius * .16,
      y + Math.sin(angle) * tile.radius * .16); ctx.stroke(); ctx.restore();
  }
};

const fightingPhysical = (ctx: CanvasRenderingContext2D, tile: FocusTile,
  ms: number) => {
  const focus = ease((ms - 20) / 160);
  const shake = fade((ms - 160) / 170) * tile.radius * .035;
  const x = tile.x + Math.sin(ms * .32) * shake;
  const y = tile.y + Math.cos(ms * .41) * shake * .65;
  for (let i = 0; i < 3; i++) pressureRing(ctx, tile, (ms - 170 - i * 90) / 380,
    "#ffe4bc", "#a53d43", 1 + i * .11);
  drawPixelMotif(ctx, "fist", x, y, tile.radius * (2.2 - focus * 1.04),
    (.24 + focus * .76) * (1 - ease((ms - 450) / 240)), ms);
};

const fightingSpecial = (ctx: CanvasRenderingContext2D, tile: FocusTile,
  ms: number) => {
  const direction = approach(tile);
  const arrival = ease((ms - 15) / 290);
  const impact = ease((ms - 270) / 180);
  const distance = tile.radius * 1.2 * (1 - arrival);
  ctx.save(); ctx.globalAlpha = fade(clamp((ms - 80) / 600)) * .27;
  const glow = ctx.createRadialGradient(tile.x, tile.y, 0, tile.x, tile.y, tile.radius * 1.13);
  glow.addColorStop(0, "#e8fff7"); glow.addColorStop(.45, "#48d6eb"); glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow; ctx.fillRect(tile.x - tile.radius * 1.15, tile.y - tile.radius * 1.15,
    tile.radius * 2.3, tile.radius * 2.3); ctx.restore();
  drawPixelMotif(ctx, "aura", tile.x - direction.x * distance, tile.y - direction.y * distance,
    tile.radius * (1.12 + impact * .38), Math.min(1, ms / 100) * (1 - ease((ms - 550) / 210)), ms);
  for (let i = 0; i < 2; i++) pressureRing(ctx, tile, (ms - 290 - i * 105) / 420,
    "#d7fffa", "#315e93", 1.07 + i * .1);
  auraSparks(ctx, tile, ms);
};

const fightingStatus = (ctx: CanvasRenderingContext2D, tile: FocusTile,
  ms: number) => {
  const arrival = ease((ms - 40) / 260);
  const opacity = Math.min(1, ms / 80) * (1 - ease((ms - 555) / 190));
  // Upright fists cross from opposite sides and briefly hold a compact guard.
  for (const side of [-1, 1]) {
    const x = tile.x + side * tile.radius * (.97 - arrival * 1.38);
    const y = tile.y + tile.radius * (.28 - arrival * .42 + side * .1);
    drawPixelMotif(ctx, "fist", x, y, tile.radius * 1.02, opacity, ms,
      side * (.12 + arrival * .18), side > 0);
  }
  if (ms > 235) {
    const age = (ms - 235) / 500;
    ctx.save(); ctx.globalAlpha = fade(age) * .72;
    ctx.strokeStyle = "#ffe3ad"; ctx.lineWidth = Math.max(2, tile.radius * .075);
    ctx.beginPath();
    ctx.arc(tile.x, tile.y, tile.radius * (.42 + age * .27), Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke(); ctx.restore();
    pressureRing(ctx, tile, (ms - 245) / 480, "#ffedc7", "#a64d43", .66);
  }
};

const poisonSlash = (ctx: CanvasRenderingContext2D, tile: FocusTile,
  ms: number, start: number, mirrored: boolean) => {
  const age = (ms - start) / 290;
  if (age < 0 || age > 1) return;
  const r = tile.radius;
  const sweep = ease(age);
  const sign = mirrored ? -1 : 1;
  ctx.save(); ctx.translate(tile.x, tile.y); ctx.scale(sign, 1);
  ctx.globalAlpha = fade(age) * .95;
  const cut = (halfWidth: number, color: string) => {
    const edge = (side: number, reverse: boolean) => {
      for (let i = 0; i <= 12; i++) {
        const u = reverse ? 1 - i / 12 : i / 12;
        const t = u * sweep;
        const x = (1 - t) ** 2 * -.7 + 2 * (1 - t) * t * .12 + t * t * .56;
        const y = (1 - t) ** 2 * -.81 + 2 * (1 - t) * t * -.15 + t * t * .86;
        const dx = 2 * (1 - t) * .82 + 2 * t * .44;
        const dy = 2 * (1 - t) * .66 + 2 * t * 1.01;
        const length = Math.hypot(dx, dy);
        const width = halfWidth * Math.sin(Math.PI * u);
        const px = r * (x + side * -dy / length * width);
        const py = r * (y + side * dx / length * width);
        if (!reverse && i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
    };
    ctx.beginPath(); edge(1, false); edge(-1, true); ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
  };
  cut(.12, "#4b246a");
  cut(.065, "#e57bdf");
  ctx.restore();
};

const poisonPhysical = (ctx: CanvasRenderingContext2D, tile: FocusTile, ms: number) => {
  poisonSlash(ctx, tile, ms, 40, false);
  poisonSlash(ctx, tile, ms, 145, true);
  poisonBubbles(ctx, tile, ms, 13, true);
};

const poisonSpecial = (ctx: CanvasRenderingContext2D, tile: FocusTile,
  ms: number) => {
  const arrival = ease((ms - 10) / 280);
  const burst = ease((ms - 310) / 220);
  const distance = tile.radius * 1.22 * (1 - arrival);
  drawPixelMotif(ctx, "poison", tile.x, tile.y - distance,
    tile.radius * (1.45 + burst * .32),
    Math.min(1, ms / 100) * (1 - ease((ms - 360) / 220)), ms);
  for (let i = 0; i < 2; i++) pressureRing(ctx, tile, (ms - 330 - i * 100) / 370,
    "#df9ff0", "#5b2778", .86 + i * .13);
  poisonBubbles(ctx, tile, ms - 170, 17, true, .48);
};

const poisonStatus = (ctx: CanvasRenderingContext2D, tile: FocusTile, ms: number) => {
  const spread = ease((ms - 20) / 350);
  const fadeOut = 1 - ease((ms - 570) / 190);
  if (spread > 0 && fadeOut > 0) {
    const r = tile.radius;
    const x = tile.x;
    const y = tile.y + r * .43;
    ctx.save(); ctx.globalAlpha = fadeOut * .8;
    const pool = ctx.createRadialGradient(x, y, r * .06, x, y, r * spread);
    pool.addColorStop(0, "#ac63c8"); pool.addColorStop(.55, "#6e378e"); pool.addColorStop(1, "#3a1a56");
    ctx.fillStyle = pool; ctx.strokeStyle = "#d68de6";
    ctx.lineWidth = Math.max(1.5, r * .055);
    ctx.beginPath(); ctx.ellipse(x, y, r * (.22 + spread * .83),
      r * (.09 + spread * .34), 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  poisonBubbles(ctx, tile, ms, 18, false);
};

export const drawFocusedTile = (ctx: CanvasRenderingContext2D,
  type: VfxType, kind: VfxKind, tile: FocusTile, ms: number): boolean => {
  if (type !== "poison" && type !== "fighting") return false;
  if (type === "fighting") {
    if (kind === "physical") fightingPhysical(ctx, tile, ms);
    else if (kind === "special") fightingSpecial(ctx, tile, ms);
    else fightingStatus(ctx, tile, ms);
  } else if (kind === "physical") poisonPhysical(ctx, tile, ms);
  else if (kind === "special") poisonSpecial(ctx, tile, ms);
  else poisonStatus(ctx, tile, ms);
  return true;
};
