import { typeName } from "./typeDisplay";
import type { BattleCatalog, BattleEvent } from "./types";

export const MOVE_MOTION_DURATION_MS = 1500;
export const DEFAULT_EVENT_DURATION_MS = 550;

export type MotionKind = "physical" | "special" | "status";
export type MoveMotion = { kind: MotionKind; normalVfx: boolean; selfTarget: boolean };

/** Move category controls travel; move type selects the tile effect. */
export const moveMotion = (event: BattleEvent | undefined, catalog: BattleCatalog): MoveMotion | null => {
  if (event?.type !== "moveStarted") return null;
  const move = event.moveId ? catalog.moves[event.moveId] : undefined;
  const damageType = event.damageType || move?.damageType;
  const kind: MotionKind = damageType === "Physical" ? "physical"
    : damageType === "Special" ? "special" : "status";
  const moveType = event.moveType ?? move?.type;
  return { kind, normalVfx: moveType !== null && moveType !== undefined &&
    typeName(moveType, catalog).toLowerCase() === "normal",
    selfTarget: !!event.pokemonId && event.pokemonId === event.primaryTargetId };
};

export const playbackDuration = (event: BattleEvent, reducedMotion = false): number =>
  event.type === "moveStarted" && !reducedMotion ? MOVE_MOTION_DURATION_MS : DEFAULT_EVENT_DURATION_MS;

type Point = { x: number; y: number };

/** Position the actor near the primary target, or in its lane at the board's center. */
export const motionDestination = (kind: MotionKind, start: Point, target: Point,
  board: Point, targetSize: { width: number; height: number }, stacked: boolean): Point => {
  if (kind !== "physical") return stacked ? { x: target.x, y: board.y } : { x: board.x, y: target.y };
  const dx = target.x - start.x;
  const dy = target.y - start.y;
  const distance = Math.hypot(dx, dy) || 1;
  const clearance = Math.max(targetSize.width, targetSize.height) * 0.55;
  return { x: target.x - dx / distance * clearance, y: target.y - dy / distance * clearance };
};
