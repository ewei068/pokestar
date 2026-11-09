import { useEffect, useRef, useState } from "react";
import { useIsMutating, useMutation, useQuery } from "@tanstack/react-query";
import { ApiError } from "../http";
import { usePlayer } from "../player/PlayerProvider";
import type { PokemonBuildResult } from "../player/types";

const refreshMessage = "The change may have completed. Refresh Pokémon & Bag before trying again.";
const failureMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 404) return "This Pokémon is no longer in your collection.";
    if (error.status === 401 || error.code === "account_changed") return "Your session changed. Loading your account…";
    if (error.status === 429) return "Too many requests. Wait a moment, then refresh Pokémon & Bag.";
    if (error.status < 500) return "That change couldn't be made. Refresh Pokémon & Bag before choosing again.";
  }
  return refreshMessage;
};

type Change = { kind: "nature"; id: string; expected: string } | { kind: "held"; id: string | null; expected: string | null };

/** Shared account write gate and mounted-target lifetime for both Item & nature and Bag. */
export function usePokemonBuild(pokemonId: string) {
  const data = usePlayer();
  const scope = useRef({ data, pokemonId, active: false });
  if (scope.current.data !== data || scope.current.pokemonId !== pokemonId) {
    scope.current.active = false;
    scope.current = { data, pokemonId, active: false };
  }
  const lifetime = scope.current;
  const isCurrent = () => scope.current === lifetime && lifetime.active;
  const [message, setMessage] = useState<{ scope: typeof lifetime; text: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  useEffect(() => {
    lifetime.active = true;
    refreshingRef.current = false;
    setRefreshing(false);
    return () => { lifetime.active = false; };
  }, [lifetime]);
  const query = useQuery({ ...data.build(pokemonId, isCurrent), refetchOnWindowFocus: false, refetchOnReconnect: false });
  const interactionKey = [...data.prefix, "interaction"];
  const pending = useIsMutating({ mutationKey: interactionKey }) > 0;
  const mutation = useMutation({ mutationKey: interactionKey, retry: false,
    mutationFn: (change: Change) => change.kind === "nature"
      ? data.changeNature(pokemonId, change.id, change.expected, isCurrent)
      : data.changeHeldItem(pokemonId, change.id, change.expected, isCurrent) });
  const localError = message?.scope === lifetime ? message.text : null;
  const readError = query.isError ? query.error instanceof ApiError && query.error.status === 404
    ? "This Pokémon is no longer in your collection."
    : "Couldn't load Pokémon. Refresh Pokémon & Bag when you're connected." : null;
  const error = localError || (data.needsBuildRefresh ? refreshMessage : readError);
  const blocked = () => !isCurrent() || refreshingRef.current || Boolean(error) || data.needsBuildRefresh
    || data.client.isMutating({ mutationKey: interactionKey }) > 0;
  const submit = async (change: Change): Promise<PokemonBuildResult | undefined> => {
    if (blocked()) return;
    try {
      const result = await mutation.mutateAsync(change);
      if (isCurrent()) setMessage(result.warning ? { scope: lifetime,
        text: "The change was saved, but some rewards may be incomplete. Refresh Pokémon & Bag before continuing." } : null);
      return isCurrent() ? result : undefined;
    } catch (cause) {
      if (isCurrent()) setMessage({ scope: lifetime, text: failureMessage(cause) });
      return undefined;
    }
  };
  return {
    context: query.data,
    loading: query.isPending,
    pending,
    refreshing: refreshing || query.isFetching,
    error,
    changeNature: async (natureId: string) => {
      const context = query.data;
      if (!context || natureId === context.pokemon.nature.id || context.mintQuantity < context.mintCost
        || !context.natures.some(nature => nature.id === natureId)) return;
      return submit({ kind: "nature", id: natureId, expected: context.pokemon.nature.id });
    },
    changeHeldItem: async (heldItemId: string | null) => {
      const context = query.data;
      if (!context || heldItemId === context.pokemon.heldItemId
        || (heldItemId !== null && !context.heldItems.some(item => item.id === heldItemId && item.quantity > 0))) return;
      return submit({ kind: "held", id: heldItemId, expected: context.pokemon.heldItemId });
    },
    refresh: async () => {
      if (!isCurrent() || refreshingRef.current || data.client.isMutating({ mutationKey: interactionKey }) > 0) return;
      refreshingRef.current = true;
      setRefreshing(true);
      try {
        await data.refreshBuild(pokemonId, isCurrent);
        if (isCurrent()) setMessage(null);
      } catch {
        if (isCurrent()) setMessage({ scope: lifetime, text: "Couldn't refresh Pokémon & Bag. Try again when you're connected." });
      } finally {
        if (isCurrent()) { refreshingRef.current = false; setRefreshing(false); }
      }
    },
  };
}
