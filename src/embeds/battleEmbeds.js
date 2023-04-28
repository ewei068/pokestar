const { EmbedBuilder } = require("discord.js");
const { buildPartyString } = require("../utils/battleUtils");

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
    embed.addFields([
        { name: "Power", value: `${power}`, inline: true },
        { name: "Pokemon", value: buildPartyString(pokemons, party.rows, party.cols), inline: false },
    ]);

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
    const embed = new EmbedBuilder();
    embed.setTitle(`Battle State`);
    embed.setColor(0xffffff);
    embed.setDescription(battle.log[battle.log.length - 1] || "No log yet.");
    embed.addFields([
        { 
            name: `${team1.name}`, 
            value: buildPartyString(team1Party.pokemons, team1Party.rows, team1Party.cols, true, true, team1EmphPosition), 
            inline: false 
        },
        { 
            name: `${team2.name}`, 
            value: buildPartyString(team2Party.pokemons, team2Party.rows, team2Party.cols, false, true, team2EmphPosition), 
            inline: false 
        },
    ]);

    return embed;
}

module.exports = {
    buildPartyEmbed,
    buildBattleEmbed,
};