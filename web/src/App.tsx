import { useEffect, useState } from "react";
import { BattleFeature } from "./battles/BattleFeature";
import { getMe, isApiError, loginUrl, logout } from "./http";

export const App = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "login" | "error">("loading");
  useEffect(() => {
    getMe().then((me) => {
      setUserId(me.discordUserId);
      setState("ready");
    }).catch((error) => setState(isApiError(error, 401) ? "login" : "error"));
  }, []);

  return (
    <div className="app">
      <header className="site-header"><a href={import.meta.env.BASE_URL} className="brand">
        <span className="brand-mark" aria-hidden="true">✦</span> Pokestar <span>Battles</span></a>
        {state === "ready" && <div className="account"><span>Discord {userId}</span>
          <button type="button" onClick={() => {
            void logout().then(() => window.location.reload());
          }}>Sign out</button></div>}
      </header>
      {state === "loading" && <main className="page-shell"><p>Loading Pokestar…</p></main>}
      {state === "login" && <main className="page-shell login-panel">
        <p className="eyebrow">Welcome to the arena</p><h1>Continue your battle</h1>
        <p>Sign in with Discord to see and play the battles you joined.</p>
        <a className="primary-button" href={loginUrl()}>Sign in with Discord</a>
      </main>}
      {state === "error" && <main className="page-shell"><p role="alert" className="error">
        Could not connect to the Pokestar battle service. Refresh to retry.</p></main>}
      {state === "ready" && <BattleFeature />}
    </div>
  );
};
