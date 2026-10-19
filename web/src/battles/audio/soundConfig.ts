import type { VfxKind, VfxType } from "../vfx/types";

export type SoundClip = { src: string; offsetSeconds: number; delayMs: number; gain?: number };
const audio = (filename: string) => `${import.meta.env?.BASE_URL || "/"}audio/${filename}`;
const move = (type: VfxType, kind: VfxKind, offsetSeconds: number, delayMs: number): SoundClip => ({
  src: audio(`matrix-${type}-${kind}.mp3`), offsetSeconds, delayMs,
});
const result = (filename: string, gain = 1): SoundClip => ({
  src: audio(filename), offsetSeconds: 0, delayMs: 0, gain,
});

export const soundConfig = {
  moves: {
    normal: { physical: move("normal", "physical", 0.25, 420), special: move("normal", "special", 0.65, 420), status: move("normal", "status", 0.7, 420) },
    fighting: { physical: move("fighting", "physical", 0.5, 420), special: move("fighting", "special", 1.55, 420), status: move("fighting", "status", 0.7, 420) },
    flying: { physical: move("flying", "physical", 0.9, 420), special: move("flying", "special", 0.8, 420), status: move("flying", "status", 0, 500) },
    poison: { physical: move("poison", "physical", 0, 420), special: move("poison", "special", 0.45, 420), status: move("poison", "status", 0.15, 420) },
    ground: { physical: move("ground", "physical", 0.7, 420), special: move("ground", "special", 1.05, 420), status: move("ground", "status", 0.15, 420) },
    rock: { physical: move("rock", "physical", 0.55, 550), special: move("rock", "special", 1.2, 420), status: move("rock", "status", 0.6, 420) },
    bug: { physical: move("bug", "physical", 0, 420), special: move("bug", "special", 1, 420), status: move("bug", "status", 0.5, 420) },
    ghost: { physical: move("ghost", "physical", 0.05, 420), special: move("ghost", "special", 0, 420), status: move("ghost", "status", 1.65, 420) },
    steel: { physical: move("steel", "physical", 1, 420), special: move("steel", "special", 0, 420), status: move("steel", "status", 1, 420) },
    fire: { physical: move("fire", "physical", 0.1, 420), special: move("fire", "special", 0.7, 420), status: move("fire", "status", 0, 420) },
    water: { physical: move("water", "physical", 0, 420), special: move("water", "special", 1.5, 420), status: move("water", "status", 0, 420) },
    grass: { physical: move("grass", "physical", 0.35, 420), special: move("grass", "special", 2.4, 420), status: move("grass", "status", 0, 570) },
    electric: { physical: move("electric", "physical", 0.05, 420), special: move("electric", "special", 0, 420), status: move("electric", "status", 0.55, 420) },
    psychic: { physical: move("psychic", "physical", 1, 420), special: move("psychic", "special", 0.45, 420), status: move("psychic", "status", 0, 420) },
    ice: { physical: move("ice", "physical", 0.2, 420), special: move("ice", "special", 0.25, 420), status: move("ice", "status", 0, 420) },
    dragon: { physical: move("dragon", "physical", 0, 420), special: move("dragon", "special", 1.55, 420), status: move("dragon", "status", 0, 420) },
    dark: { physical: move("dark", "physical", 0.5, 420), special: move("dark", "special", 0.05, 420), status: move("dark", "status", 0.4, 420) },
    fairy: { physical: move("fairy", "physical", 1.55, 420), special: move("fairy", "special", 1.15, 420), status: move("fairy", "status", 0.35, 420) },
  } satisfies Record<VfxType, Record<VfxKind, SoundClip>>,
  select: result("select.wav"),
  results: {
    hit: result("hit.wav"), faint: result("faint.wav"), restore: result("restore.wav"),
    "status-burn": result("status-burn.wav"),
    "status-freeze": result("status-freeze.m4a"),
    "status-paralysis": result("status-paralysis.m4a"),
    "status-poison": result("status-poison.m4a"),
    "status-badly-poison": result("status-badly-poison.wav"),
    "status-sleep": result("status-sleep.m4a"),
    "stat-up": result("stat-up.wav", 1.8), "stat-down": result("stat-down.wav", 1.8),
  },
};

export type ResultSoundKey = keyof typeof soundConfig.results;
export type SoundKey = `move:${VfxType}:${VfxKind}` | ResultSoundKey | "select";
