import { useEffect, useRef, useState } from "react";
import { useIsMutating, useMutation, useQuery } from "@tanstack/react-query";
import { ApiError } from "../http";
import { usePlayer } from "../player/PlayerProvider";
import type { EquipmentSnapshot, EquipmentSpend, PokemonEquipmentResult } from "../player/types";

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
type Change = { equipmentType: string; expectedEquipment: EquipmentSnapshot }
  & ({ kind: "upgrade" } | { kind: "reroll"; slotId: string });

export function usePokemonEquipment(pokemonId: string) {
  const data = usePlayer();
  const scope = useRef({ data, pokemonId, active: false });
  if (scope.current.data !== data || scope.current.pokemonId !== pokemonId) {
    scope.current.active = false;
    scope.current = { data, pokemonId, active: false };
  }
  const lifetime = scope.current;
  const isCurrent = () => scope.current === lifetime && lifetime.active;
  const [message, setMessage] = useState<{ scope: typeof lifetime; text: string; missing?: boolean } | null>(null);
  const [confirmed, setConfirmed] = useState<{ scope: typeof lifetime; result: PokemonEquipmentResult } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const refreshingRef = useRef(false);
  useEffect(() => {
    lifetime.active = true;
    refreshingRef.current = false;
    setRefreshing(false);
    return () => { lifetime.active = false; };
  }, [lifetime]);
  const query = useQuery({ ...data.equipment(pokemonId, isCurrent), refetchOnWindowFocus: false, refetchOnReconnect: false });
  const interactionKey = [...data.prefix, "interaction"];
  const pending = useIsMutating({ mutationKey: interactionKey }) > 0;
  const mutation = useMutation({ mutationKey: interactionKey, retry: false,
    mutationFn: (change: Change) => change.kind === "upgrade"
      ? data.upgradeEquipment(pokemonId, change.equipmentType, change.expectedEquipment, isCurrent)
      : data.rerollEquipment(pokemonId, change.equipmentType, change.slotId, change.expectedEquipment, isCurrent) });
  const localMessage = message?.scope === lifetime ? message : null;
  const missing = localMessage?.missing || (query.isError && query.error instanceof ApiError && query.error.status === 404);
  const readError = query.isError ? missing ? "This Pokémon is no longer in your collection."
    : "Couldn't load equipment. Refresh Pokémon & Bag when you're connected." : null;
  const error = localMessage?.text || readError || (data.needsBuildRefresh ? refreshMessage : null);
  const context = missing ? undefined : query.data;
  const blocked = () => !isCurrent() || refreshingRef.current || Boolean(error) || data.needsBuildRefresh
    || data.client.isMutating({ mutationKey: interactionKey }) > 0;
  const submit = async (change: Change): Promise<PokemonEquipmentResult | undefined> => {
    if (blocked()) return;
    try {
      const result = await mutation.mutateAsync(change);
      if (!isCurrent()) return;
      setConfirmed({ scope: lifetime, result });
      setMessage(result.warning ? { scope: lifetime,
        text: "Equipment saved, but some updates couldn't be confirmed. Refresh Pokémon & Bag before continuing." } : null);
      return result;
    } catch (cause) {
      if (isCurrent()) setMessage({ scope: lifetime, text: failureMessage(cause),
        missing: cause instanceof ApiError && cause.status === 404 });
      return undefined;
    }
  };
  const afford = (materialId: string, cost: EquipmentSpend) => Boolean(context && context.money >= cost.money
    && (context.materials.find(material => material.id === materialId)?.quantity ?? 0) >= cost.shards);
  return {
    context,
    loading: query.isPending,
    pending,
    refreshing: refreshing || query.isFetching,
    error,
    result: confirmed?.scope === lifetime ? confirmed.result : undefined,
    upgrade: async (equipmentType: string) => {
      const piece = context?.pieces.find(value => value.id === equipmentType);
      const type = context?.catalog.types.find(value => value.id === equipmentType);
      if (!piece?.upgradeCost || !type || !afford(type.materialId, piece.upgradeCost)) return;
      return submit({ kind: "upgrade", equipmentType, expectedEquipment: piece.expectedEquipment });
    },
    reroll: async (equipmentType: string, slotId: string) => {
      const piece = context?.pieces.find(value => value.id === equipmentType);
      const type = context?.catalog.types.find(value => value.id === equipmentType);
      if (!context || !piece || !type?.slots[slotId]?.length || !piece.slots.some(slot => slot.id === slotId)
        || !afford(type.materialId, context.catalog.rerollCost)) return;
      return submit({ kind: "reroll", equipmentType, slotId, expectedEquipment: piece.expectedEquipment });
    },
    refresh: async () => {
      if (!isCurrent() || refreshingRef.current || data.client.isMutating({ mutationKey: interactionKey }) > 0) return;
      refreshingRef.current = true;
      setRefreshing(true);
      try {
        await data.refreshBuild(pokemonId, isCurrent);
        if (isCurrent()) { setMessage(null); setConfirmed(null); }
      } catch {
        if (isCurrent()) setMessage({ scope: lifetime, text: "Couldn't refresh Pokémon & Bag. Try again when you're connected." });
      } finally {
        if (isCurrent()) { refreshingRef.current = false; setRefreshing(false); }
      }
    },
  };
}
