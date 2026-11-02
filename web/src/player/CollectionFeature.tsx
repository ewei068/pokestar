import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiError } from "../http";
import { CollectionWorkspace } from "../collection/CollectionWorkspace";
import { usePlayer } from "./PlayerProvider";
import type { CollectionQuery, PlayerOperation } from "./types";

const selectionFromUrl = () => new URL(window.location.href).searchParams.get("owned");
const initialQuery: CollectionQuery = { page: 1, pageSize: 24, search: "", sort: "name", order: "asc" };
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
  const [message, setMessage] = useState<string | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    const sync = () => setSelectedId(selectionFromUrl());
    window.addEventListener("popstate", sync);
    window.addEventListener("hashchange", sync);
    return () => { mounted.current = false; window.removeEventListener("popstate", sync); window.removeEventListener("hashchange", sync); };
  }, []);
  const mutation = useMutation({ mutationKey: [...data.prefix, "interaction"], mutationFn: (operation: PlayerOperation) => data.perform(operation),
    onError: error => { if (mounted.current) setMessage(operationError(error)); } });
  const collection = useQuery({ ...data.collection(query), enabled: !mutation.isPending });
  const party = useQuery({ ...data.party(), enabled: !mutation.isPending });
  const detail = useQuery({ ...data.pokemon(selectedId || ""), enabled: Boolean(selectedId) && !mutation.isPending });
  const perform = (operation: PlayerOperation) => {
    if (mutation.isPending) return;
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
  const missing = detail.error instanceof ApiError && detail.error.status === 404;
  const readError = missing ? "This Pokémon is no longer in your collection." :
    collection.isError || party.isError || (selectedId && detail.isError) ? "Couldn't refresh your Pokémon. Try again when you're connected." : null;
  return <main className="page-shell owned-page"><h1>Your Pokémon</h1>
    <CollectionWorkspace collection={collection.data} party={party.data} pokemon={missing ? undefined : detail.data}
      query={query} onQueryChange={queryChange} selectedId={selectedId} onInspect={inspect}
      onOperation={perform} pending={mutation.isPending} loading={collection.isPending} detailLoading={Boolean(selectedId) && detail.isPending}
      error={message || readError} onRefresh={() => { setMessage(null); void data.refresh(); }} />
  </main>;
};
