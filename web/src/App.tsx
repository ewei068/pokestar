import { BattleFeature } from "./battles/BattleFeature";
import { AudioSettingsProvider } from "./settings/AudioSettings";
import { LoginScreen } from "./auth/LoginScreen";
import { useAuth } from "./auth/useAuth";
import { SiteShell, UnavailablePage } from "./navigation/SiteShell";

const AppContent = () => {
  const { state, pending, retry, signOut } = useAuth();
  const account = state.kind === "ready" ? <details className="account-menu">
    <summary aria-label="Trainer account"><span className="account-mark" aria-hidden="true">T</span><span>Trainer</span></summary>
    <div className="account-panel"><p>Discord <span>{state.userId}</span></p>
      <button type="button" disabled={!!pending} onClick={() => { void signOut(); }}>
        {pending === "logout" ? "Signing out…" : "Sign out"}</button></div>
  </details> : undefined;

  return <SiteShell account={account}>{route =>
    route.page !== "play" ? <UnavailablePage page={route.page} /> : <>
      {state.kind === "loading" && <main className="page-shell"><p className="site-panel loading-panel" role="status">Loading Pokestar…</p></main>}
      {state.kind === "login" && <LoginScreen error={state.error} pending={pending} onRetry={retry} homeHref={import.meta.env.BASE_URL} />}
      {state.kind === "ready" && <BattleFeature battleId={route.battleId} />}
    </>
  }</SiteShell>;
};

export const App = () => <AudioSettingsProvider><AppContent /></AudioSettingsProvider>;
