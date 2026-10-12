import type { ReactNode } from "react";
import type { VfxType } from "./types";

/** Softer tile auras that do not imply damage or a particular buff/debuff result. */
export const statusScenes: Record<VfxType, ReactNode> = {
  normal: <><g className="vfx-main"><circle cx="50" cy="50" r="17" /><circle cx="50" cy="50" r="29" /></g>
    <g className="vfx-fill"><path d="M50 11 54 20 50 29 46 20Z M85 50 77 54 69 50 77 46Z M50 88 46 79 50 71 54 79Z M15 50 23 46 31 50 23 54Z" /></g></>,
  fighting: <><g className="vfx-main"><path d="M16 50 33 36 40 50 33 64Z M84 50 67 36 60 50 67 64Z" />
    <circle cx="50" cy="50" r="23" /></g><g className="vfx-light"><path d="M50 15 50 27 M50 73 50 85" /></g></>,
  flying: <><g className="vfx-main"><path d="M13 58 Q35 28 65 45 Q79 53 89 38 M14 76 Q38 51 68 63 Q78 66 86 59" /></g>
    <g className="vfx-fill"><path d="M25 28 Q39 12 52 23 Q41 33 25 28Z M62 81 Q72 67 87 73 Q75 83 62 81Z" /></g></>,
  poison: <><g className="vfx-main"><circle cx="47" cy="53" r="27" /><circle cx="29" cy="22" r="6" /><circle cx="73" cy="27" r="8" />
    <circle cx="78" cy="79" r="5" /></g><g className="vfx-fill"><circle cx="38" cy="61" r="5" /><circle cx="59" cy="44" r="4" /></g></>,
  ground: <><g className="vfx-main"><path d="M13 70 Q50 41 87 70 M20 80 Q50 59 80 80 M29 90 Q50 76 71 90" /></g>
    <g className="vfx-fill"><path d="M20 27 26 38 14 39Z M52 16 58 28 45 29Z M78 27 87 38 75 41Z" /></g></>,
  rock: <><g className="vfx-main"><path d="M50 12 78 33 68 73 50 87 28 72 22 34Z" /><path d="M50 12 50 87 M22 34 68 73 M78 33 28 72" /></g>
    <g className="vfx-fill"><path d="M50 28 64 41 60 61 48 70 36 57 38 40Z" /></g></>,
  bug: <><g className="vfx-main"><path d="M50 77 Q22 60 25 31 Q44 35 50 56 Q56 35 75 31 Q78 60 50 77Z" />
    <path d="M50 56 50 84 M37 33 28 19 M63 33 72 19" /></g>
    <g className="vfx-fill"><circle cx="16" cy="57" r="3" /><circle cx="84" cy="57" r="3" /></g></>,
  ghost: <><g className="vfx-main"><path d="M24 78 Q17 50 31 36 Q38 29 39 20 Q49 34 59 21 Q59 35 70 37 Q84 58 75 79 Q65 65 55 79 Q45 66 36 80Z" /></g>
    <g className="vfx-fill"><circle cx="43" cy="53" r="3" /><circle cx="60" cy="53" r="3" /></g></>,
  steel: <><g className="vfx-main"><path d="M50 12 82 27 77 65 50 88 23 65 18 27Z" />
    <path d="M50 27 66 35 63 57 50 69 37 57 34 35Z" /></g>
    <g className="vfx-light"><path d="M50 17 50 27 M26 32 34 37 M74 32 66 37" /></g></>,
  fire: <><g className="vfx-fill"><path d="M50 20 Q59 32 54 45 Q66 37 66 29 Q79 51 67 69 Q58 80 46 76 Q30 73 32 57 Q34 48 40 40 Q40 52 46 55 Q52 44 50 20Z" /></g>
    <g className="vfx-main"><circle cx="50" cy="53" r="31" strokeDasharray="3 13" /></g></>,
  water: <><g className="vfx-main"><ellipse cx="50" cy="60" rx="34" ry="17" /><ellipse cx="50" cy="60" rx="22" ry="9" /></g>
    <g className="vfx-fill"><path d="M50 12 Q62 32 56 39 Q50 46 44 39 Q39 31 50 12Z" /></g></>,
  grass: <><g className="vfx-main"><path d="M50 84 50 41 M50 62 Q29 59 22 30 Q45 32 50 62Z M50 52 Q58 26 82 24 Q77 51 50 52Z" /></g>
    <g className="vfx-fill"><circle cx="50" cy="85" r="5" /></g></>,
  electric: <><g className="vfx-main"><circle cx="50" cy="50" r="30" strokeDasharray="12 9" />
    <path d="M34 26 26 40 39 39 32 54 M65 46 76 60 62 59 68 75" /></g>
    <g className="vfx-fill"><circle cx="50" cy="50" r="5" /></g></>,
  psychic: <><g className="vfx-main"><ellipse cx="50" cy="50" rx="34" ry="16" /><ellipse cx="50" cy="50" rx="16" ry="34" />
    <circle cx="50" cy="50" r="10" /></g><g className="vfx-fill"><circle cx="50" cy="50" r="4" /></g></>,
  ice: <><g className="vfx-main"><path d="M50 16 50 84 M16 50 84 50 M26 26 74 74 M74 26 26 74" /></g>
    <g className="vfx-fill"><path d="M50 35 65 42 65 58 50 65 35 58 35 42Z" /></g></>,
  dragon: <><g className="vfx-main"><circle cx="50" cy="50" r="31" strokeDasharray="20 8" />
    <path d="M50 16 59 31 50 38 41 31Z M84 50 69 59 62 50 69 41Z M50 84 41 69 50 62 59 69Z M16 50 31 41 38 50 31 59Z" /></g></>,
  dark: <><g className="vfx-main"><path d="M73 17 Q38 24 35 53 Q35 76 70 85 Q27 86 17 56 Q11 26 73 17Z" />
    <path d="M28 80 Q53 64 82 77" /></g><g className="vfx-fill"><circle cx="78" cy="30" r="4" /></g></>,
  fairy: <><g className="vfx-main"><circle cx="50" cy="50" r="25" /><path d="M50 12 54 23 50 33 46 23Z M88 50 77 54 67 50 77 46Z M50 88 46 77 50 67 54 77Z M12 50 23 46 33 50 23 54Z" /></g>
    <g className="vfx-fill"><circle cx="24" cy="25" r="4" /><circle cx="76" cy="25" r="4" /><circle cx="24" cy="75" r="4" /><circle cx="76" cy="75" r="4" /></g></>,
};
