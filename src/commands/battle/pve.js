/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * pve.js is the encapsulating program for the PVE system.
 */
const { setState, deleteState } = require("../../services/state");
const { buildPveSend } = require("../../services/battle");

/**
 * the encapsulating program for the PVE system.
 * @param {*} user the user given to get the relevant data from.
 * @param {*} npcId the Id of the npc to fight.
 * @param {*} difficulty the difficulty of the npc you're fighting.
 * @returns Error or message to send.
 */
const pve = async (user, npcId, difficulty) => {
  // if no npc, build list
  if (!npcId) {
    const stateId = setState(
      {
        userId: user.id,
      },
      300
    );
    const { send, err } = await buildPveSend({
      stateId,
      user,
      view: "list",
      option: null,
      page: 1,
    });
    if (err) {
      deleteState(stateId);
    }
    return { send, err };
  }
  if (!difficulty) {
    // if no difficulty, build npc data
    const stateId = setState(
      {
        userId: user.id,
      },
      300
    );
    const { send, err } = await buildPveSend({
      stateId,
      user,
      view: "npc",
      option: npcId,
      page: 1,
    });
    if (err) {
      deleteState(stateId);
    }
    return { send, err };
  }
  // otherwise build with given npc and difficulty
  const stateId = setState(
    {
      userId: user.id,
      npcId,
      difficulty,
    },
    300
  );
  const { send, err } = await buildPveSend({
    stateId,
    user,
    view: "battle",
  });
  if (err) {
    deleteState(stateId);
  }
  return { send, err };
};

const pveMessageCommand = async (message) => {
  const args = message.content.split(" ");
  const npcId = args[1];
  const difficulty = args[2];
  const { send, err } = await pve(message.author, npcId, difficulty);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

const pveSlashCommand = async (interaction) => {
  const npcId = interaction.options.getString("npcid");
  const difficulty = interaction.options.getString("difficulty");
  const { send, err } = await pve(interaction.user, npcId, difficulty);
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
};

module.exports = {
  message: pveMessageCommand,
  slash: pveSlashCommand,
};
