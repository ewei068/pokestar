import { useEffect, useState } from "react";
import { getCatalog, getMe, isApiError, listBattles, loginUrl, logout } from "./api";
import { BattlePage } from "./BattlePage";
import type { BattleCatalog, BattleSummary } from "./types";

const battleId = new URLSearchParams(window.location.search).get("battle");

const BattleList = () => {
  const [battles, setBattles] = useState<BattleSummary[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    listBattles().then(setBattles).catch(() => setError(true));
  }, []);
  return (
    <main className="page-shell">
      <div className="list-intro"><p className="eyebrow">Your arena</p><h1>Ongoing battles</h1>
        <p>Continue a battle started in Discord. Actions here and in Discord share the same state.</p></div>
      {error && <p role="alert" className="error">Could not load your battles. Refresh to retry.</p>}
      {!error && battles === null && <p className="quiet">Loading battles…</p>}
      {battles?.length === 0 && <div className="empty-state"><h2>No ongoing battles</h2>
        <p>Start one in Discord, then return here to continue it.</p></div>}
      {battles && battles.length > 0 && (
        <div className="battle-list">
          {[...battles].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
            .map((battle) => (
              <a className="battle-card" key={battle.battleId}
                href={`${import.meta.env.BASE_URL}?battle=${encodeURIComponent(battle.battleId)}`}>
                <span className="battle-card-icon" aria-hidden="true">⚔</span>
                <span><strong>{battle.mode.type || "Battle"}</strong>
                  <small>Turn {battle.turn} · Updated {new Date(battle.updatedAt).toLocaleString()}</small></span>
                <span className="battle-card-arrow" aria-hidden="true">→</span>
              </a>
            ))}
        </div>
      )}
    </main>
  );
};

export const App = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<BattleCatalog | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "login" | "error">("loading");
  useEffect(() => {
    Promise.all([getMe(), getCatalog()]).then(([me, data]) => {
      setUserId(me.discordUserId);
      setCatalog(data);
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
      {state === "ready" && catalog && (battleId
        ? <BattlePage battleId={battleId} catalog={catalog} /> : <BattleList />)}
    </div>
  );
};
