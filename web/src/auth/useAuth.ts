import { useEffect, useRef, useState } from "react";
import { getMe, isApiError, logout, startLogin } from "../http";
import { readLoginResult } from "./loginState";

type AuthState = { kind: "loading" } | { kind: "ready"; userId: string } | { kind: "login"; error: string | null };

export const useAuth = () => {
  const [result] = useState(() => readLoginResult(window.location.search));
  const [state, setState] = useState<AuthState>(result.error ? { kind: "login", error: result.error } : { kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState<"login" | "logout" | null>(null);
  const version = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    const onPageReturn = (event: PageTransitionEvent) => {
      if (event.persisted) {
        busy.current = false;
        setPending(null);
      }
    };
    window.addEventListener("pageshow", onPageReturn);
    return () => window.removeEventListener("pageshow", onPageReturn);
  }, []);

  useEffect(() => {
    if (window.location.search !== result.cleanSearch) {
      window.history.replaceState(window.history.state, "", `${window.location.pathname}${result.cleanSearch}${window.location.hash}`);
    }
  }, [result]);

  useEffect(() => {
    const current = ++version.current;
    if (!result.error || attempt > 0) {
      setState({ kind: "loading" });
      getMe().then(me => {
        if (version.current === current) setState({ kind: "ready", userId: me.discordUserId });
      }).catch(error => {
        if (version.current === current) setState({ kind: "login", error: isApiError(error, 401)
          ? result.completed ? "cookies" : null : "connection" });
      });
    }
    return () => { version.current++; };
  }, [attempt, result]);

  const signIn = async () => {
    if (busy.current) return;
    busy.current = true;
    setPending("login");
    const current = ++version.current;
    try {
      const url = await startLogin();
      if (version.current === current) window.location.assign(url);
    } catch {
      if (version.current === current) setState({ kind: "login", error: "start_failed" });
      busy.current = false;
      if (version.current === current) setPending(null);
    }
  };

  const signOut = async () => {
    if (busy.current) return;
    busy.current = true;
    setPending("logout");
    const current = ++version.current;
    try {
      await logout();
      if (version.current === current) setState({ kind: "login", error: null });
    } catch (error) {
      if (version.current === current) setState({ kind: "login", error: isApiError(error, 401) ? null : "logout_failed" });
    } finally {
      busy.current = false;
      if (version.current === current) setPending(null);
    }
  };
  const retry = () => {
    if (state.kind === "login" && state.error === "connection") setAttempt(value => value + 1);
    else if (state.kind === "login" && state.error === "logout_failed") void signOut();
    else void signIn();
  };
  return { state, pending, retry, signOut };
};
