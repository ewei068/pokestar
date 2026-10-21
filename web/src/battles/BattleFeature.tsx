import { useEffect, useState } from "react";
import { getCatalog } from "./api";
import { BattleList } from "./BattleList";
import { BattlePage } from "./BattlePage";
import type { BattleCatalog } from "./types";

const battleId = new URLSearchParams(window.location.search).get("battle");

const BattleDetail = ({ battleId }: { battleId: string }) => {
  const [catalog, setCatalog] = useState<BattleCatalog | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    getCatalog().then(setCatalog).catch(() => setError(true));
  }, []);

  if (error) return <main className="page-shell"><p role="alert" className="error">
    Couldn't load the battle details. Refresh the page to try again.</p></main>;
  if (!catalog) return <main className="page-shell"><p>Loading battles…</p></main>;
  return <BattlePage battleId={battleId} catalog={catalog} />;
};

export const BattleFeature = () => battleId ? <BattleDetail battleId={battleId} /> : <BattleList />;
