import type { BattleSummary } from "./types";
import type { DungeonEncounter, NpcEncounter, TowerFloor } from "../player/types";
import { playHref, readPlayRoute } from "../navigation/routes";
import { CollectionArtwork } from "../collection/CollectionArtwork";

const fallbackName = (type = "") => ({ pvp: "PvP battle", pve: "Trainer battle", dungeon: "Dungeon", tower: "Battle Tower", raid: "Raid" }[type] || "Battle");

export const BattleList = ({ battles, npcs, dungeons = [], floors = [] }: {
  battles: BattleSummary[]; npcs: NpcEncounter[]; dungeons?: DungeonEncounter[]; floors?: TowerFloor[];
}) => (
  <section className="ui-panel npc-panel npc-continue" aria-label="Ongoing battles">
    <header className="ui-panel-heading npc-panel-head"><h2>Ongoing battles</h2><small>{battles.length} {battles.length === 1 ? "battle" : "battles"}</small></header>
    <div className="npc-continue-list">{[...battles].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).map(battle => {
      const dungeon = battle.mode.type === "dungeon" ? dungeons.find(value => value.id === battle.mode.dungeonId) : undefined;
      const npc = battle.mode.type === "pve" ? npcs.find(value => value.id === battle.mode.npcId) : undefined;
      const listedFloor = battle.mode.type === "tower" && typeof battle.mode.stage === "number"
        ? floors.some(floor => floor.stage === battle.mode.stage) : false;
      const difficulty = (dungeon || npc)?.difficulties.find(value => value.id === battle.mode.difficulty);
      const name = dungeon?.displayName || npc?.displayName
        || (battle.mode.type === "tower" && typeof battle.mode.stage === "number" && listedFloor ? `Battle Tower · Floor ${battle.mode.stage}` : undefined)
        || fallbackName(battle.mode.type);
      const url = new URL(window.location.href);
      return <a className="npc-continue-row" key={battle.battleId}
        href={playHref(url, { ...readPlayRoute(url), battleId: battle.battleId })}>
        <span className="npc-battle-portrait">{npc ? <CollectionArtwork src={npc.spriteUrl} /> : <span aria-hidden="true">⚔</span>}</span>
        <span className="npc-battle-summary"><strong>{name}{difficulty && <small> · {difficulty.name}</small>}</strong>
          <small>Turn {battle.turn} · Updated {new Date(battle.updatedAt).toLocaleString()}</small></span>
        <span className="npc-continue-arrow" aria-hidden="true">→</span>
      </a>;
    })}</div>
  </section>
);
