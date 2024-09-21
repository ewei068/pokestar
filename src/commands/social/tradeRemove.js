/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * tradeRemove.js is used to add pokemon to the user's trade offer
 */
const { buildTradeRemoveSend } = require("../../services/trade");
const { getIdFromNameOrId } = require("../../services/pokemon");

/**
 * Adds the given pokemon via ID to the position in the given user's trade.
 * @param user user required for getting specific user's data.
 * @param pokemonId the Id of the pokemon the user wants to add to their trade
 * @returns Error or message to send.
 */
// tradeRemove sends off the relevent user, pokemonId and position to buildtradeRemoveSend from the trade.js dependency and waits for it to return.
const tradeRemove = async (user, pokemonId, money) =>
  await buildTradeRemoveSend({
    user,
    pokemonId,
    money,
  });

// turns the message into the relevant info and calls tradeRemove for message commands. returns the result.
const tradeRemoveMessageCommand = async (message) => {
  const args = message.content.split(" ");
  const option = args[1];
  let money = 0;
  let pokemonId = null;

  if (option === "ALL") {
    // pass
  } else if (!Number.isNaN(option)) {
    // if parseInt money is NaN, then it will return null
    money = parseInt(option, 10);
  } else {
    pokemonId = option;
  }
  const { send, err } = await tradeRemove(message.author, pokemonId, money);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

// using the inbuilt commands from the slash interactions, this grabs the pertinent information necessary to run tradeRemove. returns the result.
const tradeRemoveSlashCommand = async (interaction) => {
  const option = interaction.options.getString("option");
  let money = 0;
  let pokemonId = null;
  // if parseInt money is NaN, then it will return null
  if (option === "ALL") {
    // pass
    await interaction.deferReply();
  } else if (!Number.isNaN(option)) {
    // if parseInt money is NaN, then it will return null
    money = parseInt(option, 10);
    await interaction.deferReply();
  } else {
    const idRes = await getIdFromNameOrId(
      interaction.user,
      option,
      interaction
    );
    if (idRes.err) {
      await interaction.editReply(`${idRes.err}`);
      return { err: idRes.err };
    }
    pokemonId = idRes.data;
  }
  const { send, err } = await tradeRemove(interaction.user, pokemonId, money);
  if (err) {
    await interaction.editReply(`${err}`);
    return { err };
  }
  await interaction.editReply(send);
};

module.exports = {
  message: tradeRemoveMessageCommand,
  slash: tradeRemoveSlashCommand,
};
