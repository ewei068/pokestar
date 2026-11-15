export const mainPages = ["play", "pokemon", "catch", "rewards", "more"] as const;
export type SitePage = typeof mainPages[number] | "bag";
export type SiteRoute = { page: SitePage; battleId: string | null };

export const readRoute = (url: URL): SiteRoute => {
  const hash = url.hash.slice(1);
  const page = [...mainPages, "bag"].includes(hash) ? hash as SitePage : "play";
  return { page, battleId: page === "play" ? url.searchParams.get("battle") || null : null };
};

/** Build from destination state so adding a route can't leak source query keys. */
const siteHref = (current: URL, page: SitePage, params: Record<string, string | null | undefined> = {}) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  return `${current.pathname}${search.size ? `?${search}` : ""}#${page}`;
};

export const routeHref = (current: URL, route: SiteRoute): string =>
  siteHref(current, route.page, { battle: route.page === "play" ? route.battleId : null });

export const pokemonUpgradeTabs = {
  train: "Train",
  build: "Item & nature",
  equipment: "Equipment",
  transformation: "Evolution & forms",
} as const;
export type PokemonUpgradeRoute = { pokemonId: string; feature: keyof typeof pokemonUpgradeTabs };

export const readOwnedPokemon = (url: URL) =>
  readRoute(url).page === "pokemon" ? url.searchParams.get("owned") || null : null;

export const readPokemonUpgrade = (url: URL): PokemonUpgradeRoute | null => {
  const pokemonId = readOwnedPokemon(url);
  const feature = (Object.keys(pokemonUpgradeTabs) as PokemonUpgradeRoute["feature"][])
    .find(tab => tab === url.searchParams.get("upgrade"));
  return pokemonId && feature ? { pokemonId, feature } : null;
};

export const pokemonHref = (current: URL, pokemonId: string | null) =>
  siteHref(current, "pokemon", { owned: pokemonId });

export const pokemonUpgradeHref = (current: URL, pokemonId: string, feature: PokemonUpgradeRoute["feature"] = "train") =>
  siteHref(current, "pokemon", { owned: pokemonId, upgrade: pokemonId ? feature : null });

const playViews = ["continue", "trainers", "dungeons", "tower"] as const;
export type PlayRoute = { view: typeof playViews[number] | null; npcId: string | null; difficulty: string | null; dungeonId: string | null; floor: number | null };

type PlaySelectionParams = { npc?: string; difficulty?: string | null; dungeon?: string; floor?: string };

/** A view keeps only its own open row. Difficulty belongs to that row. */
const ownedPlaySelection = (selection: PlayRoute): PlaySelectionParams => {
  if (selection.view === "trainers" && selection.npcId) return { npc: selection.npcId, difficulty: selection.difficulty };
  if (selection.view === "dungeons" && selection.dungeonId) return { dungeon: selection.dungeonId, difficulty: selection.difficulty };
  if (selection.view === "tower" && selection.floor != null && Number.isSafeInteger(selection.floor) && selection.floor > 0) {
    return { floor: String(selection.floor) };
  }
  return {};
};

export const readPlayRoute = (url: URL): PlayRoute => {
  const requested = readRoute(url).page === "play" ? url.searchParams.get("playView") : null;
  const view = playViews.find(item => item === requested) || null;
  const floor = url.searchParams.get("floor");
  const owned = ownedPlaySelection({
    view, npcId: url.searchParams.get("npc"), difficulty: url.searchParams.get("difficulty"),
    dungeonId: url.searchParams.get("dungeon"), floor: floor && /^\d+$/.test(floor) ? Number(floor) : null,
  });
  return {
    view,
    npcId: owned.npc || null,
    difficulty: owned.difficulty || null,
    dungeonId: owned.dungeon || null,
    floor: owned.floor ? Number(owned.floor) : null,
  };
};

export const playHref = (current: URL, selection: PlayRoute & { battleId?: string }) =>
  siteHref(current, "play", { playView: selection.view, ...ownedPlaySelection(selection), battle: selection.battleId });

export const readBagItem = (url: URL) => readRoute(url).page === "bag" ? url.searchParams.get("item") || null : null;
export const bagHref = (current: URL, item: string | null) => siteHref(current, "bag", { item });

/** Reselecting a page keeps its local selection while closing an upgrade or battle. */
export const navigationHref = (current: URL, page: SitePage): string => {
  if (readRoute(current).page === page) {
    if (page === "play") return playHref(current, readPlayRoute(current));
    if (page === "pokemon") return pokemonHref(current, readOwnedPokemon(current));
    if (page === "bag") return bagHref(current, readBagItem(current));
  }
  return routeHref(current, { page, battleId: null });
};
