const { eventNames, eventConfig } = require("../config/eventConfig.js");
const { logger } = require("../log");
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
        await eventHandlers[eventName](interaction, data);
    } catch (error) {
        logger.error(`Error executing event ${eventName}`);
        logger.error(error);
    }
}

module.exports = {
    handleEvent,
};
