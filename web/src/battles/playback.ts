import { eventText } from "./eventText";
import type { BattleCatalog, BattleEvent, BattleResponse, BattleView } from "./types";

export type PlaybackFrame = { event: BattleEvent; view: BattleView; text: string | null };

/** Derive only newly observed frames. Opening a battle starts at its current view. */
export const newPlaybackFrames = (
  previousRevision: number | null,
  response: BattleResponse,
  catalog: BattleCatalog,
): PlaybackFrame[] => {
  if (previousRevision === null || response.revision <= previousRevision) return [];
  return response.updates
    .filter((update) => update.revision > previousRevision)
    .flatMap((update) => update.events.map((event) => {
      const view = update.view || response.view;
      const text = eventText(event, view, catalog);
      return { event, view, text };
    }));
};
