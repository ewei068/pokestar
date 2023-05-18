// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
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

const corsOptions = {
    origin: true,
    credentials: true
}

// Create a new client instance
const client = new Client({ intents: 
    [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ] 
});

client.on(Events.MessageCreate, async (message) => {
    try {
        if (!checkRateLimit(message.author.id)) return;
    } catch (error) {
        return;
    }

    runMessageCommand(message, client).then(() => {
        // do nothing
    }).catch((error) => {
        try {
            logger.error(`Error in message command: ${message.content}`);
            logger.error(error);
            message.reply("There was an error trying to execute that command!");
        } catch (error) {
            logger.error(`Error in message command: ${message.content}`);
            logger.error(error);
        }
    });
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    try {
        if (!checkRateLimit(interaction.user.id)) return;
    } catch (error) {
        return;
    }

    runSlashCommand(interaction, client).then(() => {
        // do nothing
    }).catch(async (error) => {
        logger.error(`Error in slash command: ${interaction.commandName}`);
        logger.error(error);
        try {
            await interaction.reply("There was an error trying to execute that command!");
        } catch (error) {
            try {
                await interaction.followUp("There was an error trying to execute that command!");
            } catch (error) {
                logger.error(`Error in slash command: ${interaction.commandName}`);
                logger.error(error);
            }
        }
    });
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton() && !interaction.isStringSelectMenu()) return;

    try {
        if (!checkRateLimit(interaction.user.id)) return;
    } catch (error) {
        return;
    }

    try {
        await handleEvent(interaction, client);
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
    client.user.setActivity(`/tutorial /help`);
    // log connected guilds
    let guildString = "";
    client.guilds.cache.forEach(guild => {
        guildString += `${guild.name} (${guild.id})\n`;
    });
    logger.info(`Connected to guilds: \n${guildString}`);

    // connect to discordbotlist.com
    if (process.env.STAGE === stageNames.BETA || process.env.STAGE === stageNames.PROD) {
        const dbl = createDjsClient(process.env.DBL_TOKEN, client);
        dbl.startPosting();
        logger.info(`Connected to discordbotlist.com`);
    }
});

// Log in to Discord with your client's token
const token = process.env.DISCORD_TOKEN;
client.login(token);

// setup express vote listener
const app = express();
app.use(express.json());
const PORT = 3000;

app.options('*', cors(corsOptions)); // preflight OPTIONS; put before other routes

app.post("/vote", async (req, res) => {
    try {
        let success = false;
        if (req.header("Authorization") === process.env.DBL_SECRET) {
            const user = req.body;
            logger.info(`Received DBL vote from ${user.id}`);
            const { data, err } = await addVote(user);
            if (!err) {
                success = true;
            }
        } else if (req.header("Authorization") === process.env.BOTLIST_SECRET) {
            const user = {
                id: req.body.user,
            }
            logger.info(`Received BOTLIST vote from ${user.id}`);
            const { data, err } = await addVote(user);
            if (!err) {
                success = true;
            }
        }

        if (success) {
            res.sendStatus(200);
        } else {
            res.sendStatus(500);
        }
    } catch (error) {
        logger.error(error);
        res.sendStatus(500);
    }
});

app.listen(PORT);
logger.info(`Express App listening on port ${PORT}`);
