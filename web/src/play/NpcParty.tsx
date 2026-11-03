import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PartyView } from "../collection/PartyView";
import { PokemonInspection } from "../collection/PokemonInspection";
import { usePlayer } from "../player/PlayerProvider";
import { routeHref } from "../navigation/routes";
import type { Party } from "../player/types";

export function NpcParty({ party, titleId, onClose }: { party?: Party; titleId?: string; onClose?: () => void }) {
  const data = usePlayer();
  const [selectedId, select] = useState<string | null>(null);
  const member = party?.slots.find(value => value?.id === selectedId);
  const detail = useQuery({ ...data.pokemon(member?.id || ""), enabled: Boolean(member) });
  return <div className="npc-party">
    <header className="npc-panel-head"><h2 id={titleId}>Your party <small>{party?.slots.filter(Boolean).length ?? "—"}/{party?.capacity ?? 6}</small></h2>
      {onClose && <button type="button" className="npc-close" aria-label="Close party" onClick={onClose}>×</button>}</header>
    {member ? <><button type="button" className="npc-secondary npc-inspect-back" onClick={() => select(null)}>‹ Back to party</button>
      <PokemonInspection key={member.id} pokemon={detail.data || member} loading={detail.isPending} inParty pending={false} onAdd={() => {}} /></> : party ? <>
      <div className="npc-party-direction"><span>Formation</span><span className="collection-front-direction" /></div>
      <PartyView party={party} selectedId={null} placingId={null} pending={false} mode={null} readOnly
        onSlot={index => select(party.slots[index]?.id || null)} />
    </> : <p className="npc-empty" role="status">Loading party…</p>}
    <a className="npc-secondary npc-party-edit" href={routeHref(new URL(window.location.href), { page: "pokemon", battleId: null })}>Edit party →</a>
  </div>;
}
