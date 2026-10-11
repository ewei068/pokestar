const { randomBytes, timingSafeEqual } = require("crypto");

const OAUTH_STATE_LIFETIME_MS = 10 * 60 * 1000;
const API_BASE = "https://discord.com/api/v10";

const safeReturnPath = (value) => {
  if (typeof value !== "string" || !value.startsWith("/") ||
      value.startsWith("//") || value.includes("\\") || value.length > 500) {
    return "/";
  }
  return value;
};

const newState = (returnTo) => ({
  nonce: randomBytes(24).toString("base64url"),
  returnTo: safeReturnPath(returnTo),
  createdAt: Date.now(),
});

const encodeState = (state) => Buffer.from(JSON.stringify(state)).toString("base64url");
const decodeState = (encoded) => {
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }
};

const validState = (cookieValue, queryState) => {
  const state = decodeState(cookieValue);
  if (!state || typeof state.nonce !== "string" ||
      !Number.isFinite(state.createdAt) ||
      typeof queryState !== "string" ||
      Date.now() - state.createdAt > OAUTH_STATE_LIFETIME_MS ||
      Date.now() < state.createdAt) return null;
  const expected = Buffer.from(state.nonce);
  const received = Buffer.from(queryState);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }
  return safeReturnPath(state.returnTo);
};

const authorizationUrl = ({ clientId, redirectUri, state }) => {
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("scope", "identify");
  url.searchParams.set("state", state);
  url.searchParams.set("redirect_uri", redirectUri);
  return url.toString();
};

const exchangeDiscordCode = async ({
  code, clientId, clientSecret, redirectUri, fetchImpl = fetch,
}) => {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenResponse = await fetchImpl(`${API_BASE}/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!tokenResponse.ok) throw new Error("Discord token exchange failed");
  const token = await tokenResponse.json();
  if (!token.access_token) throw new Error("Discord token response missing access token");

  const userResponse = await fetchImpl(`${API_BASE}/users/@me`, {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!userResponse.ok) throw new Error("Discord user lookup failed");
  const user = await userResponse.json();
  if (typeof user.id !== "string" || !/^\d+$/.test(user.id)) {
    throw new Error("Discord user response missing ID");
  }
  return { id: user.id, username: user.username };
};

module.exports = {
  OAUTH_STATE_LIFETIME_MS,
  newState,
  encodeState,
  validState,
  authorizationUrl,
  exchangeDiscordCode,
};
