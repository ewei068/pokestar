const { createVoteWebhook } = require("../voteWebhook");

const invoke = async (config, authorization, rewardError = null) => {
  const addVote = jest.fn().mockResolvedValue({ err: rewardError });
  const logger = { info: jest.fn(), error: jest.fn() };
  const response = { sendStatus: jest.fn() };
  await createVoteWebhook({ addVote, logger, config })({
    header: () => authorization,
    body: { id: "dbl-user", user: "topgg-user" },
  }, response);
  return { addVote, response };
};

describe("vote webhook authorization", () => {
  it.each([
    [{}, undefined],
    [{ TOPGG_SECRET: "topgg-test" }, undefined],
    [{ DBL_SECRET: "dbl-test" }, undefined],
    [{ DBL_SECRET: "", TOPGG_SECRET: "" }, ""],
    [{ DBL_SECRET: "dbl-test", TOPGG_SECRET: "topgg-test" }, undefined],
    [{ DBL_SECRET: "dbl-test", TOPGG_SECRET: "topgg-test" }, "wrong"],
  ])("rejects missing or invalid credentials without granting rewards (%j)", async (config, header) => {
    const { addVote, response } = await invoke(config, header);
    expect(addVote).not.toHaveBeenCalled();
    expect(response.sendStatus).toHaveBeenCalledWith(401);
  });

  it("accepts configured DBL credentials with the existing reward payload", async () => {
    const { addVote, response } = await invoke({ DBL_SECRET: "dbl-test" }, "dbl-test");
    expect(addVote).toHaveBeenCalledTimes(1);
    expect(addVote).toHaveBeenCalledWith({ id: "dbl-user", user: "topgg-user" });
    expect(response.sendStatus).toHaveBeenCalledWith(200);
  });

  it("accepts configured TOPGG credentials when DBL is unconfigured", async () => {
    const { addVote, response } = await invoke({ TOPGG_SECRET: "topgg-test" }, "topgg-test");
    expect(addVote).toHaveBeenCalledTimes(1);
    expect(addVote).toHaveBeenCalledWith({ id: "topgg-user" }, 2);
    expect(response.sendStatus).toHaveBeenCalledWith(200);
  });

  it("preserves retryable failures for authenticated reward processing", async () => {
    const { response } = await invoke({ DBL_SECRET: "dbl-test" }, "dbl-test", "database unavailable");
    expect(response.sendStatus).toHaveBeenCalledWith(500);
  });
});
