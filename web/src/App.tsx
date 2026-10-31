import { BattleFeature } from "./battles/BattleFeature";
import { AudioSettingsProvider } from "./settings/AudioSettings";
import { LoginScreen } from "./auth/LoginScreen";
import { useAuth } from "./auth/useAuth";
import { SiteShell, UnavailablePage } from "./navigation/SiteShell";
import { TrainerAccount, TrainerResources, TrainerStatus } from "./trainer/TrainerAccount";

const AppContent = () => {
  const { state, pending, retry, signOut } = useAuth();
  const trainer = state.kind !== "login" ? {
    profile: state.kind === "ready" ? state.trainer : null,
    loading: state.kind === "loading", userId: state.userId,
  } : null;
  const account = trainer ? <TrainerAccount {...trainer} pending={pending === "logout"}
    onRetry={retry} onSignOut={() => { void signOut(); }} /> : undefined;

  return <SiteShell account={account} resources={trainer ? <TrainerResources {...trainer} /> : undefined}>{route =>
    route.page !== "play" ? <UnavailablePage page={route.page} /> : <>
      {state.kind === "loading" && <TrainerStatus loading pending={pending === "logout"} onRetry={retry} />}
      {state.kind === "login" && <LoginScreen error={state.error} pending={pending} onRetry={retry} homeHref={import.meta.env?.BASE_URL || "/"} />}
      {state.kind === "ready" && (state.trainer ? <BattleFeature battleId={route.battleId} /> : <TrainerStatus loading={false} pending={pending === "logout"} onRetry={retry} />)}
    </>
  }</SiteShell>;
};

export const App = () => <AudioSettingsProvider><AppContent /></AudioSettingsProvider>;
