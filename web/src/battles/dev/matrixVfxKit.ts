/** Small drawing vocabulary for development-only tile VFX. Coordinates are board CSS pixels. */
export type VfxTile = { x: number; y: number; radius: number; seed: number };
export type Colors = { main: string; light: string; dark: string };
export type Motif = "wing" | "feather" | "rock" | "beam" | "leaf" | "bolt" |
  "ice" | "star" | "flame" | "eye" | "ghost" | "shield" | "brain" |
  "dragon" | "cube" | "orb" | "petal";

export const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const ease = (value: number) => 1 - (1 - clamp(value)) ** 3;
export const fade = (value: number) => Math.sin(Math.PI * clamp(value));
export const progress = (ms: number, birth: number, duration: number) =>
  (ms - birth) / duration;
export const active = (age: number) => age >= 0 && age <= 1;
export const random = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};
export const mix = (from: number, to: number, amount: number) => from + (to - from) * amount;

export const polygon = (ctx: CanvasRenderingContext2D, points: number[]) => {
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
  ctx.closePath();
};

export const disk = (ctx: CanvasRenderingContext2D, x: number, y: number,
  radius: number, color: string, alpha = 1) => {
  if (radius <= 0 || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(alpha); ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill(); ctx.restore();
};

export const ring = (ctx: CanvasRenderingContext2D, x: number, y: number,
  radius: number, width: number, color: string, alpha = 1) => {
  if (radius <= 0 || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(alpha); ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, width); ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
};

export const ellipse = (ctx: CanvasRenderingContext2D, x: number, y: number,
  rx: number, ry: number, color: string, alpha = 1, angle = 0) => {
  if (rx <= 0 || ry <= 0 || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(alpha); ctx.fillStyle = color;
  ctx.beginPath(); ctx.ellipse(x, y, rx, ry, angle, 0, Math.PI * 2);
  ctx.fill(); ctx.restore();
};

export const stroke = (ctx: CanvasRenderingContext2D, points: number[],
  width: number, color: string, alpha = 1) => {
  if (points.length < 4 || alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(alpha); ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, width); ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath(); ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) ctx.lineTo(points[i], points[i + 1]);
  ctx.stroke(); ctx.restore();
};

export const glint = (ctx: CanvasRenderingContext2D, x: number, y: number,
  radius: number, color: string, alpha: number) => {
  stroke(ctx,[x-radius,y,x+radius,y],Math.max(1,radius*.15),color,alpha);
  stroke(ctx,[x,y-radius,x,y+radius],Math.max(1,radius*.15),color,alpha);
  disk(ctx,x,y,Math.max(1,radius*.13),color,alpha);
};

export const glow = (ctx: CanvasRenderingContext2D, x: number, y: number,
  radius: number, color: string, alpha: number) => {
  if (alpha <= 0) return;
  ctx.save(); ctx.globalAlpha = clamp(alpha);
  const fill = ctx.createRadialGradient(x, y, 0, x, y, radius);
  fill.addColorStop(0, color); fill.addColorStop(.4, color); fill.addColorStop(1, "transparent");
  ctx.fillStyle = fill; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
};

/** A tapered, curved cut. Start, control, and end are tile-radius coordinates. */
export const cut = (ctx: CanvasRenderingContext2D, tile: VfxTile,
  start: [number, number], control: [number, number], end: [number, number],
  width: number, color: string, alpha: number, reveal = 1) => {
  if (alpha <= 0 || reveal <= 0) return;
  const path = (side: number, reverse: boolean) => {
    for (let i = 0; i <= 12; i++) {
      const u = reverse ? 1 - i / 12 : i / 12;
      const t = u * clamp(reveal);
      const dx = 2 * (1 - t) * (control[0] - start[0]) + 2 * t * (end[0] - control[0]);
      const dy = 2 * (1 - t) * (control[1] - start[1]) + 2 * t * (end[1] - control[1]);
      const len = Math.hypot(dx, dy) || 1;
      const x = (1 - t) ** 2 * start[0] + 2 * (1 - t) * t * control[0] + t * t * end[0];
      const y = (1 - t) ** 2 * start[1] + 2 * (1 - t) * t * control[1] + t * t * end[1];
      const half = width * Math.sin(Math.PI * u);
      const px = tile.x + tile.radius * (x + side * -dy / len * half);
      const py = tile.y + tile.radius * (y + side * dx / len * half);
      if (!reverse && i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
  };
  ctx.save(); ctx.globalAlpha = clamp(alpha); ctx.fillStyle = color;
  ctx.beginPath(); path(1, false); path(-1, true); ctx.closePath(); ctx.fill(); ctx.restore();
};

/** All focal motifs use two or three flat shades and clear outlines at actual board size. */
export const motif = (ctx: CanvasRenderingContext2D, name: Motif, c: Colors,
  x: number, y: number, size: number, angle = 0, alpha = 1) => {
  if (size <= 0 || alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(angle); ctx.scale(size, size);
  ctx.globalAlpha = clamp(alpha); ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.fillStyle = c.main; ctx.strokeStyle = c.dark; ctx.lineWidth = .11;
  const fill = () => { ctx.fill(); ctx.stroke(); };
  switch (name) {
    case "wing":
      ctx.beginPath(); ctx.moveTo(-.84,.68); ctx.bezierCurveTo(-.55,-.74,.3,-.95,.9,-.78);
      ctx.quadraticCurveTo(.78,-.3,.37,-.16); ctx.quadraticCurveTo(.64,.09,.1,.14);
      ctx.quadraticCurveTo(.31,.42,-.23,.38); ctx.quadraticCurveTo(-.47,.72,-.84,.68); fill();
      ctx.strokeStyle = c.light; ctx.lineWidth = .075;
      ctx.beginPath(); ctx.moveTo(-.73,.58); ctx.quadraticCurveTo(.13,-.2,.78,-.72); ctx.stroke();
      break;
    case "feather":
      ctx.beginPath(); ctx.moveTo(-.78,.82); ctx.quadraticCurveTo(-.75,-.35,.8,-.88);
      ctx.quadraticCurveTo(.5,.28,-.78,.82); fill();
      ctx.strokeStyle = c.light; ctx.lineWidth = .07;
      ctx.beginPath(); ctx.moveTo(-.85,.9); ctx.lineTo(.58,-.64); ctx.stroke(); break;
    case "rock":
      polygon(ctx,[-.87,.38,-.53,-.65,.34,-.88,.9,-.2,.72,.7,-.27,.84]); fill();
      ctx.fillStyle = c.light; ctx.globalAlpha *= .64;
      polygon(ctx,[-.53,-.65,.34,-.88,.16,-.05,-.27,.18]); ctx.fill(); break;
    case "beam":
      polygon(ctx,[-.56,-.9,.58,-.9,.76,-.68,.76,.91,-.65,.91,-.76,.68,-.76,-.66]); fill();
      ctx.fillStyle = c.light; polygon(ctx,[-.54,-.75,-.19,-.75,-.19,.74,-.54,.74]); ctx.fill();
      ctx.fillStyle = c.dark; ctx.beginPath(); ctx.arc(.47,-.53,.07,0,Math.PI*2);
      ctx.arc(.47,.58,.07,0,Math.PI*2); ctx.fill(); break;
    case "leaf":
      ctx.beginPath(); ctx.moveTo(-.95,.42); ctx.quadraticCurveTo(-.27,-.88,.94,-.65);
      ctx.quadraticCurveTo(.45,.8,-.95,.42); fill();
      ctx.strokeStyle = c.light; ctx.lineWidth = .075;
      ctx.beginPath(); ctx.moveTo(-.92,.5); ctx.quadraticCurveTo(.07,.05,.75,-.55); ctx.stroke(); break;
    case "bolt":
      polygon(ctx,[.05,-.98,-.62,.04,-.18,.04,-.45,.98,.79,-.28,.21,-.22]); fill();
      ctx.fillStyle = c.light; polygon(ctx,[.08,-.82,-.32,-.05,.12,-.05,-.16,.6,.53,-.25,.06,-.25]); ctx.fill(); break;
    case "ice":
      polygon(ctx,[0,-.99,.82,-.2,.29,.95,-.55,.7,-.81,-.32]); fill();
      ctx.fillStyle = c.light; polygon(ctx,[0,-.82,.58,-.21,.13,.58,-.08,-.12]); ctx.fill(); break;
    case "star":
      polygon(ctx,[0,-1,.18,-.2,.93,0,.18,.2,0,1,-.18,.2,-.93,0,-.18,-.2]); fill();
      ctx.fillStyle = c.light; polygon(ctx,[0,-.53,.08,-.09,.5,0,.08,.09,0,.53,-.08,.09,-.5,0,-.08,-.09]); ctx.fill(); break;
    case "flame":
      ctx.beginPath(); ctx.moveTo(-.72,.81); ctx.bezierCurveTo(-1,.11,-.21,-.08,.02,-1);
      ctx.bezierCurveTo(.13,-.39,.87,-.22,.7,.52); ctx.quadraticCurveTo(.44,.95,-.72,.81); fill();
      ctx.fillStyle = c.light; ctx.beginPath(); ctx.moveTo(-.28,.67);
      ctx.quadraticCurveTo(-.14,.1,.18,-.49); ctx.quadraticCurveTo(.49,.49,-.28,.67); ctx.fill(); break;
    case "eye":
      ctx.beginPath(); ctx.moveTo(-.98,0); ctx.quadraticCurveTo(0,-.82,.98,0);
      ctx.quadraticCurveTo(0,.82,-.98,0); fill();
      ctx.fillStyle = c.light; ctx.beginPath(); ctx.arc(0,0,.37,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = c.dark; ctx.beginPath(); ctx.arc(0,0,.18,0,Math.PI*2); ctx.fill(); break;
    case "ghost":
      ctx.beginPath(); ctx.moveTo(-.78,.77); ctx.lineTo(-.78,-.08);
      ctx.quadraticCurveTo(-.7,-.81,0,-.86); ctx.quadraticCurveTo(.7,-.81,.78,-.08);
      ctx.lineTo(.78,.77); ctx.lineTo(.43,.5); ctx.lineTo(.15,.83);
      ctx.lineTo(-.17,.52); ctx.lineTo(-.46,.83); ctx.closePath(); fill();
      ctx.fillStyle = c.light; ctx.fillRect(-.43,-.3,.22,.2); ctx.fillRect(.21,-.3,.22,.2); break;
    case "shield":
      polygon(ctx,[0,-.97,.87,-.61,.79,.35,0,.98,-.79,.35,-.87,-.61]); fill();
      ctx.strokeStyle = c.light; ctx.lineWidth = .12;
      polygon(ctx,[0,-.72,.62,-.45,.58,.24,0,.73,-.58,.24,-.62,-.45]); ctx.stroke();
      ctx.fillStyle = c.light; polygon(ctx,[0,-.33,.11,-.07,.4,0,.11,.07,0,.36,-.11,.07,-.4,0,-.11,-.07]); ctx.fill(); break;
    case "brain":
      ctx.beginPath(); ctx.moveTo(-.75,.64); ctx.bezierCurveTo(-1,.24,-.82,-.33,-.47,-.55);
      ctx.quadraticCurveTo(-.36,-.98,0,-.73); ctx.quadraticCurveTo(.36,-.98,.49,-.54);
      ctx.bezierCurveTo(1,-.4,1,.28,.69,.63); ctx.closePath(); fill();
      ctx.strokeStyle = c.light; ctx.lineWidth = .08;
      ctx.beginPath(); ctx.moveTo(0,-.68); ctx.quadraticCurveTo(-.2,-.15,0,.15);
      ctx.quadraticCurveTo(.17,.47,0,.65); ctx.moveTo(-.56,-.3);
      ctx.quadraticCurveTo(-.18,-.23,-.4,.23); ctx.moveTo(.57,-.32);
      ctx.quadraticCurveTo(.24,-.18,.47,.25); ctx.stroke(); break;
    case "dragon":
      polygon(ctx,[-.78,.94,-.69,-.21,-.86,-.72,-.27,-.48,-.09,-.98,
        .22,-.57,.75,-.74,.53,-.31,.87,-.18,.98,.13,.51,.13,.66,.53,
        .14,.42,-.16,.92]); fill();
      ctx.fillStyle = c.light; polygon(ctx,[.31,-.3,.54,-.24,.34,-.09]); ctx.fill();
      ctx.fillStyle = c.dark; ctx.beginPath(); ctx.arc(.68,-.1,.045,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle = c.light; ctx.lineWidth = .085;
      ctx.beginPath(); ctx.moveTo(.1,.39); ctx.quadraticCurveTo(.43,.24,.91,.28); ctx.stroke(); break;
    case "cube":
      polygon(ctx,[0,-.93,.83,-.52,.83,.51,0,.93,-.83,.51,-.83,-.52]); fill();
      ctx.strokeStyle = c.light; ctx.lineWidth = .09;
      ctx.beginPath(); ctx.moveTo(0,-.93); ctx.lineTo(0,.93);
      ctx.moveTo(-.83,-.52); ctx.lineTo(0,-.1); ctx.lineTo(.83,-.52); ctx.stroke(); break;
    case "orb":
      ctx.beginPath(); ctx.arc(0,0,.81,0,Math.PI*2); fill();
      ctx.fillStyle = c.light; ctx.beginPath(); ctx.arc(-.22,-.23,.29,0,Math.PI*2); ctx.fill(); break;
    case "petal":
      ctx.beginPath(); ctx.moveTo(0,-.95); ctx.quadraticCurveTo(.8,-.26,.35,.65);
      ctx.lineTo(0,.91); ctx.lineTo(-.35,.65); ctx.quadraticCurveTo(-.8,-.26,0,-.95); fill();
      ctx.strokeStyle = c.light; ctx.lineWidth = .06;
      ctx.beginPath(); ctx.moveTo(0,-.58); ctx.lineTo(0,.64); ctx.stroke(); break;
  }
  ctx.restore();
};
