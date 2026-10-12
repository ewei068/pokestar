import type { ReactNode } from "react";
import type { VfxType } from "./types";

/** Sustained energy, elements, and fields; distinct from the short physical impacts. */
export const specialScenes: Record<VfxType, ReactNode> = {
  normal: <><g className="vfx-main"><circle cx="50" cy="50" r="21" /><circle cx="50" cy="50" r="34" />
    <path d="M51 18 C84 21 91 60 66 75 C43 90 16 66 28 43 C36 29 59 30 65 47" /></g></>,
  fighting: <><g className="vfx-main"><circle cx="50" cy="50" r="28" /><path d="M10 50 37 50 M63 50 90 50 M50 11 50 36 M50 64 50 89" /></g>
    <g className="vfx-fill"><path d="M50 29 65 50 50 71 35 50Z" /></g></>,
  flying: <><g className="vfx-main"><path d="M10 63 C31 17 88 26 83 61 C78 85 35 82 34 57 C34 40 61 35 67 52" />
    <path d="M21 35 Q42 19 65 24 M64 76 Q82 72 91 55" /></g></>,
  poison: <><g className="vfx-main"><circle cx="50" cy="57" r="24" /><circle cx="28" cy="28" r="8" /><circle cx="70" cy="20" r="6" />
    <circle cx="82" cy="62" r="9" /></g><g className="vfx-fill"><circle cx="41" cy="51" r="5" /><circle cx="60" cy="66" r="7" /></g></>,
  ground: <><g className="vfx-main"><path d="M10 78 Q28 55 44 74 Q57 34 75 55 Q82 26 91 23" />
    <path d="M15 61 Q30 40 48 55 M52 40 Q70 17 88 34" /></g>
    <g className="vfx-fill"><path d="M28 28 35 39 20 40Z M70 73 85 65 80 84Z" /></g></>,
  rock: <><g className="vfx-fill"><path d="M17 74 30 45 40 72Z M34 82 52 19 66 82Z M64 70 77 38 88 72Z" /></g>
    <g className="vfx-light"><path d="M49 34 55 50 M74 49 78 60 M25 58 30 65" /></g></>,
  bug: <><g className="vfx-main"><path d="M50 51 Q18 8 13 47 Q18 76 50 51Z M50 51 Q82 8 87 47 Q82 76 50 51Z" />
    <path d="M50 51 50 82 M42 35 34 22 M58 35 66 22" /></g>
    <g className="vfx-fill"><circle cx="50" cy="53" r="8" /></g></>,
  ghost: <><g className="vfx-main"><path d="M54 17 C20 10 12 52 34 74 C48 91 76 79 76 57 C75 38 50 38 48 58" />
    <path d="M22 22 Q27 36 16 43 M81 24 Q69 33 85 44" /></g>
    <g className="vfx-fill"><circle cx="52" cy="58" r="7" /></g></>,
  steel: <><g className="vfx-main"><path d="M15 25 85 25 85 75 15 75Z M15 50 85 50 M50 25 50 75" />
    <path d="M8 50 92 50 M50 8 50 92" /></g>
    <g className="vfx-fill"><path d="M50 37 63 50 50 63 37 50Z" /></g></>,
  fire: <><g className="vfx-fill"><path d="M49 10 Q66 27 59 47 Q73 35 73 20 Q96 65 72 83 Q45 101 27 77 Q15 57 33 31 Q33 50 42 53 Q50 40 49 10Z" /></g>
    <g className="vfx-light"><path d="M52 49 Q64 62 55 82 Q37 78 43 64 Q48 68 52 49Z" /></g></>,
  water: <><g className="vfx-main"><path d="M15 53 C20 22 72 18 82 47 C96 86 31 93 27 62 C25 45 50 39 62 56" />
    <path d="M22 35 Q43 18 67 28 M72 76 Q84 68 84 59" /></g>
    <g className="vfx-fill"><circle cx="52" cy="56" r="6" /></g></>,
  grass: <><g className="vfx-main"><path d="M50 82 Q31 48 19 24 Q45 18 51 50 Q59 21 81 20 Q75 58 50 82Z" />
    <path d="M50 81 49 45 M30 29 48 57 M70 27 53 57" /></g>
    <g className="vfx-fill"><circle cx="50" cy="83" r="5" /></g></>,
  electric: <><g className="vfx-main"><path d="M50 9 34 42 54 42 42 91 75 45 56 49 69 13" />
    <path d="M14 32 27 23 23 42 36 35 M76 67 88 57 84 77 95 70" /></g>
    <g className="vfx-light"><circle cx="51" cy="51" r="30" strokeDasharray="7 10" /></g></>,
  psychic: <><g className="vfx-main"><ellipse cx="50" cy="50" rx="39" ry="22" /><ellipse cx="50" cy="50" rx="22" ry="39" />
    <path d="M12 50 Q50 16 88 50 Q50 84 12 50Z" /></g>
    <g className="vfx-fill"><circle cx="50" cy="50" r="9" /></g></>,
  ice: <><g className="vfx-main"><path d="M50 8 50 92 M8 50 92 50 M20 20 80 80 M80 20 20 80" />
    <path d="M50 8 42 21 M50 8 58 21 M92 50 79 42 M92 50 79 58 M50 92 42 79 M50 92 58 79 M8 50 21 42 M8 50 21 58" /></g>
    <g className="vfx-fill"><circle cx="50" cy="50" r="8" /></g></>,
  dragon: <><g className="vfx-main"><path d="M16 72 C18 24 72 11 82 41 C90 67 53 81 41 58 C35 45 56 34 67 45" />
    <path d="M21 74 33 63 37 79 M79 31 90 19 84 43" /></g>
    <g className="vfx-fill"><path d="M67 42 81 48 69 57Z" /></g></>,
  dark: <><g className="vfx-fill"><path d="M75 12 C48 23 39 40 42 60 C44 74 58 82 80 84 C46 96 16 77 16 49 C17 22 43 10 75 12Z" /></g>
    <g className="vfx-main"><circle cx="50" cy="50" r="36" strokeDasharray="13 10" /></g></>,
  fairy: <><g className="vfx-main"><path d="M50 8 59 40 91 50 59 59 50 92 41 59 9 50 41 40Z" />
    <circle cx="50" cy="50" r="23" /></g>
    <g className="vfx-fill"><circle cx="21" cy="21" r="4" /><circle cx="79" cy="24" r="4" /><circle cx="77" cy="78" r="4" /><circle cx="22" cy="77" r="4" /></g></>,
};
