import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bagHref } from "../navigation/routes";
import { usePlayer } from "../player/PlayerProvider";
import type { BagItem } from "../player/types";

const categories = [
  { id: "all", name: "All" },
  { id: "0", name: "Pokeballs" },
  { id: "1", name: "Materials" },
  { id: "2", name: "Consumables" },
  { id: "3", name: "Held Items" },
];

const navigate = (href: string, replace = false) => {
  window.history[replace ? "replaceState" : "pushState"](null, "", href);
  window.dispatchEvent(new window.PopStateEvent("popstate"));
};

const itemArt = (item: BagItem, detail: boolean, failed: boolean, onError: () => void) => {
  if (!item.icon || failed) return <span className={detail ? "item-detail-fallback" : "item-art-fallback"} aria-hidden="true">◆</span>;
  return <img className={detail ? "item-detail-art" : "item-art"} alt="" src={`${import.meta.env?.BASE_URL || "/"}images/items/${item.icon}`} onError={onError} />;
};

export function BagFeature() {
  const data = usePlayer();
  const bag = useQuery(data.bag());
  const [itemId, setItemId] = useState(() => new URL(window.location.href).searchParams.get("item"));
  const [category, setCategory] = useState("all");
  const [broken, setBroken] = useState<Record<string, boolean>>({});
  const [desktop, setDesktop] = useState(() => window.matchMedia?.("(min-width: 761px)").matches === true);
  useEffect(() => {
    const sync = () => setItemId(new URL(window.location.href).searchParams.get("item"));
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    const media = window.matchMedia?.("(min-width: 761px)");
    const resize = () => setDesktop(media?.matches === true);
    media?.addEventListener("change", resize);
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
      media?.removeEventListener("change", resize);
    };
  }, []);
  const items = bag.data;
  const visible = (items || []).filter(item => category === "all" || item.category === category);
  const addressed = itemId && visible.some(item => item.id === itemId) ? itemId : null;
  const openId = addressed || (desktop && visible[0] ? visible[0].id : null);
  const open = visible.find(item => item.id === openId) || null;
  useEffect(() => {
    if (!items || !itemId || items.some(item => item.id === itemId)) return;
    navigate(bagHref(new URL(window.location.href), null), true);
  }, [items, itemId]);
  const chooseCategory = (next: string) => {
    setCategory(next);
    const stillThere = (items || []).some(item => item.id === itemId && (next === "all" || item.category === next));
    if (itemId && !stillThere) navigate(bagHref(new URL(window.location.href), null), true);
  };
  const pick = (id: string) => navigate(bagHref(new URL(window.location.href), id));
  if (bag.isPending) return <main className="page-shell bag-page"><h1 className="bag-heading">Bag</h1>
    <section className="ui-panel bag-empty" aria-busy="true"><h2>Loading your bag…</h2></section></main>;
  if (bag.isError && !items) return <main className="page-shell bag-page"><h1 className="bag-heading">Bag</h1>
    <section className="ui-panel bag-empty"><h2>Couldn't load your bag.</h2><p>Your items are still in Discord.</p>
      <button type="button" className="bag-secondary" onClick={() => { void bag.refetch(); }}>Try again</button></section></main>;
  if (!items?.length) return <main className="page-shell bag-page"><h1 className="bag-heading">Bag</h1>
    <section className="ui-panel bag-empty"><h2>Your bag is empty.</h2><p>Catch, raid and shop rewards will land here.</p></section></main>;
  const groups: { id: string; name: string; items: BagItem[] }[] = [];
  for (const item of visible) {
    const group = groups.find(entry => entry.id === item.category);
    if (group) group.items.push(item); else groups.push({ id: item.category, name: item.categoryName, items: [item] });
  }
  const phoneDetail = !desktop && Boolean(open);
  return <main className={`page-shell bag-page${phoneDetail ? " bag-is-detail" : ""}`}>
    <h1 className="bag-heading">Bag</h1>
    {bag.isError && <div className="bag-callout" role="alert"><p>Couldn't refresh your bag. These quantities may be out of date.</p>
      <button type="button" className="bag-secondary" onClick={() => { void bag.refetch(); }}>Try again</button></div>}
    <div className="bag-filters" role="toolbar" aria-label="Item categories">
      {categories.map(chip => <button type="button" key={chip.id} aria-pressed={category === chip.id} onClick={() => chooseCategory(chip.id)}>{chip.name}</button>)}
    </div>
    {phoneDetail && <button type="button" className="bag-mobile-back" onClick={() => navigate(bagHref(new URL(window.location.href), null))}>‹ All items</button>}
    <div className="bag-layout">
      <section className="ui-panel bag-panel bag-list" aria-label="Owned items">
        <header className="ui-panel-heading bag-list-head"><h2>Items</h2><small>{items.length} owned</small></header>
        <div className="item-rows">{groups.length ? groups.map(group => <section className="item-group" key={group.id}><h3>{group.name}</h3>
          {group.items.map(item => <button type="button" className="item-row" key={item.id} aria-pressed={item.id === openId} onClick={() => pick(item.id)}>
            {itemArt(item, false, broken[item.id] === true, () => setBroken(current => ({ ...current, [item.id]: true })))}
            <strong>{item.name}</strong><span className="item-qty">{item.quantity.toLocaleString()}</span>
          </button>)}
        </section>) : <div className="bag-empty"><h2>No items in this category.</h2><p>Try another category.</p></div>}</div>
      </section>
      {open && <section className="ui-panel bag-panel bag-detail" aria-label="Selected item"><div className="item-detail">
        <div className="item-detail-head">{itemArt(open, true, broken[open.id] === true, () => setBroken(current => ({ ...current, [open.id]: true })))}
          <div><p className="item-kind">{open.categoryName}</p><h2>{open.name}</h2></div></div>
        <p className="item-owned">Owned <b>{open.quantity.toLocaleString()}</b></p>
        <p className="item-description">{open.description}</p>
      </div></section>}
    </div>
  </main>;
}
