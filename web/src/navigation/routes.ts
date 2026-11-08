export const mainPages = ["play", "pokemon", "catch", "rewards", "more"] as const;
export type SitePage = typeof mainPages[number] | "bag";
export type SiteRoute = { page: SitePage; battleId: string | null };

export const readRoute = (url: URL): SiteRoute => {
  const hash = url.hash.slice(1);
  const page = [...mainPages, "bag"].includes(hash) ? hash as SitePage : "play";
  return { page, battleId: page === "play" ? url.searchParams.get("battle") || null : null };
};

export const routeHref = (current: URL, route: SiteRoute): string => {
  const url = new URL(current);
  if (route.page === "play" && route.battleId) url.searchParams.set("battle", route.battleId);
  else url.searchParams.delete("battle");
  if (route.page !== "pokemon") url.searchParams.delete("owned");
  url.searchParams.delete("upgrade");
  if (route.page !== "bag") url.searchParams.delete("item");
  url.hash = route.page;
  return `${url.pathname}${url.search}${url.hash}`;
};

export type PokemonUpgradeRoute = { pokemonId: string; feature: "train" };

export const readPokemonUpgrade = (url: URL): PokemonUpgradeRoute | null => {
  const pokemonId = url.searchParams.get("owned");
  return readRoute(url).page === "pokemon" && pokemonId && url.searchParams.get("upgrade") === "train"
    ? { pokemonId, feature: "train" } : null;
};

export const pokemonUpgradeHref = (current: URL, pokemonId: string): string => {
  const url = new URL(routeHref(current, { page: "pokemon", battleId: null }), current);
  url.searchParams.set("owned", pokemonId);
  url.searchParams.set("upgrade", "train");
  return `${url.pathname}${url.search}${url.hash}`;
};

const playViews = ["continue", "trainers", "dungeons", "tower"] as const;
export type PlayRoute = { view: typeof playViews[number] | null; npcId: string | null; difficulty: string | null; dungeonId: string | null; floor: number | null };

type PlaySelectionParams = { npc?: string; difficulty?: string | null; dungeon?: string; floor?: string };

/** A view keeps only its own open row. Difficulty belongs to that row, not to the tab. */
const ownedPlaySelection = (selection: PlayRoute): PlaySelectionParams => {
  if (selection.view === "trainers" && selection.npcId) return { npc: selection.npcId, difficulty: selection.difficulty };
  if (selection.view === "dungeons" && selection.dungeonId) return { dungeon: selection.dungeonId, difficulty: selection.difficulty };
  if (selection.view === "tower" && selection.floor != null) return { floor: String(selection.floor) };
  return {};
};

export const readPlayRoute = (url: URL): PlayRoute => {
  const requested = url.searchParams.get("playView");
  const view = playViews.find(item => item === requested) || null;
  const floor = url.searchParams.get("floor");
  const owned = ownedPlaySelection({
    view, npcId: url.searchParams.get("npc"), difficulty: url.searchParams.get("difficulty"),
    dungeonId: url.searchParams.get("dungeon"), floor: floor && /^\d+$/.test(floor) ? Number(floor) : null,
  });
  return {
    view, npcId: owned.npc || null, difficulty: owned.difficulty || null,
    dungeonId: owned.dungeon || null, floor: owned.floor ? Number(owned.floor) : null,
  };
};
export const playHref = (current: URL, selection: PlayRoute & { battleId?: string }): string => {
  const url = new URL(current);
  const owned = ownedPlaySelection(selection);
  for (const [key, value] of [
    ["playView", selection.view], ["npc", owned.npc], ["difficulty", owned.difficulty],
    ["dungeon", owned.dungeon], ["floor", owned.floor],
  ] as const) {
    if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
  }
  return routeHref(url, { page: "play", battleId: selection.battleId || null });
};

/** `item` stays on Bag only. An empty id clears the selection, including the real id "0". */
export const bagHref = (current: URL, item: string | null): string => {
  const url = new URL(current);
  if (item) url.searchParams.set("item", item); else url.searchParams.delete("item");
  return routeHref(url, { page: "bag", battleId: null });
};
