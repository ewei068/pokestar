import { useDismissDetails } from "../components/useDismissDetails";
import { useState } from "react";
import { SiteIcon } from "../navigation/SiteIcon";
import type { TrainerProfile } from "./types";

type TrainerState = { profile: TrainerProfile | null; loading: boolean; userId?: string };
const formatNumber = (value: number) => value.toLocaleString("en-US");

const TrainerAvatar = ({ name, url }: { name: string; url: string | null }) => {
  const [failed, setFailed] = useState(false);
  return <span className="account-mark" aria-hidden="true">{url && !failed
    ? <img src={url} alt="" onError={() => setFailed(true)} /> : Array.from(name)[0]}</span>;
};

export const TrainerResources = ({ profile, loading }: TrainerState) => profile
  ? <div className="trainer-resources">
    <div className="trainer-money" role="group" aria-label="Money"><SiteIcon name="money" />
      <span className="trainer-money-label">Money</span><span>{formatNumber(profile.money)}</span></div>
    <div className="trainer-mobile-identity"><span className="trainer-name">{profile.displayName}</span>
      <span className="trainer-level">Lv. {profile.level}</span></div>
  </div>
  : <div className="trainer-resources"><p className="trainer-resource-status">
    {loading ? "Loading trainer…" : "Trainer unavailable"}</p></div>;

export const TrainerAccount = ({ profile, loading, userId, pending, onRetry, onSignOut }: TrainerState & {
  pending: boolean;
  onRetry: () => void;
  onSignOut: () => void;
}) => {
  const name = profile?.displayName || "Trainer";
  const avatar = () => <TrainerAvatar key={profile?.avatarUrl || "initial"} name={name} url={profile?.avatarUrl || null} />;
  const level = profile ? `Lv. ${profile.level}` : loading ? "Loading…" : "Signed in";
  const menuRef = useDismissDetails();
  return <details ref={menuRef} className="account-menu trainer-account" onKeyDown={event => {
    if (event.key === "Escape") {
      event.currentTarget.open = false;
      event.currentTarget.querySelector("summary")?.focus();
    }
  }}>
    <summary aria-label="Trainer account">{avatar()}<span className="trainer-account-identity">
      <span className="trainer-name">{name}</span><span className="trainer-level">{level}</span></span></summary>
    <section className="account-panel trainer-account-panel" aria-label="Trainer details">
      <div className="trainer-profile-heading">{avatar()}<div><h2>{name}</h2><small>{level}</small></div></div>
      <div className="trainer-profile-details">
        {profile ? <>
          <div className="trainer-exp-heading"><span>EXP</span><span>{profile.exp
            ? `${formatNumber(profile.exp.current)} / ${formatNumber(profile.exp.required)}` : "Max level"}</span></div>
          {profile.exp && <><progress aria-label="EXP toward next trainer level" value={profile.exp.current} max={profile.exp.required} />
            <p className="trainer-exp-caption">To level {profile.level + 1}</p></>}
          <div className="trainer-profile-money"><span>Money</span><span>{formatNumber(profile.money)}</span></div>
        </> : <>
          <p className="trainer-panel-message">{loading ? "Getting your trainer ready…" : "Couldn't load your trainer."}</p>
          {!loading && <button type="button" className="primary-button" disabled={pending} onClick={onRetry}>Try again</button>}
        </>}
        {userId && <p className="trainer-profile-id">Discord ID<span>{userId}</span></p>}
        <button type="button" className="trainer-signout" disabled={pending} onClick={onSignOut}>
          {pending ? "Signing out…" : "Sign out"}</button>
      </div>
    </section>
  </details>;
};

export const TrainerStatus = ({ loading, pending, onRetry }: { loading: boolean; pending: boolean; onRetry: () => void }) => (
  <main className="page-shell"><div className="list-intro"><h1>Play</h1></div>
    <section className={`site-panel trainer-setup-state${loading ? "" : " is-error"}`} role={loading ? "status" : "alert"}>
      <div className="trainer-setup-heading"><span aria-hidden="true">{loading ? "✦" : "!"}</span>
        <h2>{loading ? "Getting your trainer ready…" : "Couldn't load your trainer."}</h2></div>
      <p>{loading ? "Your account details will appear here in a moment." : "Try again to load your profile and resources."}</p>
      {!loading && <button type="button" className="primary-button" disabled={pending} onClick={onRetry}>Try again</button>}
    </section>
  </main>
);
