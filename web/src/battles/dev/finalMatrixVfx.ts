/** Review-only atlas treatments. Production battle playback does not import this module. */
import type { VfxKind, VfxType } from "../vfx/types";
import { vfxPalette } from "../vfx/types";
import type { MatrixTile } from "./matrixVfxArt";
import { drawMatrixTile } from "./matrixVfxArt";
import { disk, fade, glint, progress, random, ring, stroke } from "./matrixVfxKit";
import { polishPhysicalTile } from "./matrixPhysicalPolish";
import { polishSpecialTile } from "./matrixSpecialPolish";
import { polishStatusTile } from "./matrixStatusPolish";
import normalUrl from "../../../../media/vfx/review-atlas/normal.png";
import flyingUrl from "../../../../media/vfx/review-atlas/flying.png";
import groundUrl from "../../../../media/vfx/review-atlas/ground.png";
import rockUrl from "../../../../media/vfx/review-atlas/rock.png";
import bugUrl from "../../../../media/vfx/review-atlas/bug.png";
import ghostUrl from "../../../../media/vfx/review-atlas/ghost.png";
import steelUrl from "../../../../media/vfx/review-atlas/steel.png";
import fireUrl from "../../../../media/vfx/review-atlas/fire.png";
import waterUrl from "../../../../media/vfx/review-atlas/water.png";
import grassUrl from "../../../../media/vfx/review-atlas/grass.png";
import electricUrl from "../../../../media/vfx/review-atlas/electric.png";
import psychicUrl from "../../../../media/vfx/review-atlas/psychic.png";
import iceUrl from "../../../../media/vfx/review-atlas/ice.png";
import dragonUrl from "../../../../media/vfx/review-atlas/dragon.png";
import darkUrl from "../../../../media/vfx/review-atlas/dark.png";
import fairyUrl from "../../../../media/vfx/review-atlas/fairy.png";

const urls: Partial<Record<VfxType, string>> = {
  normal: normalUrl, flying: flyingUrl, ground: groundUrl, rock: rockUrl,
  bug: bugUrl, ghost: ghostUrl, steel: steelUrl, fire: fireUrl,
  water: waterUrl, grass: grassUrl, electric: electricUrl, psychic: psychicUrl,
  ice: iceUrl, dragon: dragonUrl, dark: darkUrl, fairy: fairyUrl,
};
const images = new Map<VfxType, HTMLImageElement>();
const loading = new Map<VfxType, Promise<void>>();

/** Called before a lab action starts so the first replay has its art. */
export const loadFinalMatrixArt = (type: VfxType): Promise<void> => {
  const url = urls[type];
  if (!url || typeof Image === "undefined") return Promise.resolve();
  const prior = loading.get(type);
  if (prior) return prior;
  const image = new Image();
  images.set(type, image);
  image.src = url;
  const ready = image.decode().then(() => undefined);
  loading.set(type, ready);
  return ready;
};

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const u = clamp(value);
  return u * u * (3 - 2 * u);
};
const kinds: readonly VfxKind[] = ["physical", "special", "status"];
type Motion = "sweep" | "rise" | "fall" | "spin" | "expand" | "drift" | "pulse";
/** The generated pose is the peak; these paths explain how each subject arrives. */
const motion: Partial<Record<VfxType, readonly [Motion, Motion, Motion]>> = {
  normal: ["expand","spin","expand"],
  flying: ["sweep","spin","rise"],
  ground: ["rise","rise","expand"],
  rock: ["fall","spin","rise"],
  bug: ["sweep","spin","expand"],
  ghost: ["sweep","spin","drift"],
  steel: ["fall","expand","rise"],
  fire: ["rise","rise","drift"],
  water: ["rise","rise","spin"],
  grass: ["sweep","rise","fall"],
  electric: ["pulse","fall","pulse"],
  psychic: ["sweep","pulse","pulse"],
  ice: ["fall","expand","expand"],
  dragon: ["sweep","rise","rise"],
  dark: ["sweep","spin","drift"],
  fairy: ["expand","spin","expand"],
};

const drawSubject = (ctx: CanvasRenderingContext2D, image: HTMLImageElement,
  type: VfxType, kind: VfxKind, tile: MatrixTile, ms: number) => {
  const cell = image.naturalHeight;
  const index = kinds.indexOf(kind);
  const sx = index * cell;
  const path = motion[type]?.[index] ?? "expand";
  const r = tile.radius;
  const appear = kind === "physical" ? smooth(progress(ms, 70, 240)) :
    kind === "special" ? smooth(progress(ms, 65, 350)) : smooth(progress(ms, 75, 315));
  const vanish = 1 - smooth(progress(ms, kind === "physical" ? 430 :
    kind === "special" ? 440 : 420, kind === "physical" ? 170 :
      kind === "special" ? 200 : 230));
  const alpha = clamp(appear * vanish);
  if (alpha <= 0) return;

  const baseSize = r * (kind === "physical" ? 2.02 : kind === "special" ? 2.1 : 1.98);
  let size = baseSize * (kind === "physical" ? 1.22 - appear * .2 :
    kind === "special" ? .82 + appear * .2 + Math.sin(ms / 95) * .018 :
      .88 + appear * .13 + Math.sin(ms / 125) * .012);
  size *= .86 + random(tile.seed + 47) * .28;
  if (path === "expand") size *= .7 + appear * .3;
  if (path === "pulse") size *= 1 + Math.sin(ms / 65) * .055 * appear;
  const maxTilt = type === "steel" || type === "ice" || type === "electric" ? .13 : .3;
  const seedTilt = (random(tile.seed + 121) - .5) * maxTilt;
  let tilt = seedTilt + (kind === "special" ? Math.sin(ms / 125) * .025 :
    kind === "status" ? Math.sin(ms / 195) * .016 : 0);
  let x = tile.x + (random(tile.seed + 61) - .5) * r * .29;
  let y = tile.y + (random(tile.seed + 67) - .5) * r * .2;
  const remaining = 1 - appear;
  if (path === "sweep") { x -= r * .72 * remaining; tilt -= .19 * remaining; }
  else if (path === "rise") y += r * .68 * remaining;
  else if (path === "fall") y -= r * .7 * remaining;
  else if (path === "drift") x += r * (.32 - appear * .28);
  else if (path === "spin") tilt += .85 * remaining + ms * .00045;

  // The source art is the peak pose; a mask reveals different regions during the build.
  // Secondary procedural marks continue moving independently throughout the window.
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  if (random(tile.seed + 59) > .5) ctx.scale(-1, 1);
  ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = false;
  if (path === "sweep") {
    ctx.beginPath();
    ctx.rect(-size / 2, -size / 2, size * (.12 + appear * .88), size);
    ctx.clip();
  } else if (path === "rise") {
    const revealed = size * (.1 + appear * .9);
    ctx.beginPath(); ctx.rect(-size / 2, size / 2 - revealed, size, revealed); ctx.clip();
  } else if (path === "fall") {
    const revealed = size * (.1 + appear * .9);
    ctx.beginPath(); ctx.rect(-size / 2, -size / 2, size, revealed); ctx.clip();
  } else if (kind === "physical") {
    ctx.beginPath();
    ctx.arc(0, 0, size * (.12 + appear * .65), 0, Math.PI * 2);
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, size * (.08 + appear * .62), 0, Math.PI * 2);
    ctx.clip();
  }
  ctx.drawImage(image, sx, 0, cell, cell, -size / 2, -size / 2, size, size);
  ctx.restore();
};

const drawAccents = (ctx: CanvasRenderingContext2D, type: VfxType,
  kind: VfxKind, tile: MatrixTile, ms: number) => {
  const c = vfxPalette[type];
  const r = tile.radius;
  if (kind === "physical") {
    for (let pulse = 0; pulse < 2; pulse++) {
      const age = progress(ms, 180 + pulse * 95, 355);
      if (age >= 0 && age <= 1) ring(ctx,tile.x,tile.y,r*(.16+age*.78),
        r*.035,c.light,fade(age)*.52);
    }
  } else if (kind === "special") {
    const age = progress(ms,275,440);
    if (age >= 0 && age <= 1) ring(ctx,tile.x,tile.y,r*(.24+age*.71),
      r*.025,c.main,fade(age)*.27);
  }
  const count = kind === "status" ? 15 : kind === "special" ? 13 : 10;
  for (let i = 0; i < count; i++) {
    const seed = tile.seed + i * 67;
    const birth = (kind === "physical" ? 155 : 125) + i * (kind === "status" ? 32 : 27) + random(seed) * 47;
    const age = progress(ms, birth, 220 + random(seed + 2) * 135);
    if (age < 0 || age > 1) continue;
    const angle = i * 2.399 + random(seed + 3) * .35;
    const distance = r * (.15 + age * (kind === "status" ? .75 : .95));
    const x = tile.x + Math.cos(angle) * distance;
    const y = tile.y + Math.sin(angle) * distance * (kind === "status" ? .73 : .86);
    if (i % 4 === 0) glint(ctx,x,y,r*(.028+random(seed+4)*.025),c.light,fade(age)*.63);
    else if (kind === "physical") stroke(ctx,[x-Math.cos(angle)*r*.1,y-Math.sin(angle)*r*.1,x,y],
      r*.023,i%3?c.light:c.main,fade(age)*.72);
    else disk(ctx,x,y,r*(.016+random(seed+4)*.024),i%3?c.light:c.main,fade(age)*.67);
  }
};

/** Full 54-cell review resolver: earlier focused/approved cells keep their own renderers. */
export const drawFinalMatrixTile = (ctx: CanvasRenderingContext2D,
  type: VfxType, kind: VfxKind, tile: MatrixTile, ms: number) => {
  if (ms < 0 || ms > 760) return;
  if (type === "poison" || type === "fighting") {
    drawMatrixTile(ctx,type,kind,tile,ms);
    return;
  }
  const image = images.get(type);
  if (!image?.complete || !image.naturalWidth) {
    drawMatrixTile(ctx,type,kind,tile,ms);
    return;
  }
  const polish = kind === "physical" ? polishPhysicalTile :
    kind === "special" ? polishSpecialTile : polishStatusTile;
  polish(ctx,type,tile,ms,vfxPalette[type],"back");
  drawSubject(ctx,image,type,kind,tile,ms);
  polish(ctx,type,tile,ms,vfxPalette[type],"front");
  drawAccents(ctx,type,kind,tile,ms);
};
