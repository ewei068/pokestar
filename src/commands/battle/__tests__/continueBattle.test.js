jest.mock("../../../services/durableBattle", () => ({ getDurableBattleService: jest.fn() }));
jest.mock("../../../battle/discord/durableBattleMessages", () => ({
  renderBattleList: jest.fn(), renderBattle: jest.fn(),
}));
const { getDurableBattleService } = require("../../../services/durableBattle");
const { renderBattleList, renderBattle } = require("../../../battle/discord/durableBattleMessages");
const command = require("../continueBattle");

describe("continue-battle replies", () => {
  const service = {};
  const send = { content: "Your ongoing battles", components: [] };
  beforeEach(() => {
    jest.clearAllMocks();
    getDurableBattleService.mockResolvedValue(service);
    renderBattleList.mockResolvedValue(send);
    renderBattle.mockResolvedValue(send);
  });

  it("sends message-command results in the invoking channel without a DM", async () => {
    const message = { content: "!continue-battle", author: { id: "trainer", send: jest.fn() },
      channel: { send: jest.fn() }, reply: jest.fn() };
    await command.message(message);
    expect(message.channel.send).toHaveBeenCalledWith(send);
    expect(message.author.send).not.toHaveBeenCalled();
    expect(message.reply).not.toHaveBeenCalled();
  });

  it("uses an ordinary slash reply and retains the selected battle", async () => {
    const interaction = { user: { id: "trainer" }, options: { getString: () => "battle-id" }, reply: jest.fn() };
    await command.slash(interaction);
    expect(renderBattle).toHaveBeenCalledWith(service, "battle-id", "trainer");
    expect(interaction.reply).toHaveBeenCalledWith(send);
  });
});
