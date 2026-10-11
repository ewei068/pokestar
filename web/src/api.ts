import type { BattleAction, BattleCatalog, BattleResponse, BattleSummary } from "./types";

const apiOrigin = import.meta.env.VITE_API_ORIGIN || "";

class ApiError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${apiOrigin}/api${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.error || error.reason || "request_failed");
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

export const isApiError = (error: unknown, status: number): boolean =>
  error instanceof ApiError && error.status === status;

export const loginUrl = (): string => {
  const returnTo = `${import.meta.env.BASE_URL}${window.location.search}`;
  return `${apiOrigin}/api/auth/discord/login?returnTo=${encodeURIComponent(returnTo)}`;
};

export const getMe = () => request<{ discordUserId: string }>("/me");
export const getCatalog = () => request<BattleCatalog>("/catalog");
export const listBattles = async () =>
  (await request<{ battles: BattleSummary[] }>("/battles")).battles;
export const getBattle = (battleId: string, since?: number) =>
  request<BattleResponse>(`/battles/${encodeURIComponent(battleId)}${
    since === undefined ? "" : `?since=${since}`
  }`);
export const submitAction = (
  battleId: string,
  expectedRevision: number,
  action: BattleAction,
) => request<BattleResponse>(`/battles/${encodeURIComponent(battleId)}/actions`, {
  method: "POST",
  body: JSON.stringify({ expectedRevision, requestId: crypto.randomUUID(), action }),
});

export const logout = () => request<void>("/auth/logout", { method: "POST" });
