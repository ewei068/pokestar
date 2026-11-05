import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usePlayer } from "../player/PlayerProvider";
import { CollectionArtwork } from "../collection/CollectionArtwork";
import { BattleList } from "../battles/BattleList";
import { ApiError } from "../http";
import { playHref, readPlayRoute, routeHref } from "../navigation/routes";
import type { PlayRoute } from "../navigation/routes";
import { NpcParty } from "./NpcParty";

const navigate = (href: string, replace = false) => {
  window.history[replace ? "replaceState" : "pushState"](null, "", href);
  window.dispatchEvent(new window.PopStateEvent("popstate"));
};
const startError = (error: unknown) => {
  if (error instanceof ApiError && error.status < 500) {
    if (error.status === 401 || error.code === "account_changed") return "Your session changed. Loading your account…";
    if (error.status === 429) return "Too many requests. Wait a moment, then try again.";
    if (error.code === "invalid_party") return "Your party can't battle. Edit your party, then try again.";
    if (["invalid_npc", "invalid_difficulty"].includes(error.code)) return "This trainer or difficulty is no longer available. Choose another.";
  }
  return "Couldn't confirm the start. Your battle may have started. Check Continue or try again.";
};

export function PlayFeature() {
  const data = usePlayer();
  const [selection, setSelection] = useState(() => readPlayRoute(new URL(window.location.href)));
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [partyOpen, setPartyOpen] = useState(false);
  const mounted = useRef(true);
  const dialog = useRef<HTMLDialogElement>(null);
  const mobileBack = useRef<HTMLButtonElement>(null);
  const trainerRows = useRef<HTMLDivElement>(null);
  const partyTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    mounted.current = true;
    const sync = () => { setSelection(readPlayRoute(new URL(window.location.href))); setPartyOpen(false); };
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => { mounted.current = false; window.removeEventListener("popstate", sync); window.removeEventListener("hashchange", sync); };
  }, []);
  const update = (next: PlayRoute, replace = false) => navigate(playHref(new URL(window.location.href), next), replace);
  const mutation = useMutation({ mutationKey: [...data.prefix, "interaction"],
    mutationFn: ({ npcId, difficulty }: { npcId: string; difficulty: string }) => data.perform({ kind: "npc.start", npcId, difficulty }),
    onSuccess: result => { if (mounted.current && result.battleId) navigate(playHref(new URL(window.location.href), { ...selection, battleId: result.battleId })); },
    onError: error => { if (mounted.current) setMessage(startError(error)); },
  });
  const catalog = useQuery({ ...data.npcs(), enabled: !mutation.isPending });
  const dungeons = useQuery({ ...data.dungeons(), enabled: !mutation.isPending });
  const tower = useQuery({ ...data.tower(), enabled: !mutation.isPending });
  const ongoing = useQuery(data.battles());
  const party = useQuery({ ...data.party(), enabled: !mutation.isPending });
  const view = selection.view === "trainers" ? "trainers" : ongoing.data ? ongoing.data.length ? selection.view || "continue" : "trainers" : selection.view;
  const npc = selection.npcId ? catalog.data?.find(value => value.id === selection.npcId) : catalog.data?.[0];
  const difficulty = npc?.difficulties.find(value => value.id === selection.difficulty) || npc?.difficulties[0];
  const members = party.data?.slots.filter(member => member !== null) || [];
  const canStart = Boolean(npc && difficulty && party.data && members.length > 0 && members.length <= party.data.capacity && members.every(member => member.battleEligible));
  useEffect(() => {
    if (ongoing.data === undefined) return;
    if (selection.view === null) setSelection(current => ({ ...current, view: ongoing.data.length ? "continue" : "trainers" }));
    else if (selection.view === "continue" && ongoing.data.length === 0) update({ ...selection, view: "trainers" }, true);
  }, [selection, ongoing.data]);
  useEffect(() => {
    if (selection.npcId && window.matchMedia?.("(max-width:760px)").matches) {
      window.scrollTo(0, 0);
      mobileBack.current?.focus();
    }
  }, [selection.npcId]);
  useEffect(() => {
    const modal = dialog.current;
    if (partyOpen && modal && !modal.open) modal.showModal();
    if (!partyOpen && modal?.open) modal.close();
    const wide = window.matchMedia?.("(min-width:1191px)");
    const resize = () => { if (wide?.matches) setPartyOpen(false); };
    wide?.addEventListener("change", resize);
    return () => wide?.removeEventListener("change", resize);
  }, [partyOpen]);
  useEffect(() => {
    const rows = trainerRows.current;
    const selected = rows?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (rows && selected && window.matchMedia?.("(min-width:761px)").matches) {
      rows.scrollTop += selected.getBoundingClientRect().top - rows.getBoundingClientRect().top - 8;
    }
  }, [npc?.id, view]);
  const closeParty = () => { setPartyOpen(false); partyTrigger.current?.focus(); };
  const readError = catalog.isError || party.isError || ongoing.isError;
  const tab = (next: "continue" | "trainers") => update({ ...selection, view: next });
  return <main className={`page-shell npc-page${selection.npcId ? " npc-is-detail" : ""}`}>
    <h1 className="npc-page-heading">Play</h1>
    <nav className="npc-tabs" aria-label="Play views" onFocus={event => (event.target as HTMLElement).scrollIntoView?.({ block: "nearest", inline: "nearest" })}>
      {Boolean(ongoing.data?.length) && <button type="button" aria-current={view === "continue" ? "page" : undefined} onClick={() => tab("continue")}>Continue <span className="npc-tab-count">{ongoing.data?.length}</span></button>}
      <button type="button" aria-current={view === "trainers" ? "page" : undefined} onClick={() => tab("trainers")}>Trainer battles</button>
      <button type="button" aria-disabled="true">Dungeons <small>Later</small></button>
      <button type="button" aria-disabled="true">Battle Tower <small>Later</small></button>
    </nav>
    {readError && <div className="npc-notice" role="alert">Couldn't refresh your battles, trainers or party. <button type="button" className="ui-button npc-secondary" onClick={() => { void data.refresh(); }}>Refresh</button></div>}
    {view === null && <p className="npc-empty" role="status">{ongoing.isError ? "Choose Trainer battles or refresh to try again." : "Loading battles…"}</p>}
    {view === "continue" && ongoing.data && <BattleList battles={ongoing.data} npcs={catalog.data || []} dungeons={dungeons.data || []} floors={tower.data?.floors || []} />}
    {view === "trainers" && <>
      {selection.npcId && <button ref={mobileBack} type="button" className="npc-mobile-back" onClick={() => update({ ...selection, npcId: null, difficulty: null })}>‹ All trainers</button>}
      {message && <p className="npc-notice" role="alert">{message}</p>}
      {party.data && (members.length === 0 || members.some(member => !member.battleEligible)) && <p className="npc-notice">
        {members.length === 0 ? "Add a Pokémon to your party to start." : "Your party has a Pokémon that can't battle."} <a className="ui-button npc-secondary" href={routeHref(new URL(window.location.href), { page: "pokemon", battleId: null })}>Edit party</a></p>}
      {catalog.isPending ? <p className="npc-empty" role="status">Loading trainers…</p> : !catalog.data?.length ? <p className="npc-empty">{catalog.isError ? "Couldn't load trainers. Refresh to try again." : "No trainers available."}</p> :
        <div className="npc-encounters">
          <section className="ui-panel npc-panel npc-trainers" aria-label="Trainers"><header className="ui-panel-heading npc-panel-head"><h2>Trainers</h2><small>{catalog.data.length} opponents</small></header>
            <div className="npc-search"><input type="search" aria-label="Search trainers" placeholder="Search trainers" value={search} onChange={event => setSearch(event.target.value)} /></div>
            <div className="npc-trainer-rows" ref={trainerRows}>{catalog.data.filter(value => `${value.name} ${value.displayName}`.toLowerCase().includes(search.toLowerCase())).map(value =>
              <button type="button" className="npc-trainer-row" key={value.id} aria-pressed={value.id === npc?.id} disabled={mutation.isPending}
                onClick={() => { setMessage(null); update({ view: "trainers", npcId: value.id, difficulty: value.difficulties[0].id }); }}>
                <CollectionArtwork src={value.spriteUrl} /><span><strong>{value.displayName}</strong><small>Lv. {value.minLevel}–{value.maxLevel}</small></span><span aria-hidden="true">›</span>
              </button>)}{!catalog.data.some(value => `${value.name} ${value.displayName}`.toLowerCase().includes(search.toLowerCase())) && <p className="npc-empty">No matching trainers.</p>}</div>
          </section>
          {npc && difficulty ? <section className="ui-panel npc-panel npc-detail" aria-label="Selected trainer"><header className="npc-encounter-header"><div className="npc-portrait"><CollectionArtwork src={npc.spriteUrl} /></div><div><h2>{npc.displayName}</h2><p>“{npc.catchphrase}”</p></div></header>
            <div className="npc-encounter-content"><h3>Difficulty</h3><div className="npc-difficulties" aria-label="Difficulty">{npc.difficulties.map(value => <button type="button" key={value.id} data-difficulty={value.id} aria-pressed={value.id === difficulty.id} disabled={mutation.isPending}
              onClick={() => { setMessage(null); update({ view: "trainers", npcId: npc.id, difficulty: value.id }, true); }}>{value.name}</button>)}</div>
              <div className="npc-facts"><span>{difficulty.count} Pokémon</span><span>Levels {difficulty.minLevel}–{difficulty.maxLevel}</span></div>
              <h3>Possible Pokémon</h3><ul className="npc-species" tabIndex={0} aria-label="Possible species, scroll horizontally. Ace is marked with a red border.">{difficulty.species.map(species => <li key={species.id} className={species.ace ? "npc-is-ace" : ""} aria-label={`${species.name}${species.ace ? `, Ace, level ${difficulty.maxLevel}` : ""}`} title={species.name}>
                <CollectionArtwork src={species.spriteUrl} />{species.ace && <span className="npc-ace-tag" aria-hidden="true">Ace</span>}</li>)}</ul>
              <section className="npc-rewards" aria-label="Daily Reward"><header><h3>Daily Reward</h3>{!difficulty.rewards.length ? <small>None</small> : difficulty.dailyClaimed && <small>Already claimed</small>}</header>
                {difficulty.rewards.map((reward, index) => <div className="npc-reward" key={index}>{reward.icon ? <img src={`${import.meta.env?.BASE_URL || "/"}images/items/${reward.icon}`} alt="" /> : <span aria-hidden="true">◆</span>}<span>{reward.quantity}</span><span>{reward.name}</span></div>)}
              </section>
            </div>
            <footer className="npc-start-bar"><button ref={partyTrigger} type="button" className="ui-button npc-secondary npc-party-trigger" aria-haspopup="dialog" aria-expanded={partyOpen} onClick={() => setPartyOpen(true)}>Your party <small>{party.data ? members.length : "—"}/{party.data?.capacity || 6} ↗</small></button>
              <button type="button" className="primary-button" disabled={!canStart || mutation.isPending} aria-busy={mutation.isPending} onClick={() => {
                if (mutation.isPending) return;
                setMessage(null); mutation.mutate({ npcId: npc.id, difficulty: difficulty.id });
              }}>{mutation.isPending ? "Starting battle…" : "Start battle"}<span aria-hidden="true">⚔</span></button></footer>
          </section> : <p className="npc-empty">This trainer is no longer available. Choose another.</p>}
          <aside className="ui-panel npc-panel npc-party-preview"><NpcParty party={party.data} /></aside>
        </div>}
    </>}
    <dialog ref={dialog} className="npc-party-dialog" aria-labelledby="npc-party-title" onClose={closeParty}
      onClick={event => { if (event.target !== dialog.current) return; const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeParty(); }}>
      {partyOpen && <NpcParty party={party.data} titleId="npc-party-title" onClose={closeParty} />}
    </dialog>
  </main>;
}
