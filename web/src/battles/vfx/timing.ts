/** The event queue, actor, and tile renderer share these phase boundaries. */
export const MOVE_APPROACH_MS = 420;
export const TILE_EFFECT_MS = 760;
export const MOVE_RETURN_MS = 320;
export const MOVE_TOTAL_MS = MOVE_APPROACH_MS + TILE_EFFECT_MS + MOVE_RETURN_MS;
