import type { CSSProperties } from "react";
import { physicalScenes } from "./physical";
import { specialScenes } from "./special";
import { statusScenes } from "./status";
import { vfxPalette } from "./types";
import type { VfxKind, VfxType } from "./types";

const scenes = { physical: physicalScenes, special: specialScenes, status: statusScenes };

/** One visual effect per resolved tile; the board supplies placement and timing. */
export const TileVfx = ({ type, kind }: { type: VfxType; kind: VfxKind }) => {
  const palette = vfxPalette[type];
  const style = { "--vfx-main": palette.main, "--vfx-light": palette.light,
    "--vfx-dark": palette.dark } as CSSProperties;
  return <svg className={`arena-tile-vfx is-${kind} type-${type}`} data-vfx-type={type}
    data-vfx-kind={kind} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style={style}>
    {scenes[kind][type]}
  </svg>;
};
