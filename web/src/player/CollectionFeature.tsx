import { useEffect, useRef, useState } from "react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { ApiError } from "../http";
import { CollectionWorkspace } from "../collection/CollectionWorkspace";
import { usePlayer } from "./PlayerProvider";
import { pokemonUpgradeHref, readPokemonUpgrade, routeHref } from "../navigation/routes";
import { PokemonUpgradeWorkspace } from "../upgrades/PokemonUpgradeWorkspace";
import { EquipmentFeature } from "../upgrades/EquipmentFeature";
import type { PokemonUpgradeRoute } from "../navigation/routes";
import { ItemNatureFeature } from "../upgrades/ItemNatureFeature";
import { TrainingFeature } from "../upgrades/TrainingFeature";
import type { CollectionQuery, PlayerOperation } from "./types";

const selectionFromUrl = () => new URL(window.location.href).searchParams.get("owned");
const initialQuery: CollectionQuery = { page: 1, pageSize: 24, search: "", sort: "recent", order: "asc" };
const operationError = (error: unknown) => {
  if (error instanceof ApiError && error.status < 500) {
    if (error.code === "party_changed") return "Your party changed. Check the refreshed positions and choose again.";
    if (error.status === 429) return "Too many requests. Wait a moment, then try again.";
    if (error.status === 404) return "This Pokémon is no longer in your collection.";
    if (error.code === "account_changed" || error.status === 401) return "Your session changed. Loading your account…";
    return "That change couldn't be made. Check your party and choose again.";
  }
  return "The request may have completed. Check your refreshed collection before trying again.";
};

export const CollectionFeature = () => {
  const data = usePlayer();
  const [query, setQuery] = useState<CollectionQuery>(initialQuery);
  const [selectedId, setSelectedId] = useState<string | null>(selectionFromUrl);
  const [upgrade, setUpgrade] = useState(() => readPokemonUpgrade(new URL(window.location.href)));
  const [message, setMessage] = useState<string | null>(null);
  const collectionView = useRef<HTMLDivElement>(null);
  const returnContext = useRef<{ href: string; focus: HTMLElement | null; scroll: number; panels: number[] } | null>(null);
  const previousUpgrade = useRef(upgrade);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const sync = () => {
      setSelectedId(selectionFromUrl());
      setUpgrade(readPokemonUpgrade(new URL(window.location.href)));
    };
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => { mounted.current = false; window.removeEventListener("popstate", sync); window.removeEventListener("hashchange", sync); };
  }, []);
  useEffect(() => {
    if (upgrade) {
      document.querySelector<HTMLElement>(".pokemon-upgrade-workspace h1")?.focus({ preventScroll: true });
    } else if (previousUpgrade.current && returnContext.current) {
      const context = returnContext.current;
      const timer = window.setTimeout(() => {
        collectionView.current?.querySelectorAll<HTMLElement>(".collection-grid-scroll, .collection-inspect-scroll")
          .forEach((panel, index) => { panel.scrollTop = context.panels[index] || 0; });
        if (context.focus?.isConnected) context.focus.focus({ preventScroll: true });
        window.scrollTo(0, context.scroll);
      }, 0);
      previousUpgrade.current = upgrade;
      return () => window.clearTimeout(timer);
    }
    previousUpgrade.current = upgrade;
  }, [upgrade]);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("upgrade") && !readPokemonUpgrade(url)) {
      url.searchParams.delete("upgrade");
      window.history.replaceState(window.history.state, "", url);
    }
  }, [upgrade]);
  const mutation = useMutation({ mutationKey: [...data.prefix, "interaction"], mutationFn: (operation: PlayerOperation) => data.perform(operation),
    onError: error => { if (mounted.current) setMessage(operationError(error)); } });
  const collection = useQuery({ ...data.collection(query), placeholderData: keepPreviousData, enabled: !upgrade && !mutation.isPending });
  const party = useQuery({ ...data.party(), enabled: !upgrade && !mutation.isPending });
  const detail = useQuery({ ...data.pokemon(selectedId || ""), enabled: !upgrade && Boolean(selectedId) && !mutation.isPending });
  const perform = (operation: PlayerOperation) => {
    if (upgrade || mutation.isPending) return;
    setMessage(null);
    mutation.mutate(operation);
  };
  const fresh = (key: readonly unknown[]) => {
    const state = data.client.getQueryState(key);
    return state?.status === "success" && !state.isInvalidated && Date.now() - state.dataUpdatedAt < 10000;
  };
  const queryChange = (next: CollectionQuery, explicit: boolean) => {
    if (explicit && mutation.isPending) return;
    setQuery(next);
    if (explicit && !fresh(data.collection(next).queryKey)) perform({ kind: "collection", query: next });
  };
  const inspect = (id: string) => {
    if (mutation.isPending) return;
    setSelectedId(id);
    const url = new URL(window.location.href);
    if (url.searchParams.get("owned") !== id) {
      url.searchParams.set("owned", id);
      window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
    }
    if (!fresh(data.pokemon(id).queryKey)) perform({ kind: "inspect", pokemonId: id });
  };
  const train = (id: string) => {
    if (mutation.isPending) return;
    const focus = document.activeElement instanceof HTMLElement && collectionView.current?.contains(document.activeElement)
      ? document.activeElement : collectionView.current?.querySelector<HTMLElement>(".collection-train") || null;
    returnContext.current = { href: `${window.location.pathname}${window.location.search}${window.location.hash}`,
      focus, scroll: window.scrollY,
      panels: [...collectionView.current!.querySelectorAll<HTMLElement>(".collection-grid-scroll, .collection-inspect-scroll")].map(panel => panel.scrollTop) };
    window.history.pushState({ ...window.history.state, pokemonUpgradeFrom: returnContext.current.href }, "",
      pokemonUpgradeHref(new URL(window.location.href), id));
    window.dispatchEvent(new window.PopStateEvent("popstate"));
    window.scrollTo(0, 0);
  };
  const changeUpgrade = (feature: PokemonUpgradeRoute["feature"]) => {
    if (!upgrade || feature === upgrade.feature) return;
    window.history.replaceState(window.history.state, "", pokemonUpgradeHref(new URL(window.location.href), upgrade.pokemonId, feature));
    window.dispatchEvent(new window.PopStateEvent("popstate"));
  };
  const closeUpgrade = () => {
    if (returnContext.current && window.history.state?.pokemonUpgradeFrom === returnContext.current.href) window.history.back();
    else {
      window.history.replaceState(window.history.state, "", routeHref(new URL(window.location.href), { page: "pokemon", battleId: null }));
      window.dispatchEvent(new window.PopStateEvent("popstate"));
    }
  };
  const missing = detail.error instanceof ApiError && detail.error.status === 404;
  const readError = missing ? "This Pokémon is no longer in your collection." :
    collection.isError || party.isError || (selectedId && detail.isError) ? "Couldn't refresh your Pokémon. Try again when you're connected." : null;
  return <main className="page-shell owned-page">
    <div ref={collectionView} hidden={Boolean(upgrade)}><h1>Your Pokémon</h1>
    <CollectionWorkspace collection={collection.data} party={party.data} pokemon={missing ? undefined : detail.data}
      query={query} onQueryChange={queryChange} selectedId={selectedId} onInspect={inspect}
      onTrain={train} active={!upgrade}
      onOperation={perform} pending={mutation.isPending} loading={collection.isPending || collection.isPlaceholderData} detailUnavailable={missing} detailLoading={Boolean(selectedId) && detail.isPending}
      error={message || readError} onRefresh={() => { setMessage(null); void data.refresh(); }} /></div>
    {upgrade && <PokemonUpgradeWorkspace pokemonId={upgrade.pokemonId} title={upgrade.feature === "train" ? "Train" : upgrade.feature === "build" ? "Item & nature" : "Equipment"}
      feature={upgrade.feature} onFeatureChange={changeUpgrade} onBack={closeUpgrade}>
      {upgrade.feature === "train" ? <TrainingFeature pokemonId={upgrade.pokemonId} /> : upgrade.feature === "build" ? <ItemNatureFeature pokemonId={upgrade.pokemonId} /> : <EquipmentFeature pokemonId={upgrade.pokemonId} />}
    </PokemonUpgradeWorkspace>}
  </main>;
};
