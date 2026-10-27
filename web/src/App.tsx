import { LoginScreen } from "./auth/LoginScreen";
import { useAuth } from "./auth/useAuth";

const AppContent = () => {
  const { state, pending, retry, signOut } = useAuth();

  return (
    <div className="app">
      <header className="site-header"><a href={import.meta.env.BASE_URL} className="brand">
        <span className="brand-mark" aria-hidden="true">✦</span> Pokestar <span>Battles</span></a>
        <div className="site-controls">
        {state.kind === "ready" && <div className="account"><span>Discord {state.userId}</span>
          <button type="button" disabled={!!pending} onClick={() => { void signOut(); }}>
            {pending === "logout" ? "Signing out…" : "Sign out"}</button></div>}</div>
      </header>
      {state.kind === "loading" && <main className="page-shell"><p role="status">Loading Pokestar…</p></main>}
      {state.kind === "login" && <LoginScreen error={state.error} pending={pending} onRetry={retry} homeHref={import.meta.env.BASE_URL} />}
      {state.kind === "ready" && <main className="page-shell"><h1>Signed in</h1><p>Your Discord account is connected. Battle browsing is added in the next layer.</p></main>}
    </div>
  );
};

export const App = AppContent;
