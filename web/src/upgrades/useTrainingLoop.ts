import { useEffect, useRef, useState } from "react";
import { ApiError } from "../http";
import type { TrainingContext, TrainingGains, TrainingResult } from "../player/types";

type Options = {
  context: TrainingContext | undefined;
  train: (locationId: string, isCurrent: () => boolean) => Promise<TrainingResult>;
  refresh: (isCurrent: () => boolean) => Promise<unknown>;
  onStop: () => void | Promise<unknown>;
};
const emptyGains = (): TrainingGains => ({ exp: 0, evs: [0, 0, 0, 0, 0, 0] });
const failureMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 429) return "Too many requests. Wait a moment, then start training again.";
    if (error.status === 404) return "This Pokémon is no longer in your collection.";
    if (error.status === 401 || error.code === "account_changed") return "Your session changed. Loading your account…";
    if (error.status < 500) return "Training stopped. Check the refreshed Pokémon and location before trying again.";
  }
  return "Training may have completed. Check the refreshed Pokémon before starting again.";
};

/** The visible Train feature owns one timer and at most one submitted operation. */
export function useTrainingLoop(options: Options) {
  const latest = useRef(options);
  latest.current = options;
  const generation = useRef(0);
  const mounted = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = useRef(false);
  const inFlight = useRef(false);
  const session = useRef(false);
  const blocked = useRef(false);
  const retryAt = useRef(0);
  const refreshingRef = useRef(false);
  const [running, setRunning] = useState(false);
  const [pending, setPending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totals, setTotals] = useState<TrainingGains>(emptyGains);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState("");
  const available = (context: TrainingContext | undefined) => context?.locations.find(location => location.id === "0")
    || context?.locations.find(location => location.owned);
  const locationId = options.context?.locations.some(location => location.id === selection) ? selection : available(options.context)?.id || "";
  const location = useRef(locationId);
  location.current = locationId;

  const clearTimer = () => { if (timer.current !== null) clearTimeout(timer.current); timer.current = null; };
  const notifyStop = () => {
    if (!session.current) return;
    session.current = false;
    void Promise.resolve().then(() => latest.current.onStop()).catch(() => {});
  };
  const stop = () => {
    active.current = false;
    clearTimer();
    if (mounted.current) setRunning(false);
    if (!inFlight.current) notifyStop();
  };

  const reconcile = async (current: () => boolean) => {
    if (!current() || refreshingRef.current) return false;
    refreshingRef.current = true;
    setRefreshing(true);
    try {
      await latest.current.refresh(current);
      if (!current()) return false;
      blocked.current = false;
      return true;
    } catch {
      if (!current()) return;
      blocked.current = true;
      setError("Couldn't refresh training. Refresh before starting again.");
      return false;
    } finally {
      if (current()) { refreshingRef.current = false; setRefreshing(false); }
    }
  };

  const schedule = (current: () => boolean, selected: string) => {
    timer.current = setTimeout(async () => {
      timer.current = null;
      if (!current() || !active.current || inFlight.current) return;
      if (document.visibilityState === "hidden" || navigator.onLine === false) { stop(); return; }
      inFlight.current = true;
      setPending(true);
      try {
        const result = await latest.current.train(selected, current);
        if (!current()) return;
        if (result.trained) setTotals(previous => ({ exp: previous.exp + result.gains.exp,
          evs: previous.evs.map((gain, index) => gain + (result.gains.evs[index] || 0)) }));
        if (result.warning) {
          active.current = false;
          inFlight.current = false;
          setPending(false);
          blocked.current = true;
          setRunning(false);
          setError("Training saved, but some rewards may be incomplete. Check the refreshed Pokémon before starting again.");
          await reconcile(current);
          if (!current()) return;
        } else if (!result.trained || !result.locations.find(item => item.id === selected)?.canTrain) {
          active.current = false;
          setRunning(false);
        }
      } catch (cause) {
        if (!current()) return;
        active.current = false;
        inFlight.current = false;
        setPending(false);
        blocked.current = true;
        retryAt.current = cause instanceof ApiError && cause.status === 429 ? cause.retryAt ?? Date.now() + 60000 : 0;
        setRunning(false);
        setError(cause instanceof ApiError && cause.status === 429
          ? `Too many requests. Wait ${Math.max(1, Math.ceil((retryAt.current - Date.now()) / 1000))} seconds, then refresh.`
          : failureMessage(cause));
        await reconcile(current);
        if (!current()) return;
      } finally {
        inFlight.current = false;
        if (current()) {
          setPending(false);
          if (active.current) schedule(current, selected);
          else notifyStop();
        } else notifyStop();
      }
    }, 1000);
  };

  useEffect(() => {
    mounted.current = true;
    generation.current++;
    const pause = () => stop();
    const visibility = () => { if (document.visibilityState === "hidden") pause(); };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("offline", pause);
    return () => {
      mounted.current = false;
      generation.current++;
      active.current = false;
      clearTimer();
      if (!inFlight.current) notifyStop();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("offline", pause);
    };
  }, []);

  const toggle = () => {
    if (active.current) { stop(); return; }
    if (inFlight.current || refreshingRef.current || blocked.current || !mounted.current) return;
    if (Date.now() < retryAt.current) {
      setError(`Too many requests. Try again in ${Math.ceil((retryAt.current - Date.now()) / 1000)} seconds.`);
      return;
    }
    if (document.visibilityState === "hidden" || navigator.onLine === false) return;
    const selected = latest.current.context?.locations.find(item => item.id === location.current);
    if (!selected?.canTrain || (!selected.owned && selected.id !== "0")) return;
    const identity = ++generation.current;
    const current = () => mounted.current && generation.current === identity;
    active.current = true;
    session.current = true;
    setRunning(true);
    setError(null);
    schedule(current, selected.id);
  };
  const refresh = async () => {
    if (active.current || inFlight.current || !mounted.current) return;
    const identity = generation.current;
    const current = () => mounted.current && generation.current === identity;
    const refreshed = await reconcile(current);
    if (!current() || !refreshed) return;
    setError(Date.now() >= retryAt.current ? null : `Too many requests. Wait ${Math.ceil((retryAt.current - Date.now()) / 1000)} seconds, then refresh.`);
  };
  return { locationId, running, pending, totals, error, refreshing, toggle, refresh,
    selectLocation: (id: string) => {
      if (!active.current && !inFlight.current && latest.current.context?.locations.some(item => item.id === id && (item.owned || id === "0"))) setSelection(id);
    } };
}
