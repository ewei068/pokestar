/** Development-only first pass for the remaining type/category tile effects. */
import { vfxPalette } from "../vfx/types";
import type { VfxKind, VfxType } from "../vfx/types";

export type MatrixTile = { x: number; y: number; radius: number; seed: number };
type Palette = typeof vfxPalette[VfxType];
type Motion = "burst" | "orbit" | "rise" | "sweep" | "spiral";

const motion: Record<VfxType, Motion> = {
  normal: "orbit", fighting: "burst", flying: "sweep", poison: "rise",
  ground: "rise", rock: "burst", bug: "orbit", ghost: "spiral",
  steel: "orbit", fire: "rise", water: "spiral", grass: "rise",
  electric: "burst", psychic: "orbit", ice: "burst", dragon: "spiral",
  dark: "orbit", fairy: "burst",
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const fade = (value: number) => Math.sin(Math.PI * clamp(value));
const random = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

const polygon = (ctx: CanvasRenderingContext2D, points: number[]) => {
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let index = 2; index < points.length; index += 2) ctx.lineTo(points[index], points[index + 1]);
  ctx.closePath();
};

const fill = (ctx: CanvasRenderingContext2D) => { ctx.fill(); ctx.stroke(); };

/** Each type has a small, recognizable silhouette; category choreography supplies the rest. */
const drawGlyph = (ctx: CanvasRenderingContext2D, type: VfxType, palette: Palette,
  x: number, y: number, size: number, rotation: number, alpha: number) => {
  if (alpha <= 0 || size <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(size, size);
  ctx.globalAlpha = clamp(alpha);
  ctx.fillStyle = palette.main;
  ctx.strokeStyle = palette.dark;
  ctx.lineWidth = .13;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  switch (type) {
    case "normal":
      ctx.beginPath(); ctx.arc(0, 0, .7, -.9, 4.2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, .38, 1.2, 5.8); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, .12, 0, Math.PI * 2); fill(ctx); break;
    case "fighting":
      polygon(ctx, [-.9,-.35,-.15,-.7,.4,-.18,.1,.04,.88,.45,.2,.78,-.14,.43,-.75,.7,-.45,.02]);
      fill(ctx); break;
    case "flying":
      ctx.beginPath(); ctx.moveTo(-.85,.6); ctx.quadraticCurveTo(-.65,-.7,.82,-.7);
      ctx.quadraticCurveTo(.4,.48,-.85,.6); fill(ctx);
      ctx.strokeStyle = palette.light; ctx.lineWidth = .1;
      ctx.beginPath(); ctx.moveTo(-.72,.5); ctx.quadraticCurveTo(-.1,-.08,.7,-.63); ctx.stroke(); break;
    case "poison":
      ctx.beginPath(); ctx.moveTo(0,-.95); ctx.bezierCurveTo(.6,-.3,.75,.15,.55,.54);
      ctx.bezierCurveTo(.25,1,-.38,.8,-.57,.45); ctx.bezierCurveTo(-.8,.05,-.4,-.45,0,-.95);
      fill(ctx); ctx.fillStyle = palette.light;
      ctx.beginPath(); ctx.arc(-.18,.16,.14,0,Math.PI*2); ctx.fill(); break;
    case "ground":
      polygon(ctx, [-.94,.61,-.42,-.42,-.05,.13,.35,-.75,.94,.61]); fill(ctx);
      ctx.strokeStyle = palette.light; ctx.lineWidth = .09;
      ctx.beginPath(); ctx.moveTo(-.25,.44); ctx.lineTo(.35,-.42); ctx.stroke(); break;
    case "rock":
      polygon(ctx, [-.78,.44,-.42,-.72,.42,-.94,.88,-.25,.7,.68,-.2,.9]); fill(ctx);
      ctx.strokeStyle = palette.light; ctx.lineWidth = .1;
      ctx.beginPath(); ctx.moveTo(-.42,-.72); ctx.lineTo(.07,.19); ctx.lineTo(.7,.68); ctx.stroke(); break;
    case "bug":
      ctx.beginPath(); ctx.ellipse(-.34,-.15,.45,.7,-.48,0,Math.PI*2);
      ctx.ellipse(.34,-.15,.45,.7,.48,0,Math.PI*2); fill(ctx);
      ctx.fillStyle = palette.dark; ctx.beginPath(); ctx.ellipse(0,.27,.18,.53,0,0,Math.PI*2); ctx.fill(); break;
    case "ghost":
      ctx.beginPath(); ctx.moveTo(-.48,.82); ctx.bezierCurveTo(-.9,.15,-.4,-.65,.05,-.82);
      ctx.bezierCurveTo(.83,-.7,.92,.04,.5,.62); ctx.quadraticCurveTo(.18,.31,-.02,.86);
      ctx.quadraticCurveTo(-.19,.52,-.48,.82); fill(ctx); break;
    case "steel":
      polygon(ctx, [0,-.94,.78,-.51,.84,.43,0,.94,-.84,.43,-.78,-.51]); fill(ctx);
      ctx.strokeStyle = palette.light; ctx.lineWidth = .12;
      ctx.beginPath(); ctx.moveTo(0,-.7); ctx.lineTo(0,.65); ctx.moveTo(-.6,-.33); ctx.lineTo(.57,.47); ctx.stroke(); break;
    case "fire":
      ctx.beginPath(); ctx.moveTo(-.58,.8); ctx.bezierCurveTo(-.88,.15,-.2,-.12,.03,-.94);
      ctx.bezierCurveTo(.13,-.42,.83,-.14,.62,.52); ctx.quadraticCurveTo(.31,1,-.58,.8);
      fill(ctx); ctx.fillStyle = palette.light;
      ctx.beginPath(); ctx.moveTo(-.21,.62); ctx.quadraticCurveTo(-.12,.1,.16,-.3);
      ctx.quadraticCurveTo(.5,.54,-.21,.62); ctx.fill(); break;
    case "water":
      ctx.beginPath(); ctx.moveTo(0,-.96); ctx.bezierCurveTo(.3,-.4,.8,.13,.78,.46);
      ctx.bezierCurveTo(.73,1,-.73,1,-.78,.46); ctx.bezierCurveTo(-.8,.13,-.3,-.4,0,-.96);
      fill(ctx); ctx.strokeStyle = palette.light; ctx.lineWidth = .12;
      ctx.beginPath(); ctx.arc(.04,.38,.42,.1,1.2); ctx.stroke(); break;
    case "grass":
      ctx.beginPath(); ctx.moveTo(-.9,.68); ctx.quadraticCurveTo(-.48,-.78,.88,-.83);
      ctx.quadraticCurveTo(.81,.67,-.9,.68); fill(ctx);
      ctx.strokeStyle = palette.light; ctx.lineWidth = .12;
      ctx.beginPath(); ctx.moveTo(-.76,.61); ctx.quadraticCurveTo(.05,.04,.74,-.69); ctx.stroke(); break;
    case "electric":
      polygon(ctx, [.08,-.96,-.66,.05,-.15,.04,-.43,.94,.77,-.25,.14,-.19]); fill(ctx); break;
    case "psychic":
      ctx.beginPath(); ctx.moveTo(-.93,0); ctx.quadraticCurveTo(0,-.84,.93,0);
      ctx.quadraticCurveTo(0,.84,-.93,0); fill(ctx);
      ctx.fillStyle = palette.light; ctx.beginPath(); ctx.arc(0,0,.32,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = palette.dark; ctx.beginPath(); ctx.arc(0,0,.13,0,Math.PI*2); ctx.fill(); break;
    case "ice":
      ctx.strokeStyle = palette.dark; ctx.lineWidth = .23;
      for (let index = 0; index < 6; index++) {
        const angle = index * Math.PI / 3;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(angle)*.87,Math.sin(angle)*.87); ctx.stroke();
      }
      ctx.strokeStyle = palette.light; ctx.lineWidth = .1;
      ctx.beginPath(); ctx.arc(0,0,.28,0,Math.PI*2); ctx.stroke(); break;
    case "dragon":
      polygon(ctx, [-.86,.82,-.28,-.76,.04,-.19,.42,-.91,.88,.75,.23,.32,-.04,.82,-.3,.28]);
      fill(ctx); break;
    case "dark":
      ctx.beginPath(); ctx.arc(0,0,.83,-1.43,1.48);
      ctx.arc(.38,-.05,.6,1.73,-1.75,true); ctx.closePath(); fill(ctx); break;
    case "fairy":
      polygon(ctx, [0,-.97,.2,-.22,.95,0,.2,.22,0,.97,-.2,.22,-.95,0,-.2,-.22]);
      fill(ctx); ctx.fillStyle = palette.light;
      ctx.beginPath(); ctx.arc(0,0,.14,0,Math.PI*2); ctx.fill(); break;
    default: {
      const missing: never = type;
      throw new Error(`Missing VFX silhouette for ${missing}`);
    }
  }
  ctx.restore();
};

const ring = (ctx: CanvasRenderingContext2D, tile: MatrixTile, radius: number,
  alpha: number, palette: Palette, width: number) => {
  ctx.save();
  ctx.globalAlpha = clamp(alpha);
  ctx.strokeStyle = palette.dark;
  ctx.lineWidth = width + 2;
  ctx.beginPath(); ctx.arc(tile.x,tile.y,radius,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle = palette.light;
  ctx.lineWidth = width;
  ctx.stroke();
  ctx.restore();
};

const glow = (ctx: CanvasRenderingContext2D, tile: MatrixTile,
  alpha: number, palette: Palette) => {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = clamp(alpha);
  const gradient = ctx.createRadialGradient(tile.x,tile.y,0,tile.x,tile.y,tile.radius*1.1);
  gradient.addColorStop(0,palette.light);
  gradient.addColorStop(.48,palette.main);
  gradient.addColorStop(1,"transparent");
  ctx.fillStyle = gradient;
  ctx.fillRect(tile.x-tile.radius*1.1,tile.y-tile.radius*1.1,tile.radius*2.2,tile.radius*2.2);
  ctx.restore();
};

const particlePosition = (tile: MatrixTile, mode: Motion, index: number,
  age: number, seed: number): [number, number] => {
  const angle = index * 2.399 + random(seed + 5) * .6;
  const r = tile.radius;
  if (mode === "rise") return [tile.x + Math.sin(angle) * r * (.12 + age * .34),
    tile.y + r * (.55 - age * 1.35)];
  if (mode === "sweep") return [tile.x + r * (-.86 + age * 1.72),
    tile.y + Math.sin(angle + age * 4) * r * .4];
  if (mode === "orbit") return [tile.x + Math.cos(angle + age * 2.8) * r * (.35 + age * .38),
    tile.y + Math.sin(angle + age * 2.8) * r * (.3 + age * .31)];
  if (mode === "spiral") return [tile.x + Math.cos(angle + age * 4.4) * r * (.18 + age * .7),
    tile.y + Math.sin(angle + age * 4.4) * r * (.17 + age * .55)];
  return [tile.x + Math.cos(angle) * r * (.12 + age * .95),
    tile.y + Math.sin(angle) * r * (.12 + age * .75)];
};

const physical = (ctx: CanvasRenderingContext2D, type: VfxType,
  palette: Palette, tile: MatrixTile, ms: number) => {
  for (let pulse = 0; pulse < 2; pulse++) {
    const age = (ms - 30 - pulse * 190) / 360;
    if (age < 0 || age > 1) continue;
    ring(ctx,tile,tile.radius*(.18+age*.76),fade(age)*.43,palette,Math.max(1.3,tile.radius*.048));
    drawGlyph(ctx,type,palette,tile.x,tile.y,tile.radius*(.23+age*.14),
      (random(tile.seed+pulse*71)-.5)*.55,fade(age)*.7);
  }
  for (let index = 0; index < (tile.radius < 30 ? 8 : 11); index++) {
    const key = tile.seed + index * 83;
    const birth = 20 + random(key+3)*145 + (index%2)*115;
    const age = (ms-birth)/(290+random(key+7)*125);
    if (age < 0 || age > 1) continue;
    const [x,y] = particlePosition(tile,"burst",index,age,key);
    drawGlyph(ctx,type,palette,x,y,tile.radius*(.16+random(key+11)*.14)*(1-age*.28),
      random(key+13)*Math.PI*2+age*.65,fade(age)*.94);
  }
};

const special = (ctx: CanvasRenderingContext2D, type: VfxType,
  palette: Palette, tile: MatrixTile, ms: number) => {
  const progress = clamp(ms/760);
  glow(ctx,tile,fade(progress)*.13,palette);
  for (let pulse = 0; pulse < 2; pulse++) {
    const age = (ms-pulse*235)/520;
    if (age >= 0 && age <= 1) ring(ctx,tile,tile.radius*(.22+age*.68),
      fade(age)*.36,palette,Math.max(1.2,tile.radius*.035));
  }
  drawGlyph(ctx,type,palette,tile.x,tile.y,tile.radius*(.24+Math.sin(progress*Math.PI)*.08),
    (random(tile.seed+41)-.5)*.35+progress*.22,fade(progress)*.5);
  for (let index = 0; index < (tile.radius < 30 ? 11 : 15); index++) {
    const key = tile.seed + index*97;
    const birth = index*25 + random(key+3)*36;
    const age = (ms-birth)/(295+random(key+7)*190);
    if (age < 0 || age > 1) continue;
    const [x,y] = particlePosition(tile,motion[type],index,age,key);
    drawGlyph(ctx,type,palette,x,y,tile.radius*(.17+random(key+11)*.15),
      random(key+13)*Math.PI*2+age*.55,fade(age)*.9);
  }
};

const status = (ctx: CanvasRenderingContext2D, type: VfxType,
  palette: Palette, tile: MatrixTile, ms: number) => {
  const progress = clamp(ms/760);
  glow(ctx,tile,fade(progress)*.09,palette);
  for (let pulse = 0; pulse < 2; pulse++) {
    const age = (ms-pulse*300)/440;
    if (age >= 0 && age <= 1) ring(ctx,tile,tile.radius*(.22+age*.55),
      fade(age)*.22,palette,Math.max(1.1,tile.radius*.026));
  }
  drawGlyph(ctx,type,palette,tile.x,tile.y,tile.radius*(.1+fade(progress)*.07),
    (random(tile.seed+31)-.5)*.3,fade(progress)*.35);
  for (let index = 0; index < (tile.radius < 30 ? 11 : 15); index++) {
    const key = tile.seed + index*107;
    const birth = 20 + index*38 + random(key+3)*28;
    const age = (ms-birth)/(220+random(key+7)*165);
    if (age < 0 || age > 1) continue;
    const [x,y] = particlePosition(tile,motion[type],index,age*.72,key);
    drawGlyph(ctx,type,palette,x,y,tile.radius*(.13+random(key+11)*.13),
      random(key+13)*Math.PI*2+age*.24,fade(age)*.78);
  }
};

export const drawMatrixTile = (ctx: CanvasRenderingContext2D,
  type: VfxType, kind: VfxKind, tile: MatrixTile, ms: number) => {
  if (ms < 0 || ms > 760) return;
  const palette = vfxPalette[type];
  if (kind === "physical") physical(ctx,type,palette,tile,ms);
  else if (kind === "special") special(ctx,type,palette,tile,ms);
  else status(ctx,type,palette,tile,ms);
};
