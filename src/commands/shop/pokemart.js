/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * pokemart.js Is file that creates an interactive pokemart for the user to buy items from.
 */
const { setState, deleteState } = require("../../services/state");
const { buildShopSend } = require("../../services/shop");

/**
 * Parses the shop config, returning an interactive embed for the user to
 * browse the shop.
 * @param {String} user User who initiated the command.
 * @returns Embed with shop options.
 */
const pokemart = async (user) => {
  // build selection list of shop categories
  const stateId = setState(
    {
      userId: user.id,
      messageStack: [],
    },
    150
  );

  const { send, err } = await buildShopSend({
    stateId,
    user,
    view: "shop",
    option: null,
  });
  if (err) {
    deleteState(stateId);
  }

  return { send, err };
};

const pokemartMessageCommand = async (message) => {
  const { send, err } = await pokemart(message.author);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

const pokemartSlashCommand = async (interaction) => {
  const { send, err } = await pokemart(interaction.user);
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
};

module.exports = {
  message: pokemartMessageCommand,
  slash: pokemartSlashCommand,
};
