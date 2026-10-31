import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { SettingsMenu } from "../settings/AudioSettings";
import { mainPages, routeHref } from "./routes";
import type { SitePage, SiteRoute } from "./routes";
import { SiteIcon } from "./SiteIcon";
import { useSiteRoute } from "./useSiteRoute";

export const pageLabels: Record<SitePage, string> = {
  play: "Play", pokemon: "Pokémon", catch: "Catch", rewards: "Rewards", more: "More", bag: "Bag",
};

export const SiteShell = ({ children, account }: { children: ReactNode | ((route: SiteRoute) => ReactNode); account?: ReactNode }) => {
  const { route, followLink } = useSiteRoute();
  const content = useRef<HTMLDivElement>(null);
  const previousRoute = useRef(route);
  const currentUrl = new URL(window.location.href);
  useEffect(() => {
    document.title = `${route.battleId ? "Battle" : pageLabels[route.page]} | Pokestar`;
    if (previousRoute.current.page !== route.page || previousRoute.current.battleId !== route.battleId) {
      content.current?.focus();
      window.scrollTo(0, 0);
    }
    previousRoute.current = route;
  }, [route]);
  return <div className="app" onClick={followLink}>
    <a className="skip-link" href="#site-content" onClick={(event) => {
      event.preventDefault();
      content.current?.focus();
    }}>Skip to content</a>
    <header className="site-header">
      <a href={routeHref(currentUrl, { page: "play", battleId: null })} className="brand" aria-label="Pokestar · Play">
        <span className="brand-mark" aria-hidden="true">✦</span>Pokestar</a>
      <div className="site-controls">
        <a className="icon-button bag-link" href={routeHref(currentUrl, { page: "bag", battleId: null })}
          aria-label="Bag" aria-current={route.page === "bag" ? "page" : undefined}><SiteIcon name="bag" /></a>
        {account}
        <SettingsMenu />
      </div>
    </header>
    <div className="site-layout">
      <nav className="system-bar" aria-label="Main navigation">
        {mainPages.map(page => <a key={page} href={routeHref(currentUrl, { page, battleId: null })}
          aria-current={route.page === page ? "page" : undefined}>
          <SiteIcon name={page} /><span>{pageLabels[page]}</span><span className="nav-arrow" aria-hidden="true">›</span>
        </a>)}
      </nav>
      <div className="site-content" id="site-content" ref={content} tabIndex={-1}>{typeof children === "function" ? children(route) : children}</div>
    </div>
  </div>;
};

const availability: Record<Exclude<SitePage, "play">, string> = {
  pokemon: "Your Pokémon collection isn't available on the web yet. Manage your Pokémon in Discord.",
  catch: "Catching Pokémon isn't available on the web yet. Catch Pokémon in Discord.",
  rewards: "Daily rewards, quests, achievements and tutorials aren't available on the web yet. Find them in Discord.",
  more: "More activities will be available here as they come to the web. Keep playing in Discord.",
  bag: "Your Bag isn't available on the web yet. Use your items in Discord.",
};

export const UnavailablePage = ({ page }: { page: Exclude<SitePage, "play"> }) => (
  <main className="page-shell destination-page">
    <h1>{pageLabels[page]}</h1>
    <section className="site-panel availability-panel">
      <SiteIcon name={page} /><h2>Not on the web yet</h2><p>{availability[page]}</p>
      <a className="primary-button" href={routeHref(new URL(window.location.href), { page: "play", battleId: null })}>Back to Play <span aria-hidden="true">→</span></a>
    </section>
  </main>
);
