import { useLayoutEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import type { PlaybackFrame } from '../playback';
import type { BattleTile, BattleView } from '../types';
import { BoardVfx } from '../vfx/BoardVfx';
import type { VfxType } from '../vfx/types';
import { resultAnimationConfig as config } from './config';

/** Reuse the approved tile recipes directly, without a move approach or actor motion. */
export const StatusVfx = ({ boardRef, frame, view }: {
  boardRef: RefObject<HTMLDivElement>; frame: PlaybackFrame; view: BattleView;
}) => {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  useLayoutEffect(() => { setStartedAt(performance.now()); }, [frame.id]);
  const groups = useMemo(() => {
    const groups = new Map<VfxType, BattleTile[]>();
    for (const change of frame.changes.statuses) {
      if (change.removed) continue;
      const pokemon = view.pokemon[change.pokemonId];
      if (!pokemon || pokemon.isFainted) continue;
      const type = config.reactions.status.types[change.statusId] || config.reactions.status.fallbackType;
      const tiles = groups.get(type) || [];
      tiles.push({ teamName: pokemon.teamName, position: pokemon.position }); groups.set(type, tiles);
    }
    return [...groups];
  }, [frame, view]);
  return <>{startedAt !== null && groups.map(([type, tiles]) => <BoardVfx key={type} boardRef={boardRef}
    event={frame.event} view={view} tiles={tiles} type={type} kind="status" startedAt={startedAt} delayMs={0} />)}</>;
};
