const { rarities, rarityConfig, natureConfig, pokemonConfig, typeConfig } = require('../config/pokemonConfig');
const { moveConfig } = require('../config/battleConfig');
const { EmbedBuilder } = require('discord.js');
const { getWhitespace, getPBar, linebreakString } = require('../utils/utils');
const { getPokemonExpNeeded, buildPokemonStatString } = require('../utils/pokemonUtils');
const { buildMoveString } = require('../utils/battleUtils');

// pokemon: user's pokemon data
// speciesData: pokemon species config data
const buildNewPokemonEmbed = (pokemon, speciesData) => {
    let typeString = "";
    for (let i = 0; i < speciesData.type.length; i++) {
        typeString += typeConfig[speciesData.type[i]].name;
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
    embed.setImage(pokemon.shiny ? speciesData.shinySprite : speciesData.sprite);
    const lbHelp = '/info <id> to inspect this Pokemon\n/train <id> to train this Pokemon\n/list to see all your Pokemon';
    const footerText= `ID: ${pokemon._id}\n${lbHelp}`;
    embed.setFooter({ text: footerText });

    return embed;
}

const buildPokemonListEmbed = (trainer, pokemons, page) => {
    let pokemonString = "\n";
    for (let i = 0; i < pokemons.length; i++) {
        const pokemon = pokemons[i];
        const speciesData = pokemonConfig[pokemons[i].speciesId];
        const ivPercent = pokemon.ivTotal * 100 / (31 * 6);
        
        pokemonString += `${pokemon.shiny ? "✨" : ""}${speciesData.emoji} **[Lv. ${pokemon.level}] [IV ${Math.round(ivPercent)}%]** ${pokemon.name} (${pokemon._id})\n`;
    }

    const embed = new EmbedBuilder();
    embed.setTitle(`Trainer ${trainer.user.username}'s Pokemon`);
    embed.setColor(0xffffff);
    embed.setDescription(pokemonString);
    embed.setFooter({ text: `Page ${page} | Select a Pokemon or use /info <id> to inspect it!` });

    return embed;
}

const buildPokemonEmbed = (trainer, pokemon) => {
    const speciesData = pokemonConfig[pokemon.speciesId];

    let typeString = "";
    for (let i = 0; i < speciesData.type.length; i++) {
        typeString += typeConfig[speciesData.type[i]].name;
        if (i < speciesData.type.length - 1) {
            typeString += "/";
        }
    }

    const oldLevelExp = getPokemonExpNeeded(pokemon.level, speciesData.growthRate);
    const newLevelExp = getPokemonExpNeeded(pokemon.level + 1, speciesData.growthRate);
    const levelPercent = pokemon.level >= 100 ? 0 : ((pokemon.exp || 0) - oldLevelExp) / (newLevelExp - oldLevelExp) * 100;
    const progressBar = `${getPBar(levelPercent, 20)} -- ${Math.round(levelPercent)}%`;

    const statString = buildPokemonStatString(pokemon);

    // TODO: display original owner?
    const embed = new EmbedBuilder();
    embed.setTitle(`${trainer.user.username}'s ${pokemon.name}`);
    embed.setDescription(`${pokemon.shiny ? "✨" : ""}**[Lv. ${pokemon.level}]** ${speciesData.name} (#${pokemon.speciesId})\n${speciesData.description}`);
    embed.setColor(rarityConfig[speciesData.rarity].color);
    embed.addFields(
        { name: "Type", value: typeString, inline: true },
        { name: "Ability", value: pokemon.abilityId, inline: true },
        { name: "Nature", value: `${natureConfig[pokemon.natureId].name} (${natureConfig[pokemon.natureId].description})`, inline: true },
        { name: "Rarity", value: speciesData.rarity, inline: true },
        { name: "Shiny", value: pokemon.shiny ? "True" : "False", inline: true },
        { name: "Date Caught", value: new Date(pokemon.dateAcquired).toLocaleDateString(), inline: true },
        { name: "Stats (Stat|IVs|EVs)", value: statString, inline: false },
        { name: "Level Progress", value: progressBar, inline: false }
    );

    // if pokemon has moves, display them
    if (speciesData.moveIds) {
        const fields = speciesData.moveIds.map((moveId) => {
            const moveData = moveConfig[moveId];
            const { moveHeader, moveString } = buildMoveString(moveData);
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

        embed.addFields(fields);
    }

    embed.setImage(pokemon.shiny ? speciesData.shinySprite : speciesData.sprite);

    const lbHelp = '/train <id> to train this Pokemon' + (pokemon.battleEligible ? '\n/partyadd <id> <position> to add this Pokemon to your party' : '');
    embed.setFooter({ text: `ID: ${pokemon._id}\n${lbHelp}` });

    return embed;
}



module.exports = {
    buildNewPokemonEmbed,
    buildPokemonListEmbed,
    buildPokemonEmbed,
}