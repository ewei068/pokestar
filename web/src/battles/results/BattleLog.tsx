import type { BattleLogEntry } from '../playback';

export const BattleLog = ({ entries, playing, onSkip }: { entries: BattleLogEntry[]; playing: boolean; onSkip: () => void }) => {
  const groups = new Map<number, BattleLogEntry[]>();
  for (const entry of entries) groups.set(entry.revision, [...(groups.get(entry.revision) || []), entry]);
  return <section className="arena-history" aria-label="Battle log">
    <div className="arena-section-heading"><h2>Battle log</h2>
      {playing && <button type="button" className="arena-skip" onClick={onSkip}>Skip animations</button>}</div>
    {entries.length === 0 ? <p className="arena-muted">New actions will appear here.</p> :
      <div className="arena-log-groups">{[...groups.entries()].reverse().map(([revision, lines]) =>
        <section key={revision} className="arena-log-action"><h3>Turn {lines[0].turn} <span>Action {revision}</span></h3>
          <ol>{lines.map(entry => <li key={entry.id}>{entry.text}</li>)}</ol>
        </section>)}</div>}
  </section>;
};
