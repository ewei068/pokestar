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
  url.hash = route.page;
  return `${url.pathname}${url.search}${url.hash}`;
};

const playViews = ["continue", "trainers", "dungeons", "tower"] as const;
export type PlayRoute = { view: typeof playViews[number] | null; npcId: string | null; difficulty: string | null; dungeonId: string | null; floor: number | null };
export const readPlayRoute = (url: URL): PlayRoute => {
  const requested = url.searchParams.get("playView");
  const floor = url.searchParams.get("floor");
  return {
    view: playViews.find(view => view === requested) || null,
    npcId: url.searchParams.get("npc"), difficulty: url.searchParams.get("difficulty"),
    dungeonId: url.searchParams.get("dungeon"),
    floor: floor && /^\d+$/.test(floor) ? Number(floor) : null,
  };
};
export const playHref = (current: URL, selection: PlayRoute & { battleId?: string }): string => {
  const url = new URL(current);
  for (const [key, value] of [
    ["playView", selection.view], ["npc", selection.npcId], ["difficulty", selection.difficulty],
    ["dungeon", selection.dungeonId], ["floor", selection.floor == null ? null : String(selection.floor)],
  ]) {
    if (value) url.searchParams.set(key!, value); else url.searchParams.delete(key!);
  }
  return routeHref(url, { page: "play", battleId: selection.battleId || null });
};
