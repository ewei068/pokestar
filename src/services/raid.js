const { buildButtonActionRow } = require("../components/buttonActionRow");
const { buildIdConfigSelectRow } = require("../components/idConfigSelectRow");
const { collectionNames } = require("../config/databaseConfig");
const { eventNames } = require("../config/eventConfig");
const { raids, raidConfig, difficultyConfig } = require("../config/npcConfig");
const { QueryBuilder, deleteDocuments } = require("../database/mongoHandler");
const { buildRaidListEmbed, buildRaidEmbed, buildRaidInstanceEmbed } = require("../embeds/battleEmbeds");
const { generateRandomPokemon } = require("./gacha");
const { getState, setTtl } = require("./state");
const { getTrainer } = require("./trainer");
const { v4: uuidv4, v4 } = require('uuid');

// return true if raid not expired
const checkTtl = async (raid) => {
    if (!raid) {
        return false;
    }
    const ttl = raid.ttl;
    if (ttl < Date.now()) {
        // delete raid
        await deleteDocuments(collectionNames.RAIDS, {
            _id: raid._id
        });
        return false;
    }
    return true;
}

const getRaidForUser = async ({ user=null } = {}) => {
    const query = new QueryBuilder(collectionNames.RAIDS)
        .setFilter({
            userId: user.id
        });
    const raid = await query.findOne();
    
    if (!await checkTtl(raid)) {
        return null;
    }

    return raid;
}

const onRaidStart = async ({ stateId=null, user=null } = {}) => {
    // get state
    const state = getState(stateId);

    // get raid data
    const raidId = state.raidId;
    const raidData = raidConfig[raidId];
    if (!raidData) {
        return { send: null, err: "Invalid raid selection" };
    }

    // get difficulty data
    const difficulty = state.difficulty;
    const difficultyData = raidData.difficulties[difficulty];
    if (!difficultyData) {
        return { send: null, err: "Invalid difficulty selection" };
    }

    // get trainer
    let trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }

    const existingRaid = await getRaidForUser({ user: user });
    if (existingRaid) {
        return { send: null, err: "You already have an active raid. Use `/raid` again to view it." };
    }

    // create boss pokemon
    const bossId = raidData.boss;
    const bossData = difficultyData.pokemons.filter(p => p.speciesId === bossId)[0];
    const raidUserId = uuidv4(); // placeholder ID for raid enemy
    const boss = generateRandomPokemon(raidUserId, bossId, bossData.level, {
        betterIvs: true,
    });
    boss.remainingHp = boss.stats[0];

    // create raid
    const raid = {
        userId: user.id,
        raidId: raidId,
        raidUserId: raidUserId,
        difficulty: difficulty,
        boss: boss,
        ttl: Date.now() + difficultyData.ttl,
        participants: {},
        stateId: stateId,
    }
    const query = new QueryBuilder(collectionNames.RAIDS)
        .setInsert(raid);
    const res = await query.insertOne();
    if (!res) {
        return { send: null, err: "Failed to create raid" };
    }

    // update state ttl
    setTtl(stateId, Math.floor(difficultyData.ttl / 1000));
    state.raidInstanceId = res.insertedId;
    state.view = "instance";

    return {};
}

const buildRaidSend = async ({ stateId=null, user=null } = {}) => {
    // get state
    const state = getState(stateId);

    // get trainer
    let trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }
    trainer = trainer.data;

    // check if trainer has active raid
    const existingRaid = await getRaidForUser({ user: user });

    const send = {
        content: "",
        embeds: [],
        components: []
    }
    if (existingRaid) {
        // set state ttl
        const newStateTtl = existingRaid.ttl - Date.now();
        if (newStateTtl > 0) {
            setTtl(stateId, Math.floor(newStateTtl / 1000));
        }

        // view existing raid
        const embed = buildRaidInstanceEmbed(existingRaid);
        send.embeds.push(embed);

        // TODO: battle button
    } else if (state.view === "list") {
        // list raids
        const embed = buildRaidListEmbed();
        send.embeds.push(embed);

        // build raid list select
        const raidSelectRowData = {
            stateId: stateId,
        };
        const raidSelectRow = buildIdConfigSelectRow(
            Object.values(raids),
            raidConfig,
            "Select a Raid to battle:",
            raidSelectRowData,
            eventNames.RAID_SELECT,
            false
        );
        send.components.push(raidSelectRow);
    } else if (state.view === "raid") {
        // view raid
        const raidId = state.raidId;
        const raidData = raidConfig[raidId];
        if (!raidData) {
            return { send: null, err: "Invalid raid selection" };
        }

        const embed = buildRaidEmbed(raidId);
        send.embeds.push(embed);

        // build difficulty select
        const difficultySelectData = {
            stateId: stateId,
        }
        const difficultyButtonConfigs = Object.keys(raidData.difficulties).map(difficulty => {
            return {
                label: difficultyConfig[difficulty].name,
                disabled: false,
                data: {
                    ...difficultySelectData,
                    difficulty: difficulty,
                }
            }
        });
        const difficultyRow = buildButtonActionRow(
            difficultyButtonConfigs,
            eventNames.RAID_START,
        );
        send.components.push(difficultyRow);

        // build return button
        const returnData = {
            stateId: stateId,
        }
        const returnButtonConfigs = [
            {
                label: "Return",
                disabled: false,
                data: returnData,
            }
        ]
        const returnRow = buildButtonActionRow(
            returnButtonConfigs,
            eventNames.RAID_RETURN,
        );

        send.components.push(returnRow);
    }
        
    return { send: send, err: null };
}

module.exports = {
    onRaidStart,
    buildRaidSend
};
