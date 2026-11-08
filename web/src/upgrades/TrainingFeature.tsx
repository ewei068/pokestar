import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiError } from "../http";
import { usePlayer } from "../player/PlayerProvider";
import { TrainingPanel } from "./TrainingPanel";
import { useTrainingLoop } from "./useTrainingLoop";

const TrainingSession = ({ pokemonId }: { pokemonId: string }) => {
  const data = usePlayer();
  const context = useQuery({ ...data.training(pokemonId), refetchOnWindowFocus: false, refetchOnReconnect: false });
  const mutation = useMutation({ mutationKey: [...data.prefix, "interaction"], retry: false,
    mutationFn: ({ locationId, isCurrent }: { locationId: string; isCurrent: () => boolean }) => data.train(pokemonId, locationId, isCurrent) });
  const loop = useTrainingLoop({ context: context.data,
    train: (locationId, isCurrent) => mutation.mutateAsync({ locationId, isCurrent }),
    refresh: isCurrent => data.refreshTraining(pokemonId, isCurrent),
    onStop: () => data.refreshTrainingSummaries() });
  const readError = context.error instanceof ApiError && context.error.status === 404
    ? "This Pokémon is no longer in your collection."
    : context.isError ? "Couldn't load training. Refresh when you're connected." : null;
  return <TrainingPanel context={context.data} locationId={loop.locationId} onLocationChange={loop.selectLocation}
    onToggle={loop.toggle} running={loop.running} pending={loop.pending} totals={loop.totals}
    error={loop.error || readError} onRefresh={() => { void loop.refresh(); }}
    loading={context.isPending} refreshing={loop.refreshing || context.isFetching} />;
};

export const TrainingFeature = ({ pokemonId }: { pokemonId: string }) => {
  const data = usePlayer();
  return <TrainingSession key={`${data.userId}:${pokemonId}`} pokemonId={pokemonId} />;
};
