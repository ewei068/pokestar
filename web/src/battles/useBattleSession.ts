import { useCallback, useEffect, useRef, useState } from "react";
import { getBattle, submitAction } from "./api";
import { isApiError } from "../http";
import { newPlaybackFrames } from "./playback";
import type { PlaybackFrame } from "./playback";
import type { BattleAction, BattleCatalog, BattleDisplay, BattleResponse } from "./types";

const toDisplay = (response: BattleResponse): BattleDisplay => ({
  battleId: response.battleId,
  rulesetVersion: response.rulesetVersion,
  revision: response.revision,
  status: response.status,
  completionStatus: response.completionStatus,
  mode: response.mode,
  myTeamNames: response.myTeamNames,
  isMyTurn: response.isMyTurn,
  view: response.view,
  availableActions: response.availableActions,
});

/** Owns transport, action submission, and playback timing. Renderers consume its plain state. */
export const useBattleSession = (battleId: string, catalog: BattleCatalog) => {
  const [battle, setBattle] = useState<BattleDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null);
  const [inspectedPokemonId, setInspectedPokemonId] = useState<string | null>(null);
  const [eventQueue, setEventQueue] = useState<PlaybackFrame[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const revisionRef = useRef<number | null>(null);
  const stateIdRef = useRef<string | null>(null);

  const applyResponse = useCallback((response: BattleResponse) => {
    if (revisionRef.current !== null && response.revision < revisionRef.current) return;
    const previousRevision = revisionRef.current;
    const queued = newPlaybackFrames(previousRevision, response, catalog);
    revisionRef.current = response.revision;
    stateIdRef.current = response.stateId;
    setBattle(toDisplay(response));
    if (previousRevision === null || response.revision > previousRevision) {
      setSelectedMoveId(null);
    }
    if (queued.length > 0) {
      setEventQueue((current) => [...current, ...queued]);
      setHistory((current) => [...current, ...queued.flatMap((item) => item.text ? [item.text] : [])].slice(-20));
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
        : isApiError(cause, 401) ? "Your session expired. Reload to sign in."
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
    if (!battle || busy || eventQueue.length > 0 || battle.rulesetVersion !== catalog.rulesetVersion) return;
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

  const targetPokemon = (pokemonId: string) => {
    const selected = battle?.availableActions.moves.find((option) => option.moveId === selectedMoveId);
    if (selectedMoveId && selected?.targetPokemonIds.includes(pokemonId)) {
      void act({ action: "useMove", moveId: selectedMoveId, targetPokemonId: pokemonId });
    }
  };

  const playing: PlaybackFrame | null = eventQueue[0] || null;
  return {
    battle, loading, busy, error, notice, selectedMoveId, inspectedPokemonId,
    playing, history,
    refresh,
    selectMove: setSelectedMoveId,
    inspectPokemon: setInspectedPokemonId,
    targetPokemon,
    skipTurn: () => { void act({ action: "skipTurn" }); },
  };
};

export type BattleSession = Omit<ReturnType<typeof useBattleSession>, "playing"> & {
  playing: PlaybackFrame | null;
};
