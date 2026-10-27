import { useBattlePlayback } from "./useBattlePlayback";
import { useCallback, useEffect, useRef, useState } from "react";
import { getBattle, submitAction } from "./api";
import { isApiError } from "../http";
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
    if (document.visibilityState === "hidden") return;
    try {
      const response = await getBattle(battleId, stateIdRef.current ?? undefined);
      if (response) applyResponse(response);
      setError(null);
    } catch (cause) {
      setError(isApiError(cause, 404) ? "This battle isn't available. It may have expired."
        : isApiError(cause, 401) ? battleCopy.sessionExpired
        : "Couldn't load the battle. Try again in a moment.");
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

  const act = async (action: BattleAction) => {
    if (!battle || busy || playing !== null || battle.rulesetVersion !== catalog.rulesetVersion) return;
    setBusy(true);
    setNotice(null);
    try {
      const response = await submitAction(battleId, battle.revision, action);
      applyResponse(response);
      setNotice(response.accepted ? null : "The battle changed before your action went through. Here's the latest.");
      setError(null);
    } catch (cause) {
      setNotice(null);
      setError(isApiError(cause, 401) ? battleCopy.sessionExpired
        : "Couldn't confirm your action. Refresh the page to check the battle before trying again.");
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
