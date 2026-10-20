import { useCallback, useEffect, useRef, useState } from "react";
import { useAudioSettings } from "../../settings/AudioSettings";
import type { PlaybackFrame } from "../playback";
import type { BattleCatalog } from "../types";
import { SoundPlayer } from "./SoundPlayer";
import { soundConfig } from "./soundConfig";
import { soundsForFrame } from "./soundCues";

export const useBattleAudio = () => {
  const { settings } = useAudioSettings();
  const [error, setError] = useState<string | null>(null);
  const player = useRef<SoundPlayer | null>(null);
  const readyRef = useRef(false);
  const warmedRef = useRef(false);
  const speciesRef = useRef<string[]>([]);
  const warmedCriesRef = useRef(new Set<string>());
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    player.current = new SoundPlayer();
    return () => { player.current?.dispose(); player.current = null; };
  }, []);
  useEffect(() => {
    player.current?.setVolume(settings.muted ? 0 : settings.sfxVolume);
  }, [settings]);
  useEffect(() => {
    const hidden = () => { if (document.visibilityState === "hidden") {
      player.current?.stopAll();
      readyRef.current = false;
    } };
    document.addEventListener("visibilitychange", hidden);
    return () => document.removeEventListener("visibilitychange", hidden);
  }, []);

  const warmCries = useCallback(() => {
    const clips = speciesRef.current.flatMap(speciesId => soundConfig.cry(speciesId) ?? [])
      .filter(clip => !warmedCriesRef.current.has(clip.src));
    clips.forEach(clip => warmedCriesRef.current.add(clip.src));
    if (clips.length) void player.current?.warm(clips);
  }, []);

  const enable = useCallback(async () => {
    if (!player.current) return false;
    try {
      const unlocked = await player.current.unlock();
      if (!unlocked) return false;
      player.current.setVolume(settingsRef.current.muted ? 0 : settingsRef.current.sfxVolume);
      readyRef.current = true;
      setError(null);
      if (!warmedRef.current) {
        warmedRef.current = true;
        const clips = [soundConfig.select, ...Object.values(soundConfig.results),
          ...Object.values(soundConfig.moves).flatMap(row => Object.values(row))];
        void player.current.warm(clips);
      }
      warmCries();
      return true;
    } catch {
      setError("SFX could not start. Tap a battle control to retry.");
      return false;
    }
  }, [warmCries]);

  const setBattleSpecies = useCallback((speciesIds: string[]) => {
    speciesRef.current = speciesIds;
    if (readyRef.current) warmCries();
  }, [warmCries]);

  const playSelect = useCallback(async () => {
    if (settingsRef.current.muted || settingsRef.current.sfxVolume === 0 || !await enable()) return;
    const played = await player.current?.play({ clip: soundConfig.select, delayMs: 0,
      maxSeconds: 1.5 });
    if (played === false) setError("A local sound file is missing. Run the audio setup script.");
  }, [enable]);

  const playFrame = useCallback((frame: PlaybackFrame, catalog: BattleCatalog, reducedMotion: boolean) => {
    if (!readyRef.current || settingsRef.current.muted || settingsRef.current.sfxVolume === 0 || !player.current) return;
    for (const sound of soundsForFrame(frame, catalog, reducedMotion)) {
      void player.current.play(sound).then(played => {
        if (played === false) setError("A local sound file is missing. Run the audio setup script.");
      });
    }
  }, []);

  const stopAll = useCallback(() => player.current?.stopAll(), []);
  return { error, playSelect, playFrame, stopAll, setBattleSpecies };
};

export type BattleAudio = ReturnType<typeof useBattleAudio>;
