import { useId, type ReactNode } from "react";
import type { PokemonBuildContext } from "../player/types";

const statNames = ["HP", "Attack", "Defense", "Sp. Atk", "Sp. Def", "Speed"];
const effect = (nature: { raisedStat: number | null; loweredStat: number | null }) => nature.raisedStat === null || nature.loweredStat === null
  ? "No stat changes" : `↑ ${statNames[nature.raisedStat]} · ↓ ${statNames[nature.loweredStat]}`;

export type NatureEditorProps = {
  context: PokemonBuildContext;
  natureId: string;
  onNatureChange: (id: string) => void;
  disabled?: boolean;
  children?: ReactNode;
};

/** Values come from the server's prospective build; the client never derives nature stats. */
export function NatureEditor({ context, natureId, onNatureChange, disabled = false, children }: NatureEditorProps) {
  const id = useId();
  const selected = context.natures.find(nature => nature.id === natureId);
  return <div className="nature-editor ui-controls">
    <p className="build-current-label">Current nature</p><h3>{context.pokemon.nature.name}</h3>
    <p className="build-effect">{effect(context.pokemon.nature)}</p>
    <label className="build-field" htmlFor={id}>New nature</label>
    <select id={id} value={selected?.id || ""} onChange={event => onNatureChange(event.target.value)} disabled={disabled}>
      <option value="">Choose a nature…</option>
      {context.natures.map(nature => <option key={nature.id} value={nature.id}>
        {nature.name} · {effect(nature)}{nature.id === context.pokemon.nature.id ? " · Current" : ""}
      </option>)}
    </select>
    {selected && <p className="build-effect">{effect(selected)}</p>}
    <table className="nature-stats"><thead><tr><th scope="col">Stat</th><th scope="col">Current</th><th scope="col">{selected ? "After" : "Preview"}</th></tr></thead>
      <tbody>{statNames.map((name, index) => {
        const before = context.pokemon.stats[index];
        const after = selected?.stats[index];
        const delta = after === undefined ? 0 : after - before;
        return <tr key={name} className={delta ? "is-changed" : undefined}><th scope="row">{name}</th><td>{before}</td>
          <td><span>{after ?? "—"}</span>{delta !== 0 && <small className={delta > 0 ? "is-raised" : "is-lowered"}> {delta > 0 ? "+" : "−"}{Math.abs(delta)}</small>}</td></tr>;
      })}</tbody></table>
    {children}
  </div>;
}
