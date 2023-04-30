const { EmbedBuilder } = require("discord.js");
const { moveConfig } = require("../config/battleConfig");
const { buildPartyString, buildMoveString, buildBattlePokemonString } = require("../utils/battleUtils");

const buildPartyEmbed = (trainer, pokemons) => {
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
        return `${user.username}#${user.discriminator}`;
    }).join(" ");
    const team2UserString = team2.userIds.map((userId) => {
        const user = battle.users[userId];
        return `${user.username}#${user.discriminator}`;
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
        const cooldown = pokemon.moveIds[moveId];
        const moveData = moveConfig[moveId];
        const { moveHeader, moveString } = buildMoveString(moveData, cooldown);
        return {
            name: moveHeader,
            value: moveString,
            inline: true,
        };
    });

    // every 2 fields, add a blank field
    if (fields.length > 2) {
        for (let i = 2; i < fields.length; i += 3) {
            fields.splice(i, 0, { name: '** **', value: '** **', inline: false });
        }
    }

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
        return `${user.username}#${user.discriminator}`;
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

module.exports = {
    buildPartyEmbed,
    buildBattleEmbed,
    buildBattleMovesetEmbed,
    buildBattleTeamEmbed,
};