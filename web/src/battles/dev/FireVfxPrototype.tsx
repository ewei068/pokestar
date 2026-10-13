/** Throwaway Fire Special study: three particle behaviors on the existing battle board. */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import flameUrl from "../../../../media/vfx/experiments/fire-special-flame-source.png";
import emberCoalUrl from "../../../../media/vfx/experiments/fire-ember-coal.png";
import emberFleckUrl from "../../../../media/vfx/experiments/fire-ember-fleck.png";
import emberForkUrl from "../../../../media/vfx/experiments/fire-ember-fork.png";

export const fireVfxVariants = ["original", "column", "bloom", "burst"] as const;
export type FireVfxVariant = typeof fireVfxVariants[number];

export const fireVfxVariantName: Record<FireVfxVariant, string> = {
  original: "Current SVG",
  bloom: "Flame bloom",
  column: "Rising column",
  burst: "Ember burst",
};

export const readFireVfxVariant = (params: URLSearchParams): FireVfxVariant => {
  const value = params.get("variant");
  return fireVfxVariants.find((variant) => variant === value) || "column";
};

type Tile = { x: number; y: number; radius: number; seed: number };
type FireTextures = { flame: HTMLImageElement; embers: HTMLImageElement[] };
const tileSeed = (teamName: string, position: string) => {
  // The same action/tile pair should keep its look even if the target list changes order.
  let hash = 2166136261;
  for (const character of `${teamName}:${position}`) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return hash >>> 0;
};
const random = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const fade = (value: number) => Math.sin(Math.PI * clamp(value));

const drawFlame = (ctx: CanvasRenderingContext2D, image: HTMLImageElement,
  x: number, y: number, width: number, height: number, angle: number, alpha: number) => {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = clamp(alpha);
  ctx.drawImage(image, -width / 2, -height * .83, width, height);
  ctx.restore();
};

const drawGlow = (ctx: CanvasRenderingContext2D, tile: Tile, time: number, strength: number) => {
  const peak = fade(time);
  if (!peak) return;
  const radius = tile.radius * (0.45 + peak * .6);
  const gradient = ctx.createRadialGradient(tile.x, tile.y, 0, tile.x, tile.y, radius);
  gradient.addColorStop(0, `rgba(255, 243, 142, ${peak * strength})`);
  gradient.addColorStop(.5, `rgba(255, 119, 24, ${peak * strength * .37})`);
  gradient.addColorStop(1, "rgba(255, 80, 0, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(tile.x - radius, tile.y - radius, radius * 2, radius * 2);
};

const drawEmbers = (ctx: CanvasRenderingContext2D, textures: FireTextures, tile: Tile,
  ms: number, count: number, burst: boolean, seed: number) => {
  for (let index = 0; index < count; index++) {
    const particleSeed = seed + index * 101;
    const birth = 35 + random(particleSeed + 7) * (burst ? 170 : 190);
    const life = 180 + random(particleSeed + 13) * (burst ? 260 : 200);
    const age = (ms - birth) / life;
    if (age < 0 || age > 1) continue;
    // Every particle has a stable seed so replaying the story reproduces its motion.
    const angle = (burst ? random(particleSeed + 17) * Math.PI * 2 :
      -Math.PI / 2 + (random(particleSeed + 17) - .5) * Math.PI * 1.5);
    const speed = (.45 + random(particleSeed + 23) * .95) * tile.radius;
    const originX = (random(particleSeed + 19) - .5) * tile.radius * .55;
    const originY = (random(particleSeed + 31) - .5) * tile.radius * .35;
    const x = tile.x + originX + Math.cos(angle) * speed * age;
    const y = tile.y + originY + Math.sin(angle) * speed * age;
    const size = Math.max(4, tile.radius * (.14 + random(particleSeed + 29) * .13)) * (1 - age * .35);
    const sprite = textures.embers[Math.floor(random(particleSeed + 37) * textures.embers.length)];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((random(particleSeed + 41) - .5) * 1.2 + age * (random(particleSeed + 43) - .5));
    ctx.globalAlpha = Math.min(1, age * 7) * Math.pow(1 - age, .8) * .9;
    ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
    ctx.restore();
  }
};

/** One long-lived tailed ember gives each tile a clear center amid smaller particles. */
const drawMainEmber = (ctx: CanvasRenderingContext2D, textures: FireTextures,
  tile: Tile, localMs: number, duration: number, column: boolean) => {
  const seed = tile.seed;
  const age = clamp(localMs / duration);
  const emberSize = tile.radius * (column ? 1.68 + random(seed + 61) * .16 :
    1.1 + random(seed + 61) * .32) * (1 - age * .13);
  const emberX = tile.x + (random(seed + 67) - .5) * tile.radius * (column ? .14 : .3);
  const emberY = tile.y + tile.radius * (column ? .16 : .09) - age * tile.radius * .14;
  const flip = random(seed + 69) < .5 ? -1 : 1;
  ctx.save();
  ctx.translate(emberX, emberY);
  ctx.rotate(column ? -Math.PI / 4 + (random(seed + 71) - .5) * .1 :
    (random(seed + 71) - .5) * .2);
  if (!column) ctx.scale(flip, 1);
  ctx.globalAlpha = Math.min(1, age * 12) * Math.pow(1 - age, .42) * .95;
  ctx.drawImage(textures.embers[1], -emberSize / 2, -emberSize / 2, emberSize, emberSize);
  const coreSize = emberSize * .38;
  ctx.drawImage(textures.embers[0], -coreSize / 2 - emberSize * .12,
    -coreSize / 2 + emberSize * .13, coreSize, coreSize);
  ctx.restore();
};

/** Column sparks cross the large ember's face before drifting upward. */
const drawForegroundEmbers = (ctx: CanvasRenderingContext2D, textures: FireTextures,
  tile: Tile, ms: number) => {
  for (let index = 0; index < 14; index++) {
    const key = tile.seed + index * 107;
    const birth = 55 + index * 29 + random(key + 3) * 45;
    const life = 250 + random(key + 7) * 190;
    const age = (ms - birth) / life;
    if (age < 0 || age > 1) continue;
    const x = tile.x + (random(key + 11) - .5) * tile.radius * .52 +
      (random(key + 13) - .5) * tile.radius * .62 * age;
    const y = tile.y + tile.radius * .38 - age * tile.radius *
      (.65 + random(key + 17) * .55);
    const size = tile.radius * (.23 + random(key + 19) * .17) * (1 - age * .24);
    const sprite = textures.embers[Math.floor(random(key + 23) * textures.embers.length)];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-.35 + (random(key + 29) - .5) * .85);
    ctx.globalAlpha = Math.min(1, age * 8) * Math.pow(1 - age, .64);
    ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
    ctx.fillStyle = "#fff4b1";
    ctx.beginPath();
    ctx.arc(0, 0, Math.max(1, size * .09), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

const drawTile = (ctx: CanvasRenderingContext2D, textures: FireTextures,
  tile: Tile, ms: number, variant: Exclude<FireVfxVariant, "original">) => {
  const seed = tile.seed;
  const image = textures.flame;
  const offset = random(seed + 3) * 105;
  const localMs = ms - offset;
  if (localMs < 0) return;
  const time = clamp(localMs / (760 - offset));
  if (variant === "bloom") {
    drawGlow(ctx, tile, time, .5 + random(seed + 5) * .35);
    const flameCount = 4 + Math.floor(random(seed + 11) * 4);
    const spread = random(seed + 13) * Math.PI * 2;
    for (let index = 0; index < flameCount; index++) {
      const birth = random(seed + index * 97 + 17) * 135;
      const life = 340 + random(seed + index * 97 + 19) * 215;
      const age = (localMs - birth) / life;
      if (age < 0 || age > 1) continue;
      const angle = spread + index / flameCount * Math.PI * 2 +
        (random(seed + index * 97 + 23) - .5) * .65;
      const distance = tile.radius * (.05 + age * (.2 + random(seed + index * 97 + 29) * .36));
      const size = tile.radius * (.65 + random(seed + index * 97 + 31) * .65) * (1 - age * .35);
      drawFlame(ctx, image, tile.x + Math.cos(angle) * distance,
        tile.y + Math.sin(angle) * distance * .55 + tile.radius * .2 - age * tile.radius * .33,
        size * .6, size, Math.cos(angle) * .4, fade(age) * (.57 + random(seed + index * 97 + 37) * .26));
    }
    drawMainEmber(ctx, textures, tile, localMs, 760 - offset, false);
    drawEmbers(ctx, textures, tile, localMs, 10 + Math.floor(random(seed + 73) * 7), false, seed);
  } else if (variant === "column") {
    drawGlow(ctx, { ...tile, y: tile.y + tile.radius * .25 }, time, .5);
    const count = 5 + Math.floor(random(seed + 11) * 3);
    for (let index = 0; index < count; index++) {
      const birth = index * 55 + random(seed + index * 97 + 13) * 38;
      const age = (localMs - birth) / 450;
      if (age < 0 || age > 1) continue;
      const sway = Math.sin(age * 6 + index * 1.8 + random(seed + 17) * 3) * tile.radius * .12;
      const size = tile.radius * (.55 + random(seed + index * 9) * .3);
      drawFlame(ctx, image, tile.x + sway + (random(seed + index * 3) - .5) * tile.radius * .35,
        tile.y + tile.radius * .42 - age * tile.radius * 1.05,
        size * .62, size, sway / tile.radius * .7, fade(age) * .67);
    }
    drawMainEmber(ctx, textures, tile, localMs, 760 - offset, true);
    drawForegroundEmbers(ctx, textures, tile, localMs);
  } else {
    drawGlow(ctx, tile, clamp((localMs - 50) / 500), .95);
    const count = 3 + Math.floor(random(seed + 11) * 3);
    for (let index = 0; index < count; index++) {
      const birth = 55 + index * 32 + random(seed + index * 97 + 13) * 45;
      const age = (localMs - birth) / 430;
      if (age < 0 || age > 1) continue;
      const angle = (index - (count - 1) / 2) * .3 + (random(seed + 17) - .5) * .35;
      const size = tile.radius * (1.05 - age * .4);
      drawFlame(ctx, image, tile.x + angle * tile.radius * .38,
        tile.y + tile.radius * .22 - age * tile.radius * .27,
        size * .66, size, angle, fade(age) * .9);
    }
    drawEmbers(ctx, textures, tile, localMs, 18 + Math.floor(random(seed + 73) * 9), true, seed + 203);
  }
};

export const FireVfxPrototype = ({ variant, replayKey }: {
  variant: Exclude<FireVfxVariant, "original">; replayKey: number;
}) => {
  const [board, setBoard] = useState<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => setBoard(document.querySelector<HTMLElement>(".arena-board")), [replayKey]);

  useEffect(() => {
    if (!board || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageFor = (url: string) => {
      const image = new Image();
      image.src = url;
      return image;
    };
    const textures: FireTextures = {
      flame: imageFor(flameUrl),
      embers: [emberCoalUrl, emberFleckUrl, emberForkUrl].map(imageFor),
    };
    let frame = 0;
    let disposed = false;
    let tiles: Tile[] = [];
    const measure = () => {
      const boardRect = board.getBoundingClientRect();
      const density = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(boardRect.width * density);
      canvas.height = Math.round(boardRect.height * density);
      ctx.setTransform(density, 0, 0, density, 0, 0);
      ctx.imageSmoothingEnabled = false;
      tiles = [...board.querySelectorAll<HTMLElement>(".arena-cell.is-pattern-cell")]
        .map((cell) => {
          const rect = cell.getBoundingClientRect();
          return { x: rect.left + rect.width / 2 - boardRect.left,
            y: rect.top + rect.height / 2 - boardRect.top,
            radius: Math.min(rect.width * .36, rect.height * .52),
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
      const width = canvas.width / Math.min(window.devicePixelRatio || 1, 2);
      const height = canvas.height / Math.min(window.devicePixelRatio || 1, 2);
      ctx.clearRect(0, 0, width, height);
      const effectMs = elapsed - 405;
      const images = [textures.flame, ...textures.embers];
      if (images.every((image) => image.complete && image.naturalWidth > 0) &&
        effectMs >= 0 && effectMs <= 760) {
        tiles.forEach((tile) => drawTile(ctx, textures, tile, effectMs, variant));
      }
      if (elapsed < 1500) frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); };
  }, [board, replayKey, variant]);

  return board && createPortal(<canvas ref={canvasRef} className="battle-vfx-study-canvas"
    aria-hidden="true" />, board);
};
