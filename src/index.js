// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { runMessageCommand, runSlashCommand } = require('./commands/commandHandler.js');
const { logger } = require('./log');

// Create a new client instance
const client = new Client({ intents: 
    [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

client.on(Events.MessageCreate, (message) => {
    runMessageCommand(client, message).then(() => {
        // do nothing
    }).catch((error) => {
        logger.error(error);
        message.reply("There was an error trying to execute that command!");
    });
});

client.on(Events.InteractionCreate, (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    runSlashCommand(interaction).then(() => {
        // do nothing
    }).catch((error) => {
        logger.error(error);
        interaction.reply("There was an error trying to execute that command!");
    });
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	logger.info(`Ready! Logged in as ${c.user.tag}`);
    client.user.setActivity(`psa!help | psa!ti`);
});

// Log in to Discord with your client's token
const token = process.env.DISCORD_TOKEN;
client.login(token);
