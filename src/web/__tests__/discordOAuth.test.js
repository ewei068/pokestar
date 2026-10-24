const { exchangeDiscordCode, DiscordOAuthError } = require("../discordOAuth");

const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
const credentials = { code: "code", clientId: "id", clientSecret: "secret", redirectUri: "https://pokestar.example/api/auth/discord/callback" };

describe("Discord authorization exchange", () => {
  it("exchanges a code and projects the Discord identity with bounded requests", async () => {
    const fetchImpl = jest.fn().mockResolvedValueOnce(json({ access_token: "token" }))
      .mockResolvedValueOnce(json({ id: "123", username: "Trainer", email: "private" }));
    expect(await exchangeDiscordCode({ ...credentials, fetchImpl })).toEqual({ id: "123", username: "Trainer" });
    expect(fetchImpl.mock.calls).toHaveLength(2);
    for (const [, options] of fetchImpl.mock.calls) expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it.each([
    [400, { error: "invalid_grant" }, "code_expired"],
    [401, { error: "invalid_client" }, "discord_unavailable"],
    [429, { message: "Rate limited" }, "discord_unavailable"],
    [503, { error: "server_error" }, "discord_unavailable"],
  ])("classifies token failure %s as %s", async (status, body, reason) => {
    const fetchImpl = jest.fn().mockResolvedValueOnce(json(body, status));
    await expect(exchangeDiscordCode({ ...credentials, fetchImpl })).rejects.toMatchObject({ code: reason });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it.each([
    [json({}), null],
    [new Response("not JSON"), null],
    [json({ access_token: "token" }), json({}, 503)],
    [json({ access_token: "token" }), json({ id: null })],
  ])("rejects incomplete or invalid Discord responses", async (tokenResponse, userResponse) => {
    const fetchImpl = jest.fn().mockResolvedValueOnce(tokenResponse).mockResolvedValueOnce(userResponse);
    await expect(exchangeDiscordCode({ ...credentials, fetchImpl })).rejects.toThrow();
  });

  it("does not turn network or timeout errors into a successful identity", async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new Error("Network unavailable"));
    await expect(exchangeDiscordCode({ ...credentials, fetchImpl })).rejects.toThrow("Network unavailable");
    expect(new DiscordOAuthError("code_expired", "Expired")).toBeInstanceOf(Error);
  });
});
