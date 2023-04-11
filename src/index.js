// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { runMessageCommand, runSlashCommand } = require('./handlers/commandHandler.js');
const { handleEvent } = require('./handlers/eventHandler.js');
const { logger } = require('./log');

// Create a new client instance
const client = new Client({ intents: 
    [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

client.on(Events.MessageCreate, async (message) => {
    runMessageCommand(client, message).then(() => {
        // do nothing
    }).catch((error) => {
        logger.error(`Error in message command: ${message.content}`);
        logger.error(error);
        message.reply("There was an error trying to execute that command!");
    });
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    runSlashCommand(interaction).then(() => {
        // do nothing
    }).catch(async (error) => {
        logger.error(`Error in slash command: ${interaction.commandName}`);
        logger.error(error);
        try {
            await interaction.reply("There was an error trying to execute that command!");
        } catch (error) {
            interaction.followUp("There was an error trying to execute that command!");
        }
    });
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    // logger.info(interaction)
    // turn interaction customId into json
    // logger.info(JSON.parse(interaction.customId));
    try {
        await handleEvent(interaction);
    } catch (error) {
        logger.error(`Error in event handler: ${interaction.customId}`);
        logger.error(error);
    }
});

// On guild join, log it
client.on(Events.GuildCreate, (guild) => {
    logger.info(`Joined guild: ${guild.name} (${guild.id})`);
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	logger.info(`Ready! Logged in as ${c.user.tag}`);
    client.user.setActivity(`psa!help | psa!ti`);
    // log connected guilds
    let guildString = "";
    client.guilds.cache.forEach(guild => {
        guildString += `${guild.name} (${guild.id})\n`;
    });
    logger.info(`Connected to guilds: \n${guildString}`);
});

// Log in to Discord with your client's token
const token = process.env.DISCORD_TOKEN;
client.login(token);
