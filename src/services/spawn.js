const { ButtonStyle } = require("discord.js");
const { buildButtonActionRow } = require("../components/buttonActionRow");
const { backpackItems } = require("../config/backpackConfig");
const { typeAdvantages } = require("../config/battleConfig");
const { eventNames } = require("../config/eventConfig");
const { pokeballConfig } = require("../config/gachaConfig");
const { rarityBins, pokemonConfig, types, typeConfig } = require("../config/pokemonConfig");
const { stageNames } = require("../config/stageConfig");
const { buildPokemonSpawnEmbed, buildNewPokemonEmbed } = require("../embeds/pokemonEmbeds");
const { logger } = require("../log");
const { drawDiscrete, drawIterable, drawUniform } = require("../utils/gachaUtils");
const { setState } = require("./state");
const { getTrainer } = require("./trainer");
const { giveNewPokemons } = require("./gacha");
const { QueryBuilder } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");

const SPAWN_TIME = process.env.STAGE == stageNames.ALPHA ? 12 * 60 * 1000 : 120 * 60 * 1000;
const SPAWN_TIME_VARIANCE = process.env.STAGE == stageNames.ALPHA ? 3 * 60 * 1000 : 30 * 60 * 1000;
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
    "1107082108716986410"
]
// always spawn
const WHITELISTED_SERVERS = [
    "1110030030848934009",
    "1093395679516311615",
    "1118653294894645278"
]
const QUESTION_TYPES = [
    "typeAdvantage",
    "pokemonIcon", 
    "pokemonType"
];

const canSendInChannel = (guild, channel) => {
    return guild.members.me.permissionsIn(channel).has("SendMessages");
}

const buildPokemonSpawnSend = () => {
    // get random rarity
    const rarity = drawDiscrete(pokeballConfig[backpackItems.GREATBALL].chances, 1)[0];
    // get random pokemon
    const speciesId = drawIterable(rarityBins[rarity], 1)[0];
    const pokemonData = pokemonConfig[speciesId];

    const shinyChance = process.env.STAGE == stageNames.ALPHA ? 1 : 1024 / 8;
    const isShiny = drawUniform(0, shinyChance, 1)[0] == 0;
    const level = drawUniform(1, 100, 1)[0];

    const stateId = setState({
        speciesId: speciesId,
        isShiny: isShiny,
        level: level,
    }, 10 * 60);
    const buttonConfigs = [{
        label: "Catch!",
        disabled: false,
        emoji: pokemonData.emoji,
        data: {
            stateId: stateId,
        }
    }];
    const button = buildButtonActionRow(buttonConfigs, eventNames.WILD_POKEMON_BUTTON);

    const send = {
        embeds: [buildPokemonSpawnEmbed(speciesId, level, isShiny)],
        components: [button],
    };
    return {
        send: send,
        err: null,
    }
}

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

    const correct = data.correct;
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
                const [ type1, type2 ] = drawIterable(Object.keys(typeAdvantages), 2);
                let isType1WeakToType2 = false;
                const type1Matrix = typeAdvantages[type2];
                if (type1Matrix && type1Matrix[type1] !== undefined && type1Matrix[type1] > 1) {
                    isType1WeakToType2 = true;
                }
                send.content = `Is ${typeConfig[type1].emoji} ${typeConfig[type1].name} weak to ${typeConfig[type2].emoji} ${typeConfig[type2].name}?`;
                isTrueCorrect = isType1WeakToType2;
                break;
            case "pokemonIcon":
                const correctPokemon = drawUniform(0, 1, 1)[0] == 0;
                let [ pokemon1, pokemon2 ]= drawIterable(Object.keys(pokemonConfig).filter(
                    pid => !pokemonConfig[pid].unobtainable && !pokemonConfig[pid].noGacha
                ), 2, { replacement: false });
                if (correctPokemon) {
                    pokemon2 = pokemon1;
                }

                send.content = `Is this Pokemon ${pokemonConfig[pokemon1].name}? ${pokemonConfig[pokemon2].emoji}`;
                isTrueCorrect = correctPokemon;
                break;
            case "pokemonType":
                const correctType = drawUniform(0, 1, 1)[0] == 0;
                const speciesId = drawIterable(Object.keys(pokemonConfig).filter(
                    pid => !pokemonConfig[pid].unobtainable && !pokemonConfig[pid].noGacha
                ), 1)[0];
                let type;
                if (correctType) {
                    type = pokemonConfig[speciesId].type[0];
                    // if has 2 types, 50% chance to be either
                    if (pokemonConfig[speciesId].type[1] !== undefined && drawUniform(0, 1, 1)[0] == 0) {
                        type = pokemonConfig[speciesId].type[1];
                    }
                } else {
                    // draw types until it's not the pokemon's type
                    while (pokemonConfig[speciesId].type.includes(type) || type === undefined) {
                        type = drawIterable(Object.keys(typeAdvantages), 1)[0];
                    }
                }

                send.content = `Is ${pokemonConfig[speciesId].emoji} ${pokemonConfig[speciesId].name} a ${typeConfig[type].emoji} ${typeConfig[type].name} Type?`;
                isTrueCorrect = correctType;
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
                    stateId: data.stateId
                },
                style: ButtonStyle.Success
            },
            {
                label: "False",
                disabled: false,
                emoji: "✖️",
                data: {
                    correct: !isTrueCorrect,
                    stateId: data.stateId
                },
                style: ButtonStyle.Danger
            }
        ];
        const buttons = buildButtonActionRow(buttonConfigs, eventNames.WILD_POKEMON_BUTTON);
        send.components.push(buttons);
        await interaction.reply(send);
    } else if (correct) {
        // catch pokemon
        state.caught = true;
        // generate pokemon
        const give = await giveNewPokemons(trainer.data, [state.speciesId], state.level, {
            isShiny: state.isShiny,
            betterIvs: true,
        });
        if (give.err) {
            return { send: null, err: give.err };
        }

        const embed = buildNewPokemonEmbed(give.data.pokemons[0]);
        const send = {
            content: `${give.data.pokemons[0]._id}`,
            embeds: [embed],
            components: [],
            emphemeral: false
        }
        await interaction.update({
            components: [],
        });
        await interaction.followUp(send);
        if (state.originalMessage) {
            await state.originalMessage.edit({
                components: [],
            });
        }
    } else {
        // you got it wrong
        const send = {
            content: "You got it wrong, try again!",
            components: [],
            ephemeral: true,
        };
        await interaction.update(send);
    }

    return { err: null };
}

class GuildSpawner {
    client;
    guild;
    chachedChannels = [];

    constructor(client, guild) {
        this.client = client;
        this.guild = guild;
    }

    cacheGuild() {
        this.guild = this.client.guilds.cache.get(this.guild.id);
    }

    cacheChannels() {
        // for every channel
        this.guild.channels.cache.forEach(channel => {
            // if the channel is a text channel
            if (channel.type !== 0) return;

            // if the bot can't send messages in the channel
            if (!canSendInChannel(this.guild, channel)) {
                return;
            } 

            this.chachedChannels.push(channel);
        });
    }

    refreshChannels() {
        this.chachedChannels = [];
        this.cacheGuild();
        this.cacheChannels();
        if (this.chachedChannels.length == 0) {
            return { err: `${this.guild.name} No channels to spawn in.` };
        }
        return {};
    }

    async spawn(guild) {
        // spawn probability based on number of members (not implemented for now)
        /* let spawnProbability = 0;
        const memberCount = guild.members.cache.size;
        console.log(memberCount);
        if (memberCount < 5) {
            spawnProbability = 0.25;
        } else if (memberCount < 100) {
            spawnProbability = 1;
        } else if (memberCount < 500) {
            spawnProbability = 0.7;
        } else {
            spawnProbability = 0.5;
        }
        if (Math.random() > spawnProbability && !WHITELISTED_SERVERS.includes(guild.id)) {
            return {};
        } */

        // check if spawn was disabled for guild
        // get guild
        let guildData = {
            guildId: this.guild.id,
            spawnDisabled: false
        }
        try {
            const query = new QueryBuilder(collectionNames.GUILDS)
                .setFilter({ guildId: this.guild.id });

            const guildRes = await query.findOne();
            if (guildRes) {
                guildData = guildRes;
            }
        } catch (err) {
            logger.warn(err);
            // pass
        }
        if (guildData.spawnDisabled) {
            return {};
        }

        if (this.chachedChannels.length == 0) {
            const res = this.refreshChannels();
            if (res.err) {
                return res;
            }
        }

        // get random cached channel
        let channel = this.chachedChannels[Math.floor(Math.random() * this.chachedChannels.length)];
        // check if able to send in channel
        if (!canSendInChannel(guild, channel)) {
            // re-cache channels
            const res = this.refreshChannels();
            if (res.err) {
                return res;
            }
        }

        // get random cached channel
        channel = this.chachedChannels[Math.floor(Math.random() * this.chachedChannels.length)];
        // send in channel
        const { send, err } = buildPokemonSpawnSend();
        if (err) {
            return { err: err };
        }
        await channel.send(send);

        return {};
    }

    async startSpawning() {
        try {
            while (true) {
                const res = await this.spawn(this.guild);
                if (res.err) {
                    logger.warn(res.err);
                }
                const timeout = Math.floor((Math.random() * 2 - 1) * SPAWN_TIME_VARIANCE + SPAWN_TIME);
                await new Promise((resolve) => setTimeout(resolve, timeout));
            }
        } catch (error) {
            logger.warn(error);
            return;
        }
    }
}

const guildIdToSpawner = {};

const addGuild = (client, guild, silence=false) => {
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
}

const startSpawning = (client) => {
    for (const guild of client.guilds.cache.values()) {
        addGuild(client, guild, true);
    }
    logger.info(`Spawning in ${Object.keys(guildIdToSpawner).length} guilds.`);
}

module.exports = {
    startSpawning,
    addGuild,
    onButtonPress,
}
