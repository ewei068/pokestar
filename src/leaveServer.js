require('dotenv').config();

const { Client, Events, GatewayIntentBits } = require('discord.js');
const { runMessageCommand, runSlashCommand, prefix } = require('./handlers/commandHandler.js');
const { handleEvent } = require('./handlers/eventHandler.js');
const { logger } = require('./log');
const { checkRateLimit } = require('./services/rateLimit.js');
const { createDjsClient } = require("discordbotlist");
const express = require('express');
const cors = require('cors');
const { addVote } = require('./services/trainer.js');
const { stageNames } = require('./config/stageConfig.js');
const { poll, formatMoney } = require('./utils/utils.js');
const axios = require('axios');


// Create a new client instance
const client = new Client({ intents: 
    [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        // GatewayIntentBits.MessageContent
    ] 
});

client.once(Events.ClientReady, async c => {
	logger.info(`Ready! Logged in as ${c.user.tag}`);

    // leave server at an id
    try {
        await client.guilds.cache.get(process.argv[2]).leave();
        console.log(`Left server ${process.argv[2]}`)
    } catch (error) {
        logger.error(error);
    }
});

// Log in to Discord with your client's token
const token = process.env.DISCORD_TOKEN;
client.login(token);
