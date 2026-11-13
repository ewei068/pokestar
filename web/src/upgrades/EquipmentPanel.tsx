import { useId, useState } from "react";
import { CollectionArtwork } from "../collection/CollectionArtwork";
import { TypeBadge } from "../components/TypeBadge";
import type { PokemonEquipmentContext, PokemonEquipmentResult } from "../player/types";
import { equipmentValue, equipmentRuleValue } from "./equipmentRules";
import { EquipmentGuide } from "./EquipmentGuide";

const statNames = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
const fmt = (value: number) => value.toLocaleString("en-US");
function EquipmentArt({ icon, folder = "equipment" }: { icon: string | null; folder?: string }) {
  const [failed, setFailed] = useState(false);
  return icon && !failed ? <img src={`${import.meta.env?.BASE_URL || "/"}images/${folder}/${icon}`} alt="" onError={() => setFailed(true)} />
    : <span className="equipment-art-fallback" aria-hidden="true">◇</span>;
}
export type EquipmentPanelProps = {
  context: PokemonEquipmentContext | undefined; loading: boolean; pending: boolean; refreshing: boolean; error: string | null;
  result?: PokemonEquipmentResult; onRefresh: () => void; onUpgrade: (type: string) => void; onReroll: (type: string, slot: string) => void;
};
export function EquipmentPanel({ context, loading, pending, refreshing, error, result, onRefresh, onUpgrade, onReroll }: EquipmentPanelProps) {
  const [selection, setSelection] = useState("");
  const [mode, setMode] = useState<"upgrade" | "reroll">("upgrade");
  const [slotSelection, setSlotSelection] = useState("primary");
  const [guide, setGuide] = useState(false);
  const slotInput = useId();
  const refresh = <button className="ui-button" disabled={pending || refreshing} onClick={onRefresh}>Refresh Pokémon &amp; Bag</button>;
  if (!context) return <section className="ui-panel build-state" aria-busy={loading}><h2>{loading ? "Loading equipment…" : "Equipment unavailable."}</h2>
    {error && <p role="alert">{error}</p>}{!loading && refresh}</section>;
  const { pokemon, catalog } = context;
  const piece = context.pieces.find(item => item.id === selection) || context.pieces[0];
  const type = catalog.types.find(item => item.id === piece?.id);
  const slotId = piece?.slots.some(slot => slot.id === slotSelection) ? slotSelection : piece?.slots[0]?.id;
  const disabled = pending || refreshing || Boolean(error);
  const canSelectRerollSlot = mode === "reroll" && !disabled;
  const material = context.materials.find(item => item.id === type?.materialId);
  const cost = mode === "upgrade" ? piece?.upgradeCost : catalog.rerollCost;
  const affordable = Boolean(cost && context.money >= cost.money && (material?.quantity || 0) >= cost.shards);
  const name = (id: string) => catalog.modifiers.find(item => item.id === id)?.name || id;
  const slotName = (id: string) => catalog.slots.find(item => item.id === id)?.name || id;
  const change = result?.change;
  const current = result?.pieces.find(item => item.id === change?.equipmentType);
  const oldRoll = change?.slotId ? change.previousEquipment.slots[change.slotId] : undefined;
  const newRoll = current?.slots.find(item => item.id === change?.slotId);
  const changedType = catalog.types.find(item => item.id === change?.equipmentType);
  return <div className="equipment ui-controls">
    {error && <div className="build-notice" role="alert"><p>{error}</p>{refresh}</div>}
    {pending && <p role="status">Saving equipment…</p>}
    {result && <div className="build-notice equipment-result" role="status">{change?.kind === "upgrade"
      ? <p>{changedType?.name} upgraded to level {current?.level}!</p>
      : oldRoll && newRoll && change?.slotId ? <><p>{slotName(change.slotId)} rerolled!</p><p>
        {name(oldRoll.modifier)} {equipmentValue(catalog, oldRoll.modifier, equipmentRuleValue(catalog, change.slotId, oldRoll.modifier, oldRoll.quality, change.previousEquipment.level))} · {oldRoll.quality}%
        <span className="equipment-next">→</span>{name(newRoll.modifier)} {equipmentValue(catalog, newRoll.modifier, newRoll.value)} · {newRoll.quality}%</p></> : null}</div>}
    <div className="ui-panel build-identity equipment-identity"><CollectionArtwork src={pokemon.spriteUrl} /><div><h2>{pokemon.name}</h2>
      <p>Lv. {pokemon.level} · {pokemon.speciesName}{pokemon.inParty ? " · In party" : ""}</p>
      <div className="ui-badge-list">{pokemon.types.map(item => <TypeBadge key={item} type={item} />)}</div></div>
      <button className="ui-button equipment-guide-trigger" onClick={() => setGuide(true)}>Equipment guide</button></div>
    {!piece || !type ? <section className="ui-panel build-state"><h2>No equipment</h2><p>This Pokémon has no equipment to upgrade or reroll.</p></section> :
      <div className="equipment-layout"><section className="ui-panel equipment-choices" aria-label="Equipment choices"><h2 className="ui-panel-heading">Equipment</h2><div>
        {context.pieces.map(item => { const rule = catalog.types.find(rule => rule.id === item.id); return rule && <button key={item.id} className="equipment-choice"
          aria-pressed={piece.id === item.id} disabled={pending} onClick={() => { setSelection(item.id); setSlotSelection("primary"); setMode("upgrade"); }}>
          <EquipmentArt key={rule.icon} icon={rule.icon} /><span><span>{rule.name}</span><small>Base {statNames[rule.primaryStat]} · Lv. {item.level}</small></span></button>; })}
      </div></section><section className="ui-panel equipment-detail" aria-label={`${type.name} details`}>
        <header className="ui-panel-heading equipment-detail-heading"><EquipmentArt key={type.icon} icon={type.icon} /><h2>{type.name}</h2><span>Lv. {piece.level} / {catalog.maxLevel}</span></header>
        <div className="equipment-body"><div className="equipment-switch" role="group" aria-label="Equipment action">
          <button className="ui-button" aria-pressed={mode === "upgrade"} disabled={pending} onClick={() => setMode("upgrade")}>Upgrade</button>
          <button className="ui-button" aria-pressed={mode === "reroll"} disabled={pending} onClick={() => setMode("reroll")}>Reroll</button></div>
        <table className="equipment-slots"><thead><tr><th>Slot</th><th>Modifier</th><th>Value{mode === "upgrade" && piece.upgradeCost ? " → next" : ""}</th><th>Quality</th></tr></thead>
          <tbody className={canSelectRerollSlot ? "equipment-reroll-slots" : undefined}>{piece.slots.map(slot => {
            const rerolling = mode === "reroll" && slot.id === slotId;
            return <tr key={slot.id} className={rerolling ? "equipment-selected-slot" : undefined}
              onClick={canSelectRerollSlot ? () => setSlotSelection(slot.id) : undefined}>
            <th scope="row">{slotName(slot.id)}</th><td>{name(slot.modifier)}{rerolling && type.slots[slot.id]?.length > 1 && <span className="equipment-next">→ ???</span>}</td>
            <td>{equipmentValue(catalog, slot.modifier, slot.value)}{rerolling ? <span className="equipment-next">→ ???</span>
              : mode === "upgrade" && piece.upgradeCost && slot.value !== slot.nextValue ? <span className="equipment-next">→ {equipmentValue(catalog, slot.modifier, slot.nextValue)}</span> : null}</td>
            <td>{slot.quality}%{rerolling && <span className="equipment-next">→ ???%</span>}</td></tr>; })}</tbody></table>
        <p className="equipment-helper">Only primary &amp; secondary stats scale with equipment level.</p>
        <section className="equipment-action"><h3>{mode === "upgrade" ? piece.upgradeCost ? `Level ${piece.level} → ${piece.level + 1}` : "Maximum level" : `Reroll ${slotName(slotId || "").toLowerCase()}`}</h3>
          {mode === "reroll" && <><label htmlFor={slotInput}>Stat slot</label><select id={slotInput} value={slotId} disabled={disabled} onChange={event => setSlotSelection(event.target.value)}>
            {piece.slots.map(slot => <option key={slot.id} value={slot.id}>{slotName(slot.id)} · {name(slot.modifier)} {equipmentValue(catalog, slot.modifier, slot.value)}</option>)}</select></>}
          {cost ? <><div className="equipment-cost"><div><span>{fmt(cost.money)} money</span><small>Owned: {fmt(context.money)}</small></div>
            <div><EquipmentArt key={material?.icon} icon={material?.icon || null} folder="items" /><span>{cost.shards} {material?.name || "matching Shard"}{cost.shards === 1 ? "" : "s"}</span><small>Owned: {material?.quantity || 0}</small></div></div>
            {!affordable && <p>Not enough {context.money < cost.money ? "money" : `${material?.name || "matching Shard"}s`}.</p>}</>
            : <p>This equipment is fully leveled. You can still reroll its slots.</p>}
          <div className="equipment-confirm"><button className="ui-button ui-button--primary" disabled={disabled || !affordable}
            onClick={() => mode === "upgrade" ? onUpgrade(piece.id) : slotId && onReroll(piece.id, slotId)}>
            {mode === "reroll" ? "Confirm reroll" : piece.upgradeCost ? "Upgrade level" : `Level ${catalog.maxLevel} reached`}</button>
            {mode === "reroll" && <button className="ui-button" disabled={pending} onClick={() => setMode("upgrade")}>Cancel</button>}</div>
        </section></div></section></div>}
    {guide && <EquipmentGuide catalog={catalog} initialType={type?.id} initialLevel={piece?.level} onClose={() => setGuide(false)} />}
  </div>;
}
