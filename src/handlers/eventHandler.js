const { eventNames, eventConfig } = require("../config/eventConfig.js");
const { logger } = require("../log");
const { addExp } = require("../services/trainer");
const path = require("path");

const eventHandlers = {};

for (const eventName in eventConfig) { 
    const config = eventConfig[eventName];
    const filePath = path.join(__dirname, "../events", config.execute);
    eventHandlers[eventName] = require(filePath);
}

const handleEvent = async (interaction) => {
    const data = JSON.parse(interaction.customId);
    const eventName = data.eventName;

    // if event not in handler, return
    if (!eventHandlers[eventName]) {
        logger.warn(`Event ${eventName} not found in event handlers`);
        return;
    }

    // execute event
    try {
        res = await eventHandlers[eventName](interaction, data);
        if (res && res.err) {
            logger.warn(`Error executing event ${eventName}`);
            logger.warn(res.err);
            return;
        }

        // add exp
        const exp = eventConfig[eventName].exp;
        if (exp && exp > 0) {
            const { level, err } = await addExp(interaction.user, exp);
            if (err) {
                return;
            } else if (level) {
                await interaction.followUp(`You leveled up to level ${level}! Use \`/levelrewards\` to claim you level rewards.`);
            }
        }
    } catch (error) {
        logger.error(`Error executing event ${eventName}`);
        logger.error(error);
    }
}

module.exports = {
    handleEvent,
};
