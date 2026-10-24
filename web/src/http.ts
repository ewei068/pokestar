import { loginReturnTo } from "./auth/loginState";

const apiOrigin = import.meta.env?.VITE_API_ORIGIN || "";

class ApiError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

export const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
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

const authRequest = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    return await request<T>(path, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
};

export const startLogin = async (): Promise<string> => {
  const returnTo = loginReturnTo(import.meta.env?.BASE_URL || "/", window.location.search);
  const result = await authRequest<{ authorizationUrl: string }>(`/auth/discord/login?returnTo=${encodeURIComponent(returnTo)}`,
    { headers: { Accept: "application/json" } });
  const url = new URL(result.authorizationUrl);
  if (url.origin !== "https://discord.com" || url.pathname !== "/oauth2/authorize") throw new Error("Invalid sign-in destination");
  return url.toString();
};

export const getMe = async () => {
  const me = await authRequest<{ discordUserId: string }>("/me");
  if (typeof me.discordUserId !== "string" || !me.discordUserId) throw new Error("Invalid session response");
  return me;
};
export const logout = () => authRequest<void>("/auth/logout", { method: "POST" });
