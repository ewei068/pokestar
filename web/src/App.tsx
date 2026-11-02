import { useIsMutating, useQuery } from "@tanstack/react-query";
import { BattleFeature } from "./battles/BattleFeature";
import { AudioSettingsProvider } from "./settings/AudioSettings";
import { LoginScreen } from "./auth/LoginScreen";
import { useAuth } from "./auth/useAuth";
import { SiteShell, UnavailablePage } from "./navigation/SiteShell";
import { TrainerAccount, TrainerResources, TrainerStatus } from "./trainer/TrainerAccount";
import { PlayerProvider, usePlayer } from "./player/PlayerProvider";
import { CollectionFeature } from "./player/CollectionFeature";

type Auth = ReturnType<typeof useAuth>;
const ReadyContent = ({ auth }: { auth: Auth }) => {
  const data = usePlayer();
  const writing = useIsMutating({ mutationKey: [...data.prefix, "interaction"] }) > 0;
  const profile = useQuery({ ...data.trainer(), enabled: !writing && auth.pending !== "logout" });
  const trainer = { profile: profile.data ?? null, loading: profile.isPending, userId: data.userId };
  const retry = () => { void profile.refetch(); };
  const account = <TrainerAccount {...trainer} pending={auth.pending === "logout"} onRetry={retry}
    onSignOut={() => { data.dispose(); void auth.signOut(); }} />;
  return <SiteShell account={account} resources={<TrainerResources {...trainer} />}>{route => {
    if (route.page !== "play" && route.page !== "pokemon") return <UnavailablePage page={route.page} />;
    if (!trainer.profile) return <TrainerStatus loading={trainer.loading} pending={auth.pending === "logout"} onRetry={retry} />;
    return route.page === "pokemon" ? <CollectionFeature /> : <BattleFeature battleId={route.battleId} />;
  }}</SiteShell>;
};

const AppContent = () => {
  const auth = useAuth();
  const { state, pending, retry } = auth;
  if (state.kind === "ready") return <PlayerProvider key={state.userId} userId={state.userId}
    trainer={state.trainer} onAccountChanged={auth.refreshSession}><ReadyContent auth={auth} /></PlayerProvider>;
  return <SiteShell>{route => route.page !== "play" && route.page !== "pokemon" ? <UnavailablePage page={route.page} /> :
    state.kind === "loading" ? <TrainerStatus loading pending={pending === "logout"} onRetry={retry} /> :
      <LoginScreen error={state.error} pending={pending} onRetry={retry} homeHref={import.meta.env?.BASE_URL || "/"} />
  }</SiteShell>;
};

export const App = () => <AudioSettingsProvider><AppContent /></AudioSettingsProvider>;
