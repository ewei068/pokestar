import { useEffect, useId, useRef, useState } from "react";
import type { EquipmentCatalog } from "../player/types";
import { equipmentRuleValue, equipmentValue } from "./equipmentRules";

export function EquipmentGuide({ catalog, initialType, initialLevel = 1, onClose }: {
  catalog: EquipmentCatalog; initialType?: string; initialLevel?: number; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const [typeId, setTypeId] = useState(initialType || catalog.types[0]?.id);
  const [slotId, setSlotId] = useState(catalog.slots[0]?.id);
  const [modifierId, setModifierId] = useState("");
  const [quality, setQuality] = useState(75);
  const [level, setLevel] = useState(initialLevel);
  const type = catalog.types.find(item => item.id === typeId) || catalog.types[0];
  const slot = catalog.slots.find(item => item.id === slotId) || catalog.slots[0];
  const pool = type?.slots[slot?.id] || [];
  const modifier = catalog.modifiers.find(item => item.id === (pool.includes(modifierId) ? modifierId : pool[0]));
  useEffect(() => {
    const element = dialog.current;
    const focus = document.activeElement;
    if (element?.showModal) element.showModal(); else element?.setAttribute("open", "");
    return () => { element?.close?.(); if (focus instanceof HTMLElement && focus.isConnected) focus.focus({ preventScroll: true }); };
  }, []);
  const value = (modifier: string, quality: number, level: number) => equipmentValue(catalog, modifier,
    equipmentRuleValue(catalog, slot.id, modifier, quality, level));
  return <dialog ref={dialog} className="ui-panel ui-controls equipment-guide" aria-labelledby={`${id}-title`}
    onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>
    <header className="ui-panel-heading"><h2 id={`${id}-title`}>Equipment guide</h2><button className="ui-button" onClick={onClose}>Close guide</button></header>
    <div className="equipment-guide-body"><section><h3>Level-ups and rerolls</h3>
      <p>Each Pokémon has six equipment pieces, with five stat slots each. Only primary &amp; secondary stats scale with equipment level.</p>
      <p>A level-up costs the new level in matching Shards and {catalog.moneyPerShard} money per Shard, up to level {catalog.maxLevel}.
        A reroll costs {catalog.rerollCost.shards} matching Shards and {catalog.rerollCost.money.toLocaleString("en-US")} money.</p>
      <p>Rerolls replace one slot’s modifier and quality. You can’t keep the old roll. A weaker or identical result still spends the cost.</p></section>
      {type && slot && <><section><h3>What can roll?</h3><label htmlFor={`${id}-piece`}>Equipment</label>
        <select id={`${id}-piece`} value={type.id} onChange={event => setTypeId(event.target.value)}>{catalog.types.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <label htmlFor={`${id}-slot`}>Stat slot rules</label><select id={`${id}-slot`} value={slot.id} onChange={event => setSlotId(event.target.value)}>
          {catalog.slots.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <p>{slot.scalesWithLevel ? "Scales with equipment level." : "Substats do not scale with equipment level."} {pool.length === 1 ? "This slot always keeps its modifier." : "Each listed modifier is equally likely."}
          {" "}Quality is rolled independently: every integer from 0 to 100 is equally likely.</p>
        <table className="equipment-guide-table"><thead><tr><th>Modifier</th><th>At level 1</th><th>At level {catalog.maxLevel}</th></tr></thead><tbody>{pool.map(key =>
          <tr key={key}><th scope="row">{catalog.modifiers.find(item => item.id === key)?.description}</th><td>{value(key, 0, 1)}–{value(key, 100, 1)}</td>
            <td>{value(key, 0, catalog.maxLevel)}–{value(key, 100, catalog.maxLevel)}</td></tr>)}</tbody></table>
        <p>Ranges show 0% → 100% quality, rounded to whole values. Equal chances for quality do not mean equal chances for each rounded value.</p></section>
      {modifier && <section><h3>How quality and level scale</h3><p>Quality sets the position between a modifier’s minimum and maximum. Primary and secondary multiply that value by equipment level. The result rounds to the nearest whole number.</p>
        <label htmlFor={`${id}-modifier`}>Modifier</label><select id={`${id}-modifier`} value={modifier.id} onChange={event => setModifierId(event.target.value)}>
          {pool.map(key => <option key={key} value={key}>{catalog.modifiers.find(item => item.id === key)?.description}</option>)}</select>
        <label htmlFor={`${id}-quality`}>Quality · {quality}%</label><input id={`${id}-quality`} type="range" min="0" max="100" value={quality} onChange={event => setQuality(Number(event.target.value))} />
        <label htmlFor={`${id}-level`}>Equipment level · {level}</label><input id={`${id}-level`} type="range" min="1" max={catalog.maxLevel} value={level} disabled={!slot.scalesWithLevel} onChange={event => setLevel(Number(event.target.value))} />
        <output aria-live="polite">{modifier.description}: {value(modifier.id, quality, level)}</output>
        <p className="equipment-helper">({modifier.min} + ({modifier.max} − {modifier.min}) × {quality}%){slot.scalesWithLevel ? ` × ${level}` : " · Substats do not scale with level."}</p></section>}</>}
      <section><h3>How modifiers affect Pokémon stats</h3><p><strong>Base</strong> adds to the species’ base stat before Pokémon level and nature are applied.</p>
        <p><strong>Percent</strong> adds to the percentage multiplier applied after level and nature. Percent modifiers stack additively.</p>
        <p><strong>Flat</strong> adds to the final stat, scaled by Pokémon level ÷ 100 and rounded down. At Pokémon level 100, the full amount applies.</p>
        <p>Rarity multipliers apply after equipment. A modifier’s displayed value is not always the same as the final Pokémon stat gain.</p></section>
    </div>
  </dialog>;
}
