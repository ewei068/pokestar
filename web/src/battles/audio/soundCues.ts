import type { PlaybackFrame } from "../playback";
import type { BattleCatalog, BattleEvent } from "../types";
import { moveMotion } from "../motion";
import { effectDirection } from "../results/effectDirection";
import { soundConfig } from "./soundConfig";
import type { ResultSoundKey, SoundClip, SoundKey } from "./soundConfig";

export type FrameSound = { key: SoundKey; clip: SoundClip; delayMs: number; maxSeconds: number };

const resultKey = (event: BattleEvent, catalog: BattleCatalog): ResultSoundKey | null => {
  if (event.type === "hpChanged") return Number(event.amount) > 0 ? "restore"
    : Number(event.amount) < 0 ? "hit" : null;
  if (event.type === "pokemonFainted") return "faint";
  if (event.type === "statusApplied") {
    const names: Record<string, ResultSoundKey> = {
      Burn: "status-burn", Freeze: "status-freeze", Paralysis: "status-paralysis",
      Poison: "status-poison", "Badly Poison": "status-badly-poison", Sleep: "status-sleep",
    };
    return names[event.statusId || ""] || null;
  }
  if (event.type === "effectApplied" && event.effectId)
    return effectDirection(event.effectId, catalog) === "debuff" ? "stat-down" : "stat-up";
  return null;
};

/** A frame can contain several events, but repeated hits of the same kind share one cue. */
export const soundsForFrame = (frame: PlaybackFrame, catalog: BattleCatalog,
  reducedMotion = false): FrameSound[] => {
  if (frame.stage !== "event") return [];
  if (frame.event.type === "turnStarted") {
    const speciesId = frame.view.pokemon[frame.event.pokemonId || ""]?.speciesId;
    const clip = speciesId ? soundConfig.cry(speciesId) : null;
    // A cry may ring past the short turn announcement rather than being cut off.
    return clip ? [{ key: `cry:${speciesId}`, clip, delayMs: 0, maxSeconds: soundConfig.cryMaxSeconds }] : [];
  }
  if (frame.event.type === "moveStarted") {
    const motion = moveMotion(frame.event, catalog);
    if (!motion) return [];
    const type = motion.vfxType || "normal";
    const clip = soundConfig.moves[type][motion.kind];
    const delayMs = reducedMotion ? 0 : clip.delayMs;
    return [{ key: `move:${type}:${motion.kind}`, clip, delayMs,
      maxSeconds: Math.max(0, (frame.durationMs - clip.delayMs) / 1000) }];
  }
  const seen = new Set<ResultSoundKey>();
  const sounds: FrameSound[] = [];
  for (const announcement of frame.announcements) {
    const key = resultKey(announcement.event, catalog);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    sounds.push({ key, clip: soundConfig.results[key], delayMs: 0,
      maxSeconds: frame.durationMs / 1000 });
  }
  return sounds;
};
