import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAudioSettings } from "../../settings/AudioSettings";
import { chooseMusicTrack, musicUrl, trackVolume } from "./musicCatalog";

/** One track per page load. This player never follows combat frames or poll revisions. */
export const useBattleMusic = (
  battleId: string,
  themeId: string | null | undefined,
  { autoPlay = true }: { autoPlay?: boolean } = {},
) => {
  const { settings } = useAudioSettings();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const track = useMemo(() => themeId === undefined ? null : chooseMusicTrack(themeId), [battleId, themeId]);
  const element = useRef<HTMLAudioElement | null>(null);
  const context = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const startAttempt = useRef(0);
  const volumeRef = useRef(1);
  volumeRef.current = track ? trackVolume(track) : 1;
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const musicLevel = () => settingsRef.current.muted ? 0 : settingsRef.current.musicVolume * volumeRef.current;

  useEffect(() => {
    if (gain.current && context.current)
      gain.current.gain.setValueAtTime(musicLevel(), context.current.currentTime);
  }, [settings, track?.id, track?.volume]);

  const start = useCallback(async () => {
    const audio = element.current;
    if (!audio) return;
    if (!audio.paused && context.current?.state === "running") return;
    const attempt = ++startAttempt.current;
    try {
      if (!context.current) {
        const next = new AudioContext();
        try {
          const source = next.createMediaElementSource(audio);
          const level = next.createGain();
          source.connect(level).connect(next.destination);
          context.current = next;
          gain.current = level;
          next.onstatechange = () => {
            if (element.current === audio) setPlaying(!audio.paused && next.state === "running");
          };
        } catch (cause) {
          void next.close();
          throw cause;
        }
      }
      gain.current!.gain.setValueAtTime(musicLevel(), context.current.currentTime);
      // Both calls must happen before awaiting, while an input event still has user activation.
      // Media playback and Web Audio can be suspended independently on mobile.
      const resume = context.current.state === "running" ? Promise.resolve() : context.current.resume();
      const play = audio.paused ? audio.play() : Promise.resolve();
      await Promise.all([resume, play]);
      if (element.current !== audio || startAttempt.current !== attempt || audio.paused) return;
      setPlaying(context.current?.state === "running");
      setError(null);
    } catch (cause) {
      if (element.current !== audio || startAttempt.current !== attempt) return;
      audio.pause();
      console.warn("Battle music playback was rejected or failed to start:", cause);
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (!track) return;
    setPlaying(false);
    setError(null);
    const audio = new Audio(musicUrl(track));
    audio.loop = true;
    audio.preload = "metadata";
    element.current = audio;
    const onPause = () => setPlaying(false);
    const pauseForHidden = () => { ++startAttempt.current; audio.pause(); };
    const onPlaying = () => {
      if (autoPlay && document.visibilityState === "hidden") pauseForHidden();
      else setPlaying(context.current?.state === "running");
    };
    const onError = () => { setPlaying(false); setError("This music track could not load."); };
    const recover = () => { if (document.visibilityState !== "hidden") void start(); };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") pauseForHidden();
      else recover();
    };
    const inputs = ["pointerdown", "pointerup", "touchend", "keydown"];
    audio.addEventListener("pause", onPause);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("error", onError);
    if (autoPlay) {
      document.addEventListener("visibilitychange", onVisibility);
      window.addEventListener("pageshow", recover);
      window.addEventListener("focus", recover);
      for (const input of inputs) window.addEventListener(input, recover, { capture: true, passive: true });
      recover();
    }
    return () => {
      ++startAttempt.current;
      if (autoPlay) {
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("pageshow", recover);
        window.removeEventListener("focus", recover);
        for (const input of inputs) window.removeEventListener(input, recover, true);
      }
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      if (element.current === audio) element.current = null;
      if (context.current) {
        context.current.onstatechange = null;
        void context.current.close();
      }
      context.current = null;
      gain.current = null;
    };
  }, [autoPlay, battleId, track?.id, start]);

  const toggle = useCallback(() => {
    const audio = element.current;
    if (!audio) return;
    if (!audio.paused && context.current?.state === "running") {
      ++startAttempt.current;
      audio.pause();
      return;
    }
    void start();
  }, [start]);

  return { trackTitle: track?.title || null, playing, error, toggle, showControls: !autoPlay };
};

export type BattleMusic = ReturnType<typeof useBattleMusic>;
