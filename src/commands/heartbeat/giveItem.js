const { getTrainer, updateTrainer } = require("../../services/trainer");
const { stageNames } = require("../../config/stageConfig");
const { backpackItems } = require("../../config/backpackConfig");
const { addItems } = require("../../utils/trainerUtils");

// giveItem.js is used to give items to the current user. Only useable in Alpha

const giveItem = async (user, itemId, quantity) => {
  if (process.env.STAGE !== stageNames.ALPHA) {
    return { send: null, err: "This command is not available yet." };
  }
  // TODO: restrict users who can use?
  if (Object.values(backpackItems).indexOf(itemId) === -1) {
    return { send: null, err: "Invalid item" };
  }
  if (!quantity || quantity < 1) {
    return { send: null, err: "Invalid quantity" };
  }

  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { send: null, err: trainer.err };
  }

  addItems(trainer.data, itemId, quantity);

  const updateRes = await updateTrainer(trainer.data);
  if (updateRes.err) {
    return { send: null, err: updateRes.err };
  }

  return { send: "Added items successfully", err: null };
};

const giveItemMessageCommand = async () => ({
  err: "Use the slash command srr",
});

const giveItemSlashCommand = async (interaction) => {
  const itemId = interaction.options.getString("itemid");
  const quantity = interaction.options.getInteger("quantity") || 1;
  const { send, err } = await giveItem(interaction.user, itemId, quantity);
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
};

module.exports = {
  message: giveItemMessageCommand,
  slash: giveItemSlashCommand,
};
