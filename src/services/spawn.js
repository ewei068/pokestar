/* eslint-disable no-case-declarations */
/* eslint-disable no-param-reassign */
// eslint-disable-next-line no-unused-vars
const { ButtonStyle, Client } = require("discord.js");
const { buildButtonActionRow } = require("../components/buttonActionRow");
const { backpackItems } = require("../config/backpackConfig");
const { typeAdvantages } = require("../config/battleConfig");
const { eventNames } = require("../config/eventConfig");
const { pokeballConfig } = require("../config/gachaConfig");
const {
  rarityBins,
  pokemonConfig,
  typeConfig,
} = require("../config/pokemonConfig");
const { stageNames } = require("../config/stageConfig");
const {
  buildPokemonSpawnEmbed,
  buildNewPokemonEmbed,
} = require("../embeds/pokemonEmbeds");
const { logger } = require("../log");
const {
  drawDiscrete,
  drawIterable,
  drawUniform,
} = require("../utils/gachaUtils");
const { setState } = require("./state");
const { getTrainer } = require("./trainer");
const { giveNewPokemons } = require("./gacha");
const { QueryBuilder } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");

const SPAWN_TIME =
  process.env.STAGE === stageNames.ALPHA ? 15 * 60 * 1000 : 120 * 60 * 1000;
// const SPAWN_TIME_VARIANCE =
//  process.env.STAGE === stageNames.ALPHA ? 3 * 60 * 1000 : 30 * 60 * 1000;
// blacklist emoji servers
const BLACKLISTED_SERVERS = [
  "1099523950297485323",
  "1100284426044309555",
  "1100289786046058518",
  "1116755651876618320",
  "1119802868413775965",
  "1126680474778091570",
  "1132495466542678079",
  "1132495525929816137",
  "1109520907581542441",
  "1100295491356471306",
  "1117867567281885345",
  "1107082108716986410",
];
// always spawn
const WHITELISTED_SERVERS = [
  "1110030030848934009",
  "1093395679516311615",
  "1118653294894645278",
];
const QUESTION_TYPES = ["typeAdvantage", "pokemonIcon", "pokemonType"];

const PERMISSIONS_NEEDED = ["ViewChannel", "SendMessages", "EmbedLinks"];

const canSendInChannel = (guild, channel, guildData) => {
  const blacklistedChannels = guildData.spawnDisabledChannels;
  const channelInBlacklist =
    blacklistedChannels && blacklistedChannels.includes(channel.id);
  const channelParentInBlacklist =
    blacklistedChannels &&
    channel.parentId &&
    blacklistedChannels.includes(channel.parentId);
  if (channelInBlacklist || channelParentInBlacklist) {
    return false;
  }
  const permissionsIn = guild.members.me.permissionsIn(channel);
  return PERMISSIONS_NEEDED.every((permission) =>
    permissionsIn.has(permission)
  );
};

/* const calculateSpawnCooldown = (multiplier = 1) => {
  const timeout = Math.floor(
    (Math.random() * 2 - 1) * SPAWN_TIME_VARIANCE + SPAWN_TIME
  );
  return Math.round(timeout * multiplier);
}; */

const buildPokemonSpawnSend = (goodSpawn) => {
  // get random rarity
  const rarity = drawDiscrete(
    pokeballConfig[backpackItems.GREATBALL].chances,
    1
  )[0];
  // get random pokemon
  const speciesId = drawIterable(rarityBins[rarity], 1)[0];
  const pokemonData = pokemonConfig[speciesId];

  let shinyChance = process.env.STAGE === stageNames.ALPHA ? 1 : 1024 / 4;
  if (!goodSpawn) {
    shinyChance = 1024;
  }
  const isShiny = drawUniform(0, shinyChance, 1)[0] === 0;
  const level = drawUniform(1, 100, 1)[0];

  const stateId = setState(
    {
      speciesId,
      isShiny,
      level,
      goodSpawn,
    },
    15 * 60
  );
  const buttonConfigs = [
    {
      label: "Catch!",
      disabled: false,
      emoji: pokemonData.emoji,
      data: {
        stateId,
      },
    },
  ];
  const button = buildButtonActionRow(
    buttonConfigs,
    eventNames.WILD_POKEMON_BUTTON
  );

  const send = {
    embeds: [buildPokemonSpawnEmbed(speciesId, level, isShiny)],
    components: [button],
  };
  return {
    send,
    err: null,
  };
};

const onButtonPress = async (interaction, data, state) => {
  // get trainer
  const trainer = await getTrainer(interaction.user);
  if (trainer.err) {
    return { send: null, err: trainer.err };
  }

  if (state.caught) {
    await interaction.update({
      components: [],
    });
    return { err: "This pokemon has already been caught." };
  }

  const { correct } = data;
  const send = {
    components: [],
  };
  if (correct === undefined) {
    state.originalMessage = interaction.message;
    // generate question
    const questionType = drawIterable(QUESTION_TYPES, 1)[0];
    let isTrueCorrect = false;
    switch (questionType) {
      case "typeAdvantage":
        // get random 2 types
        const [type1, type2] = drawIterable(Object.keys(typeAdvantages), 2);
        let isType1WeakToType2 = false;
        const type1Matrix = typeAdvantages[type2];
        if (
          type1Matrix &&
          type1Matrix[type1] !== undefined &&
          type1Matrix[type1] > 1
        ) {
          isType1WeakToType2 = true;
        }
        send.content = `Is ${typeConfig[type1].emoji} ${typeConfig[type1].name} weak to ${typeConfig[type2].emoji} ${typeConfig[type2].name}?`;
        isTrueCorrect = isType1WeakToType2;
        break;
      case "pokemonIcon":
        const correctPokemon = drawUniform(0, 1, 1)[0] === 0;
        // eslint-disable-next-line prefer-const
        let [pokemon1, pokemon2] = drawIterable(
          Object.keys(pokemonConfig).filter(
            (pid) =>
              !pokemonConfig[pid].unobtainable && !pokemonConfig[pid].noGacha
          ),
          2,
          { replacement: false }
        );
        if (correctPokemon) {
          pokemon2 = pokemon1;
        }

        send.content = `Is this Pokemon ${pokemonConfig[pokemon1].name}? ${pokemonConfig[pokemon2].emoji}`;
        isTrueCorrect = correctPokemon;
        break;
      case "pokemonType":
        const correctType = drawUniform(0, 1, 1)[0] === 0;
        const speciesId = drawIterable(
          Object.keys(pokemonConfig).filter(
            (pid) =>
              !pokemonConfig[pid].unobtainable && !pokemonConfig[pid].noGacha
          ),
          1
        )[0];
        let type;
        if (correctType) {
          // eslint-disable-next-line prefer-destructuring
          type = pokemonConfig[speciesId].type[0];
          // if has 2 types, 50% chance to be either
          if (
            pokemonConfig[speciesId].type[1] !== undefined &&
            drawUniform(0, 1, 1)[0] === 0
          ) {
            // eslint-disable-next-line prefer-destructuring
            type = pokemonConfig[speciesId].type[1];
          }
        } else {
          // draw types until it's not the pokemon's type
          while (
            pokemonConfig[speciesId].type.includes(type) ||
            type === undefined
          ) {
            [type] = drawIterable(Object.keys(typeAdvantages), 1);
          }
        }

        send.content = `Is ${pokemonConfig[speciesId].emoji} ${pokemonConfig[speciesId].name} a ${typeConfig[type].emoji} ${typeConfig[type].name} Type?`;
        isTrueCorrect = correctType;
        break;
      default:
        logger.error(`Invalid question type: ${questionType}`);
        break;
    }
    send.ephemeral = true;

    const buttonConfigs = [
      {
        label: "True",
        disabled: false,
        emoji: "✅",
        data: {
          correct: isTrueCorrect,
          stateId: data.stateId,
        },
        style: ButtonStyle.Success,
      },
      {
        label: "False",
        disabled: false,
        emoji: "✖️",
        data: {
          correct: !isTrueCorrect,
          stateId: data.stateId,
        },
        style: ButtonStyle.Danger,
      },
    ];
    const buttons = buildButtonActionRow(
      buttonConfigs,
      eventNames.WILD_POKEMON_BUTTON
    );
    send.components.push(buttons);
    await interaction.reply(send);
  } else if (correct) {
    // catch pokemon
    state.caught = true;
    // generate pokemon
    const give = await giveNewPokemons(
      trainer.data,
      [state.speciesId],
      state.level,
      {
        isShiny: state.isShiny,
        betterIvs: state.goodSpawn,
      }
    );
    if (give.err) {
      return { send: null, err: give.err };
    }

    const embed = buildNewPokemonEmbed(give.data.pokemons[0]);
    const followUpSend = {
      content: `${give.data.pokemons[0]._id}`,
      embeds: [embed],
      components: [],
      emphemeral: false,
    };
    await interaction.update({
      components: [],
    });
    await interaction.followUp(followUpSend);
    if (state.originalMessage) {
      await state.originalMessage.edit({
        components: [],
      });
    }
  } else {
    // you got it wrong
    const updateSend = {
      content: "You got it wrong, try again!",
      components: [],
      ephemeral: true,
    };
    await interaction.update(updateSend);
  }

  return { err: null };
};

const getGuildData = async (guildId) => {
  let guildData = {
    guildId,
    spawnDisabled: false,
    spawnDisabledChannels: [],
  };
  try {
    const query = new QueryBuilder(collectionNames.GUILDS).setFilter({
      guildId,
    });

    const guildRes = await query.findOne();
    if (guildRes) {
      guildData = guildRes;
    }
  } catch (err) {
    logger.warn(err);
    // pass
  }
  if (!guildData.spawnDisabledChannels) {
    guildData.spawnDisabledChannels = [];
  }
  return guildData;
};

/* const guildIdToSpawner = {};

 class GuildSpawner {

  constructor(client, guild) {
    this.client = client;
    this.guild = guild;
    this.guildId = guild.id;
    this.chachedChannels = [];
  }

  cacheGuild() {
    this.guild = this.client.guilds.cache.get(this.guild.id);
  }

  cacheChannels() {
    // for every channel
    this.guild.channels.cache.forEach((channel) => {
      // if the channel is a text channel
      if (channel.type !== 0) return;

      // if the bot can't send messages in the channel
      if (!canSendInChannel(this.guild, channel, this.guildData)) {
        return;
      }

      this.chachedChannels.push(channel);
    });
  }

  refreshChannels() {
    this.chachedChannels = [];
    this.cacheGuild();
    this.cacheChannels();
    if (this.chachedChannels.length === 0) {
      return { err: `${this.guild.name} No channels to spawn in.` };
    }
    return {};
  }

  async spawn(guild) {
    // check if spawn was disabled for guild
    // get guild
    this.guildData = await getGuildData(guild.id);

    if (this.guildData.spawnDisabled) {
      return {};
    }

    // TEMP: refresh channels every time
    // eslint-disable-next-line no-constant-condition
    if (true) {
      // this.chachedChannels.length == 0) {
      const res = this.refreshChannels();
      if (res.err) {
        return res;
      }
    }
    guild = this.guild;

    // spawn probability based on number of members
    let spawnProbability = 0;
    const memberCount = guild.members.cache.size;
    if (memberCount < 5) {
      spawnProbability = 0.33;
    } else if (memberCount < 20) {
      spawnProbability = 0.7;
    } else if (memberCount < 200) {
      spawnProbability = 1;
    } else {
      spawnProbability = 0.8;
    }
    let goodSpawn = true;
    if (
      Math.random() > spawnProbability &&
      !WHITELISTED_SERVERS.includes(guild.id)
    ) {
      goodSpawn = false;
    }

    // get random cached channel
    let channel =
      this.chachedChannels[
        Math.floor(Math.random() * this.chachedChannels.length)
      ];
    // check if able to send in channel
    if (!canSendInChannel(guild, channel, this.guildData)) {
      // re-cache channels
      const res = this.refreshChannels();
      if (res.err) {
        return res;
      }
    }

    // get random cached channel
    channel =
      this.chachedChannels[
        Math.floor(Math.random() * this.chachedChannels.length)
      ];
    // send in channel
    const { send, err } = buildPokemonSpawnSend(goodSpawn);
    if (err) {
      return { err };
    }
    try {
      await channel.send(send);
    } catch (error) {
      return { err: error };
    }

    return {};
  }

  async startSpawning() {
    try {
      await new Promise((resolve) => {
        setTimeout(resolve, calculateSpawnCooldown(0.5));
      });
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const res = await this.spawn(this.guild);
        if (res.err) {
          logger.warn(res.err);
        }
        const timeout = calculateSpawnCooldown();
        await new Promise((resolve) => {
          setTimeout(resolve, timeout);
        });
      }
    } catch (error) {
      logger.warn(error);
      try {
        // TEMP: remove guild from spawner list
        delete guildIdToSpawner[this.guildId];
      } catch (delErr) {
        logger.warn(delErr);
      }
    }
  }
}

const addGuild = (client, guild, silence = false) => {
  if (BLACKLISTED_SERVERS.includes(guild.id)) {
    return;
  }
  if (guildIdToSpawner[guild.id]) {
    return;
  }
  const spawner = new GuildSpawner(client, guild);
  guildIdToSpawner[guild.id] = spawner;
  spawner.startSpawning();
  if (!silence) logger.info(`Spawning in ${guild.name}.`);
}; */

/**
 * @param {DiscordGuild} guild
 */
const spawn = async (guild) => {
  // check if spawn was disabled for guild
  // get guild
  const guildData = await getGuildData(guild.id);

  if (guildData.spawnDisabled) {
    return {};
  }

  let spawnProbability = 0;
  const memberCount = guild.members.cache.size;
  if (memberCount < 5) {
    spawnProbability = 0.33;
  } else if (memberCount < 20) {
    spawnProbability = 0.7;
  } else if (memberCount < 200) {
    spawnProbability = 1;
  } else {
    spawnProbability = 0.8;
  }
  let goodSpawn = true;
  if (
    Math.random() > spawnProbability &&
    !WHITELISTED_SERVERS.includes(guild.id)
  ) {
    goodSpawn = false;
  }

  const possibleChannels = [];
  guild.channels.cache.forEach((channel) => {
    // if the channel is a text channel
    if (channel.type !== 0) return;

    // if the bot can't send messages in the channel
    if (!canSendInChannel(guild, channel, guildData)) {
      return;
    }

    possibleChannels.push(channel);
  });
  if (possibleChannels.length === 0) {
    return { err: `${guild.name} No channels to spawn in.` };
  }

  // get random channel
  const channel = drawIterable(possibleChannels, 1)[0];

  // send in channel
  const { send, err } = buildPokemonSpawnSend(goodSpawn);
  if (err) {
    return { err };
  }
  try {
    await channel.send(send);
  } catch (error) {
    return { err: error };
  }

  return {};
};

class SpawnManager {
  /**
   * @param {Client} client
   */
  constructor(client) {
    this.client = client;
    this.shouldSpawn = true;
  }

  triggerSingleSpawn() {
    if (!this.shouldSpawn) {
      return;
    }

    // calculate spawn time -- 2 hours / num guilds (includes blacklisted servers but whatever)
    const numGuilds = this.client.guilds.cache.size;
    const timeout = Math.floor(SPAWN_TIME / numGuilds);
    setTimeout(() => {
      // get random guild
      const guild = this.client.guilds.cache
        .filter((g) => !BLACKLISTED_SERVERS.includes(g.id))
        .random();
      spawn(guild).catch((err) => {
        logger.warn(err);
      });
      this.triggerSingleSpawn();
    }, timeout);
  }

  stopSpawning() {
    this.shouldSpawn = false;
  }
}

const startSpawning = (client) => {
  const spawnManager = new SpawnManager(client);
  spawnManager.triggerSingleSpawn();
  logger.info(`Spawning started.`);
};

module.exports = {
  startSpawning,
  onButtonPress,
};
