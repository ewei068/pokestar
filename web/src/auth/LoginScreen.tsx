import { useEffect } from "react";
import { loginErrorMessage } from "./loginState";

export const LoginScreen = ({ error, pending, onRetry, homeHref }: {
  error: string | null;
  pending: "login" | "logout" | null;
  onRetry: () => void;
  homeHref: string;
}) => {
  const copy = error ? loginErrorMessage(error) : {
    title: "Continue your battle", message: "Sign in with Discord to play Pokestar.",
  };
  let actionLabel = error ? "Try again" : "Sign in with Discord";
  if (pending === "logout") actionLabel = "Signing out…";
  else if (pending === "login") actionLabel = "Opening Discord…";
  else if (error === "logout_failed") actionLabel = "Try signing out again";
  useEffect(() => {
    const previous = document.title;
    document.title = `${copy.title} | Pokestar`;
    return () => { document.title = previous; };
  }, [copy.title]);
  return <main className="page-shell login-panel">
    <section className={`login-card ${error ? "has-error" : ""}`} aria-labelledby="login-title">
      <span className="login-symbol" aria-hidden="true">{error ? "!" : "✦"}</span>
      <div role={error ? "alert" : undefined}>
        <p className="eyebrow">{error ? "Sign-in problem" : "Pokestar Battles"}</p>
        <h1 id="login-title">{copy.title}</h1><p>{copy.message}</p>
      </div>
      <div className="login-actions">
        <button type="button" className="primary-button" disabled={!!pending} onClick={onRetry}>
          {actionLabel}
        </button>
        {error && <a className="login-back" href={homeHref}>Back to battles</a>}
      </div>
    </section>
  </main>;
};
