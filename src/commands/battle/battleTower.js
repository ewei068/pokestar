/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * battleTwoer.js is used to run the game's battle tower system, specifically the commands within.
 */
const { setState, deleteState } = require("../../services/state");
const { buildBattleTowerSend } = require("../../services/battle");
const { getTrainer } = require("../../services/trainer");
const { battleTowerConfig } = require("../../config/npcConfig");

/**
 * Creates the tower via encapsulating buildBattleTowerSend and giving it the required user data
 * @param user user required for creating user specific tower.
 * @returns Error or message to send.
 */
const battleTower = async (user) => {
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { err: trainer.err };
  }

  const stateId = setState(
    {
      userId: user.id,
      towerStage:
        trainer.data.lastTowerStage +
        (trainer.data.lastTowerStage === Object.keys(battleTowerConfig).length
          ? 0
          : 1),
    },
    300
  );
  const { send, err } = await buildBattleTowerSend({
    stateId,
    user,
  });
  if (err) {
    deleteState(stateId);
  }
  return { send, err };
};

// reads in commands (not slash commands) for the user-created tower. and outputs results.
const battleTowerMessageCommand = async (message) => {
  const { send, err } = await battleTower(message.author);
  if (err) {
    await message.channel.send(`${err}`);
    return { err };
  }
  await message.channel.send(send);
};

// reads in slash-commands for the user-created tower and outputs results.
const battleTowerSlashCommand = async (interaction) => {
  const { send, err } = await battleTower(interaction.user);
  if (err) {
    await interaction.reply(`${err}`);
    return { err };
  }
  await interaction.reply(send);
};

// exporting types of commands. this is a common occurrance.
module.exports = {
  message: battleTowerMessageCommand,
  slash: battleTowerSlashCommand,
};
