import { useEffect, useState } from "react";
import { listBattles } from "./api";
import { battleCopy } from "./copy";
import type { BattleSummary } from "./types";

export const BattleList = () => {
  const [battles, setBattles] = useState<BattleSummary[] | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    listBattles().then(setBattles).catch(() => setError(true));
  }, []);
  return (
    <main className="page-shell">
      <div className="list-intro"><h1>Ongoing battles</h1>
        <p>{battleCopy.listIntro}</p></div>
      {error && <p role="alert" className="error">Couldn't load your battles. Refresh the page to try again.</p>}
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
