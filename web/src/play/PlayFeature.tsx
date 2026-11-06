import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usePlayer } from "../player/PlayerProvider";
import { CollectionArtwork } from "../collection/CollectionArtwork";
import { BattleList } from "../battles/BattleList";
import { ApiError } from "../http";
import { playHref, readPlayRoute, routeHref } from "../navigation/routes";
import type { PlayRoute } from "../navigation/routes";
import { NpcParty } from "./NpcParty";
import { DungeonPlay, TowerPlay } from "./ModeEncounter";
import type { PlayerOperation } from "../player/types";

const navigate = (href: string, replace = false) => {
  window.history[replace ? "replaceState" : "pushState"](null, "", href);
  window.dispatchEvent(new window.PopStateEvent("popstate"));
};
const startError = (error: unknown) => {
  if (error instanceof ApiError && error.status < 500) {
    if (error.status === 401 || error.code === "account_changed") return "Your session changed. Loading your account…";
    if (error.status === 429) return "Too many requests. Wait a moment, then try again.";
    if (error.code === "invalid_party") return "Your party can't battle. Edit your party, then try again.";
    if (["invalid_npc", "invalid_difficulty", "invalid_dungeon", "invalid_stage", "tower_not_current"].includes(error.code)) return "That challenge changed. Choose another from the refreshed list.";
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
  const update = (next: Partial<PlayRoute>, replace = false) => navigate(playHref(new URL(window.location.href), { ...selection, ...next }), replace);
  const mutation = useMutation({ mutationKey: [...data.prefix, "interaction"],
    mutationFn: (operation: Extract<PlayerOperation, { kind: "npc.start" | "dungeon.start" | "tower.start" }>) => data.perform(operation),
    onSuccess: result => { if (mounted.current && result.battleId) navigate(playHref(new URL(window.location.href), { ...selection, battleId: result.battleId })); },
    onError: error => { if (mounted.current) setMessage(startError(error)); },
  });
  const catalog = useQuery({ ...data.npcs(), enabled: !mutation.isPending });
  const dungeons = useQuery({ ...data.dungeons(), enabled: !mutation.isPending });
  const tower = useQuery({ ...data.tower(), enabled: !mutation.isPending });
  const ongoing = useQuery(data.battles());
  const party = useQuery({ ...data.party(), enabled: !mutation.isPending });
  const explicit = selection.view === "trainers" || selection.view === "dungeons" || selection.view === "tower";
  const view = explicit ? selection.view : ongoing.data ? ongoing.data.length ? selection.view || "continue" : "trainers" : selection.view;
  const npc = selection.npcId ? catalog.data?.find(value => value.id === selection.npcId) : catalog.data?.[0];
  const difficulty = npc?.difficulties.find(value => value.id === selection.difficulty) || npc?.difficulties[0];
  const members = party.data?.slots.filter(member => member !== null) || [];
  const partyReady = Boolean(party.data && members.length > 0 && members.length <= party.data.capacity && members.every(member => member.battleEligible));
  const canStart = Boolean(npc && difficulty && partyReady);
  const dungeon = dungeons.data?.find(value => value.id === selection.dungeonId) || dungeons.data?.[0];
  const towerFloors = tower.data?.floors || [];
  const towerFloor = towerFloors.find(value => value.stage === selection.floor) || towerFloors.find(value => value.stage === ((tower.data?.lastTowerStage || 0) >= 20 ? 20 : (tower.data?.lastTowerStage || 0) + 1));
  useEffect(() => {
    if (ongoing.data === undefined) return;
    if (selection.view === null) setSelection(current => ({ ...current, view: ongoing.data.length ? "continue" : "trainers" }));
    else if (selection.view === "continue" && ongoing.data.length === 0) update({ ...selection, view: "trainers" }, true);
  }, [selection, ongoing.data]);
  const inspecting = (view === "trainers" && Boolean(selection.npcId))
    || (view === "dungeons" && Boolean(selection.dungeonId))
    || (view === "tower" && selection.floor != null);
  useEffect(() => {
    if (inspecting && window.matchMedia?.("(max-width:760px)").matches) {
      window.scrollTo(0, 0);
      mobileBack.current?.focus();
    }
  }, [inspecting]);
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
  const tab = (next: "continue" | "trainers" | "dungeons" | "tower") => update({ view: next });
  return <main className={`page-shell npc-page${inspecting ? " npc-is-detail" : ""}`}>
    <h1 className="npc-page-heading">Play</h1>
    <nav className="npc-tabs" aria-label="Play views" onFocus={event => (event.target as HTMLElement).scrollIntoView?.({ block: "nearest", inline: "nearest" })}>
      {Boolean(ongoing.data?.length) && <button type="button" aria-current={view === "continue" ? "page" : undefined} onClick={() => tab("continue")}>Continue <span className="npc-tab-count">{ongoing.data?.length}</span></button>}
      <button type="button" aria-current={view === "trainers" ? "page" : undefined} onClick={() => tab("trainers")}>Trainer battles</button>
      <button type="button" aria-current={view === "dungeons" ? "page" : undefined} onClick={() => tab("dungeons")}>Dungeons</button>
      <button type="button" aria-current={view === "tower" ? "page" : undefined} onClick={() => tab("tower")}>Battle Tower</button>
    </nav>
    {readError && <div className="npc-notice" role="alert">Couldn't refresh your battles, trainers or party. <button type="button" className="ui-button npc-secondary" onClick={() => { void data.refresh(); }}>Refresh</button></div>}
    {view === null && <p className="npc-empty" role="status">{ongoing.isError ? "Choose Trainer battles or refresh to try again." : "Loading battles…"}</p>}
    {view === "continue" && ongoing.data && <BattleList battles={ongoing.data} npcs={catalog.data || []} dungeons={dungeons.data || []} floors={tower.data?.floors || []} />}
    {view === "trainers" && <>
      {selection.npcId && <button ref={mobileBack} type="button" className="npc-mobile-back" onClick={() => update({ view: "trainers", npcId: null, difficulty: null })}>‹ All trainers</button>}
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
                setMessage(null); mutation.mutate({ kind: "npc.start", npcId: npc.id, difficulty: difficulty.id });
              }}>{mutation.isPending ? "Starting battle…" : "Start battle"}<span aria-hidden="true">⚔</span></button></footer>
          </section> : <p className="npc-empty">This trainer is no longer available. Choose another.</p>}
          <aside className="ui-panel npc-panel npc-party-preview"><NpcParty party={party.data} /></aside>
        </div>}
    </>}
    {(view === "dungeons" || view === "tower") && <>
      {view === "dungeons" && selection.dungeonId && <button ref={mobileBack} type="button" className="npc-mobile-back" onClick={() => update({ view: "dungeons", dungeonId: null, difficulty: null })}>‹ All dungeons</button>}
      {view === "tower" && selection.floor != null && <button ref={mobileBack} type="button" className="npc-mobile-back" onClick={() => update({ view: "tower", floor: null })}>‹ All floors</button>}
      {message && <p className="npc-notice" role="alert">{message}</p>}
      {party.data && !partyReady && <p className="npc-notice">{members.length === 0 ? "Add a Pokémon to your party to start." : "Your party has a Pokémon that can't battle."} <a className="ui-button npc-secondary" href={routeHref(new URL(window.location.href), { page: "pokemon", battleId: null })}>Edit party</a></p>}
      {view === "dungeons" && (dungeons.isPending ? <p className="npc-empty" role="status">Loading dungeons…</p> : <DungeonPlay dungeons={dungeons.data || []} selectedId={dungeon?.id || null} difficultyId={selection.difficulty} pending={mutation.isPending} canStart={partyReady}
        onSelect={(dungeonId, difficulty) => { setMessage(null); update({ ...selection, view: "dungeons", dungeonId, difficulty }); }}
        onStart={(dungeonId, difficulty) => { setMessage(null); mutation.mutate({ kind: "dungeon.start", dungeonId, difficulty }); }} />)}
      {view === "tower" && (tower.isPending ? <p className="npc-empty" role="status">Loading Battle Tower…</p> : <TowerPlay floors={tower.data?.floors || []} savedStage={tower.data?.lastTowerStage || 0} selectedStage={towerFloor?.stage || null} battles={ongoing.data || []} pending={mutation.isPending} canStart={partyReady}
        onSelect={stage => { setMessage(null); update({ ...selection, view: "tower", floor: stage }); }}
        onStart={stage => { setMessage(null); mutation.mutate({ kind: "tower.start", stage }); }} />)}
    </>}
    <dialog ref={dialog} className="npc-party-dialog" aria-labelledby="npc-party-title" onClose={closeParty}
      onClick={event => { if (event.target !== dialog.current) return; const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeParty(); }}>
      {partyOpen && <NpcParty party={party.data} titleId="npc-party-title" onClose={closeParty} />}
    </dialog>
  </main>;
}
