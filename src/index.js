/* eslint-disable no-console */
require("dotenv").config();

const { Client, Events, GatewayIntentBits } = require("discord.js");
const { createDjsClient } = require("discordbotlist");
const express = require("express");
const cors = require("cors");
const { default: axios } = require("axios");
const {
  runMessageCommand,
  runSlashCommand,
} = require("./handlers/commandHandler");
const { handleEvent } = require("./handlers/eventHandler");
const { logger } = require("./log");
const { checkRateLimit } = require("./services/rateLimit");
const { addVote } = require("./services/trainer");
const { stageNames } = require("./config/stageConfig");
const { poll } = require("./utils/utils");
const { startSpawning, addGuild } = require("./services/spawn");
const { getStateCount } = require("./services/state");
const { cleanupRaids } = require("./services/raid");
const {
  initialize: initializeBattleData,
} = require("./battle/data/initialize");

console.log(`STAGE: ${process.env.STAGE}`);
const FFLAG_ENABLE_SPAWN = process.env.FFLAG_ENABLE_SPAWN === "1";
console.log(`FFLAG_ENABLE_SPAWN: ${FFLAG_ENABLE_SPAWN}`);

initializeBattleData();

const corsOptions = {
  origin: true,
  credentials: true,
};

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.MessageContent
  ],
});

client.on(Events.MessageCreate, async (message) => {
  try {
    if (!checkRateLimit(message.author.id)) return;
  } catch {
    return;
  }

  runMessageCommand(message, client)
    .then(() => {
      // do nothing
    })
    .catch(async (error) => {
      try {
        logger.error(`Error in message command: ${message.content}`);
        logger.error(error);
        await message.reply(
          "There was an error trying to execute that command!"
        );
      } catch (error2) {
        logger.error(`Error in message command: ${message.content}`);
        logger.error(error2);
      }
    });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    if (!checkRateLimit(interaction.user.id)) return;
  } catch {
    return;
  }

  runSlashCommand(interaction, client)
    .then(() => {
      // do nothing
    })
    .catch(async (error) => {
      logger.error(`Error in slash command: ${interaction.commandName}`);
      logger.error(error);
      try {
        await interaction.reply(
          "There was an error trying to execute that command!"
        );
      } catch {
        try {
          await interaction.followUp(
            "There was an error trying to execute that command!"
          );
        } catch (error2) {
          logger.error(`Error in slash command: ${interaction.commandName}`);
          logger.error(error2);
        }
      }
    });
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (
    !interaction.isButton() &&
    !interaction.isStringSelectMenu() &&
    !interaction.isModalSubmit()
  )
    return;

  try {
    if (!checkRateLimit(interaction.user.id)) return;
  } catch {
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
  if (FFLAG_ENABLE_SPAWN) {
    addGuild(client, guild);
  }
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
  if (!client.user) {
    logger.error(
      "Client user not found. Something went terribly wrong I'm so sorry I can't continue xd"
    );
    return;
  }
  logger.info(`Ready! Logged in as ${c.user.tag}`);
  client.user.setActivity(`/tutorial /help`);
  // log connected guilds
  let guildString = "";
  client.guilds.cache.forEach((guild) => {
    guildString += `${guild.name} (${guild.id})\n`;
  });
  logger.info(`Connected to guilds: \n${guildString}`);

  // start spawners
  if (FFLAG_ENABLE_SPAWN) {
    startSpawning(client);
  }

  // poll state size
  poll(async () => {
    try {
      const stateSize = getStateCount();
      logger.info(`STATE SIZE: ${stateSize}`);
    } catch {
      logger.warn("Error polling state size");
    }
  }, 1000 * 60 * 60);

  // poll raid cleanup
  poll(async () => {
    try {
      await cleanupRaids();
    } catch (error) {
      logger.error("Error cleaning up raids", error);
    }
  }, 1000 * 60 * 15);

  // poll resource metrics
  poll(async () => {
    try {
      const resourceMetrics = {};
      const memoryUsage = process.memoryUsage();
      for (const [key, value] of Object.entries(memoryUsage)) {
        const valueInMB = value / 1024 / 1024;
        resourceMetrics[key] = `${valueInMB.toFixed(2)} MB`;
      }

      // log metrics in a single line
      let metricsString = "";
      for (const [key, value] of Object.entries(resourceMetrics)) {
        metricsString += `${key}: ${value} | `;
      }
      logger.info(`Resource metrics: ${metricsString}`);
    } catch {
      logger.warn("Error logging metrics");
    }
  }, 1000 * 15);

  // connect to discordbotlist.com
  if (
    (process.env.STAGE === stageNames.BETA ||
      process.env.STAGE === stageNames.PROD) &&
    process.env.DBL_TOKEN
  ) {
    const dbl = createDjsClient(process.env.DBL_TOKEN, client);
    dbl.on("posted", (stats) => {
      logger.info(
        `Posted stats to discordbotlist.com: ${JSON.stringify(stats)}`
      );
    });
    dbl.startPosting();
    logger.info(`Connected to discordbotlist.com`);

    // post botlist stats every hour
    poll(async () => {
      try {
        const botlistUrl = `https://api.botlist.me/api/v1/bots/${process.env.CLIENT_ID}/stats`;
        const botlistData = {
          server_count: client.guilds.cache.size,
        };
        logger.info(`Posting botlist.me stats: ${JSON.stringify(botlistData)}`);
        const botlistHeaders = {
          Authorization: process.env.BOTLIST_TOKEN,
          "Content-Type": "application/json",
        };
        await axios.post(botlistUrl, botlistData, { headers: botlistHeaders });
      } catch {
        logger.warn("Error posting botlist.me stats");
      }
    }, 1000 * 60 * 60);

    // post top.gg stats every hour
    poll(async () => {
      try {
        const topggUrl = `https://top.gg/api/bots/${process.env.CLIENT_ID}/stats`;
        const topggData = {
          server_count: client.guilds.cache.size,
        };
        logger.info(`Posting top.gg stats: ${JSON.stringify(topggData)}`);
        const topggHeaders = {
          Authorization: process.env.TOPGG_TOKEN,
          "Content-Type": "application/json",
        };
        await axios.post(topggUrl, topggData, { headers: topggHeaders });
      } catch {
        logger.warn("Error posting top.gg stats");
      }
    }, 1000 * 60 * 60);

    // post discordlist stats every hour
    poll(async () => {
      try {
        const discordlistUrl = `https://api.discordlist.gg/v0/bots/${process.env.CLIENT_ID}/stats`;
        const discordlistData = {
          server_count: client.guilds.cache.size,
        };
        logger.info(
          `Posting discordlist.gg stats: ${JSON.stringify(discordlistData)}`
        );
        const discordlistHeaders = {
          Authorization: `Bearer ${process.env.DISCORDLIST_TOKEN}`,
          "Content-Type": "application/json",
        };
        await axios.post(discordlistUrl, discordlistData, {
          headers: discordlistHeaders,
        });
      } catch {
        logger.warn("Error posting discordlist.gg stats");
      }
    }, 1000 * 60 * 60);
  }
});

// Log in to Discord with your client's token
const token = process.env.DISCORD_TOKEN;
client.login(token);

// setup express vote listener
const app = express();
app.use(express.json());
const PORT = 3000;

app.options("*", cors(corsOptions)); // preflight OPTIONS; put before other routes

app.post("/vote", async (req, res) => {
  try {
    let success = false;
    if (req.header("Authorization") === process.env.DBL_SECRET) {
      const user = req.body;
      logger.info(`Received DBL vote from ${user.id}`);
      const { err } = await addVote(user);
      if (!err) {
        success = true;
      }
      /* } else if (req.header("Authorization") === process.env.BOTLIST_SECRET) {
                const user = {
                    id: req.body.user,
                }
                logger.info(`Received BOTLIST vote from ${user.id}`);
                const { data, err } = await addVote(user);
                if (!err) {
                    success = true;
                } */
    } else if (req.header("Authorization") === process.env.TOPGG_SECRET) {
      const user = {
        id: req.body.user,
      };
      logger.info(`Received TOP.GG vote from ${user.id}`);
      const { err } = await addVote(user, 2);
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
