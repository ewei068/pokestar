import { useCallback, useEffect, useRef, useState } from "react";
import { getBattle, isApiError, submitAction } from "./api";
import { BattleGrid } from "./BattleGrid";
import { eventText, highlightedPokemonId } from "./eventText";
import { MovePanel } from "./MovePanel";
import type { BattleAction, BattleCatalog, BattleEvent, BattleResponse, BattleView } from "./types";

type QueuedEvent = { event: BattleEvent; view: BattleView; text: string };

export const BattlePage = ({ battleId, catalog }: { battleId: string; catalog: BattleCatalog }) => {
  const [battle, setBattle] = useState<BattleResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null);
  const [inspectedPokemonId, setInspectedPokemonId] = useState<string | null>(null);
  const [eventQueue, setEventQueue] = useState<QueuedEvent[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const revisionRef = useRef<number | null>(null);
  const stateIdRef = useRef<string | null>(null);

  const applyResponse = useCallback((response: BattleResponse) => {
    if (revisionRef.current !== null && response.revision < revisionRef.current) return;
    const previousRevision = revisionRef.current;
    const unseen = response.updates.filter((update) =>
      previousRevision === null || update.revision > previousRevision);
    revisionRef.current = response.revision;
    stateIdRef.current = response.stateId;
    setBattle(response);
    if (previousRevision === null || response.revision > previousRevision) {
      setSelectedMoveId(null);
    }
    if (unseen.length > 0) {
      const queued = unseen.flatMap((update) => update.events.flatMap((event) => {
        const view = update.view || response.view;
        const text = eventText(event, view, catalog);
        return text ? [{ event, view, text }] : [];
      }));
      setEventQueue((current) => [...current, ...queued]);
      setHistory((current) => [...current, ...queued.map((item) => item.text)].slice(-20));
    }
  }, [catalog]);

  const refresh = useCallback(async () => {
    if (document.visibilityState === "hidden") return;
    try {
      const response = await getBattle(battleId, stateIdRef.current ?? undefined);
      if (response) applyResponse(response);
      setError(null);
    } catch (cause) {
      setError(isApiError(cause, 404) ? "This battle is unavailable or has expired."
        : "Could not load the battle. Try again shortly.");
    } finally {
      setLoading(false);
    }
  }, [battleId, applyResponse]);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 3000);
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);

  useEffect(() => {
    if (eventQueue.length === 0) return;
    const timer = window.setTimeout(() => setEventQueue((queue) => queue.slice(1)), 550);
    return () => window.clearTimeout(timer);
  }, [eventQueue]);

  const act = async (action: BattleAction) => {
    if (!battle || busy) return;
    setBusy(true);
    setNotice("Resolving this turn…");
    try {
      const response = await submitAction(battleId, battle.revision, action);
      applyResponse(response);
      setNotice(response.accepted ? null : "The battle changed before your action. Showing the latest state.");
      setError(null);
    } catch (cause) {
      setNotice(null);
      setError(isApiError(cause, 401) ? "Your session expired. Reload to sign in."
        : "Your action was not submitted. Refresh and try again.");
    } finally {
      setBusy(false);
    }
  };

  if (loading && !battle) return <main className="page-shell"><p>Loading battle…</p></main>;
  if (!battle) return (
    <main className="page-shell">
      <a className="back-link" href={import.meta.env.BASE_URL}>← Battles</a>
      <p role="alert">{error || "Battle unavailable."}</p>
      <button type="button" onClick={() => { void refresh(); }}>Retry</button>
    </main>
  );

  const selected = battle.availableActions.moves.find((option) => option.moveId === selectedMoveId);
  const targetIds = selected?.targetPokemonIds || [];
  const playing = eventQueue[0];
  const displayBattle = playing ? { ...battle, view: playing.view } : battle;
  const versionMatches = battle.rulesetVersion === catalog.rulesetVersion;
  const inspected = battle.view.pokemon[
    inspectedPokemonId || battle.view.activePokemonId || ""
  ];

  return (
    <main className="page-shell battle-page">
      <div className="page-toolbar">
        <a className="back-link" href={import.meta.env.BASE_URL}>← Battles</a>
        <span className="revision">Battle {battle.battleId.slice(0, 8)} · Revision {battle.revision}</span>
      </div>
      <div className="battle-header">
        <div><p className="eyebrow">{battle.mode.type || "Battle"}</p><h1>Turn {battle.view.turn}</h1></div>
        <span className={`status-pill ${battle.status}`}>{battle.status}</span>
      </div>
      {battle.status === "completed" && <p className="notice">{battle.view.winner || "A team"} won. This result is read-only.</p>}
      {battle.completionStatus === "processing" && <p className="notice">Battle rewards are being processed.</p>}
      {battle.completionStatus === "failed" && <p className="notice">Reward processing needs review. The battle result is saved.</p>}
      {!versionMatches && <p role="alert" className="error">Battle display data changed. Reload the page before acting.</p>}
      {error && <p role="alert" className="error">{error}</p>}
      {notice && <p role="status" className="notice">{notice}</p>}
      <div className="event-banner" aria-live="polite">{playing?.text || (battle.isMyTurn ? "Choose an action." : "Waiting for the next action…")}</div>
      <BattleGrid battle={displayBattle} catalog={catalog}
        targetIds={busy || playing || !versionMatches ? [] : targetIds}
        highlightedId={highlightedPokemonId(playing?.event)}
        onInspect={setInspectedPokemonId}
        onTarget={(pokemonId) => {
          if (selectedMoveId && targetIds.includes(pokemonId)) {
            void act({ action: "useMove", moveId: selectedMoveId, targetPokemonId: pokemonId });
          }
        }} />
      {inspected && <section className="detail-panel" aria-label="Pokémon details">
        <div><p className="eyebrow">Pokémon details</p><h2>{inspected.name} · Lv. {inspected.level}</h2>
          <p className="quiet">{[inspected.type1, inspected.type2].filter(Boolean).join(" / ")} · {
            inspected.hp}/{inspected.maxHp} HP · {inspected.status?.statusId || "No status"}</p></div>
        <div className="detail-tags">
          {Object.keys(inspected.effectIds).map((id) => <span key={id}>{catalog.effects[id]?.name || id}</span>)}
          {inspected.abilityId && <span>Ability: {catalog.abilities[inspected.abilityId]?.name || inspected.abilityId}</span>}
          {inspected.heldItemId && <span>Item: {catalog.heldItems[inspected.heldItemId]?.name || inspected.heldItemId}</span>}
          {inspected.moveIds && <span>Moves: {Object.keys(inspected.moveIds)
            .map((id) => catalog.moves[id]?.name || id).join(", ")}</span>}
        </div>
      </section>}
      <div className="battle-lower">
        <MovePanel battle={battle} catalog={catalog} selectedMoveId={selectedMoveId}
          busy={busy || !!playing || !versionMatches} onSelectMove={setSelectedMoveId}
          onSkip={() => { void act({ action: "skipTurn" }); }} />
        <section className="history-panel">
          <h2>Recent actions</h2>
          {history.length === 0 ? <p className="quiet">New actions will appear here.</p> : (
            <ol>{[...history].reverse().map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}</ol>
          )}
        </section>
      </div>
    </main>
  );
};
