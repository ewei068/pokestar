const { rarities, rarityConfig, natureConfig, pokemonConfig } = require('../config/pokemonConfig');
const { EmbedBuilder } = require('discord.js');

// pokemon: user's pokemon data
// pokemonData: pokemon species config data
const buildNewPokemonEmbed = (pokemon, pokemonData) => {
    let typeString = "";
    for (let i = 0; i < pokemonData.type.length; i++) {
        typeString += pokemonData.type[i].name;
        if (i < pokemonData.type.length - 1) {
            typeString += "/";
        }
    }

    const ivString = `HP: ${pokemon.ivs[0]} | Atk: ${pokemon.ivs[1]} | Def: ${pokemon.ivs[2]} | SpA: ${pokemon.ivs[3]} | SpD: ${pokemon.ivs[4]} | Spe: ${pokemon.ivs[5]}`

    const embed = new EmbedBuilder();
    embed.setTitle(`${pokemonData.name} (#${pokemon.speciesId})`);
    if (pokemonData.rarity == rarities.LEGENDARY) {
        embed.setDescription(`You caught the LEGENDARY ${pokemonData.name}!`);
    } else {
        embed.setDescription(`You caught a ${pokemonData.rarity} ${pokemonData.name}!`);
    }

    embed.setColor(rarityConfig[pokemonData.rarity].color);
    embed.addFields(
        { name: "Type", value: typeString, inline: true },
        { name: "Nature", value: `${natureConfig[pokemon.natureId].name} (${natureConfig[pokemon.natureId].description})`, inline: true },
        { name: "Ability", value: pokemon.abilityId, inline: true },
        { name: "Shiny", value: pokemon.shiny ? "True" : "False", inline: true },
        { name: "IVs", value: ivString, inline: false },
    );
    embed.setImage(pokemonData.sprite);
    embed.setFooter({ text: `ID: ${pokemon._id}` });

    return embed;
}

const buildPokemonListEmbed = (trainer, pokemons, page) => {
    let pokemonString = "\n";
    for (let i = 0; i < pokemons.length; i++) {
        const pokemon = pokemons[i];
        const pokemonData = pokemonConfig[pokemons[i].speciesId];
        pokemonString += `${pokemonData.emoji} **[Lv. ${pokemon.level}]** ${pokemon.name} (${pokemon._id})\n`;
    }

    const embed = new EmbedBuilder();
    embed.setTitle(`Trainer ${trainer.user.username}'s Pokemon`);
    embed.setColor(0xffffff);
    embed.setDescription(pokemonString);
    embed.setFooter({ text: `Page ${page} | Use \`/inspect <id>\` to inspect a Pokemon!` });

    return embed;
}

module.exports = {
    buildNewPokemonEmbed,
    buildPokemonListEmbed,
}