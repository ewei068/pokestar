/** Throwaway Fire Special study: three particle behaviors on the existing battle board. */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import flameUrl from "../../../../media/vfx/experiments/fire-special-flame-source.png";
import emberCoalUrl from "../../../../media/vfx/experiments/fire-ember-coal.png";
import emberFleckUrl from "../../../../media/vfx/experiments/fire-ember-fleck.png";
import emberForkUrl from "../../../../media/vfx/experiments/fire-ember-fork.png";

export const fireVfxVariants = ["original", "bloom", "column", "burst"] as const;
export type FireVfxVariant = typeof fireVfxVariants[number];

export const fireVfxVariantName: Record<FireVfxVariant, string> = {
  original: "Current SVG",
  bloom: "Flame bloom",
  column: "Rising column",
  burst: "Ember burst",
};

export const readFireVfxVariant = (params: URLSearchParams): FireVfxVariant => {
  const value = params.get("variant");
  return fireVfxVariants.find((variant) => variant === value) || "bloom";
};

export const FireVfxSwitcher = ({ variant, onChange }: {
  variant: FireVfxVariant; onChange: (variant: FireVfxVariant) => void;
}) => {
  const advance = (direction: number) => {
    const index = fireVfxVariants.indexOf(variant);
    onChange(fireVfxVariants[(index + direction + fireVfxVariants.length) % fireVfxVariants.length]);
  };
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        advance(event.key === "ArrowLeft" ? -1 : 1);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [variant]);
  return <nav className="battle-fire-vfx-switcher" aria-label="Fire VFX prototype variants">
    <button type="button" onClick={() => advance(-1)} aria-label="Previous VFX variant">←</button>
    <span><small>Fire Special prototype</small><strong>{fireVfxVariantName[variant]}</strong></span>
    <button type="button" onClick={() => advance(1)} aria-label="Next VFX variant">→</button>
  </nav>;
};

type Tile = { x: number; y: number; radius: number };
type FireTextures = { flame: HTMLImageElement; embers: HTMLImageElement[] };
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

const drawTile = (ctx: CanvasRenderingContext2D, textures: FireTextures,
  tile: Tile, ms: number, variant: Exclude<FireVfxVariant, "original">, seed: number) => {
  const image = textures.flame;
  const time = clamp(ms / 760);
  if (variant === "bloom") {
    drawGlow(ctx, tile, time, .7);
    for (let index = 0; index < 6; index++) {
      const birth = index * 27;
      const age = (ms - birth) / 560;
      if (age < 0 || age > 1) continue;
      const angle = index / 6 * Math.PI * 2 + random(seed + index) * .4;
      const distance = tile.radius * (.08 + age * .36);
      const size = tile.radius * (.8 + random(seed + index * 9) * .32) * (1 - age * .35);
      drawFlame(ctx, image, tile.x + Math.cos(angle) * distance,
        tile.y + Math.sin(angle) * distance * .55 + tile.radius * .2 - age * tile.radius * .33,
        size * .6, size, Math.cos(angle) * .32, fade(age) * .76);
    }
    // One larger coal anchors the bloom and outlives the surrounding flame tongues.
    const coalAge = ms / 760;
    const coalSize = tile.radius * (.79 + random(seed + 61) * .18) * (1 - coalAge * .12);
    ctx.save();
    ctx.translate(tile.x + (random(seed + 67) - .5) * tile.radius * .12,
      tile.y + tile.radius * .08 - coalAge * tile.radius * .1);
    ctx.rotate((random(seed + 71) - .5) * .25);
    ctx.globalAlpha = Math.min(1, coalAge * 12) * Math.pow(1 - coalAge, .45) * .95;
    ctx.drawImage(textures.embers[0], -coalSize / 2, -coalSize / 2, coalSize, coalSize);
    ctx.restore();
    drawEmbers(ctx, textures, tile, ms, 13, false, seed);
  } else if (variant === "column") {
    drawGlow(ctx, { ...tile, y: tile.y + tile.radius * .25 }, time, .5);
    for (let index = 0; index < 8; index++) {
      const birth = index * 62;
      const age = (ms - birth) / 450;
      if (age < 0 || age > 1) continue;
      const sway = Math.sin(age * 6 + index * 1.8) * tile.radius * .12;
      const size = tile.radius * (.68 + random(seed + index * 9) * .38);
      drawFlame(ctx, image, tile.x + sway + (random(seed + index * 3) - .5) * tile.radius * .35,
        tile.y + tile.radius * .42 - age * tile.radius * 1.05,
        size * .62, size, sway / tile.radius * .7, fade(age) * .75);
    }
    drawEmbers(ctx, textures, tile, ms, 12, false, seed + 101);
  } else {
    drawGlow(ctx, tile, clamp((ms - 50) / 500), .95);
    for (let index = 0; index < 4; index++) {
      const birth = 70 + index * 32;
      const age = (ms - birth) / 430;
      if (age < 0 || age > 1) continue;
      const angle = (index - 1.5) * .3;
      const size = tile.radius * (1.05 - age * .4);
      drawFlame(ctx, image, tile.x + angle * tile.radius * .38,
        tile.y + tile.radius * .22 - age * tile.radius * .27,
        size * .66, size, angle, fade(age) * .9);
    }
    drawEmbers(ctx, textures, tile, ms, 23, true, seed + 203);
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
            radius: Math.min(rect.width, rect.height) * .52 };
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
        tiles.forEach((tile, index) => drawTile(ctx, textures, tile, effectMs, variant, index * 1009 + 17));
      }
      if (elapsed < 1500) frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => { disposed = true; cancelAnimationFrame(frame); observer.disconnect(); };
  }, [board, replayKey, variant]);

  return board && createPortal(<canvas ref={canvasRef} className="battle-fire-vfx-prototype"
    aria-hidden="true" />, board);
};
