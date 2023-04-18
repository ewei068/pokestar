const { eventNames, eventConfig } = require("../config/eventConfig.js");
const { logger } = require("../log");
const { addExpAndMoney: addExpAndMoney } = require("../services/trainer");
const path = require("path");

const eventHandlers = {};

for (const eventName in eventConfig) { 
    const config = eventConfig[eventName];
    const filePath = path.join(__dirname, "../events", config.execute);
    eventHandlers[eventName] = require(filePath);
}

const handleEvent = async (interaction, client) => {
    const data = JSON.parse(interaction.customId);
    const eventName = data.eventName;

    // if event not in handler, return
    if (!eventHandlers[eventName]) {
        logger.warn(`Event ${eventName} not found in event handlers`);
        return;
    }

    // execute event
    try {
        res = await eventHandlers[eventName](interaction, data, client);
        if (res && res.err) {
            logger.warn(`Error executing event ${eventName}`);
            return;
        }
        
        // add exp & money if possible
        const exp = eventConfig[eventName].exp || 0;
        const money = eventConfig[eventName].money || 0;
        if (exp > 0 || money > 0) {
            const { level, err } = await addExpAndMoney(interaction.user, exp, money);
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
