import { useBattlePlayback } from "./useBattlePlayback";
import { useCallback, useEffect, useRef, useState } from "react";
import { getBattle, submitAction } from "./api";
import { isApiError, rateLimitDeadline } from "../http";
import { battleCopy } from "./copy";
import type { BattleAction, BattleCatalog, BattleResponse } from "./types";

/** Owns transport, action submission, and playback timing. Renderers consume its plain state. */
export const useBattleSession = (battleId: string, catalog: BattleCatalog) => {
  const playback = useBattlePlayback(catalog);
  const { battle, playing } = playback;
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedMoveId, setSelectedMoveId] = useState<string | null>(null);
  const [inspectedPokemonId, setInspectedPokemonId] = useState<string | null>(null);
  const revisionRef = useRef<number | null>(null);
  const stateIdRef = useRef<string | null>(null);
  const readRef = useRef<AbortController | null>(null);
  const actionRef = useRef<AbortController | null>(null);
  const activeRef = useRef(false);
  const retryAtRef = useRef(0);
  const needsRefreshRef = useRef(false);
  const [retryAt, setRetryAt] = useState(0);

  const pause = useCallback((deadline: number) => {
    retryAtRef.current = Math.max(retryAtRef.current, deadline);
    setRetryAt(retryAtRef.current);
    needsRefreshRef.current = true;
    setError("Too many requests. Waiting a moment before checking the battle again.");
  }, []);

  const applyResponse = useCallback((response: BattleResponse) => {
    if (revisionRef.current !== null && response.revision < revisionRef.current) return;
    const previousRevision = revisionRef.current;
    revisionRef.current = response.revision;
    stateIdRef.current = response.stateId;
    playback.receive(response);
    if (previousRevision === null || response.revision > previousRevision) {
      setSelectedMoveId(null);
    }
  }, [playback.receive]);

  const refresh = useCallback(async () => {
    if (!activeRef.current || document.visibilityState === "hidden" || readRef.current ||
      actionRef.current || Date.now() < retryAtRef.current) return;
    const controller = new AbortController();
    readRef.current = controller;
    try {
      const response = await getBattle(battleId, stateIdRef.current ?? undefined, controller.signal);
      if (!activeRef.current || controller.signal.aborted) return;
      if (response) applyResponse(response);
      needsRefreshRef.current = false;
      retryAtRef.current = 0;
      setRetryAt(0);
      setError(null);
    } catch (cause) {
      if (!activeRef.current || controller.signal.aborted) return;
      const deadline = rateLimitDeadline(cause);
      if (deadline !== null) { pause(deadline); return; }
      setError(isApiError(cause, 404) ? "This battle isn't available. It may have expired."
        : isApiError(cause, 401) ? battleCopy.sessionExpired
        : "Couldn't load the battle. Try again in a moment.");
    } finally {
      if (readRef.current === controller) readRef.current = null;
      if (activeRef.current) setLoading(false);
    }
  }, [battleId, applyResponse, pause]);

  useEffect(() => {
    activeRef.current = true;
    void refresh();
    const interval = window.setInterval(() => { void refresh(); }, 3000);
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      activeRef.current = false;
      readRef.current?.abort();
      readRef.current = null;
      actionRef.current?.abort();
      actionRef.current = null;
      window.clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [refresh]);

  useEffect(() => {
    if (!retryAt) return;
    const timer = window.setTimeout(() => { void refresh(); }, Math.min(2147483647, Math.max(0, retryAt - Date.now())));
    return () => window.clearTimeout(timer);
  }, [retryAt, refresh]);

  const act = async (action: BattleAction) => {
    if (!battle || busy || actionRef.current || playing !== null || battle.rulesetVersion !== catalog.rulesetVersion) return;
    if (Date.now() < retryAtRef.current || needsRefreshRef.current) {
      void refresh();
      return;
    }
    readRef.current?.abort();
    const controller = new AbortController();
    actionRef.current = controller;
    setBusy(true);
    setNotice(null);
    try {
      const response = await submitAction(battleId, battle.revision, action, controller.signal);
      if (!activeRef.current || controller.signal.aborted) return;
      applyResponse(response);
      setNotice(response.accepted ? null : "The battle changed before your action went through. Here's the latest.");
      setError(null);
    } catch (cause) {
      if (!activeRef.current || controller.signal.aborted) return;
      needsRefreshRef.current = true;
      setNotice(null);
      const deadline = rateLimitDeadline(cause);
      if (deadline !== null) { pause(deadline); return; }
      setError(isApiError(cause, 401) ? battleCopy.sessionExpired
        : "Couldn't confirm your action. Refresh the page to check the battle before trying again.");
    } finally {
      if (actionRef.current === controller) actionRef.current = null;
      if (activeRef.current) setBusy(false);
    }
  };

  const targetPokemon = (pokemonId: string) => {
    const selected = battle?.availableActions.moves.find((option) => option.moveId === selectedMoveId);
    if (selectedMoveId && selected?.targetPokemonIds.includes(pokemonId)) {
      void act({ action: "useMove", moveId: selectedMoveId, targetPokemonId: pokemonId });
    }
  };

  return {
    battle, loading, busy, error, notice, selectedMoveId, inspectedPokemonId,
    playing, history: playback.history, skipPlayback: playback.skipPlayback,
    waitingForArt: playback.waitingForArt, reducedMotion: playback.reducedMotion,
    refresh,
    selectMove: setSelectedMoveId,
    inspectPokemon: setInspectedPokemonId,
    targetPokemon,
    skipTurn: () => { void act({ action: "skipTurn" }); },
  };
};

export type BattleSession = ReturnType<typeof useBattleSession>;
