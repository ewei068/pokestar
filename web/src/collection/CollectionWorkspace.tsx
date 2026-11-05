import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Chevron } from "../components/Chevron";
import type { CollectionPage, CollectionQuery, Party, PlayerOperation, PokemonDetail } from "../player/types";
import { PartyView, partyTargets } from "./PartyView";
import { CollectionArtwork } from "./CollectionArtwork";
import { PokemonInspection } from "./PokemonInspection";

export type CollectionWorkspaceProps = {
  collection: CollectionPage | undefined; party: Party | undefined; pokemon: PokemonDetail | undefined;
  query: CollectionQuery; onQueryChange: (query: CollectionQuery, explicit: boolean) => void;
  selectedId: string | null; onInspect: (id: string) => void; onOperation: (operation: PlayerOperation) => void;
  pending: boolean; loading: boolean; detailLoading?: boolean; detailUnavailable?: boolean; error: string | null; onRefresh: () => void;
};
const types = ["Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"];

export function CollectionWorkspace(props: CollectionWorkspaceProps) {
  const { collection, party, pokemon, query, onQueryChange, selectedId, onInspect, onOperation, pending, loading, error, onRefresh } = props;
  const [sheet, setSheet] = useState<"party" | "inspect" | null>(selectedId ? "inspect" : null);
  const [placingId, setPlacingId] = useState<string | null>(null);
  const [mode, setMode] = useState<"move" | "remove" | null>(null);
  const [manage, setManage] = useState(false);
  const [filters, setFilters] = useState(false);
  const [search, setSearch] = useState(query.search);
  const [label, setLabel] = useState("name");
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const dockRef = useRef<HTMLElement>(null);
  const [panelHeight, setPanelHeight] = useState<number>();
  useEffect(() => {
    const resize = () => {
      if (!panelRef.current) return;
      const dock = dockRef.current;
      const bottom = dock && window.getComputedStyle(dock).display !== "none"
        ? dock.getBoundingClientRect().top - 8 : window.innerHeight - 24;
      const top = panelRef.current.getBoundingClientRect().top + window.scrollY;
      setPanelHeight(Math.max(260, Math.min(820, bottom - top)));
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [error]);
  const callbacks = useRef(props); callbacks.current = props;
  const suppressClick = useRef(false);
  const previousSelection = useRef(selectedId);
  useEffect(() => {
    if (previousSelection.current !== selectedId) {
      previousSelection.current = selectedId;
      setSheet(selectedId ? "inspect" : null);
    }
  }, [selectedId]);
  const pointer = useRef<{ id: string; origin: string; startX: number; startY: number; active: boolean } | null>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest(".collection-filters, .collection-filter-toggle")) setFilters(false);
      if (!target.closest(".collection-manage, .collection-manage-toggle")) setManage(false);
      const panel = workspaceRef.current?.querySelector(`.collection-${sheet}-panel`);
      if (panel && window.getComputedStyle(panel).position === "fixed" && !panel.contains(target) &&
          !target.closest(".collection-dock, [data-pokemon]") && !pointer.current?.active) setSheet(null);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [sheet]);
  useEffect(() => { setSearch(query.search); }, [query.search]);
  useEffect(() => {
    if (search === query.search || pending) return;
    const timer = window.setTimeout(() => {
      const current = callbacks.current;
      current.onQueryChange({ ...current.query, search, page: 1 }, true);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search, query.search, pending]);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || typeof ResizeObserver === "undefined") return;
    const resize = () => {
      const { width, height } = grid.getBoundingClientRect();
      if (!width || !height) return;
      const columns = Math.max(1, Math.floor((width - 20 + 7) / 63));
      const rows = Math.max(1, Math.floor((height - 20 + 7) / (label === "none" ? 67 : 85)));
      const pageSize = columns * Math.min(rows, Math.max(1, Math.floor(100 / columns)));
      const current = callbacks.current;
      if (current.query.pageSize !== pageSize) current.onQueryChange({ ...current.query, page: 1, pageSize }, false);
    };
    const observer = new ResizeObserver(resize); observer.observe(grid); resize();
    return () => observer.disconnect();
  }, [label]);
  const cancel = () => { setPlacingId(null); setMode(null); setManage(false); };
  const inspect = (id: string) => { if (pending || suppressClick.current) return; cancel(); setSheet("inspect"); onInspect(id); };
  const place = (id: string, index: number) => {
    const target = party ? partyTargets(party, id)?.[index] : undefined;
    if (pending || !party || !target || target.kind === "disabled") return;
    onOperation({ kind: "party.place", pokemonId: id, index, expectedOccupant: party.slots[index]?.id || null }); cancel();
  };
  const remove = (index: number) => {
    const member = party?.slots[index];
    if (!pending && member) { onOperation({ kind: "party.remove", index, expectedOccupant: member.id }); cancel(); }
  };
  const slot = (index: number) => {
    if (suppressClick.current) return;
    if (placingId) return place(placingId, index);
    if (mode === "remove") return remove(index);
    const member = party?.slots[index];
    if (member) { if (mode === "move") setPlacingId(member.id); else inspect(member.id); }
  };
  const pointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (pending || event.button !== 0) return;
    if (event.pointerType !== "mouse" && !(event.target as HTMLElement).closest(".collection-drag-handle")) return;
    const id = event.currentTarget.dataset.pokemon;
    if (!id) return;
    pointer.current = { id, origin: event.currentTarget.dataset.origin || "collection", startX: event.clientX, startY: event.clientY, active: false };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };
  const pointerMove = (event: ReactPointerEvent) => {
    const current = pointer.current;
    if (!current) return;
    if (!current.active && Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < 8) return;
    current.active = true; suppressClick.current = true;
    setPlacingId(current.id); setSheet("party"); setDrag({ id: current.id, x: event.clientX, y: event.clientY });
  };
  const pointerEnd = (event: ReactPointerEvent, cancelled = false) => {
    const current = pointer.current; pointer.current = null;
    if (!current?.active) return;
    if (!cancelled) {
      const target = document.elementFromPoint(event.clientX, event.clientY);
      const slotElement = target?.closest<HTMLElement>("[data-slot]");
      if (slotElement) place(current.id, Number(slotElement.dataset.slot));
      else if (current.origin === "party" && target?.closest("[data-collection-drop]")) {
        const index = party?.slots.findIndex(member => member?.id === current.id) ?? -1;
        if (index >= 0) remove(index);
      }
    }
    setDrag(null); cancel(); setTimeout(() => { suppressClick.current = false; }, 0);
  };
  const update = (patch: Partial<CollectionQuery>) => onQueryChange({ ...query, ...patch, page: 1 }, true);
  const count = party?.slots.filter(Boolean).length || 0;
  const selected = props.detailUnavailable ? undefined : pokemon?.id === selectedId ? pokemon : collection?.items.find(member => member.id === selectedId) || party?.slots.find(member => member?.id === selectedId);
  const dragged = drag && (collection?.items.find(member => member.id === drag.id) || party?.slots.find(member => member?.id === drag.id));
  return <div ref={workspaceRef} className={`ui-controls collection-workspace ${pending ? "is-pending" : ""} ${drag ? "is-dragging" : ""}`} onDragStart={event => event.preventDefault()} onKeyDown={event => { if (event.key === "Escape") { cancel(); setFilters(false); setSheet(null); } }} onPointerMove={pointerMove} onPointerUp={event => pointerEnd(event)} onPointerCancel={event => pointerEnd(event, true)}>
    {error && <div className="collection-notice" role="alert">{error}<button onClick={onRefresh} disabled={pending}>Refresh</button></div>}
    {pending && <div className="collection-status" role="status">Working…</div>}
    <section className={`ui-panel collection-panel collection-party-panel ${sheet === "party" ? "is-open" : ""}`} aria-label="Your party">
      <header className="ui-panel-heading"><h2>Your party <small>{count} / {party?.capacity ?? "—"}</small></h2><button className="collection-collapse" aria-label="Collapse party" onClick={() => setSheet(null)}><Chevron /></button></header>
      <div className={`collection-party-tools ${placingId || mode ? "is-placing" : ""}`}>
        {placingId || mode ? <><span role="status">{placingId ? "Choose an available position." : "Choose a Pokémon in your party."}</span><button onClick={cancel}>Cancel</button></> :
          <><span className="collection-front-direction" /><button className="collection-manage-toggle" disabled={pending || !party} aria-expanded={manage} onClick={() => setManage(!manage)}>Manage <Chevron /></button></>}
      </div>
      {manage && <div className="collection-manage"><button onClick={() => { setMode("move"); setManage(false); }}>Move / Swap</button><button onClick={() => { setMode("remove"); setManage(false); }}>Remove from party</button></div>}
      {party ? <PartyView party={party} selectedId={selectedId} placingId={placingId} pending={pending} mode={mode} onSlot={slot} onPointerDown={pointerDown} /> : <p className="collection-state">{loading ? "Loading party…" : "Party unavailable. Refresh to try again."}</p>}
      <p className="collection-party-help">Tap to inspect. Drag to move or swap; drag into your collection to remove.</p>
    </section>
    <section ref={panelRef} style={{ height: panelHeight }} className="ui-panel collection-panel collection-list-panel" aria-label="Pokémon collection" data-collection-drop>
      <header className="ui-panel-heading"><h2>Collection <small>{collection?.total ?? "—"}</small></h2><label><span className="collection-sr-only">Tile labels</span><select value={label} onChange={event => setLabel(event.target.value)}><option value="name">Names</option><option value="cp">Combat power</option><option value="iv">IV perfection</option><option value="none">No labels</option></select></label></header>
      <form className="collection-tools" onSubmit={event => { event.preventDefault(); update({ search }); }}>
        <input aria-label="Search Pokémon" placeholder="Search" value={search} onChange={event => setSearch(event.target.value)} />
        <select aria-label="Sort Pokémon" value={query.sort} onChange={event => update({ sort: event.target.value as CollectionQuery["sort"] })}>{["name", "cp", "iv", "recent", "level"].map(value => <option key={value} value={value}>{({ name: "Name", cp: "CP", iv: "IV %", recent: "Recent", level: "Level" } as Record<string, string>)[value]}</option>)}</select>
        <button type="button" aria-label={query.order === "asc" ? "Sort descending" : "Sort ascending"} onClick={() => update({ order: query.order === "asc" ? "desc" : "asc" })}>{query.order === "asc" ? "↑" : "↓"}</button>
        <button type="button" className="collection-filter-toggle" aria-expanded={filters} onClick={() => setFilters(!filters)}>Filter</button>
      </form>
      {filters && <div className="collection-filters"><label>Rarity<select aria-label="Rarity" value={query.rarity || ""} onChange={event => update({ rarity: event.target.value || undefined })}><option value="">All</option>{["Common", "Rare", "Epic", "Legendary", "Mythical"].map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Type<select value={query.type || ""} onChange={event => update({ type: event.target.value || undefined })}><option value="">All</option>{types.map(value => <option key={value}>{value}</option>)}</select></label>
        <label>Shiny<select value={query.shiny === undefined ? "" : String(query.shiny)} onChange={event => update({ shiny: event.target.value === "" ? undefined : event.target.value === "true" })}><option value="">All</option><option value="true">Shiny</option><option value="false">Not shiny</option></select></label>
        <label>Party<select value={query.inParty === undefined ? "" : String(query.inParty)} onChange={event => update({ inParty: event.target.value === "" ? undefined : event.target.value === "true" })}><option value="">All</option><option value="true">In party</option><option value="false">In collection</option></select></label>
        <label>Minimum IV<select value={query.minIv ?? 0} onChange={event => update({ minIv: Number(event.target.value) || undefined })}>{[0, 50, 75, 90, 100].map(value => <option key={value} value={value}>{value}%</option>)}</select></label>
        <button onClick={() => { update({ rarity: undefined, type: undefined, shiny: undefined, inParty: undefined, minIv: undefined }); }}>Clear filters</button><button onClick={() => setFilters(false)}>Done</button></div>}
      {drag && <div className="collection-drop" data-collection-drop>Drop here to remove from party</div>}
      <div className="collection-grid-scroll" ref={gridRef} aria-busy={loading}>
        {loading && !collection ? <p className="collection-state">Loading Pokémon…</p> : !collection ? <p className="collection-state">Collection unavailable. Refresh to try again.</p> : !collection.items.length ? <p className="collection-state">{collection.total ? "No Pokémon on this page." : query.search || query.rarity || query.type || query.shiny !== undefined || query.inParty !== undefined || query.minIv ? "No Pokémon found. Try changing your search or filters." : "Your collection is empty. Catch Pokémon in Discord to get started."}</p> : <div className="collection-grid">{collection.items.map(member => <button key={member.id} className="collection-tile" data-rarity={member.rarity} data-pokemon={member.id} data-origin="collection" aria-pressed={selectedId === member.id} disabled={pending} aria-label={`Inspect ${member.name}, level ${member.level}, CP ${member.combatPower}, IV ${member.ivPercent}%${member.inParty ? ", in party" : ""}`} onClick={() => inspect(member.id)} onPointerDown={pointerDown}>
          <span className="collection-tile-art"><CollectionArtwork src={member.spriteUrl} />{member.inParty && <span className="collection-party-marker">P</span>}{member.shiny && <span className="collection-shiny-marker">✦</span>}<span className="collection-drag-handle" aria-hidden="true">⠿</span></span>
          {label !== "none" && <span className="collection-tile-label">{label === "cp" ? member.combatPower.toLocaleString() : label === "iv" ? `${member.ivPercent}%` : member.name}</span>}</button>)}</div>}
      </div>
      <footer className="collection-pagination"><button aria-label="Previous page" disabled={loading || pending || query.page <= 1} onClick={() => onQueryChange({ ...query, page: query.page - 1 }, true)}>‹</button><span>Page {collection?.page ?? query.page} / {Math.max(1, collection?.totalPages || 1)}</span><button aria-label="Next page" disabled={loading || pending || !collection || query.page >= collection.totalPages} onClick={() => onQueryChange({ ...query, page: query.page + 1 }, true)}>›</button></footer>
    </section>
    <section className={`ui-panel collection-panel collection-inspect-panel ${sheet === "inspect" ? "is-open" : ""}`} aria-label="Pokémon inspection"><header className="ui-panel-heading"><h2>Inspect</h2><button className="collection-collapse" aria-label="Collapse inspection" onClick={() => setSheet(null)}><Chevron /></button></header>
      <div className="collection-inspect-scroll">{selected ? <PokemonInspection pokemon={selected} loading={props.detailLoading} inParty={party ? party.slots.some(member => member?.id === selected.id) : selected.inParty} pending={pending || !party} onAdd={() => { setPlacingId(selected.id); setMode(null); setSheet("party"); }} /> : <p className="collection-state">{selectedId ? props.detailLoading || loading ? "Loading Pokémon…" : "Pokémon unavailable. It may no longer be in your collection. Refresh to check." : "Choose a Pokémon to inspect."}</p>}</div>
    </section>
    <nav ref={dockRef} className="collection-dock" aria-label="Collection panels"><button aria-expanded={sheet === "party"} onClick={() => setSheet(sheet === "party" ? null : "party")}>Party · {count} / {party?.capacity ?? "—"}<Chevron /></button><button aria-expanded={sheet === "inspect"} onClick={() => setSheet(sheet === "inspect" ? null : "inspect")}>{selected?.name || "Inspect"}<Chevron /></button></nav>
    {drag && <div className="collection-drag-ghost" style={{ left: drag.x, top: drag.y }} aria-label={`Dragging ${dragged?.name || "Pokémon"}`}><CollectionArtwork src={dragged?.spriteUrl || null} /></div>}
  </div>;
}
