import { useLayoutEffect, useRef, useState } from 'react';
import { VList } from 'virtua';
import type { VListHandle } from 'virtua';
import type { BattleLogEntry } from '../playback';
import { resultAnimationConfig as config } from './config';

/** Full session history, with only the viewport and a small overscan mounted. */
export const BattleLog = ({ entries, playing, onSkip }: { entries: BattleLogEntry[]; playing: boolean; onSkip: () => void }) => {
  const list = useRef<VListHandle>(null);
  const follow = useRef(true);
  const [following, setFollowing] = useState(true);
  const latest = () => {
    follow.current = true; setFollowing(true);
    if (entries.length) list.current?.scrollToIndex(entries.length - 1, { align: 'end' });
  };
  useLayoutEffect(() => {
    if (follow.current && entries.length) list.current?.scrollToIndex(entries.length - 1, { align: 'end' });
  }, [entries.length]);
  return <section className="arena-history" aria-label="Battle log">
    <div className="arena-section-heading"><h2>Battle log <small>{entries.length} entries</small></h2>
      <div className="arena-log-controls">{!following && <button type="button" className="arena-skip" onClick={latest}>Latest</button>}
        {playing && <button type="button" className="arena-skip" onClick={onSkip}>Skip animations</button>}</div>
    </div>
    {entries.length === 0 ? <p className="arena-muted">New actions will appear here.</p> :
      <VList ref={list} data={entries} className="arena-log-list" style={{ height: config.log.viewportPx }}
        role="list" aria-label="Event history" tabIndex={0}
        onResize={() => {
          if (follow.current && entries.length) list.current?.scrollToIndex(entries.length - 1, { align: 'end' });
        }}
        onScroll={offset => {
          const handle = list.current; if (!handle) return;
          const atLatest = handle.scrollSize - handle.viewportSize - offset <= config.log.followThresholdPx;
          follow.current = atLatest; setFollowing(atLatest);
        }}>
        {(entry, index) => <div key={entry.id} role="listitem" className="arena-log-entry"
          aria-posinset={index + 1} aria-setsize={entries.length} data-log-id={entry.id}>
          {(index === 0 || entries[index - 1].revision !== entry.revision) &&
            <h3>Turn {entry.turn} <span>Action {entry.revision}</span></h3>}
          <p>{entry.text}</p>
        </div>}
      </VList>}
  </section>;
};
