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
  url.hash = route.page;
  return `${url.pathname}${url.search}${url.hash}`;
};
