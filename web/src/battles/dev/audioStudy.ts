import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaybackFrame } from "../playback";
import type { BattleCatalog } from "../types";
import { effectDirection } from "../results/effectDirection";
import { MOVE_APPROACH_MS, MOVE_TOTAL_MS } from "../vfx/timing";

export type StudyGeneration = 4 | 5;
type MoveKey = "rock-slide" | "hyper-beam" | "tackle" | "recover";
type StatusCue = "status-burn" | "status-freeze" | "status-paralysis" | "status-poison" |
  "status-badly-poison" | "status-sleep";
type StatCue = "stat-up" | "stat-down";
export type StudyCue = `${StudyGeneration}-${MoveKey}` | StatusCue | StatCue |
  "select" | "hit" | "faint" | "restore";
export const isMoveCue = (cue: StudyCue) => /^[45]-/.test(cue);

const moveForStory: Record<string, MoveKey> = {
  "audio-rock-slide": "rock-slide", "audio-hyper-beam": "hyper-beam",
  "audio-tackle": "tackle", "audio-recover": "recover",
};
const moveForId: Record<string, MoveKey> = {
  m157: "rock-slide", m63: "hyper-beam", m33: "tackle", m105: "recover",
};
const statusForCue: Record<string, StatusCue> = {
  Burn: "status-burn", Freeze: "status-freeze", Paralysis: "status-paralysis",
  Poison: "status-poison", "Badly Poison": "status-badly-poison", Sleep: "status-sleep",
};
const resultCueForStory: Record<string, StatusCue | StatCue> = {
  "audio-status-burn": "status-burn", "audio-status-freeze": "status-freeze",
  "audio-status-paralysis": "status-paralysis", "audio-status-poison": "status-poison",
  "audio-status-toxic": "status-badly-poison", "audio-status-sleep": "status-sleep",
  "audio-effect-buff": "stat-up", "audio-effect-neutral": "stat-up",
  "audio-effect-debuff": "stat-down",
};
const durations: Record<`${StudyGeneration}-${MoveKey}`, number> = {
  "4-rock-slide": 2.30, "5-rock-slide": 2.59,
  "4-hyper-beam": 2.98, "5-hyper-beam": 2.53,
  "4-tackle": 0.97, "5-tackle": 1.12,
  "4-recover": 1.41, "5-recover": 3.37,
};

// The Gen 5 excerpts place each recording's measured attack near its VFX contact.
// These are listening-study candidates, not production cue timings.
const gen5Fit: Record<MoveKey, { delayMs: number; excerptStart: number }> = {
  "rock-slide": { delayMs: 550, excerptStart: 0.55 },
  "hyper-beam": { delayMs: MOVE_APPROACH_MS, excerptStart: 0.65 },
  "tackle": { delayMs: MOVE_APPROACH_MS, excerptStart: 0.25 },
  "recover": { delayMs: 500, excerptStart: 0.7 },
};

export const defaultExcerptStart = (id: string, generation: StudyGeneration) => {
  const move = moveForStory[id];
  return generation === 5 && move ? gen5Fit[move].excerptStart : 0;
};

export const maxExcerptStart = (id: string, generation: StudyGeneration) => {
  const move = moveForStory[id];
  return move ? Math.max(0, Math.floor((durations[`${generation}-${move}`] - 0.5) * 10) / 10) : 0;
};

export const cuesForStory = (id: string, generation: StudyGeneration): StudyCue[] => {
  const move = moveForStory[id];
  if (!move) return resultCueForStory[id] ? [resultCueForStory[id]] : [];
  return [`${generation}-${move}`, "select", move === "recover" ? "restore" : "hit",
    ...(move === "tackle" ? ["faint" as const] : [])];
};

export const cueForFrame = (frame: PlaybackFrame, generation: StudyGeneration,
  catalog?: BattleCatalog): StudyCue | null => {
  if (frame.stage !== "event") return null;
  if (frame.event.type === "moveStarted") {
    const move = moveForId[frame.event.moveId || ""];
    return move ? `${generation}-${move}` as StudyCue : null;
  }
  if (frame.event.type === "pokemonFainted") return "faint";
  if (frame.event.type === "hpChanged") return frame.event.amount && frame.event.amount > 0 ? "restore" : "hit";
  if (frame.event.type === "statusApplied") return statusForCue[frame.event.statusId || ""] || null;
  if (frame.event.type === "effectApplied" && frame.event.effectId && catalog)
    return effectDirection(frame.event.effectId, catalog) === "debuff" ? "stat-down" : "stat-up";
  return null;
};

export const timingForFrame = (frame: PlaybackFrame, generation: StudyGeneration,
  reducedMotion: boolean, catalog?: BattleCatalog) => {
  const cue = cueForFrame(frame, generation, catalog);
  if (!cue) return null;
  if (frame.event.type !== "moveStarted") return { cue, delayMs: 0,
    maxSeconds: cue.startsWith("status-") || cue.startsWith("stat-") ? frame.durationMs / 1000 : undefined };
  const move = moveForId[frame.event.moveId || ""];
  const delayMs = reducedMotion ? 0 : generation === 5 && move
    ? gen5Fit[move].delayMs : MOVE_APPROACH_MS;
  return { cue, delayMs, maxSeconds: (MOVE_TOTAL_MS - delayMs) / 1000 };
};

const m4aCues = new Set<StudyCue>(["status-freeze", "status-paralysis", "status-poison", "status-sleep"]);
const urlFor = (cue: StudyCue) => `${import.meta.env.BASE_URL}__audio-study/${cue}.${isMoveCue(cue) ? "mp3" : m4aCues.has(cue) ? "m4a" : "wav"}`;

/** Development-only playback. Files stay outside Git; the story consumes local assets. */
export const useAudioStudy = () => {
  const context = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const buffers = useRef(new Map<StudyCue, AudioBuffer>());
  const active = useRef(new Set<AudioBufferSourceNode>());
  const [volume, setVolume] = useState(0.55);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (master.current) master.current.gain.value = muted ? 0 : volume;
  }, [muted, volume]);
  useEffect(() => () => {
    for (const source of active.current) { try { source.stop(); } catch { /* already ended */ } }
    void context.current?.close();
  }, []);

  const stop = useCallback(() => {
    for (const source of active.current) { try { source.stop(); } catch { /* already ended */ } }
    active.current.clear();
  }, []);

  const prepare = useCallback(async (cues: StudyCue[]) => {
    setLoading(true);
    setError(null);
    try {
      const audio = context.current || new AudioContext();
      context.current = audio;
      if (!master.current) {
        master.current = audio.createGain();
        master.current.gain.value = muted ? 0 : volume;
        master.current.connect(audio.destination);
      }
      await audio.resume();
      await Promise.all(cues.filter((cue) => !buffers.current.has(cue)).map(async (cue) => {
        const response = await fetch(urlFor(cue));
        if (!response.ok) throw new Error(`${cue}: HTTP ${response.status}`);
        buffers.current.set(cue, await audio.decodeAudioData(await response.arrayBuffer()));
      }));
      return true;
    } catch (cause) {
      setError(`Audio files unavailable (${cause instanceof Error ? cause.message : String(cause)}). Run the local study asset setup.`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [muted, volume]);

  const play = useCallback((cue: StudyCue, offsetSeconds = 0, delayMs = 0, maxSeconds?: number) => {
    const audio = context.current, buffer = buffers.current.get(cue), destination = master.current;
    if (!audio || !buffer || !destination) return () => {};
    const availableSeconds = maxSeconds ?? (isMoveCue(cue) ? MOVE_TOTAL_MS / 1000 : buffer.duration);
    const duration = Math.min(buffer.duration - offsetSeconds, availableSeconds);
    if (duration <= 0) return () => {};
    const startsAt = audio.currentTime + delayMs / 1000;
    const source = audio.createBufferSource();
    const gain = audio.createGain();
    source.buffer = buffer;
    source.connect(gain).connect(destination);
    const level = cue === "stat-up" || cue === "stat-down" ? 1.8 : 1;
    gain.gain.setValueAtTime(0, startsAt);
    gain.gain.linearRampToValueAtTime(level, startsAt + Math.min(0.01, duration / 4));
    if (buffer.duration - offsetSeconds > availableSeconds) {
      gain.gain.setValueAtTime(level, startsAt + Math.max(0.01, duration - 0.2));
      gain.gain.linearRampToValueAtTime(0, startsAt + duration);
    }
    source.onended = () => active.current.delete(source);
    active.current.add(source);
    source.start(startsAt, offsetSeconds);
    source.stop(startsAt + duration);
    return () => { try { source.stop(); } catch { /* already ended */ } active.current.delete(source); };
  }, []);

  return { volume, setVolume, muted, setMuted, loading, error, prepare, play, stop };
};
