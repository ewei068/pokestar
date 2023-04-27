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

module.exports = {
    buildPartyEmbed
};