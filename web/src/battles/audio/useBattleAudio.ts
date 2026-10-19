import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaybackFrame } from "../playback";
import type { BattleCatalog } from "../types";
import { SoundPlayer } from "./SoundPlayer";
import { soundConfig } from "./soundConfig";
import { soundsForFrame } from "./soundCues";

const preferenceKey = "pokestar:battle-sfx";
const initialSettings = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(preferenceKey) || "null");
    return { volume: typeof saved?.volume === "number" && saved.volume >= 0 && saved.volume <= 1
      ? saved.volume : 0.55, muted: typeof saved?.muted === "boolean" ? saved.muted : false };
  } catch { return { volume: 0.55, muted: false }; }
};

export const useBattleAudio = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [error, setError] = useState<string | null>(null);
  const player = useRef<SoundPlayer | null>(null);
  const readyRef = useRef(false);
  const warmedRef = useRef(false);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    player.current = new SoundPlayer();
    return () => { player.current?.dispose(); player.current = null; };
  }, []);
  useEffect(() => {
    try { localStorage.setItem(preferenceKey, JSON.stringify(settings)); } catch { /* optional preference */ }
    player.current?.setVolume(settings.muted ? 0 : settings.volume);
  }, [settings]);
  useEffect(() => {
    const hidden = () => { if (document.visibilityState === "hidden") {
      player.current?.stopAll();
      readyRef.current = false;
    } };
    document.addEventListener("visibilitychange", hidden);
    return () => document.removeEventListener("visibilitychange", hidden);
  }, []);

  const enable = useCallback(async () => {
    if (!soundConfig.enabled || !player.current) return false;
    try {
      const unlocked = await player.current.unlock();
      if (!unlocked) return false;
      player.current.setVolume(settingsRef.current.muted ? 0 : settingsRef.current.volume);
      readyRef.current = true;
      setError(null);
      if (!warmedRef.current) {
        warmedRef.current = true;
        const clips = [soundConfig.select, ...Object.values(soundConfig.results),
          ...Object.values(soundConfig.moves).flatMap(row => Object.values(row))];
        void player.current.warm(clips);
      }
      return true;
    } catch {
      setError("SFX could not start. Tap a battle control to retry.");
      return false;
    }
  }, []);

  const playSelect = useCallback(async () => {
    if (!await enable() || settingsRef.current.muted) return;
    const played = await player.current?.play({ clip: soundConfig.select, delayMs: 0,
      maxSeconds: 1.5 });
    if (played === false) setError("A local sound file is missing. Run the audio setup script.");
  }, [enable]);

  const playFrame = useCallback((frame: PlaybackFrame, catalog: BattleCatalog, reducedMotion: boolean) => {
    if (!soundConfig.enabled || !readyRef.current || settingsRef.current.muted || !player.current) return;
    for (const sound of soundsForFrame(frame, catalog, reducedMotion)) {
      void player.current.play(sound).then(played => {
        if (played === false) setError("A local sound file is missing. Run the audio setup script.");
      });
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    settingsRef.current = { ...settingsRef.current, volume };
    setSettings(settingsRef.current);
  }, []);
  const setMuted = useCallback((muted: boolean) => {
    settingsRef.current = { ...settingsRef.current, muted };
    setSettings(settingsRef.current);
  }, []);
  const stopAll = useCallback(() => player.current?.stopAll(), []);
  return { available: soundConfig.enabled, error, volume: settings.volume, muted: settings.muted,
    setVolume, setMuted, playSelect, playFrame, stopAll };
};

export type BattleAudio = ReturnType<typeof useBattleAudio>;
