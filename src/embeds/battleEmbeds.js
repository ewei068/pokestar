const { EmbedBuilder } = require("discord.js");
const { moveConfig } = require("../config/battleConfig");
const { buildPartyString, buildMoveString, buildBattlePokemonString, buildNpcDifficultyString, buildDungeonDifficultyString, buildCompactPartyString } = require("../utils/battleUtils");
const { buildPokemonStatString, getAbilityName } = require("../utils/pokemonUtils");
const { setTwoInline } = require("../utils/utils");
const { npcConfig, dungeonConfig  } = require("../config/npcConfig");
const { pokemonConfig } = require("../config/pokemonConfig");
const { getFullUsername } = require("../utils/trainerUtils");

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
};