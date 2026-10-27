import { request } from "../http";
import type { BattleAction, BattleCatalog, BattleResponse, BattleSummary } from "./types";

export const getCatalog = () => request<BattleCatalog>("/catalog");
export const listBattles = async () =>
  (await request<{ battles: BattleSummary[] }>("/battles")).battles;
export const getBattle = async (battleId: string, after?: string, signal?: AbortSignal): Promise<BattleResponse | null> =>
  (await request<BattleResponse | void>(`/battles/${encodeURIComponent(battleId)}${
    after === undefined ? "" : `?after=${encodeURIComponent(after)}`
  }`, { signal })) || null;
export const submitAction = (
  battleId: string,
  expectedRevision: number,
  action: BattleAction,
  signal?: AbortSignal,
) => request<BattleResponse>(`/battles/${encodeURIComponent(battleId)}/actions`, {
  method: "POST",
  signal,
  body: JSON.stringify({ expectedRevision, requestId: crypto.randomUUID(), action }),
});
