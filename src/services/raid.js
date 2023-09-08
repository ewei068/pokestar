const { buildButtonActionRow } = require("../components/buttonActionRow");
const { buildIdConfigSelectRow } = require("../components/idConfigSelectRow");
const { collectionNames } = require("../config/databaseConfig");
const { eventNames } = require("../config/eventConfig");
const { raids, raidConfig, difficultyConfig } = require("../config/npcConfig");
const { QueryBuilder, deleteDocuments, updateDocument } = require("../database/mongoHandler");
const { buildRaidListEmbed, buildRaidEmbed, buildRaidInstanceEmbed, buildRaidWinEmbed } = require("../embeds/battleEmbeds");
const { logger } = require("../log");
const { drawIterable } = require("../utils/gachaUtils");
const { addRewards } = require("../utils/trainerUtils");
const { idFrom, errorlessAsync } = require("../utils/utils");
const { RaidNPC, Battle, getStartTurnSend } = require("./battle");
const { generateRandomPokemon, giveNewPokemons } = require("./gacha");
const { validateParty } = require("./party");
const { getState, setTtl, setState, deleteState } = require("./state");
const { getTrainer, updateTrainer, getTrainerFromId } = require("./trainer");
const { v4: uuidv4, v4 } = require('uuid');

const updateRaid = async (raid) => {
    await updateDocument(collectionNames.RAIDS, {
        _id: raid._id
    }, {
        $set: raid
    });
}

const deleteRaid = async (raid) => {
    // delete all state IDs
    const stateIds = raid.stateIds || [];
    for (const stateId of stateIds) {
        deleteState(stateId);
    }
    await deleteDocuments(collectionNames.RAIDS, {
        _id: raid._id
    });
}

// return true if raid not expired
const checkTtl = async (raid) => {
    if (!raid) {
        return false;
    }
    const ttl = raid.ttl;
    if (ttl < Date.now()) {
        // delete raid
        await deleteRaid(raid);
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

const getRaidByInstanceId = async ({ raidInstanceId=null } = {}) => {
    const query = new QueryBuilder(collectionNames.RAIDS)
        .setFilter({
            _id: idFrom(raidInstanceId)
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
    boss._id = uuidv4();

    // create raid
    const raid = {
        userId: user.id,
        raidId: raidId,
        raidUserId: raidUserId,
        bossPokemonId: boss._id,
        difficulty: difficulty,
        boss: boss,
        ttl: Date.now() + difficultyData.ttl,
        participants: {},
        stateIds: [stateId],
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

const onRaidWin = async (raid) => {
    // ensure raid is valid
    const raidId = raid.raidId;
    const raidData = raidConfig[raidId];
    if (!raidData) {
        return;
    }
    const difficulty = raid.difficulty;
    const difficultyData = raidData.difficulties[difficulty];
    if (!difficultyData) {
        return;
    }

    // add 10% damage to owner
    const ownerId = raid.userId;
    raid.participants[ownerId] = (raid.participants[ownerId] || 1) + raid.boss.stats[0] * 0.1;

    // calculate rewards
    const rewards = {};
    for (const [userId, damage] of Object.entries(raid.participants)) {
        try {
            const trainer = await getTrainerFromId(userId);
            if (trainer.err) {
                continue;
            }
            const percentDamage = damage / raid.boss.stats[0];

            const rewardsForTrainer = {
                money: Math.floor(difficultyData.moneyPerPercent * percentDamage * 100),
                backpack: {} // TODO
            }
            const _receivedRewards = addRewards(trainer.data, rewardsForTrainer);
            rewards[userId] = rewardsForTrainer;

            // update trainer
            await updateTrainer(trainer.data);
            
            // if damage >= 10%, shinyChance chance of shiny
            const receivedShiny = percentDamage >= 0.1 && Math.random() < difficultyData.shinyChance;
            if (!receivedShiny) {
                continue;
            }

            // give shiny
            // get random shiny pokemon
            const speciesId = drawIterable(raidData.shinyRewards, 1)[0];
            const giveRes = await giveNewPokemons(trainer.data, [speciesId]);
            if (giveRes.err) {
                continue;
            }

            rewardsForTrainer.shiny = speciesId;
        } catch (err) {
            // pass
            logger.error("Error giving raid rewards", err);
        }
    }

    // hacky: remove 10% damage from owner
    raid.participants[ownerId] = raid.participants[ownerId] - raid.boss.stats[0] * 0.1;

    // reply to all messages
    const stateIds = raid.stateIds || [];
    for (const stateId of stateIds) {
        try {
            const state = getState(stateId, false);
            const embed = buildRaidWinEmbed(raid, rewards);
            errorlessAsync(async () => {
                await state.messageRef.reply({
                    embeds: [embed]
                })
            });
        } catch (err) {
            // pass 
        }
    }

    // delete raid
    await deleteRaid(raid);
}

const getBattleEndCallbacks = (raidInstanceId, user, remainingHp) => {
    const raidCallback = async (battle) => {
        const raid = await getRaidByInstanceId({ raidInstanceId: raidInstanceId });
        if (!raid) {
            battle.addToLog("**This raid has expired.**");
            return;
        }

        // validate raid
        // if user is participant, return
        if (raid.participants[user.id]) {
            battle.addToLog("**You have already participated in this raid.**");
            return;
        }

        // check if raid defeated (this should never happen)
        if (raid.boss.remainingHp <= 0) {
            // raid defeated
            battle.addToLog("**The raid has already been defeated!**");
            await deleteRaid(raid);
            return;
        }

        // get info of boss
        const bossPokemon = battle.allPokemon[raid.bossPokemonId];
        const newRemainingInstanceHp = Math.min(remainingHp, bossPokemon.hp);
        let damageDealt = remainingHp - newRemainingInstanceHp;
        const newRemainingHp = Math.max(raid.boss.remainingHp - damageDealt, 0);
        // adjust damage dealt in case of overflow
        damageDealt = Math.max(raid.boss.remainingHp - newRemainingHp, 1);
        const percentRemainingHp = Math.floor(newRemainingHp / bossPokemon.maxHp * 100);
        const percentDamageDealt = Math.floor(damageDealt / bossPokemon.maxHp * 100);
        battle.addToLog(`**You dealt ${damageDealt} (${percentDamageDealt}%) damage to ${bossPokemon.name}! ${bossPokemon.name} has ${newRemainingHp} (${percentRemainingHp}%) HP remaining.**`);

        // update boss hp
        raid.boss.remainingHp = newRemainingHp;
        // update participants
        raid.participants[user.id] = damageDealt;
        await updateRaid(raid);

        // update state messages
        const stateIds = raid.stateIds || [];
        for (const stateId of stateIds) {
            try {
                const state = getState(stateId, false);
                // view existing raid
                const embed = buildRaidInstanceEmbed(raid);
                errorlessAsync(async () =>
                    await state.messageRef.edit({
                        embeds: [embed],
                    })
                );
            } catch (err) {
                // pass 
            }
        }

        // check if raid defeated
        if (raid.boss.remainingHp <= 0) {
            // raid defeated
            battle.addToLog("**The raid has been defeated!**");
            onRaidWin(raid);
            return;
        }
    }

    return {
        loseCallback: raidCallback,
        winCallback: raidCallback,
    }
}

const onRaidAccept = async ({ stateId=null, user=null } = {}) => {
    // get state
    const state = getState(stateId, false);

    // get raid
    const raid = await getRaidByInstanceId({ raidInstanceId: state.raidInstanceId });
    if (!raid) {
        deleteState(stateId);
        return { send: null, err: "This raid has expired." };
    }
    const { raidId, difficulty, participants, boss, raidUserId } = raid;

    // validate raid
    // if user is participant, return
    if (participants[user.id]) {
        return { send: null, err: "You have already participated in this raid." };
    }
    const raidData = raidConfig[raidId];
    if (!raidData) {
        return { send: null, err: "Invalid raid selection" };
    }
    const raidDifficultyData = raidData.difficulties[difficulty];
    if (!raidDifficultyData) {
        return { send: null, err: "Invalid difficulty selection" };
    }

    // get trainer
    let trainer = await getTrainer(user);
    if (trainer.err) {
        return { send: null, err: trainer.err };
    }

    // validate party
    const validate = await validateParty(trainer.data);
    if (validate.err) {
        return { err: validate.err };
    }

    // add npc to battle
    const npc = new RaidNPC(raidData, difficulty, raidUserId, boss);
    npc.setPokemon(raidData, difficulty);
    const rewardMultipliers = raidDifficultyData.rewardMultipliers || difficultyConfig[difficulty].rewardMultipliers;
    const battle = new Battle({
        ...rewardMultipliers,
        npcId: raidId,
        difficulty: difficulty,
        ...getBattleEndCallbacks(state.raidInstanceId, user, boss.remainingHp),
    });
    battle.addTeam("Raid", true);
    battle.addTrainer(npc, npc.party.pokemons, "Raid", npc.party.rows, npc.party.cols);
    battle.addTeam("Player", false);
    battle.addTrainer(trainer.data, validate.data, "Player");

    // start battle and create a new state
    battle.start();
    const raidStateId = setState({
        battle: battle,
        userId: user.id,
    }, 300);

    return {
        send: await getStartTurnSend(battle, raidStateId),
        err: null,
    }
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
        // attempt to append state Ids
        const stateIds = existingRaid.stateIds || [];
        if (!stateIds.includes(stateId)) {
            if (stateIds.length >= 10) {
                // remove oldest state
                const removeStateId = stateIds.shift();
                deleteState(removeStateId);
            }
            stateIds.push(stateId);
        }
        existingRaid.stateIds = stateIds;
        await updateRaid(existingRaid);

        // set state ttl
        const newStateTtl = existingRaid.ttl - Date.now();
        if (newStateTtl > 0) {
            setTtl(stateId, Math.floor(newStateTtl / 1000));
        }

        state.raidInstanceId = existingRaid._id;
        state.view = "instance";

        // view existing raid
        const embed = buildRaidInstanceEmbed(existingRaid);
        send.embeds.push(embed);

        // add accept button
        const acceptButtonData = {
            stateId: stateId,
        };
        const acceptButtonConfigs = [
            {
                label: "Battle!",
                disabled: false,
                data: acceptButtonData,
            }
        ]
        const acceptButtonRow = buildButtonActionRow(acceptButtonConfigs, eventNames.RAID_ACCEPT);
        send.components.push(acceptButtonRow);
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

const cleanupRaids = async () => {
    const query = new QueryBuilder(collectionNames.RAIDS)
        .setFilter({ ttl: { $lt: Date.now() } });
    
    let numRaidsCleaned = 0;
    const raids = await query.find();
    for (const raid of raids) {
        try {
            await checkTtl(raid);
            numRaidsCleaned++;
        } catch (err) {
            // pass
        }
    }
    logger.info(`Cleaned ${numRaidsCleaned} raids`);
}

module.exports = {
    onRaidStart,
    onRaidAccept,
    buildRaidSend,
    cleanupRaids,
};
