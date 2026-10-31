import { createContext, useContext, useEffect, useState } from "react";
import { SiteIcon } from "../navigation/SiteIcon";
import type { ReactNode } from "react";

export type AudioSettings = { sfxVolume: number; musicVolume: number; muted: boolean };
const key = "pokestar:audio-settings";
const oldSfxKey = "pokestar:battle-sfx";
const defaults: AudioSettings = { sfxVolume: 0.55, musicVolume: 0.25, muted: false };
const level = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1 ? value : fallback;

export const readAudioSettings = (storage: Pick<Storage, "getItem">): AudioSettings => {
  try {
    const saved = JSON.parse(storage.getItem(key) || "null");
    if (saved && typeof saved === "object") return {
      sfxVolume: level(saved.sfxVolume, defaults.sfxVolume),
      musicVolume: level(saved.musicVolume, defaults.musicVolume),
      muted: typeof saved.muted === "boolean" ? saved.muted : defaults.muted,
    };
    const old = JSON.parse(storage.getItem(oldSfxKey) || "null");
    return { sfxVolume: level(old?.volume, defaults.sfxVolume), musicVolume: defaults.musicVolume,
      muted: typeof old?.muted === "boolean" ? old.muted : defaults.muted };
  } catch { return defaults; }
};

type AudioSettingsContext = {
  settings: AudioSettings;
  setSettings: (next: Partial<AudioSettings>) => void;
};
const context = createContext<AudioSettingsContext | null>(null);

export const AudioSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setCurrent] = useState(() => readAudioSettings(localStorage));
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(settings)); } catch { /* optional preference */ } }, [settings]);
  const setSettings = (next: Partial<AudioSettings>) => setCurrent((current) => ({ ...current, ...next }));
  return <context.Provider value={{ settings, setSettings }}>{children}</context.Provider>;
};

export const useAudioSettings = () => {
  const value = useContext(context);
  if (!value) throw new Error("AudioSettingsProvider is missing");
  return value;
};

export const SettingsMenu = () => {
  const { settings, setSettings } = useAudioSettings();
  return <details className="settings-menu" onKeyDown={(event) => {
    if (event.key === "Escape") {
      event.currentTarget.open = false;
      event.currentTarget.querySelector("summary")?.focus();
    }
  }}>
    <summary className="icon-button" aria-label="Settings"><SiteIcon name="settings" /></summary>
    <section className="settings-panel" aria-label="Site settings">
      <h2>Settings</h2>
      <h3>Audio</h3>
      <label className="settings-switch"><input type="checkbox" checked={settings.muted}
        onChange={(event) => setSettings({ muted: event.target.checked })} />Mute all audio</label>
      <label className="settings-level">Music <input aria-label="Music volume" type="range" min="0" max="1" step="0.05"
        value={settings.musicVolume} onChange={(event) => setSettings({ musicVolume: Number(event.target.value) })} />
        <span>{Math.round(settings.musicVolume * 100)}%</span></label>
      <label className="settings-level">Sound effects <input aria-label="Sound effects volume" type="range" min="0" max="1" step="0.05"
        value={settings.sfxVolume} onChange={(event) => setSettings({ sfxVolume: Number(event.target.value) })} />
        <span>{Math.round(settings.sfxVolume * 100)}%</span></label>
    </section>
  </details>;
};
