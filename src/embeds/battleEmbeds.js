/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 * 
 * battleEmbeds.js Handles all embedded instructions for battles.
*/
const { EmbedBuilder } = require("discord.js");
const { moveConfig, weatherConditions } = require("../config/battleConfig");
const { buildPartyString, buildMoveString, buildBattlePokemonString, buildNpcDifficultyString, buildDungeonDifficultyString, buildCompactPartyString, buildRaidDifficultyString } = require("../utils/battleUtils");
const { buildPokemonStatString, getAbilityName } = require("../utils/pokemonUtils");
const { setTwoInline, linebreakString, fortnightToUTCTime, getFullUTCFortnight, getPBar } = require("../utils/utils");
const { npcConfig, dungeonConfig, battleTowerConfig, raidConfig  } = require("../config/npcConfig");
const { pokemonConfig } = require("../config/pokemonConfig");
const { getFullUsername, getRewardsString, flattenRewards } = require("../utils/trainerUtils");

/**
 * Handles building the party embedded instructions for building a party.
 * @param {*} trainer the trainer to build the party for.
 * @param {*} pokemons the pokemon the trainer has.
 * @param {*} detailed whether it's a detailed party formation.
 * @returns an embeded.
 */
const buildPartyEmbed = (trainer, pokemons, detailed=false) => {
    const party = trainer.party;

    const power = pokemons.reduce((acc, pokemon) => {
        if (pokemon) {
            acc += pokemon.combatPower;
        }
        return acc;
    }, 0);

    const embed = new EmbedBuilder();
    embed.setTitle(`${trainer.user.username}'s Party`);
    embed.setColor(0xffffff);
    embed.setThumbnail(`https://cdn.discordapp.com/avatars/${trainer.userId}/${trainer.user.avatar}.webp`);
    embed.addFields(
        { name: "Power", value: `${power}`, inline: true },
        { name: "Pokemon", value: buildPartyString(pokemons, party.rows, party.cols), inline: false },
    );

    if (detailed) {
        const pokemonFields = pokemons.filter(p => p !== null).map((pokemon, index) => {
            const statString = buildPokemonStatString(pokemon, size=10, compact=true);
            const pokemonData = pokemonConfig[pokemon.speciesId];
            return {
                name: `${pokemonData.emoji} [${pokemons.indexOf(pokemon) + 1}] [Lv. ${pokemon.level}] ${pokemon.name}`,
                value: `${pokemon._id}\n${statString}\nAbility: ${getAbilityName(pokemon.abilityId)}`,
                inline: true,
            };
        });
        // every 2 fields, add a blank field
        setTwoInline(pokemonFields);
        embed.addFields(pokemonFields);
    }

    const footerString = 'Modify your party with /partyadd and /partyremove';
    embed.setFooter({ text: footerString });

    return embed;
}
/**
 * Shows the built parties of the user.
 * @param {*} trainer the trainer who's parties we're showing.
 * @param {*} pokemonMap the map of pokemon the user has?
 * @returns an embeded.
 */
const buildPartiesEmbed = (trainer, pokemonMap) => {
    // active party field
    const activeParty = trainer.party;
    const { partyHeader: activePartyHeader, partyString: activePartyString } = buildCompactPartyString(activeParty, "active", pokemonMap, true);
    const activePartyField = {
        name: activePartyHeader,
        value: activePartyString,
        inline: true,
    };
    const fields = [activePartyField];

    // saved parties fields
    const savedParties = trainer.savedParties;
    for (const [partyId, party] of Object.entries(savedParties)) {
        const { partyHeader, partyString } = buildCompactPartyString(party, partyId, pokemonMap);
        const field = {
            name: partyHeader,
            value: partyString,
            inline: true,
        };
        fields.push(field);
    }

    const embed = new EmbedBuilder();
    embed.setTitle(`${trainer.user.username}'s Parties`);
    embed.setColor(0xffffff);
    embed.setThumbnail(`https://cdn.discordapp.com/avatars/${trainer.userId}/${trainer.user.avatar}.webp`);
    embed.addFields(fields);
    embed.setFooter({ text: "Use /partyload <id> to load a party" });

    return embed;
}
/**
 * Builds the battle the players/players and npcs will use.
 * @param {*} battle the battle itself.
 * @returns an embeded.
 */
const buildBattleEmbed = (battle) => {
    // assume two teams
    const team1 = Object.values(battle.teams)[0];
    const team2 = Object.values(battle.teams)[1];
    const team1Party = battle.parties[team1.name];
    const team2Party = battle.parties[team2.name];
    const team1EmphPosition = battle.activePokemon.teamName === team1.name ? battle.activePokemon.position : null;
    const team2EmphPosition = battle.activePokemon.teamName === team2.name ? battle.activePokemon.position : null;

    // TODO: deal with NPCs
    const team1UserString = team1.userIds.map((userId) => {
        const user = battle.users[userId];
        return `${getFullUsername(user)}`;
    }).join(" ");
    const team2UserString = team2.userIds.map((userId) => {
        const user = battle.users[userId];
        return `${getFullUsername(user)}`;
    }).join(" ");

    const embed = new EmbedBuilder();
    embed.setTitle(`Battle State`);
    embed.setColor(0xffffff);
    embed.setDescription(battle.log[battle.log.length - 1] || "No log yet.");
    // build weather field
    const negatedString = battle.isWeatherNegated() ? " (negated)" : "";
    if (battle.weather.weatherId) {
        switch (battle.weather.weatherId) {
            case weatherConditions.SUN:
                embed.addFields({ name: "Weather", value: `Harsh Sun${negatedString} (${battle.weather.duration})`, inline: true });
                break;
            case weatherConditions.RAIN:
                embed.addFields({ name: "Weather", value: `Rain${negatedString} (${battle.weather.duration})`, inline: true });
                break;
            case weatherConditions.SANDSTORM:
                embed.addFields({ name: "Weather", value: `Sandstorm${negatedString} (${battle.weather.duration})`, inline: true });
                break;
            case weatherConditions.HAIL:
                embed.addFields({ name: "Weather", value: `Hail${negatedString} (${battle.weather.duration})`, inline: true });
                break;
        }
    }
    embed.addFields(
        { 
            name: `${team1.name} | ${team1UserString}`, 
            value: buildPartyString(team1Party.pokemons, team1Party.rows, team1Party.cols, true, true, team1EmphPosition), 
            inline: false 
        },
        { 
            name: `${team2.name} | ${team2UserString}`, 
            value: buildPartyString(team2Party.pokemons, team2Party.rows, team2Party.cols, false, true, team2EmphPosition), 
            inline: false 
        },
    );

    return embed;
}

/**
 * Builds the moveset of the pokemon in the battle.
 * @param {*} pokemon the pokemon to build the moves for.
 * @returns an embeded
 */
const buildBattleMovesetEmbed = (pokemon) => {
    const fields = Object.keys(pokemon.moveIds).map((moveId, index) => {
        const cooldown = pokemon.moveIds[moveId].cooldown;
        const moveData = moveConfig[moveId];
        const { moveHeader, moveString } = buildMoveString(moveData, cooldown);
        return {
            name: moveHeader,
            value: moveString,
            inline: true,
        };
    });

    setTwoInline(fields);

    const embed = new EmbedBuilder();
    embed.setTitle(`[${pokemon.position}] ${pokemon.name}'s Moveset`);
    embed.setColor(0xffffff);
    embed.addFields(fields);
    embed.setFooter({ text: "Use the buttons for battle info | Use the selection menus to select & use a move" });

    return embed;
}
/**
 * Builds the team for the battle to be embeded.
 * @param {*} battle the battle itself.
 * @param {*} teamName the name of the team we're looking at. (a specific user's team)
 * @returns an embeded.
 */
const buildBattleTeamEmbed = (battle, teamName) => {
    const teamUserIds = battle.teams[teamName].userIds;
    const teamPokemons = battle.parties[teamName].pokemons;
    const teamUserString = teamUserIds.map((userId) => {
        const user = battle.users[userId];
        return `${getFullUsername(user)}`;
    }).join(" ");

    const embed = new EmbedBuilder();
    embed.setTitle(`${teamName}'s Pokemon | ${teamUserString}`);
    embed.setColor(0xffffff);
    embed.addFields(teamPokemons.filter(pokemon => pokemon !== null).map((pokemon, index) => {
        const { pokemonHeader, pokemonString } = buildBattlePokemonString(pokemon);
        return {
            name: pokemonHeader,
            value: pokemonString,
            inline: true,
        };
    }));
    embed.setFooter({ text: "Use the buttons for battle info | Use the selection menus to select & use a move" });

    return embed;
}

/**
 * Builds the list of pve options as an embeded.
 * @param {*} npcIds the npc's available for battle.
 * @param {*} page the page number.
 * @returns an embeded
 */
const buildPveListEmbed = (npcIds, page) => {
    let npcString = "";
    npcIds.forEach((npcId) => {
        const npcData = npcConfig[npcId];
        let levelString = "**[Lv. ";
        for (let difficultyConfig of Object.values(npcData.difficulties)) {
            const level = Math.ceil((difficultyConfig.minLevel + difficultyConfig.maxLevel) / 2);
            levelString += `${level}/`;
        }
        levelString = levelString.slice(0, -1);
        levelString += "]**";
        npcString += `${npcData.emoji} ${levelString} ${npcData.name} (${npcId})\n`;
    });

    const embed = new EmbedBuilder();
    embed.setTitle(`NPCs`);
    embed.setColor(0xffffff);
    embed.setDescription(npcString);
    embed.setFooter({ text: `Page ${page} | Use the buttons to select an NPC` });

    return embed;
}
/**
 * Builds a specific npc for pve.
 * @param {*} npcId the id of the npc we're building.
 * @returns an embeded
 */
const buildPveNpcEmbed = (npcId) => {
    const npc = npcConfig[npcId];
    const fields = Object.entries(npc.difficulties).map(([difficulty, difficultyData]) => {
        const { difficultyHeader, difficultyString } = buildNpcDifficultyString(difficulty, difficultyData);
        return {
            name: difficultyHeader,
            value: difficultyString,
            inline: false,
        };
    });

    const embed = new EmbedBuilder();
    embed.setTitle(`${npc.emoji} ${npc.name} (${npcId})`);
    embed.setColor(0xffffff);
    embed.setDescription(npc.catchphrase);
    embed.addFields(fields);
    embed.setImage(npc.sprite);
    embed.setFooter({ text: "Use the buttons to select a difficulty" });

    return embed;
}

/**
 * Builds the list of Dungeons as an embeded.
 * @returns an embeded list of the dungeons.
 */
const buildDungeonListEmbed = () => {
    let dungeonString = "";
    Object.entries(dungeonConfig).forEach(([dungeonId, dungeonData]) => {
        dungeonString += `**${dungeonData.emoji} ${dungeonData.name}** • ${dungeonData.description}\n\n`;
    });

    const embed = new EmbedBuilder();
    embed.setTitle(`Dungeons`);
    embed.setColor(0xffffff);
    embed.setDescription(dungeonString);
    embed.setFooter({ text: `Defeat dungeons to power up your /equipment!` });

    return embed;
}
/**
 * Builds a specific dungeon for the embeded dungeon list.
 * @param {*} dungeonId the Id of the specific dungeon we're building.
 * @returns an embeded dungeon.
 */
const buildDungeonEmbed = (dungeonId) => {
    const dungeonData = dungeonConfig[dungeonId];
    let bossString = '';
    for (bossId of dungeonData.bosses) {
        const bossData = pokemonConfig[bossId];
        bossString += `${bossData.emoji} #${bossId} **${bossData.name}** \`/pokedex ${bossId}\`\n`;
    }
    const fields = Object.entries(dungeonData.difficulties).map(([difficulty, difficultyData]) => {
        const { difficultyHeader, difficultyString } = buildDungeonDifficultyString(difficulty, difficultyData);
        return {
            name: difficultyHeader,
            value: difficultyString,
            inline: false,
        };
    });

    const embed = new EmbedBuilder();
    embed.setTitle(`${dungeonData.emoji} ${dungeonData.name}`);
    embed.setColor(0xffffff);
    embed.setDescription(dungeonData.description);
    embed.addFields({ name: "Bosses", value: bossString, inline: false });
    embed.addFields(fields);
    embed.setImage(dungeonData.sprite);
    embed.setFooter({ text: "Use the buttons to select a difficulty" });

    return embed;
}

const buildBattleTowerEmbed = (towerStage) => {
    const battleTowerData = battleTowerConfig[towerStage];
    const npcData = npcConfig[battleTowerData.npcId];
    const npcDifficultyData = npcData.difficulties[battleTowerData.difficulty];

    const nextFortnight = Math.floor(fortnightToUTCTime(getFullUTCFortnight() + 1) / 1000);
    const towerDescription = `Climb the Battle Tower every other week to earn rewards at increasing difficulties! The Battle Tower resets <t:${nextFortnight}:R>.`

    const difficultyHeader = `**[Lv. ${battleTowerData.minLevel}-${battleTowerData.maxLevel + 1}]**`;

    const pokemonIds = npcDifficultyData.pokemonIds;
    let difficultyString = '';
    difficultyString += `**Possible Pokemon:** ${npcDifficultyData.numPokemon}x`;
    for (let i = 0; i < pokemonIds.length; i++) {
        const pokemonId = pokemonIds[i];
        const pokemonData = pokemonConfig[pokemonId];
        difficultyString += ` ${pokemonData.emoji}`;
    }
    difficultyString += '\n';
    const bossData = pokemonConfig[npcDifficultyData.aceId];
    const bossString = `**Boss**: ${bossData.emoji} #${npcDifficultyData.aceId} **${bossData.name}** \`/pokedex ${npcDifficultyData.aceId}\``;
    difficultyString += `${bossString}\n`;
    difficultyString += `**Rewards:** ${getRewardsString(flattenRewards(battleTowerData.rewards), received=false)}`;
    

    const embed = new EmbedBuilder();
    embed.setTitle(`${npcData.emoji} Battle Tower Floor ${towerStage}: ${npcData.name}`);
    embed.setColor(0xffffff);
    embed.setDescription(`${linebreakString(towerDescription, 50)}\n\n${difficultyHeader}\n${difficultyString}`);
    embed.setImage(npcData.sprite);

    return embed;
}

const buildRaidListEmbed = () => {
    let raidString = "";
    Object.entries(raidConfig).forEach(([raidId, raidData]) => {
        raidString += `**${raidData.emoji} ${raidData.name}** • ${raidData.description}\n\n`;
    });

    const embed = new EmbedBuilder();
    embed.setTitle(`Raids`);
    embed.setColor(0xffffff);
    embed.setDescription(raidString);
    embed.setFooter({ text: `Defeat raids with your server!` });

    return embed;
}

const buildRaidEmbed = (raidId) => {
    const raidData = raidConfig[raidId];

    const bossId = raidData.boss;
    const bossData = pokemonConfig[bossId];
    const bossString = `${bossData.emoji} #${bossId} **${bossData.name}** \`/pokedex ${bossId}\`\n`;
    
    const shinyIds = raidData.shinyRewards;
    let shinyString = '';
    for (const shinyId of shinyIds) {
        const shinyData = pokemonConfig[shinyId];
        shinyString += `${shinyData.emoji}`;
    }

    const fields = Object.entries(raidData.difficulties).map(([difficulty, difficultyData]) => {
        const { difficultyHeader, difficultyString } = buildRaidDifficultyString(difficulty, difficultyData);
        return {
            name: difficultyHeader,
            value: difficultyString,
            inline: false,
        };
    });

    const embed = new EmbedBuilder();
    embed.setTitle(`${raidData.emoji} ${raidData.name}`);
    embed.setColor(0xffffff);
    embed.setDescription(raidData.description);
    embed.addFields({ name: "Boss", value: bossString, inline: true });
    embed.addFields({ name: "Possible Shinies", value: shinyString, inline: true });
    embed.addFields(fields);
    embed.setImage(raidData.sprite);
    embed.setFooter({ text: "Use the buttons to select a difficulty" });

    return embed;
}

const buildRaidInstanceEmbed = (raid) => {
    const { userId, raidId, difficulty, boss, ttl, participants } = raid;
    const raidData = raidConfig[raidId];
    const bossData = pokemonConfig[boss.speciesId];
    const bossTotalHp = boss.stats[0];

    const percentHp = Math.floor(boss.remainingHp / bossTotalHp * 100);
    let descriptionString = `HP: ${getPBar(percentHp, 20)} ${percentHp}%\n`;
    descriptionString += `**Raid Despawns <t:${Math.floor(ttl / 1000)}:R>**`;

    const embed = new EmbedBuilder();
    embed.setTitle(`${raidData.emoji} ${raidData.name} Raid`);
    embed.setColor(0xffffff);
    embed.setDescription(descriptionString);
    embed.addFields(
        { name: "Owner", value: `<@${userId}>`, inline: false },
        { name: "Boss", value: `${bossData.emoji} #${boss.speciesId} **${bossData.name}** \`/pokedex ${boss.speciesId}\``, inline: true }
    );
    // TODO: add participants
    embed.setImage(raidData.sprite);

    return embed;
}

module.exports = {
    buildPartyEmbed,
    buildPartiesEmbed,
    buildBattleEmbed,
    buildBattleMovesetEmbed,
    buildBattleTeamEmbed,
    buildPveListEmbed,
    buildPveNpcEmbed,
    buildDungeonListEmbed,
    buildDungeonEmbed,
    buildBattleTowerEmbed,
    buildRaidListEmbed,
    buildRaidEmbed,
    buildRaidInstanceEmbed,
};