/** Throwaway Normal Physical and Fairy Status studies on the existing battle board. */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import impactUrl from "../../../../media/vfx/experiments/normal-impact-streak.png";
import fairyUrl from "../../../../media/vfx/experiments/fairy-status-mote.png";

export const qualityVfxVariants = {
  "normal-physical": ["original", "impact", "cross", "ripple"],
  "fairy-status": ["original", "halo", "spiral", "veil"],
} as const;
export type QualityVfxStudy = keyof typeof qualityVfxVariants;
export type QualityVfxVariant = "original" | "impact" | "cross" | "ripple" | "halo" | "spiral" | "veil";
export const qualityVfxNames: Record<QualityVfxVariant, string> = {
  original: "Current SVG",
  impact: "Impact lines",
  cross: "Crossing strikes",
  ripple: "Pressure rings",
  halo: "Mote halo",
  spiral: "Gathering spiral",
  veil: "Ribbon veil",
};
export const readQualityVfxVariant = (study: QualityVfxStudy, params: URLSearchParams): QualityVfxVariant => {
  const value = params.get("variant");
  const variants = qualityVfxVariants[study] as readonly string[];
  return (variants.find((variant) => variant === value) || variants[1]) as QualityVfxVariant;
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

const drawNormalPhysical = (ctx: CanvasRenderingContext2D, image: HTMLImageElement,
  tile: Tile, ms: number, variant: QualityVfxVariant) => {
  const seed = tile.seed;
  const r = tile.radius;
  if (variant === "impact") {
    const coreAge = (ms - 25) / 310;
    if (coreAge >= 0 && coreAge <= 1) {
      ctx.save();
      ctx.globalAlpha = fade(coreAge) * .65;
      ctx.fillStyle = "#fff8e5";
      ctx.beginPath();
      ctx.ellipse(tile.x, tile.y, r * (.09 + coreAge * .11),
        r * (.08 + coreAge * .08), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#525967";
      ctx.lineWidth = Math.max(1, r * .035);
      ctx.stroke();
      ctx.restore();
    }
    const ringAge = ms / 370;
    if (ringAge <= 1) drawRing(ctx, tile, r * (.18 + ringAge * .74),
      fade(ringAge) * .65, "#b7a993", Math.max(1.5, r * .075));
    const count = 6 + Math.floor(random(seed + 7) * 4);
    const phase = random(seed + 11) * Math.PI * 2;
    for (let index = 0; index < count; index++) {
      const key = seed + index * 101;
      const age = (ms - 28 - random(key + 17) * 90) / (260 + random(key + 19) * 170);
      if (age < 0 || age > 1) continue;
      const angle = phase + index / count * Math.PI * 2 + (random(key + 23) - .5) * .3;
      const length = r * (1.03 + random(key + 29) * .7) * (1 - age * .25);
      drawStreak(ctx, image, tile, angle, r * age * .33, length, fade(age) * .87);
    }
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
    for (let index = 0; index < 3; index++) {
      const age = (ms - index * 105) / 430;
      if (age < 0 || age > 1) continue;
      drawRing(ctx, tile, r * (.15 + age * .95), fade(age) * (.7 - index * .13),
        index === 0 ? "#fff8e8" : "#b7a994", Math.max(1, r * (.07 - index * .013)), .6 + index * .09);
    }
    for (let index = 0; index < 5; index++) {
      const key = seed + index * 109;
      const age = (ms - 75 - random(key + 5) * 100) / 350;
      if (age < 0 || age > 1) continue;
      const angle = index / 5 * Math.PI * 2 + random(key + 11) * .45;
      drawStreak(ctx, image, tile, angle, r * (.25 + age * .55), r * .36, fade(age) * .5);
    }
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

const drawFairyStatus = (ctx: CanvasRenderingContext2D, image: HTMLImageElement,
  tile: Tile, ms: number, variant: QualityVfxVariant) => {
  const seed = tile.seed;
  const r = tile.radius;
  drawFairyGlow(ctx, tile, ms / 760);
  if (variant === "halo") {
    const age = ms / 690;
    if (age <= 1) {
      drawRing(ctx, tile, r * (.22 + age * .65), fade(age) * .75,
        "#f4b7f2", Math.max(1.5, r * .055), .7);
      drawRing(ctx, tile, r * (.14 + age * .47), fade(age) * .5,
        "#bbf7ff", Math.max(1, r * .03), .7);
    }
    for (let index = 0; index < 8; index++) {
      const key = seed + index * 97;
      const birth = 65 + random(key + 3) * 180;
      const age = (ms - birth) / (360 + random(key + 7) * 190);
      if (age < 0 || age > 1) continue;
      const angle = index / 8 * Math.PI * 2 + random(seed + 11) * .4 + age * .35;
      const radius = r * (.33 + age * .57);
      drawMote(ctx, image, tile.x + Math.cos(angle) * radius,
        tile.y + Math.sin(angle) * radius * .72 - age * r * .17,
        r * (.23 + random(key + 13) * .23), angle + age, fade(age) * .92);
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
    for (let index = 0; index < 11; index++) {
      const key = seed + index * 101;
      const birth = index * 28 + random(key + 5) * 65;
      const age = (ms - birth) / 450;
      if (age < 0 || age > 1) continue;
      const angle = index * 2.4 + age * 3.5 + random(seed + 7);
      const radius = r * (.9 - age * .62);
      drawMote(ctx, image, tile.x + Math.cos(angle) * radius,
        tile.y + Math.sin(angle) * radius * .72 - age * r * .22,
        r * (.25 + random(key + 17) * .28), angle, fade(age) * .95);
    }
    const age = (ms - 325) / 410;
    if (age >= 0 && age <= 1) drawMote(ctx, image, tile.x, tile.y - age * r * .2,
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
      drawMote(ctx, image, x, y, r * (.19 + random(key + 3) * .24),
        age * .7, fade(age) * .8);
    }
  }
};

export const QualityVfxPrototype = ({ study, variant, replayKey }: {
  study: QualityVfxStudy; variant: Exclude<QualityVfxVariant, "original">; replayKey: number;
}) => {
  const [board, setBoard] = useState<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => setBoard(document.querySelector<HTMLElement>(".arena-board")), [replayKey]);
  useEffect(() => {
    if (!board || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const image = new Image();
    image.src = study === "normal-physical" ? impactUrl : fairyUrl;
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
        return { x: cellRect.left + cellRect.width / 2 - rect.left,
          y: cellRect.top + cellRect.height / 2 - rect.top,
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
      if (image.complete && image.naturalWidth > 0 && effectMs >= 0 && effectMs <= 760) {
        tiles.forEach((tile) => {
          const ms = effectMs - random(tile.seed + 3) * 65;
          if (ms < 0) return;
          if (study === "normal-physical") drawNormalPhysical(ctx, image, tile, ms, variant);
          else drawFairyStatus(ctx, image, tile, ms, variant);
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
