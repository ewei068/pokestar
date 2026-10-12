import type { ReactNode } from "react";
import type { VfxType } from "./types";

/** Short, directional impacts. Each type has its own strike silhouette. */
export const physicalScenes: Record<VfxType, ReactNode> = {
  normal: <><g className="vfx-light"><path d="M14 28 36 41 M8 55 33 55 M18 82 39 65 M83 18 65 38 M92 51 68 52 M81 82 64 65" /></g>
    <g className="vfx-main"><path d="M28 14 43 39 M64 11 57 35 M87 69 66 59 M39 89 47 68" /></g></>,
  fighting: <><g className="vfx-dark"><path d="M12 70 41 43 28 23 M88 26 60 53 72 78" /></g>
    <g className="vfx-main"><path d="M20 30 48 58 80 20 M21 77 54 42 82 72" /></g>
    <g className="vfx-light"><path d="M42 39 50 28 58 39 M40 64 50 76 60 63" /></g></>,
  flying: <><g className="vfx-main"><path d="M6 64 Q45 15 92 29 M8 79 Q55 40 96 48 M23 87 Q53 65 83 68" /></g>
    <g className="vfx-light"><path d="M20 48 Q38 28 62 24 M54 76 Q72 60 91 60" /></g></>,
  poison: <><g className="vfx-fill"><path d="M50 16 Q64 35 61 51 Q56 65 44 59 Q34 53 39 41Z" />
    <circle cx="23" cy="67" r="7" /><circle cx="78" cy="70" r="5" /></g>
    <g className="vfx-dark"><path d="M16 40 32 48 M85 37 67 47 M43 76 36 88 M62 75 69 88" /></g></>,
  ground: <><g className="vfx-dark"><path d="M10 57 32 48 40 62 53 37 64 55 91 43 M31 84 43 66 51 76 69 59 82 72" /></g>
    <g className="vfx-main"><path d="M15 30 29 37 M74 24 89 31 M14 80 24 76 M82 86 93 81" /></g></>,
  rock: <><g className="vfx-fill"><path d="M15 66 30 35 43 54 35 82Z M47 47 62 13 81 47 67 67Z M66 80 82 54 93 70 81 90Z" /></g>
    <g className="vfx-dark"><path d="M29 38 34 68 M61 20 66 49 M81 59 80 81" /></g></>,
  bug: <><g className="vfx-main"><path d="M14 21 Q19 62 48 61 M86 21 Q81 62 52 61 M21 76 42 58 M79 76 58 58" /></g>
    <g className="vfx-dark"><path d="M41 26 50 48 59 26 M44 74 50 85 56 74" /></g></>,
  ghost: <><g className="vfx-main"><path d="M25 86 Q11 48 38 32 Q46 15 58 25 Q84 23 78 48 Q64 40 65 67 Q46 51 43 80Z" /></g>
    <g className="vfx-light"><path d="M24 42 Q31 20 42 19 M78 72 Q89 59 86 44" /></g></>,
  steel: <><g className="vfx-fill"><path d="M50 7 59 37 92 50 59 59 50 92 40 59 8 50 40 39Z" /></g>
    <g className="vfx-light"><path d="M50 12 50 82 M13 50 87 50" /></g>
    <g className="vfx-dark"><path d="M21 21 32 32 M78 20 67 32 M20 79 32 67 M78 78 67 67" /></g></>,
  fire: <><g className="vfx-main"><path d="M16 77 Q29 53 40 35 M28 85 Q46 56 54 21 M55 82 Q70 55 79 30" /></g>
    <g className="vfx-fill"><path d="M39 35 44 13 54 28 51 43Z M74 33 80 15 89 29 83 46Z" /></g>
    <g className="vfx-light"><path d="M22 58 39 54 M57 66 76 62" /></g></>,
  water: <><g className="vfx-main"><path d="M16 64 Q43 90 76 58 M17 47 Q46 70 88 39 M29 29 Q45 42 60 24" /></g>
    <g className="vfx-fill"><path d="M24 18 Q31 30 28 37 Q19 33 24 18Z M76 19 Q83 30 79 38 Q70 34 76 19Z M85 70 Q92 80 88 87 Q78 83 85 70Z" /></g></>,
  grass: <><g className="vfx-fill"><path d="M13 79 Q25 34 53 27 Q46 64 13 79Z M48 78 Q57 37 88 20 Q88 59 48 78Z" /></g>
    <g className="vfx-light"><path d="M19 73 47 34 M55 71 83 29" /></g></>,
  electric: <><g className="vfx-main"><path d="M34 7 20 48 43 44 31 90 78 36 55 42 67 8" /></g>
    <g className="vfx-light"><path d="M15 22 9 39 22 36 M80 65 91 57 88 75" /></g></>,
  psychic: <><g className="vfx-main"><path d="M14 48 Q40 14 79 30 Q57 78 21 72 Q54 85 89 51" /></g>
    <g className="vfx-light"><circle cx="50" cy="50" r="11" /><path d="M50 20 50 32 M50 68 50 80" /></g></>,
  ice: <><g className="vfx-main"><path d="M50 10 50 90 M13 50 87 50 M23 23 77 77 M77 23 23 77" /></g>
    <g className="vfx-light"><path d="M39 20 50 30 61 20 M39 80 50 70 61 80 M20 39 30 50 20 61 M80 39 70 50 80 61" /></g></>,
  dragon: <><g className="vfx-main"><path d="M18 20 35 71 M46 11 49 76 M75 17 65 73 M28 79 49 85 70 77" /></g>
    <g className="vfx-light"><path d="M23 25 31 32 M50 18 56 29 M72 22 78 32" /></g></>,
  dark: <><g className="vfx-fill"><path d="M75 12 Q33 24 31 55 Q31 80 69 89 Q18 89 11 57 Q10 25 75 12Z" /></g>
    <g className="vfx-light"><path d="M59 24 Q39 47 63 75 M75 31 85 25 M77 67 90 73" /></g></>,
  fairy: <><g className="vfx-main"><path d="M49 9 57 41 90 50 57 58 50 91 42 58 11 50 42 41Z" /></g>
    <g className="vfx-light"><path d="M17 18 23 29 17 39 11 29Z M83 17 88 27 83 37 78 27Z M16 65 21 74 16 83 11 74Z M84 65 89 74 84 83 79 74Z" /></g></>,
};
