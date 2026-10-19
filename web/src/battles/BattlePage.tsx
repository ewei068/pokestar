import { useEffect } from "react";
import { BattleScreen } from "./BattleScreen";
import { useBattleAudio } from "./audio/useBattleAudio";
import { useBattleMusic } from "./audio/useBattleMusic";
import type { BattleCatalog } from "./types";
import { useBattleSession } from "./useBattleSession";

export const BattlePage = ({ battleId, catalog }: { battleId: string; catalog: BattleCatalog }) => {
  const session = useBattleSession(battleId, catalog);
  const audio = useBattleAudio();
  const musicThemeId = session.battle
    ? session.battle.presentation?.musicThemeId ?? null
    : undefined;
  const music = useBattleMusic(battleId, musicThemeId);
  useEffect(() => {
    if (!session.playing || session.waitingForArt) return;
    // StrictMode's effect probe cancels this timer before it can duplicate a cue.
    const timer = window.setTimeout(() => audio.playFrame(session.playing!, catalog, session.reducedMotion), 0);
    return () => window.clearTimeout(timer);
  }, [session.playing?.id, session.waitingForArt, session.reducedMotion, catalog, audio.playFrame]);
  return <BattleScreen catalog={catalog} session={session} audio={audio} music={music} />;
};
