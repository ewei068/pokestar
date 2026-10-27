import { loginReturnTo } from "./auth/loginState";

const apiOrigin = import.meta.env?.VITE_API_ORIGIN || "";

export class ApiError extends Error {
  constructor(public status: number, public code: string, public retryAt: number | null = null) {
    super(code);
  }
}

const retryDeadline = (header: string | null): number => {
  const now = Date.now();
  const value = header?.trim() || "";
  const delay = /^\d+$/.test(value) ? Number(value) * 1000
    : /^[A-Za-z]{3}, /.test(value) ? Date.parse(value) - now : NaN;
  return now + (Number.isFinite(delay) && delay >= 0 ? Math.max(1000, delay) : 60000);
};

export const rateLimitDeadline = (error: unknown): number | null =>
  error instanceof ApiError && error.status === 429 ? error.retryAt : null;

export const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  if (options.signal?.aborted) abort();
  const timeout = setTimeout(abort, 15000);
  try {
    const response = await fetch(`${apiOrigin}/api${path}`, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiError(response.status, error.error || error.reason || "request_failed",
        response.status === 429 ? retryDeadline(response.headers.get("Retry-After")) : null);
    }
    if (response.status === 204) return undefined as T;
    return await response.json() as T;
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abort);
  }
};

export const isApiError = (error: unknown, status: number): boolean =>
  error instanceof ApiError && error.status === status;

export const startLogin = async (): Promise<string> => {
  const returnTo = loginReturnTo(import.meta.env?.BASE_URL || "/", window.location.search);
  const result = await request<{ authorizationUrl: string }>(`/auth/discord/login?returnTo=${encodeURIComponent(returnTo)}`,
    { headers: { Accept: "application/json" } });
  const url = new URL(result.authorizationUrl);
  if (url.origin !== "https://discord.com" || url.pathname !== "/oauth2/authorize") throw new Error("Invalid sign-in destination");
  return url.toString();
};

export const getMe = async () => {
  const me = await request<{ discordUserId: string }>("/me");
  if (typeof me.discordUserId !== "string" || !me.discordUserId) throw new Error("Invalid session response");
  return me;
};
export const logout = () => request<void>("/auth/logout", { method: "POST" });
