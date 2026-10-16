import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { PlaybackFrame } from '../playback';
import type { BattleView } from '../types';
import { resultAnimationConfig as config } from './config';

type Anchor = { x: number; y: number; central: boolean; width: number };
/** Text is a generic event presentation; custom event treatments can replace it here. */
export const EventAnnouncement = ({ boardRef, frame, view, reducedMotion }: {
  boardRef: RefObject<HTMLDivElement>; frame: PlaybackFrame; view: BattleView; reducedMotion: boolean;
}) => {
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const board = boardRef.current; if (!board) return;
    const measure = () => {
      const bounds = board.getBoundingClientRect();
      const pokemon = frame.cue?.subjectId ? view.pokemon[frame.cue.subjectId] : undefined;
      const cell = pokemon && Array.from(board.querySelectorAll<HTMLElement>('.arena-cell')).find(item =>
        item.dataset.teamName === pokemon.teamName && Number(item.dataset.position) === pokemon.position);
      const sprite = cell?.querySelector('.arena-sprite')?.getBoundingClientRect();
      const central = !sprite;
      const x = sprite ? sprite.left + sprite.width / 2 - bounds.left : bounds.width / 2;
      const available = Math.max(0, Math.min(x, bounds.width - x) - config.text.edgePaddingPx) * 2;
      const width = Math.min(config.text.maxWidthPx, available,
        central ? bounds.width : (cell?.clientWidth || bounds.width) + config.text.targetOverhangPx);
      setAnchor({ central, width, x,
        y: sprite ? sprite.top + sprite.height / 2 - bounds.top : bounds.height / 2 });
    };
    measure(); window.addEventListener('resize', measure);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(board);
    return () => { window.removeEventListener('resize', measure); observer?.disconnect(); };
  }, [boardRef, frame.id, frame.cue?.subjectId, view]);
  useLayoutEffect(() => {
    const label = labelRef.current; if (!label?.animate || !anchor || reducedMotion) return;
    const text = config.text;
    const animation = label.animate([
      { opacity: 0, transform: `translateY(0) scale(${text.startScale})`, offset: 0 },
      { opacity: 1, transform: `translateY(-${text.entryRisePx}px) scale(1)`, offset: text.fadeInEnd },
      { opacity: 1, offset: text.fadeStart },
      { opacity: 0, transform: `translateY(-${text.risePx}px) scale(1)`, offset: 1 },
    ], { duration: text.durationMs, easing: text.easing, fill: 'both' });
    return () => animation.cancel();
  }, [frame.id, anchor?.central, reducedMotion, !!anchor]);
  if (!frame.cue || !anchor) return null;
  const label = anchor.central ? frame.text : frame.cue.label;
  return <div className={`arena-announcement ${anchor.central ? 'is-central' : 'is-anchored'} is-${frame.cue.tone}`}
    style={{ left: anchor.x, top: anchor.y, width: anchor.width, fontSize: anchor.central ? config.text.centralFontSizePx : config.text.fontSizePx }}
    role="status" aria-label={frame.text || undefined} data-event-type={frame.event.type} data-event-id={frame.id}>
    <span ref={labelRef}>{label}</span>
  </div>;
};
