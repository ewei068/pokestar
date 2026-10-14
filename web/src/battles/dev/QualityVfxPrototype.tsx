/** Throwaway Normal Physical and Fairy Status studies on the existing battle board. */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import impactUrl from "../../../../media/vfx/experiments/normal-impact-streak.png";
import pixelImpactUrl from "../../../../media/vfx/components/normal-impact-crescent.png";
import fairyUrl from "../../../../media/vfx/experiments/fairy-status-mote.png";
import fairyGlintUrl from "../../../../media/vfx/experiments/fairy-status-glint-small.png";
import fairyPearlUrl from "../../../../media/vfx/experiments/fairy-status-pearl-small.png";

export const qualityVfxVariants = {
  "normal-physical": ["original", "sprite", "ripple", "impact", "pixel", "graphic", "cross"],
  "fairy-status": ["original", "halo", "spiral", "veil"],
} as const;
export type QualityVfxStudy = keyof typeof qualityVfxVariants;
export type QualityVfxVariant = "original" | "impact" | "pixel" | "graphic" | "sprite" |
  "cross" | "ripple" | "halo" | "spiral" | "veil";
export const qualityVfxNames: Record<QualityVfxVariant, string> = {
  original: "Current SVG",
  impact: "Impact arcs",
  pixel: "Pixel geometry",
  graphic: "Clean crescents",
  sprite: "Pixel sprite + circles",
  cross: "Crossing strikes",
  ripple: "Pressure circles",
  halo: "Mote halo",
  spiral: "Gathering spiral",
  veil: "Ribbon veil",
};
export const readQualityVfxVariant = (study: QualityVfxStudy, params: URLSearchParams): QualityVfxVariant => {
  const value = params.get("variant");
  const variants = qualityVfxVariants[study] as readonly string[];
  return (variants.find((variant) => variant === value) ||
    (study === "normal-physical" ? "sprite" : "halo")) as QualityVfxVariant;
};

type Tile = { x: number; y: number; radius: number; seed: number };
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const fade = (value: number) => Math.sin(Math.PI * clamp(value));
const random = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};
const tileSeed = (team: string, position: string) => {
  let hash = 2166136261;
  for (const character of `${team}:${position}`) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
};

const drawStreak = (ctx: CanvasRenderingContext2D, image: HTMLImageElement,
  tile: Tile, angle: number, distance: number, length: number, opacity: number) => {
  ctx.save();
  ctx.translate(tile.x + Math.cos(angle) * distance, tile.y + Math.sin(angle) * distance);
  ctx.rotate(angle);
  ctx.globalAlpha = clamp(opacity * .48);
  ctx.strokeStyle = "#384452";
  ctx.lineWidth = Math.max(1, tile.radius * .034);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(length * .67, 0);
  ctx.stroke();
  ctx.globalAlpha = clamp(opacity);
  ctx.drawImage(image, -length * .14, -length / 2, length, length);
  ctx.restore();
};

const drawRing = (ctx: CanvasRenderingContext2D, tile: Tile, radius: number,
  opacity: number, color: string, width: number, squash = .72) => {
  ctx.save();
  ctx.globalAlpha = clamp(opacity);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.ellipse(tile.x, tile.y, radius, radius * squash, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

/** Concentric pressure fronts can stand alone or sit behind the impact sprite. */
const drawPressureCircles = (ctx: CanvasRenderingContext2D, tile: Tile,
  ms: number, count: number) => {
  for (let index = 0; index < count; index++) {
    const key = tile.seed + index * 73;
    const age = (ms - index * 92 - random(key + 3) * 24) / 435;
    if (age < 0 || age > 1) continue;
    const radius = tile.radius * (.16 + age * .8 + random(key + 7) * .06);
    const opacity = fade(age) * (index === 0 ? .9 : .74);
    drawRing(ctx, tile, radius, opacity * .7, "#536575",
      Math.max(2, tile.radius * .12), 1);
    drawRing(ctx, tile, radius, opacity, index % 2 ? "#dce8e9" : "#fff9e9",
      Math.max(1.2, tile.radius * .068), 1);
  }
};

const drawImpactArc = (ctx: CanvasRenderingContext2D, tile: Tile, start: number,
  sweep: number, radius: number, width: number, opacity: number, seed: number) => {
  const segments = 18;
  ctx.save();
  ctx.globalAlpha = clamp(opacity);
  ctx.beginPath();
  for (let step = 0; step <= segments; step++) {
    const progress = step / segments;
    const taper = Math.sin(Math.PI * progress);
    const spike = step % 3 === 1 ? .55 + random(seed + step * 31) * .8 :
      random(seed + step * 31) * .18;
    const angle = start + sweep * progress;
    const outer = radius + width * taper * spike;
    const x = tile.x + Math.cos(angle) * outer;
    const y = tile.y + Math.sin(angle) * outer * .82;
    if (!step) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  for (let step = segments; step >= 0; step--) {
    const progress = step / segments;
    const taper = Math.sin(Math.PI * progress);
    const angle = start + sweep * progress;
    const inner = radius - width * taper * (.8 + random(seed + step * 37) * .15);
    ctx.lineTo(tile.x + Math.cos(angle) * inner,
      tile.y + Math.sin(angle) * inner * .82);
  }
  ctx.closePath();
  ctx.fillStyle = "#fffaf0";
  ctx.fill();
  ctx.strokeStyle = "#525d66";
  ctx.lineWidth = Math.max(1, tile.radius * .035);
  ctx.stroke();
  ctx.restore();
};

/** Low-resolution ring segments, scaled with nearest-neighbor sampling. */
const drawPixelImpact = (ctx: CanvasRenderingContext2D, tile: Tile, ms: number) => {
  const small = document.createElement("canvas");
  small.width = small.height = 24;
  const pixel = small.getContext("2d");
  if (!pixel) return;
  const seed = tile.seed;
  for (let pulse = 0; pulse < 2; pulse++) {
    const age = (ms - 40 - pulse * 215) / 385;
    if (age < 0 || age > 1) continue;
    const radius = 4.5 + age * 5;
    const rotation = random(seed + pulse * 53) * Math.PI * 2;
    for (let index = 0; index < 3; index++) {
      const key = seed + pulse * 103 + index * 43;
      const start = rotation + index * Math.PI * 2 / 3;
      const sweep = (74 + random(key + 7) * 22) * Math.PI / 180;
      pixel.beginPath();
      pixel.arc(12, 12, radius + random(key + 13), start, start + sweep);
      pixel.strokeStyle = "#465565";
      pixel.lineWidth = 3;
      pixel.stroke();
      pixel.beginPath();
      pixel.arc(12, 12, radius + random(key + 13), start, start + sweep);
      pixel.strokeStyle = index === 1 ? "#d7e4ed" : "#fff9ed";
      pixel.lineWidth = 2;
      pixel.stroke();
    }
    pixel.fillStyle = pulse ? "#d7e4ed" : "#fff9ed";
    for (let index = 0; index < 5; index++) {
      const angle = rotation + index * Math.PI * 2 / 5;
      const fragmentRadius = radius + 3 + random(seed + index * 17 + pulse) * 2;
      pixel.fillRect(Math.round(12 + Math.cos(angle) * fragmentRadius),
        Math.round(12 + Math.sin(angle) * fragmentRadius), 1, 1);
    }
  }
  ctx.save();
  ctx.globalAlpha = clamp(.9 - ms / 950);
  ctx.imageSmoothingEnabled = false;
  const size = tile.radius * 2.3;
  ctx.drawImage(small, tile.x - size / 2, tile.y - size / 2, size, size * .82);
  ctx.restore();
};

/** Smooth, deliberately simple arcs, without texture or uneven edges. */
const drawGraphicImpact = (ctx: CanvasRenderingContext2D, tile: Tile, ms: number) => {
  for (let pulse = 0; pulse < 2; pulse++) {
    const age = (ms - 35 - pulse * 215) / 385;
    if (age < 0 || age > 1) continue;
    const radius = tile.radius * (.32 + age * .64);
    const rotation = random(tile.seed + pulse * 61) * Math.PI * 2;
    const opacity = fade(age) * (pulse ? .75 : .95);
    ctx.save();
    ctx.translate(tile.x, tile.y);
    ctx.scale(1, .8);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    for (let index = 0; index < 3; index++) {
      const key = tile.seed + pulse * 101 + index * 37;
      const start = index * Math.PI * 2 / 3;
      const end = start + (78 + random(key + 3) * 18) * Math.PI / 180;
      ctx.beginPath();
      ctx.arc(0, 0, radius * (.91 + random(key + 7) * .15), start, end);
      ctx.strokeStyle = "#4c5964";
      ctx.lineWidth = Math.max(3, tile.radius * .2);
      ctx.lineCap = "butt";
      ctx.stroke();
      ctx.strokeStyle = index === 1 ? "#d9e3e9" : "#fff9eb";
      ctx.lineWidth = Math.max(2, tile.radius * .14);
      ctx.stroke();
    }
    ctx.restore();
    drawRing(ctx, tile, tile.radius * (.18 + age * .55), opacity * .32,
      "#fff8e8", Math.max(1, tile.radius * .055));
  }
};

const drawSpriteImpact = (ctx: CanvasRenderingContext2D, image: HTMLImageElement,
  tile: Tile, ms: number) => {
  drawPressureCircles(ctx, tile, ms, 3);
  // Three small 60–90 degree segments share the pressure-ring center.
  for (let piece = 0; piece < 3; piece++) {
    const key=tile.seed+piece*137;
    const age=(ms-35-piece*32)/285;
    if(age<0||age>1)continue;
    const size=tile.radius*(1.48+age*.30+random(key)*.18);
    const halfArc=(60+random(key+5)*30)*Math.PI/360;
    ctx.save();ctx.translate(tile.x,tile.y);ctx.scale(1,.85);
    ctx.rotate(piece*Math.PI*2/3+(random(key+2)-.5)*.5);
    ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,size,Math.PI-halfArc,Math.PI+halfArc);ctx.closePath();ctx.clip();
    ctx.globalAlpha=fade(age)*.9;ctx.imageSmoothingEnabled=false;
    // The source crescent curves around a point right of its image center.
    ctx.drawImage(image,-size*.65,-size*.52,size,size);ctx.restore();
  }
};

const drawNormalPhysical = (ctx: CanvasRenderingContext2D, image: HTMLImageElement,
  sprite: HTMLImageElement,
  tile: Tile, ms: number, variant: QualityVfxVariant) => {
  const seed = tile.seed;
  const r = tile.radius;
  if (variant === "impact") {
    for (let pulse = 0; pulse < 2; pulse++) {
      const pulseAge = (ms - 45 - pulse * 210) / (pulse ? 390 : 330);
      if (pulseAge < 0 || pulseAge > 1) continue;
      drawRing(ctx, tile, r * (.28 + pulseAge * .7), fade(pulseAge) * (pulse ? .3 : .48),
        "#8e9293", Math.max(1.5, r * (pulse ? .09 : .13)), .82);
      const count = 2 + Math.floor(random(seed + pulse * 43 + 7) * 2);
      const rotation = random(seed + pulse * 43 + 11) * Math.PI * 2;
      for (let index = 0; index < count; index++) {
        const key = seed + pulse * 503 + index * 101;
        const arcAge = (ms - 45 - pulse * 210 - random(key + 5) * 65) /
          (260 + random(key + 9) * 150);
        if (arcAge < 0 || arcAge > 1) continue;
        const start = rotation + index / count * Math.PI * 2 +
          (random(key + 13) - .5) * .35;
        const sweep = (60 + random(key + 17) * 60) * Math.PI / 180;
        const radius = r * (.38 + arcAge * .42 + random(key + 23) * .17);
        const width = r * (.18 + random(key + 29) * .13) * (1 - arcAge * .35);
        drawImpactArc(ctx, tile, start, sweep, radius, width,
          fade(arcAge) * (pulse ? .76 : .92), key);
      }
    }
  } else if (variant === "pixel") {
    drawPixelImpact(ctx, tile, ms);
  } else if (variant === "graphic") {
    drawGraphicImpact(ctx, tile, ms);
  } else if (variant === "sprite") {
    drawSpriteImpact(ctx, sprite, tile, ms);
  } else if (variant === "cross") {
    const base = -.5 + (random(seed + 11) - .5) * .22;
    for (let index = 0; index < 2; index++) {
      const age = (ms - index * 125) / 360;
      if (age < 0 || age > 1) continue;
      const angle = base + index * 1.16;
      const travel = r * (-.48 + age * .95);
      drawStreak(ctx, image, tile, angle, travel, r * 1.75, fade(age) * .93);
      drawStreak(ctx, image, tile, angle + Math.PI, -travel * .38,
        r * .73, fade(age) * .43);
    }
    const age = (ms - 105) / 340;
    if (age >= 0 && age <= 1) drawRing(ctx, tile, r * (.24 + age * .65),
      fade(age) * .35, "#fff6db", Math.max(1, r * .04));
  } else {
    drawPressureCircles(ctx, tile, ms, 4);
  }
};

const drawMote = (ctx: CanvasRenderingContext2D, image: HTMLImageElement,
  x: number, y: number, size: number, angle: number, opacity: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = clamp(opacity);
  ctx.drawImage(image, -size / 2, -size / 2, size, size);
  ctx.restore();
};

const drawFairyGlow = (ctx: CanvasRenderingContext2D, tile: Tile, time: number) => {
  const strength = fade(time) * .26;
  if (!strength) return;
  const radius = tile.radius * 1.05;
  const gradient = ctx.createRadialGradient(tile.x, tile.y, 0, tile.x, tile.y, radius);
  gradient.addColorStop(0, `rgba(255, 246, 255, ${strength})`);
  gradient.addColorStop(.6, `rgba(225, 171, 250, ${strength * .44})`);
  gradient.addColorStop(1, "rgba(225, 171, 250, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(tile.x - radius, tile.y - radius, radius * 2, radius * 2);
};

type FairySprites = { main: HTMLImageElement; glint: HTMLImageElement; pearl: HTMLImageElement };
const drawFairyOutwardMotes = (ctx: CanvasRenderingContext2D, sprites: FairySprites,
  tile: Tile, ms: number, count: number) => {
  for (let index = 0; index < count; index++) {
    const key = tile.seed + index * 131;
    const birth = 15 + index * 30 + random(key + 3) * 36;
    const life = 160 + random(key + 7) * 175;
    const age = (ms - birth) / life;
    if (age < 0 || age > 1) continue;
    const angle = random(key + 11) * Math.PI * 2;
    const radius = tile.radius * (.13 + age * (.48 + random(key + 17) * .48));
    const sprite = index % 6 === 0 ? sprites.main : index % 2 ? sprites.glint : sprites.pearl;
    const size = tile.radius * (index % 6 === 0 ? .3 : .15 + random(key + 23) * .12);
    drawMote(ctx, sprite, tile.x + Math.cos(angle) * radius,
      tile.y + Math.sin(angle) * radius * .75 - age * tile.radius * .12,
      size, (random(key + 29) - .5) * .7 + age * .35,
      Math.min(1, age * 9) * Math.pow(1 - age, .65) * .88);
  }
};

const drawFairyStatus = (ctx: CanvasRenderingContext2D, sprites: FairySprites,
  tile: Tile, ms: number, variant: QualityVfxVariant) => {
  const seed = tile.seed;
  const r = tile.radius;
  drawFairyGlow(ctx, tile, ms / 760);
  if (variant === "halo") {
    for (let pulse = 0; pulse < 2; pulse++) {
      const age = (ms - pulse * 290) / (pulse ? 430 : 520);
      if (age < 0 || age > 1) continue;
      drawRing(ctx, tile, r * (.22 + age * .65), fade(age) * (pulse ? .58 : .75),
        "#f4b7f2", Math.max(1.5, r * .055), .7);
      drawRing(ctx, tile, r * (.14 + age * .47), fade(age) * .42,
        "#bbf7ff", Math.max(1, r * .03), .7);
    }
  } else if (variant === "spiral") {
    const curveAge = ms / 700;
    if (curveAge <= 1) {
      for (let arm = 0; arm < 2; arm++) {
        ctx.save();
        ctx.globalAlpha = fade(curveAge) * (arm ? .35 : .5);
        ctx.strokeStyle = arm ? "#9ce7f4" : "#d999e6";
        ctx.lineWidth = Math.max(1.3, r * .055);
        ctx.lineCap = "round";
        ctx.beginPath();
        for (let step = 0; step <= 24; step++) {
          const progress = step / 24;
          const angle = progress * Math.PI * 2.4 + arm * Math.PI + curveAge * 2.7;
          const radius = r * (.84 - progress * .62);
          const x = tile.x + Math.cos(angle) * radius;
          const y = tile.y + Math.sin(angle) * radius * .72;
          if (!step) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }
    for (let index = 0; index < 8; index++) {
      const key = seed + index * 101;
      const birth = index * 28 + random(key + 5) * 65;
      const age = (ms - birth) / 450;
      if (age < 0 || age > 1) continue;
      const angle = index * 2.4 + age * 3.5 + random(seed + 7);
      const radius = r * (.9 - age * .62);
      const sprite = index % 2 ? sprites.glint : sprites.pearl;
      drawMote(ctx, sprite, tile.x + Math.cos(angle) * radius,
        tile.y + Math.sin(angle) * radius * .72 - age * r * .22,
        r * (.2 + random(key + 17) * .18), angle, fade(age) * .95);
    }
    const age = (ms - 325) / 410;
    if (age >= 0 && age <= 1) drawMote(ctx, sprites.main, tile.x, tile.y - age * r * .2,
      r * (.62 + age * .36), age * .6, fade(age) * .9);
  } else {
    const progress = clamp(ms / 760);
    for (let index = 0; index < 3; index++) {
      const phase = index * 2.1 + random(seed + 17) * .7;
      const sway = Math.sin(progress * Math.PI * 2 + phase) * r * .19;
      ctx.save();
      ctx.globalAlpha = fade(progress) * (.52 - index * .07);
      ctx.strokeStyle = index % 2 ? "#85d9ef" : "#e0a0e9";
      ctx.lineWidth = Math.max(1.4, r * (.08 - index * .014));
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(tile.x - r * .85, tile.y + r * (.38 - index * .23));
      ctx.bezierCurveTo(tile.x - r * .25 + sway, tile.y - r * .6,
        tile.x + r * .35 - sway, tile.y + r * .6,
        tile.x + r * .85, tile.y - r * (.2 + index * .12));
      ctx.stroke();
      ctx.restore();
    }
    for (let index = 0; index < 7; index++) {
      const key = seed + index * 89;
      const age = (ms - index * 55) / 390;
      if (age < 0 || age > 1) continue;
      const x = tile.x + r * (-.75 + age * 1.5);
      const y = tile.y + Math.sin(age * Math.PI * 2 + index) * r * .34 - age * r * .18;
      drawMote(ctx, index % 2 ? sprites.glint : sprites.pearl,
        x, y, r * (.17 + random(key + 3) * .16),
        age * .7, fade(age) * .8);
    }
  }
  drawFairyOutwardMotes(ctx, sprites, tile, ms, variant === "halo" ? 18 : 14);
};

/** Reuse the approved tile studies in the temporary review gallery. */
export const createQualityReviewRenderer = (study: QualityVfxStudy) => {
  const urls = study === "normal-physical" ? [impactUrl, pixelImpactUrl] :
    [fairyUrl, fairyGlintUrl, fairyPearlUrl];
  const images = urls.map((url) => { const image = new Image(); image.src = url; return image; });
  const render = (ctx: CanvasRenderingContext2D, tile: Tile, ms: number) => {
    if (!images.every((image) => image.complete && image.naturalWidth > 0)) return;
    if (study === "normal-physical") drawNormalPhysical(ctx, images[0], images[1], tile, ms, "sprite");
    else drawFairyStatus(ctx, { main: images[0], glint: images[1], pearl: images[2] }, tile, ms, "halo");
  };
  return Object.assign(render, { ready: Promise.all(images.map(image => image.decode())) });
};

export const QualityVfxPrototype = ({ study, variant, replayKey }: {
  study: QualityVfxStudy; variant: Exclude<QualityVfxVariant, "original">; replayKey: number;
}) => {
  const [board, setBoard] = useState<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => setBoard(document.querySelector<HTMLElement>(".arena-board")), [replayKey]);
  useEffect(() => {
    if (!board || !canvasRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageUrls = study === "normal-physical" ? [impactUrl, pixelImpactUrl] :
      [fairyUrl, fairyGlintUrl, fairyPearlUrl];
    const images = imageUrls.map((url) => { const image = new Image(); image.src = url; return image; });
    let frame = 0;
    let tiles: Tile[] = [];
    let disposed = false;
    const measure = () => {
      const rect = board.getBoundingClientRect();
      const density = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * density);
      canvas.height = Math.round(rect.height * density);
      ctx.setTransform(density, 0, 0, density, 0, 0);
      ctx.imageSmoothingEnabled = false;
      tiles = [...board.querySelectorAll<HTMLElement>(".arena-cell.is-pattern-cell")].map((cell) => {
        const cellRect = cell.getBoundingClientRect();
          const anchor = cell.querySelector<HTMLElement>(".arena-sprite")?.getBoundingClientRect() || cellRect;
        return { x: anchor.left + anchor.width / 2 - rect.left,
          y: anchor.top + anchor.height / 2 - rect.top,
          radius: Math.min(cellRect.width * .36, cellRect.height * .52),
          seed: tileSeed(cell.dataset.teamName || "", cell.dataset.position || "") };
      });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(board);
    measure();
    const started = performance.now();
    const render = (now: number) => {
      if (disposed) return;
      const elapsed = now - started;
      const density = Math.min(window.devicePixelRatio || 1, 2);
      ctx.clearRect(0, 0, canvas.width / density, canvas.height / density);
      const effectMs = elapsed - 405;
      if (images.every((image) => image.complete && image.naturalWidth > 0) &&
        effectMs >= 0 && effectMs <= 760) {
        tiles.forEach((tile) => {
          const ms = effectMs - random(tile.seed + 3) * 65;
          if (ms < 0) return;
          if (study === "normal-physical") drawNormalPhysical(ctx, images[0], images[1], tile, ms, variant);
          else drawFairyStatus(ctx, { main: images[0], glint: images[1], pearl: images[2] }, tile, ms, variant);
        });
      }
      if (elapsed < 1500) frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); };
  }, [board, replayKey, study, variant]);
  return board && createPortal(<canvas ref={canvasRef} className="battle-vfx-study-canvas"
    aria-hidden="true" />, board);
};
