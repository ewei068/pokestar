import { useEffect, useState } from "react";
import { CollectionArtwork } from "../collection/CollectionArtwork";
import { playHref, readPlayRoute } from "../navigation/routes";
import type { BattleSummary } from "../battles/types";
import type { DungeonEncounter, ModeReward, ModeSpecies, TowerFloor } from "../player/types";

const imageSrc = (icon: string) => {
  const base = import.meta.env?.BASE_URL || "/";
  return `${base}images/${icon.includes("/") ? icon : `items/${icon}`}`;
};
// Epoch-aligned 14-day UTC window. Keep this in step with getFullUTCFortnight and
// fortnightToUTCTime in src/utils/utils.js, which the Discord tower embed uses.
const fortnightMs = 86400000 * 14;

export const towerResetLabel = (now = Date.now()) => {
  const days = Math.ceil((((Math.floor(now / fortnightMs) + 1) * fortnightMs) - now) / 86400000);
  return days <= 0 ? "Progress resets today." : `Progress resets in ${days} ${days === 1 ? "day" : "days"}.`;
};

const Rewards = ({ rewards, label }: { rewards: ModeReward[]; label: string }) => (
  <section className="npc-rewards" aria-label={label}><header><h3>{label}</h3></header>
    {rewards.map((reward, index) => <div className="npc-reward" key={index}>
      {reward.kind === "money" ? <span aria-hidden="true">₽</span> : reward.icon ? <img src={imageSrc(reward.icon)} alt="" /> : <span aria-hidden="true">◆</span>}
      <span>{reward.kind === "money" ? reward.label.replace("₽", "") : reward.quantity}</span>
      <span>{reward.kind === "money" ? "Money" : reward.name}</span>
    </div>)}
  </section>
);

const Species = ({ species }: { species: ModeSpecies[] }) => (
  <ul className="npc-species" tabIndex={0} aria-label="Pokémon, scroll horizontally. Bosses are marked with a red border.">
    {species.map(value => <li key={value.id} className={value.boss ? "npc-is-ace" : ""} aria-label={`${value.name}${value.boss ? ", Boss" : ""}`} title={value.name}>
      <CollectionArtwork src={value.spriteUrl} />{value.boss && <span className="npc-ace-tag" aria-hidden="true">Boss</span>}</li>)}
  </ul>
);

const LocationBanner = ({ dungeon }: { dungeon: DungeonEncounter }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [dungeon.id, dungeon.spriteUrl]);
  const art = Boolean(dungeon.spriteUrl) && !failed;
  return <header className={art ? "dungeon-banner has-art" : "dungeon-banner"}>
    {art && <img className="dungeon-scene" src={dungeon.spriteUrl || ""} alt="" onError={() => setFailed(true)} />}
    <div className="dungeon-copy"><h2>{dungeon.displayName}</h2><p>{dungeon.description}</p></div>
  </header>;
};

export function DungeonPlay({ dungeons, selectedId, difficultyId, pending, canStart, onSelect, onStart }: {
  dungeons: DungeonEncounter[]; selectedId: string | null; difficultyId: string | null; pending: boolean; canStart: boolean;
  onSelect: (dungeonId: string, difficultyId: string) => void; onStart: (dungeonId: string, difficultyId: string) => void;
}) {
  const dungeon = dungeons.find(value => value.id === selectedId) || dungeons[0];
  const difficulty = dungeon?.difficulties.find(value => value.id === difficultyId) || dungeon?.difficulties[0];
  if (!dungeon || !difficulty) return <p className="npc-empty">No dungeons available.</p>;
  return <div className="npc-encounters">
    <section className="ui-panel npc-panel npc-trainers" aria-label="Dungeons"><header className="ui-panel-heading npc-panel-head"><h2>Dungeons</h2><small>{dungeons.length}</small></header>
      <div className="npc-trainer-rows">{dungeons.map(value => <button type="button" className="npc-trainer-row" key={value.id} aria-pressed={value.id === dungeon.id} disabled={pending}
        onClick={() => onSelect(value.id, value.difficulties[0].id)}>
        <CollectionArtwork src={value.subtitle?.icon ? imageSrc(value.subtitle.icon) : value.spriteUrl} /><span><strong>{value.displayName}</strong>{value.subtitle && <small className="row-subtitle">{value.subtitle.text}</small>}</span><span aria-hidden="true">›</span>
      </button>)}</div>
    </section>
    <section className="ui-panel npc-panel npc-detail" aria-label="Selected dungeon">
      <LocationBanner dungeon={dungeon} />
      <div className="npc-encounter-content"><h3>Difficulty</h3><div className="npc-difficulties" aria-label="Difficulty">{dungeon.difficulties.map(value =>
        <button type="button" key={value.id} data-difficulty={value.id} aria-pressed={value.id === difficulty.id} disabled={pending} onClick={() => onSelect(dungeon.id, value.id)}>{value.name}</button>)}</div>
        <div className="npc-facts"><span>Levels {difficulty.minLevel}–{difficulty.maxLevel}</span></div>
        <h3>Pokémon</h3><Species species={difficulty.species} />
        <Rewards rewards={difficulty.rewards} label="Reward" />
      </div>
      <footer className="npc-start-bar"><button type="button" className="primary-button" disabled={!canStart || pending} aria-busy={pending}
        onClick={() => { if (!pending) onStart(dungeon.id, difficulty.id); }}>{pending ? "Starting battle…" : "Start battle"}<span aria-hidden="true">⚔</span></button></footer>
    </section>
  </div>;
}

const floorState = (stage: number, saved: number) => {
  if (saved >= 20) return stage === 20 ? "complete" : "cleared";
  if (stage < saved + 1) return "cleared";
  if (stage === saved + 1) return "next";
  return "locked";
};

export function TowerPlay({ floors, savedStage, selectedStage, battles, pending, canStart, onSelect, onStart }: {
  floors: TowerFloor[]; savedStage: number; selectedStage: number | null; battles: BattleSummary[]; pending: boolean; canStart: boolean;
  onSelect: (stage: number) => void; onStart: (stage: number) => void;
}) {
  const next = savedStage >= 20 ? 20 : savedStage + 1;
  const floor = floors.find(value => value.stage === selectedStage) || floors.find(value => value.stage === next) || floors[0];
  if (!floor) return <p className="npc-empty">No floors available.</p>;
  const state = floorState(floor.stage, savedStage);
  const open = [...battles].filter(battle => battle.mode.type === "tower" && battle.mode.stage === floor.stage)
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))[0];
  const continueHref = open && state === "next" ? playHref(new URL(window.location.href), { ...readPlayRoute(new URL(window.location.href)), battleId: open.battleId }) : null;
  const flag = state === "cleared" ? "Cleared" : state === "locked" ? "Locked" : state === "complete" ? "Complete" : "Next";
  return <div className="npc-encounters">
    <section className="ui-panel npc-panel npc-trainers" aria-label="Battle Tower floors"><header className="ui-panel-heading npc-panel-head"><h2>Floors</h2><small>{towerResetLabel()}</small></header>
      <div className="npc-trainer-rows">{floors.map(value => {
        const progress = floorState(value.stage, savedStage);
        return <button type="button" className="npc-trainer-row" key={value.stage} data-progress={progress} aria-pressed={value.stage === floor.stage} disabled={pending}
          onClick={() => onSelect(value.stage)}>
          <CollectionArtwork src={value.spriteUrl} /><span><strong>Floor {value.stage}</strong><small className="floor-flag">{value.npcName}</small>
            <small className="floor-flag">{progress === "cleared" ? "Cleared" : progress === "locked" ? `Clear floor ${savedStage + 1} first` : progress === "complete" ? "Complete" : "Next"}</small></span>
          <span aria-hidden="true">›</span>
        </button>;
      })}</div>
    </section>
    <section className="ui-panel npc-panel npc-detail" aria-label="Selected floor">
      <header className="npc-encounter-header"><div className="npc-portrait"><CollectionArtwork src={floor.spriteUrl} /></div><div><h2>Floor {floor.stage}</h2><p>{floor.npcName} · {floor.difficultyName}</p></div></header>
      <div className="npc-encounter-content">
        <div className="npc-facts"><span>Levels {floor.minLevel}–{floor.maxLevel}</span><span>{flag}</span></div>
        {state === "locked" && <p className="npc-notice">Clear floor {savedStage + 1} first.</p>}
        <h3>Pokémon</h3><Species species={floor.species} />
        <Rewards rewards={floor.rewards} label="Reward" />
      </div>
      <footer className="npc-start-bar">{continueHref ? <a className="primary-button" href={continueHref}>Continue<span aria-hidden="true">→</span></a> :
        <button type="button" className="primary-button" disabled={state !== "next" || !canStart || pending} aria-busy={pending}
          onClick={() => { if (!pending && state === "next") onStart(floor.stage); }}>{pending ? "Starting battle…" : state === "cleared" ? "Cleared" : state === "locked" ? "Locked" : state === "complete" ? "Tower complete" : "Start battle"}<span aria-hidden="true">⚔</span></button>}
      </footer>
    </section>
  </div>;
}
