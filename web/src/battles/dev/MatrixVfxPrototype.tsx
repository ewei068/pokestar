/** Development-only canvas study for the complete type/category matrix. */
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { VfxKind, VfxType } from "../vfx/types";
import { drawMatrixTile } from "./matrixVfxArt";
import type { MatrixTile } from "./matrixVfxArt";
import { drawFinalMatrixTile, loadFinalMatrixArt } from "./finalMatrixVfx";

const tileSeed = (team: string, position: string) => {
  let hash = 2166136261;
  for (const character of `${team}:${position}`) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
};
const random = (seed: number) => {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

export const MatrixVfxPrototype = ({ type, kind, variant, replayKey }: {
  type: VfxType; kind: VfxKind; variant: "study" | "final"; replayKey: number;
}) => {
  const [board, setBoard] = useState<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => setBoard(document.querySelector<HTMLElement>(".arena-board")), [replayKey]);
  useEffect(() => {
    if (!board || !canvasRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let tiles: MatrixTile[] = [];
    let frame = 0;
    let disposed = false;
    let observer: ResizeObserver | undefined;
    const measure = () => {
      const rect = board.getBoundingClientRect();
      const actorRect = board.querySelector<HTMLElement>(".arena-mon.is-active")?.getBoundingClientRect();
      const origin = actorRect ? { x: actorRect.left + actorRect.width / 2 - rect.left,
        y: actorRect.top + actorRect.height / 2 - rect.top } : undefined;
      const density = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * density);
      canvas.height = Math.round(rect.height * density);
      ctx.setTransform(density, 0, 0, density, 0, 0);
      tiles = [...board.querySelectorAll<HTMLElement>(".arena-cell.is-pattern-cell")].map((cell) => {
        const cellRect = cell.getBoundingClientRect();
        const anchor = cell.querySelector<HTMLElement>(".arena-sprite")?.getBoundingClientRect() || cellRect;
        const compact = cellRect.width < 100;
        return { x: anchor.left + anchor.width / 2 - rect.left,
          y: anchor.top + anchor.height / 2 - rect.top,
          radius: Math.min(cellRect.width * (compact ? .29 : .36),
            cellRect.height * (compact ? .43 : .52)),
          seed: tileSeed(cell.dataset.teamName || "", cell.dataset.position || ""), origin };
      });
    };
    const start = () => {
      if (disposed) return;
      observer = new ResizeObserver(measure);
      observer.observe(board);
      measure();
      const started = performance.now();
      const render = (now: number) => {
        if (disposed) return;
        const density = Math.min(window.devicePixelRatio || 1, 2);
        ctx.clearRect(0, 0, canvas.width / density, canvas.height / density);
        const elapsed = now - started;
        const effectMs = elapsed - 405;
        if (effectMs >= 0 && effectMs <= 760) tiles.forEach((tile) =>
          (variant === "final" ? drawFinalMatrixTile : drawMatrixTile)(ctx,type,kind,tile,
            variant === "final" ? effectMs : effectMs - random(tile.seed + 3) * 65));
        if (elapsed < 1500) frame = requestAnimationFrame(render);
      };
      frame = requestAnimationFrame(render);
    };
    void (variant === "final" ? loadFinalMatrixArt(type) : Promise.resolve())
      .then(start, start);
    return () => { disposed = true; cancelAnimationFrame(frame); observer?.disconnect(); };
  }, [board, type, kind, variant, replayKey]);
  return board && createPortal(<canvas ref={canvasRef} className="battle-vfx-study-canvas"
    aria-hidden="true" />, board);
};
