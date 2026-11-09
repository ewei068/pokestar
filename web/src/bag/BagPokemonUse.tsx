import { useEffect, useRef, useState } from "react";
import { useIsMutating, useQuery } from "@tanstack/react-query";
import { PartyView } from "../collection/PartyView";
import { CollectionArtwork } from "../collection/CollectionArtwork";
import { TypeBadge } from "../components/TypeBadge";
import { usePlayer } from "../player/PlayerProvider";
import type { BagItem } from "../player/types";
import { NatureEditor } from "../upgrades/NatureEditor";
import { usePokemonBuild } from "../upgrades/usePokemonBuild";

type Props = { item: BagItem; onClose: () => void };
type HeaderProps = { title: string; onBack?: () => void; onClose: () => void; pending: boolean };
function FlowHeader({ title, onBack, onClose, pending }: HeaderProps) {
  return <header className="ui-panel-heading bag-use-heading">
    {onBack && <button className="ui-button ui-button--icon" aria-label="Choose another Pokémon" disabled={pending} onClick={onBack}>‹</button>}
    <h2>{title}</h2><button className="ui-button ui-button--icon" aria-label="Close" disabled={pending} onClick={onClose}>×</button>
  </header>;
}

function PokemonConfirmation({ item, pokemonId, onBack, onClose }: Props & { pokemonId: string; onBack: () => void }) {
  const build = usePokemonBuild(pokemonId);
  const [natureId, setNatureId] = useState("");
  const [saved, setSaved] = useState(false);
  const { context, pending, refreshing, error } = build;
  const nature = item.id === "7";
  const pokemon = context?.pokemon;
  const stock = nature ? context?.mintQuantity || 0 : context?.heldItems.find(entry => entry.id === item.id)?.quantity || 0;
  const same = nature ? natureId === pokemon?.nature.id : item.id === pokemon?.heldItemId;
  const blocked = pending || refreshing || Boolean(error);
  const canConfirm = !saved && !blocked && Boolean(context) && !same && stock >= (nature ? context?.mintCost || 1 : 1)
    && (!nature || Boolean(context?.natures.some(choice => choice.id === natureId)));
  const refresh = <button className="ui-button" disabled={pending || refreshing} onClick={() => { void build.refresh(); }}>Refresh Pokémon &amp; Bag</button>;
  const confirm = async () => {
    if (!canConfirm) return;
    const result = nature ? await build.changeNature(natureId) : await build.changeHeldItem(item.id);
    if (result) { setSaved(true); }
  };
  let title;
  if (saved) title = nature ? "Nature changed!" : "Item equipped!";
  else if (nature) title = "Change nature?";
  else title = pokemon?.heldItemId ? "Swap held item?" : "Equip held item?";
  return <>
    <FlowHeader title={title} onBack={saved ? undefined : onBack} onClose={onClose} pending={pending} />
    <div className="bag-use-body" aria-busy={build.loading || pending}>
      {error && <div className="build-notice" role="alert"><p>{error}</p>{refresh}</div>}
      {!pokemon ? <p>{build.loading ? "Loading Pokémon…" : "Couldn't load this Pokémon."}</p> : <>
        <div className="build-identity"><CollectionArtwork src={pokemon.spriteUrl} /><div><h3>{pokemon.name}</h3>
          <p>Lv. {pokemon.level} · {pokemon.speciesName}{pokemon.inParty ? " · In party" : ""}</p>
          <div className="ui-badge-list">{pokemon.types.map(type => <TypeBadge key={type} type={type} />)}</div></div></div>
        {saved ? <p role="status">{nature ? `${pokemon.name}'s nature is now ${pokemon.nature.name}.` : `${pokemon.name} is holding ${pokemon.heldItem?.name || item.name}.`}</p>
          : nature ? <NatureEditor context={context!} natureId={natureId} onNatureChange={setNatureId} disabled={blocked} />
          : <><div className="bag-held-comparison"><div><small>Holding</small><h3>{pokemon.heldItem?.name || "None"}</h3></div>
            <span aria-hidden="true">→</span><div><small>After</small><h3>{item.name}</h3></div></div><p>{item.description}</p></>}
        {!saved && same && <p>{nature ? "This is already the current nature." : "This Pokémon is already holding this item."}</p>}
        {!saved && stock < (nature ? context!.mintCost : 1) && <p>{nature ? "You need a Mint to change nature." : "You don't own a spare copy of this item."}</p>}
      </>}
    </div>
    <footer className="bag-use-actions">
      {!saved && nature && context && <div className="bag-use-cost"><span>Uses {context.mintCost} Mint</span><span>Owned: {stock}</span></div>}
      {saved ? <button className="ui-button ui-button--primary" onClick={onClose}>Done</button> : <>
        <button className="ui-button" disabled={pending} onClick={onBack}>Back</button>
        <button className="ui-button ui-button--primary" disabled={!canConfirm} onClick={() => { void confirm(); }}>
          {pending ? "Saving…" : nature ? "Change nature" : pokemon?.heldItemId ? "Swap item" : "Equip item"}
        </button></>}
    </footer>
  </>;
}

/** A local Bag flow; Pokemon writes and their lifecycle live in the shared domain hook. */
export function BagPokemonUse({ item, onClose }: Props) {
  const data = usePlayer();
  const party = useQuery({ ...data.party(), staleTime: 0, refetchOnMount: "always", retry: false });
  const pending = useIsMutating({ mutationKey: [...data.prefix, "interaction"] }) > 0;
  const [pokemonId, setPokemonId] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const focus = document.activeElement;
    if (element?.showModal) element.showModal(); else element?.setAttribute("open", "");
    return () => {
      element?.close?.();
      if (focus instanceof HTMLElement && focus.isConnected) {
        const fallback = focus.closest(".bag-detail")?.querySelector<HTMLElement>("h2");
        (focus.matches(":disabled") ? fallback : focus)?.focus();
      }
    };
  }, []);
  return <dialog ref={dialog} className="ui-panel ui-controls bag-use-dialog" aria-label={`Use ${item.name}`}
    onCancel={event => { event.preventDefault(); if (!pending) onClose(); }}
    onClick={event => { if (event.target === event.currentTarget && !pending) {
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    } }}>
    {pokemonId ? <PokemonConfirmation key={pokemonId} item={item} pokemonId={pokemonId} onClose={onClose} onBack={() => setPokemonId(null)} /> : <>
      <FlowHeader title="Choose a Pokémon" onClose={onClose} pending={pending} />
      <div className="bag-use-body">
        <p>{item.id === "7" ? "Change nature with a Mint." : `Give ${item.name} to a Pokémon.`}</p>
        {party.isError ? <div role="alert"><p>Couldn't load your active party.</p><button className="ui-button" onClick={() => { void party.refetch(); }}>Try again</button></div>
          : party.isPending ? <p aria-busy="true">Loading your party…</p> : !party.data?.slots.some(Boolean) ? <p>Your active party is empty. Add a Pokémon from your collection.</p>
          : <div className="collection-workspace bag-use-party"><PartyView party={party.data} selectedId={null} placingId={null} pending={pending || party.isFetching}
            mode={null} readOnly onSlot={index => { const target = party.data.slots[index]; if (target) setPokemonId(target.id); }} /></div>}
      </div>
    </>}
  </dialog>;
}
