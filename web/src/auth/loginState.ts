export const loginErrors = {
  rate_limited: { title: "Please wait before signing in again", message: "Too many sign-in attempts. Give it a moment, then try again. Your battle link is still here." },
  cancelled: { title: "Sign-in cancelled", message: "You cancelled Discord sign-in. You can try again whenever you're ready." },
  invalid_state: { title: "Sign-in couldn't be verified", message: "That link may have expired or opened in a different browser. Start again here, then finish sign-in in the same browser." },
  invalid_callback: { title: "This sign-in link is incomplete", message: "Discord didn't return a complete sign-in. Start again from Pokestar." },
  code_expired: { title: "This sign-in link no longer works", message: "That link expired or was already used. Start a new sign-in to continue." },
  discord_unavailable: { title: "Couldn't sign in with Discord", message: "Discord couldn't complete your sign-in. Try again in a moment." },
  session_failed: { title: "Couldn't finish signing in", message: "Pokestar couldn't save your sign-in. Try again in a moment." },
  login_unavailable: { title: "Sign-in is unavailable", message: "Pokestar can't sign you in right now. Please try again later." },
  cookies: { title: "We couldn't keep you signed in", message: "Use the same browser to start and finish sign-in, and allow cookies for Pokestar. Then try again." },
  connection: { title: "Can't connect to Pokestar", message: "We couldn't check your sign-in. Check your connection, or try again in a moment." },
  start_failed: { title: "Couldn't open Discord sign-in", message: "Pokestar couldn't start your sign-in. Check your connection, or try again in a moment." },
  logout_failed: { title: "Couldn't sign out", message: "Your sign-in may still be active. Try signing out again." },
  unknown: { title: "Couldn't sign you in", message: "Something went wrong during sign-in. Start again from Pokestar." },
};

export const loginErrorMessage = (code: string) =>
  loginErrors[Object.prototype.hasOwnProperty.call(loginErrors, code) ? code as keyof typeof loginErrors : "unknown"];

export const readLoginResult = (search: string) => {
  const params = new URLSearchParams(search);
  const error = params.has("authError") ? params.get("authError") || "unknown" : null;
  const completed = params.get("authComplete") === "1";
  params.delete("authError");
  params.delete("authComplete");
  const clean = params.toString();
  return { error, completed, cleanSearch: clean ? `?${clean}` : "" };
};

export const loginReturnTo = (base: string, search: string, hash = "") => `${base}${readLoginResult(search).cleanSearch}${hash}`;
