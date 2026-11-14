import { useEffect, useRef, useState } from "react";
import { useIsMutating, useMutation, useQuery } from "@tanstack/react-query";
import { ApiError } from "../http";
import { usePlayer } from "../player/PlayerProvider";
import type { PokemonTransformationChoice, PokemonTransformationResult } from "../player/types";
import { TransformationPanel } from "./TransformationPanel";

const refreshMessage = "Couldn’t confirm the change. Refresh your Pokémon and money before trying again.";
const missingMessage = "This Pokémon is no longer in your collection.";

function noticeFor(error: unknown) {
  if (!(error instanceof ApiError) || error.status >= 500) return { text: refreshMessage, refresh: true };
  if (error.status === 404) return { text: missingMessage, missing: true, refresh: true };
  if (error.status === 401 || error.code === "account_changed") return { text: "Your session changed. Loading your account…", refresh: true };
  if (error.code === "insufficient_form_money" || error.code === "form_money_changed") {
    return { text: "Your money changed. Refresh your balance before trying again.", refresh: true };
  }
  if (error.code === "transformation_changed") return { text: "This Pokémon changed elsewhere. Refresh to see its current choices.", refresh: true };
  if (error.status === 429) return { text: "Too many requests. Wait a moment, then try again.", refresh: false };
  return { text: "Couldn’t change this Pokémon. Try again.", refresh: false };
}

function TransformationSession({ pokemonId }: { pokemonId: string }) {
  const data = usePlayer();
  const active = useRef(false);
  const refreshingNow = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<ReturnType<typeof noticeFor> | null>(null);
  const [result, setResult] = useState<PokemonTransformationResult["change"]>();
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  const isCurrent = () => active.current;
  const interactionKey = [...data.prefix, "interaction"];
  const pending = useIsMutating({ mutationKey: interactionKey }) > 0;
  const query = useQuery({ ...data.transformation(pokemonId, isCurrent),
    refetchOnWindowFocus: false, refetchOnReconnect: false });
  const mutation = useMutation({ mutationKey: interactionKey,
    mutationFn: ({ choice, expectedVersion }: { choice: PokemonTransformationChoice; expectedVersion: string }) =>
      data.confirmTransformation(pokemonId, choice, expectedVersion, isCurrent) });
  const trainer = useQuery({ ...data.trainer(), enabled: !pending });
  const context = query.data;
  const missing = notice?.missing || (query.error instanceof ApiError && query.error.status === 404);
  const error = notice || (query.isError ? { text: missing ? missingMessage : "Couldn’t load this Pokémon.", refresh: true }
    : data.needsBuildRefresh ? { text: refreshMessage, refresh: true } : null);
  const isBusy = () => !isCurrent() || refreshingNow.current || data.client.isMutating({ mutationKey: interactionKey }) > 0;

  const confirm = async (choice: PokemonTransformationChoice, expectedVersion: string) => {
    if (!context || context.expectedVersion !== expectedVersion || error?.refresh || data.needsBuildRefresh || isBusy()) return;
    setNotice(null);
    setResult(undefined);
    try {
      const confirmed = await mutation.mutateAsync({ choice, expectedVersion });
      if (!isCurrent()) return;
      setResult(confirmed.change);
      if (confirmed.warning) setNotice({ text: "Change saved, but some updates couldn’t be confirmed. Refresh Pokémon & money.", refresh: true });
    } catch (cause) {
      if (isCurrent()) setNotice(noticeFor(cause));
    }
  };

  const refresh = async () => {
    if (isBusy()) return;
    refreshingNow.current = true;
    setRefreshing(true);
    try {
      await data.refreshTransformation(pokemonId, isCurrent);
      if (isCurrent()) setNotice(null);
    } catch {
      if (isCurrent()) setNotice({ text: "Couldn’t refresh this Pokémon and your money. Try again.", refresh: true });
    } finally {
      refreshingNow.current = false;
      if (isCurrent()) setRefreshing(false);
    }
  };

  return <TransformationPanel context={missing ? undefined : context} money={trainer.data?.money ?? context?.money ?? 0} loading={query.isPending}
    pending={pending} confirming={mutation.isPending} refreshing={refreshing || query.isFetching} error={error}
    result={result} onConfirm={(choice, version) => { void confirm(choice, version); }} onRefresh={() => { void refresh(); }} />;
}

export function TransformationFeature({ pokemonId }: { pokemonId: string }) {
  const data = usePlayer();
  return <TransformationSession key={`${data.userId}:${pokemonId}`} pokemonId={pokemonId} />;
}
