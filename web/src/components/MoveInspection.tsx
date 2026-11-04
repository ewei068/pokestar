import { TypeBadge } from "./TypeBadge";

export type MoveInspectionData = {
  name?: string;
  damageType?: string;
  power?: number;
  accuracy?: number;
  cooldown?: number;
  description?: string;
};

export type MoveInspectionProps = {
  move: MoveInspectionData;
  fallbackName?: string;
  type?: string;
};

const ClockIcon = () => <svg className="ui-fact-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
  <circle cx="8" cy="8" r="6" /><path d="M8 4v4l3 2" />
</svg>;
const turns = (count: number) => `${count} ${count === 1 ? "turn" : "turns"}`;

export const MoveInspection = ({ move, fallbackName, type }: MoveInspectionProps) => <>
  <div className="ui-detail-title"><h3>{move.name || fallbackName}</h3>{type && <TypeBadge type={type} />}</div>
  <dl className="ui-detail-facts" aria-label="Move details">
    <div><dt><span aria-hidden="true">{move.damageType === "Physical" ? "⚔" : move.damageType === "Special" ? "✦" : "◌"}</span> Category</dt>
      <dd>{move.damageType === "Physical" || move.damageType === "Special" ? move.damageType : "Status"}</dd></div>
    <div><dt><span aria-hidden="true">✹</span> Power</dt><dd>{move.power ?? "—"}</dd></div>
    <div><dt><span aria-hidden="true">◎</span> Accuracy</dt><dd>{move.accuracy ?? "—"}</dd></div>
    <div><dt><ClockIcon /> Cooldown</dt><dd>{move.cooldown === undefined ? "—" : turns(move.cooldown)}</dd></div>
  </dl>
  <p>{move.description || "No description available."}</p>
</>;
