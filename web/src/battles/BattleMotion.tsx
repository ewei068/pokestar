import { measureArena } from "./arena/geometry";
import { PokemonSprite } from "./arena/PokemonSprite";
import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";
import { MOVE_APPROACH_MS, TILE_EFFECT_MS, MOVE_TOTAL_MS } from "./vfx/timing";
import { motionDestination, moveMotion } from "./motion";
import type { BattleCatalog, BattleEvent, BattleView } from "./types";

type Placement = { left: number; top: number; width: number; height: number; dx: number; dy: number };

/** A visual copy travels above the grid while its original sprite stays in its tile. */
export const BattleMotion = ({ boardRef, view, catalog, event, startedAt }: {
  boardRef: RefObject<HTMLDivElement>;
  view: BattleView;
  catalog: BattleCatalog;
  event: BattleEvent;
  startedAt: number;
}) => {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const actorRef = useRef<HTMLDivElement>(null);
  const motion = moveMotion(event, catalog);
  const source = event.pokemonId ? view.pokemon[event.pokemonId] : undefined;
  const species = source ? catalog.species[source.speciesId] : undefined;
  const sprite = source?.shiny ? species?.shinySprite : species?.sprite;

  useLayoutEffect(() => {
    if (!source || !motion || motion.selfTarget) {
      setPlacement(null);
      return;
    }
    const board = boardRef.current;
    const target = event.primaryTargetId ? view.pokemon[event.primaryTargetId] : undefined;
    if (!board || !target) {
      setPlacement(null);
      return;
    }
    const measure = () => {
      const geometry = measureArena(board);
      const from = geometry.at(source), to = geometry.at(target);
      if (!from?.sprite || !to) { setPlacement(null); return; }
      const boardBox = geometry.bounds, sourceBox = from.anchor, targetBox = to.rect;
      const start = from.center, targetCenter = to.center;
      const boardCenter = { x: boardBox.width / 2, y: boardBox.height / 2 };
      const stacked = window.matchMedia?.("(max-width: 640px)").matches || false;
      const destination = motionDestination(motion.kind, start, targetCenter, boardCenter,
        { width: targetBox.width, height: targetBox.height }, stacked);
      setPlacement({ left: sourceBox.left - boardBox.left, top: sourceBox.top - boardBox.top,
        width: sourceBox.width, height: sourceBox.height,
        dx: destination.x - start.x, dy: destination.y - start.y });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [boardRef, catalog, event, motion?.kind, motion?.selfTarget, source, view]);

  useLayoutEffect(() => {
    const actor = actorRef.current;
    if (!actor || !source || !placement) return;
    const board = boardRef.current;
    const sourceSprite = board ? measureArena(board).at(source)?.sprite : null;
    sourceSprite?.classList.add("is-moving-source");
    return () => sourceSprite?.classList.remove("is-moving-source");
  }, [boardRef, placement, source]);

  useLayoutEffect(() => {
    const actor = actorRef.current;
    if (!actor?.animate || !placement) return;
    const end = `translate(${placement.dx}px, ${placement.dy}px) scale(1.18)`;
    const animation = actor.animate([
      { transform: 'translate(0, 0) scale(1)', offset: 0, easing: motion?.kind === 'physical' ? 'cubic-bezier(.22,.77,.28,1)' : 'ease-in-out' },
      { transform: end, offset: MOVE_APPROACH_MS / MOVE_TOTAL_MS },
      { transform: end, offset: (MOVE_APPROACH_MS + TILE_EFFECT_MS) / MOVE_TOTAL_MS, easing: 'ease-in-out' },
      { transform: 'translate(0, 0) scale(1)', offset: 1 },
    ], { duration: MOVE_TOTAL_MS, fill: 'both' });
    animation.currentTime = Math.max(0, performance.now() - startedAt);
    return () => animation.cancel();
  }, [placement, startedAt, motion?.kind]);

  if (!placement || !source || !motion || motion.selfTarget) return null;
  const style = { left: placement.left, top: placement.top, width: placement.width,
    height: placement.height, "--travel-x": `${placement.dx}px`, "--travel-y": `${placement.dy}px` } as CSSProperties;
  return <div ref={actorRef} className={`arena-motion-actor is-${motion.kind}`} style={style} aria-hidden="true">
    <PokemonSprite src={sprite} />
  </div>;
};
