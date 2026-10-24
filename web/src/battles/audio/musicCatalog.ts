import catalog from "./musicCatalog.json";

export type MusicTrack = { id: string; title: string; file: string; isrc?: string; volume?: number };
const tracks = catalog.tracks as Record<string, Omit<MusicTrack, "id">>;
const themes = catalog.themes as Record<string, string[]>;
const gain = (value: unknown, fallback: number) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : fallback;

export const musicUrl = (track: MusicTrack) =>
  `${import.meta.env?.BASE_URL ?? "/"}music/${track.file}`;

/** Multiplies the Music slider. Omitted tracks use the catalog default, 40% below full slider level. */
export const trackVolume = (track: Pick<MusicTrack, "volume">) =>
  gain(track.volume, gain(catalog.defaultVolume, 0.6));

/** Called once per battle page load; polling never chooses another track. */
export const chooseMusicTrack = (themeId: string | null, random = Math.random): MusicTrack => {
  const pool = themes[themeId || ""] || themes.default;
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)));
  const id = pool[index];
  return { id, ...tracks[id] };
};
