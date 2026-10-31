import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { readRoute } from "./routes";

export const useSiteRoute = () => {
  const [route, setRoute] = useState(() => readRoute(new URL(window.location.href)));
  useEffect(() => {
    const sync = () => setRoute(readRoute(new URL(window.location.href)));
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);

  const followLink = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (!link || link.target || link.hasAttribute("download") || link.hash === "#site-content") return;
    const url = new URL(link.href);
    if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
    event.preventDefault();
    if (url.href !== window.location.href) window.history.pushState(null, "", url);
    setRoute(readRoute(url));
  };
  return { route, followLink };
};
