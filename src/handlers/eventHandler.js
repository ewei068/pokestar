/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * eventHandler.js Handles all events the user can create while playing the game.
 */
const path = require("path");
const { eventConfig } = require("../config/eventConfig");
const { logger } = require("../log");
const { addExpAndMoney } = require("../services/trainer");
const { triggerBoundCallback } = require("../deact/deact");
const {
  setInteractionInstance,
  removeInteractionInstance,
} = require("../deact/interactions");

const eventHandlers = {};
const eventsDirectory = path.join(__dirname, "../events");

for (const eventName in eventConfig) {
  const config = eventConfig[eventName];
  if (!config.execute) {
    continue;
  }

  let filePath = eventsDirectory;
  if (config.directory) {
    filePath = path.join(filePath, config.directory);
  }
  filePath = path.join(filePath, config.execute);
  // eslint-disable-next-line global-require, import/no-dynamic-require
  eventHandlers[eventName] = require(filePath);
}

const handleEvent = async (interaction, client) => {
  const data = JSON.parse(interaction.customId);
  const { eventName } = data;

  // if event not in handler, return
  if (!eventHandlers[eventName] && !data.dSID) {
    // logger.warn(`Event ${eventName} not found in event handlers`);
    return;
  }

  // execute event
  try {
    let res;
    if (data.dSID) {
      setInteractionInstance(interaction);
      res = await triggerBoundCallback(interaction, data);
    } else {
      res = await eventHandlers[eventName](interaction, data, client);
    }
    removeInteractionInstance(interaction);
    if (res && res.err) {
      // send ephemeral message
      const send = {
        content: `${res.err}`,
        ephemeral: true,
      };
      try {
        await interaction.reply(send);
      } catch (error) {
        await interaction.followUp(send);
      }

      return;
    }

    // TODO: Deact handler?
    // add exp & money if possible
    const exp = eventConfig[eventName]?.exp || 0;
    const money = eventConfig[eventName]?.money || 0;
    if (exp > 0 || money > 0) {
      const { level, err } = await addExpAndMoney(interaction.user, exp, money);
      if (level && !err) {
        const levelString = `You leveled up to level ${level}! Use \`/levelrewards\` to claim you level rewards.`;
        try {
          await interaction.reply(levelString);
        } catch (error) {
          await interaction.followUp(levelString);
        }
      }
    }
  } catch (error) {
    logger.error(`Error executing event ${eventName}`);
    logger.error(error);
  }
};

module.exports = {
  handleEvent,
};
