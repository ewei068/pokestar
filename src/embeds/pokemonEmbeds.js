const { rarities, rarityConfig, natureConfig, pokemonConfig, } = require('../config/pokemonConfig');
const { EmbedBuilder } = require('discord.js');
const { getWhitespace, getPBar } = require('../utils/utils');
const { getPokemonExpNeeded } = require('../utils/pokemonUtils');

// pokemon: user's pokemon data
// speciesData: pokemon species config data
const buildNewPokemonEmbed = (pokemon, speciesData) => {
    let typeString = "";
    for (let i = 0; i < speciesData.type.length; i++) {
        typeString += speciesData.type[i].name;
        if (i < speciesData.type.length - 1) {
            typeString += "/";
        }
    }

    const ivString = `HP: ${pokemon.ivs[0]} | Atk: ${pokemon.ivs[1]} | Def: ${pokemon.ivs[2]} | SpA: ${pokemon.ivs[3]} | SpD: ${pokemon.ivs[4]} | Spe: ${pokemon.ivs[5]}`

    const embed = new EmbedBuilder();
    embed.setTitle(`${speciesData.name} (#${pokemon.speciesId})`);
    if (speciesData.rarity == rarities.LEGENDARY) {
        embed.setDescription(`You caught the LEGENDARY ${speciesData.name}!`);
    } else {
        embed.setDescription(`You caught a ${speciesData.rarity} ${speciesData.name}!`);
    }

    embed.setColor(rarityConfig[speciesData.rarity].color);
    embed.addFields(
        { name: "Type", value: typeString, inline: true },
        { name: "Nature", value: `${natureConfig[pokemon.natureId].name} (${natureConfig[pokemon.natureId].description})`, inline: true },
        { name: "Ability", value: pokemon.abilityId, inline: true },
        { name: "Shiny", value: pokemon.shiny ? "True" : "False", inline: true },
        { name: "IVs", value: ivString, inline: false },
    );
    embed.setImage(speciesData.sprite);
    embed.setFooter({ text: `ID: ${pokemon._id}` });

    return embed;
}

const buildPokemonListEmbed = (trainer, pokemons, page) => {
    let pokemonString = "\n";
    for (let i = 0; i < pokemons.length; i++) {
        const pokemon = pokemons[i];
        const speciesData = pokemonConfig[pokemons[i].speciesId];
        pokemonString += `${speciesData.emoji} **[Lv. ${pokemon.level}]** ${pokemon.name} (${pokemon._id})\n`;
    }

    const embed = new EmbedBuilder();
    embed.setTitle(`Trainer ${trainer.user.username}'s Pokemon`);
    embed.setColor(0xffffff);
    embed.setDescription(pokemonString);
    embed.setFooter({ text: `Page ${page} | Use \`/info <id>\` to inspect a Pokemon!` });

    return embed;
}

const buildPokemonEmbed = (trainer, pokemon) => {
    const speciesData = pokemonConfig[pokemon.speciesId];
    // console.log(speciesData)

    let typeString = "";
    for (let i = 0; i < speciesData.type.length; i++) {
        typeString += speciesData.type[i].name;
        if (i < speciesData.type.length - 1) {
            typeString += "/";
        }
    }

    const oldLevelExp = getPokemonExpNeeded(pokemon.level, speciesData.growthRate);
    const newLevelExp = getPokemonExpNeeded(pokemon.level + 1, speciesData.growthRate);
    const levelPercent = pokemon.level >= 100 ? 0 : ((pokemon.exp || 0) - oldLevelExp) / (newLevelExp - oldLevelExp) * 100;
    const progressBar = `${getPBar(levelPercent, 20)} -- ${Math.round(levelPercent)}%`;

    const statArray = [
        `${pokemon.stats[0]}|${pokemon.ivs[0]}|${pokemon.evs[0]}`,
        `${pokemon.stats[1]}|${pokemon.ivs[1]}|${pokemon.evs[1]}`,
        `${pokemon.stats[2]}|${pokemon.ivs[2]}|${pokemon.evs[2]}`,
        `${pokemon.stats[3]}|${pokemon.ivs[3]}|${pokemon.evs[3]}`,
        `${pokemon.stats[4]}|${pokemon.ivs[4]}|${pokemon.evs[4]}`,
        `${pokemon.stats[5]}|${pokemon.ivs[5]}|${pokemon.evs[5]}`
    ];
    const whitespace = getWhitespace(statArray);
    let statString = "";
    statString += `\` HP (${whitespace[0]}${statArray[0]})\` ${getPBar(pokemon.stats[0] * 100 / 300)}\n`;
    statString += `\`Atk (${whitespace[1]}${statArray[1]})\` ${getPBar(pokemon.stats[1] * 100 / 300)}\n`;
    statString += `\`Def (${whitespace[2]}${statArray[2]})\` ${getPBar(pokemon.stats[2] * 100 / 300)}\n`;
    statString += `\`SpA (${whitespace[3]}${statArray[3]})\` ${getPBar(pokemon.stats[3] * 100 / 300)}\n`;
    statString += `\`SpD (${whitespace[4]}${statArray[4]})\` ${getPBar(pokemon.stats[4] * 100 / 300)}\n`;
    statString += `\`Spe (${whitespace[5]}${statArray[5]})\` ${getPBar(pokemon.stats[5] * 100 / 300)}\n`;
    statString += `Power: ${pokemon.combatPower}`;

    const embed = new EmbedBuilder();
    embed.setTitle(`${trainer.user.username}'s ${pokemon.name}`);
    embed.setDescription(`**[Lv. ${pokemon.level}]** ${speciesData.name} (#${pokemon.speciesId})`);
    embed.setColor(rarityConfig[speciesData.rarity].color);
    embed.addFields(
        { name: "Type", value: typeString, inline: true },
        { name: "Nature", value: `${natureConfig[pokemon.natureId].name} (${natureConfig[pokemon.natureId].description})`, inline: true },
        { name: "Ability", value: pokemon.abilityId, inline: true },
        { name: "Stats (Stat|IVs|EVs)", value: statString, inline: false },
        { name: "Level Progress", value: progressBar, inline: false }
    );
    embed.setImage(speciesData.sprite);
    embed.setFooter({ text: `ID: ${pokemon._id}` });

    return embed;
}



module.exports = {
    buildNewPokemonEmbed,
    buildPokemonListEmbed,
    buildPokemonEmbed,
}