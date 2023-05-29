const { rarities, rarityConfig, natureConfig, pokemonConfig, typeConfig, growthRateConfig } = require('../config/pokemonConfig');
const { moveConfig, abilityConfig } = require('../config/battleConfig');
const { EmbedBuilder } = require('discord.js');
const { getWhitespace, getPBar, linebreakString, setTwoInline, getOrSetDefault } = require('../utils/utils');
const { getPokemonExpNeeded, buildPokemonStatString, buildPokemonBaseStatString, getAbilityName, getAbilityOrder, buildEquipmentString, buildBoostString } = require('../utils/pokemonUtils');
const { buildMoveString } = require('../utils/battleUtils');
const { backpackItems, backpackItemConfig } = require('../config/backpackConfig');
const { trainerFields } = require('../config/trainerConfig');
const { bannerTypeConfig, pokeballConfig } = require('../config/gachaConfig');
const { getPokeballsString, getItems } = require('../utils/trainerUtils');
const { MAX_EQUIPMENT_LEVEL, levelUpCost, STAT_REROLL_COST: STAT_REROLL_COST, POKEDOLLAR_MULTIPLIER, modifierSlotConfig, modifierConfig, equipmentConfig } = require('../config/equipmentConfig');

const buildBannerEmbed = (trainer, bannerData) => {
    const type = bannerData.bannerType;
    const rateUp = bannerData.rateUp() || {};
    const pity = getOrSetDefault(trainer, "banners", trainerFields.banners.default)[type].pity;

    let displayPokemon = pokemonConfig["25"];
    if (rateUp[rarities.LEGENDARY]) {
        displayPokemon = pokemonConfig[rateUp[rarities.LEGENDARY][0]];
    }

    const rateUpRarities = Object.keys(rateUp);
    const rateUpWhitespace = getWhitespace(rateUpRarities);

    let rateUpString = "";
    for (let i = 0; i < rateUpRarities.length; i++) {
        const rarity = rateUpRarities[i];
        if (rateUp[rarity].length <= 0) {
            continue;
        }
        rateUpString += `\`${rateUpWhitespace[i]} ${rarity} \``;
        for (const speciesId of rateUp[rarity]) {
            const speciesData = pokemonConfig[speciesId];
            rateUpString += ` ${speciesData.emoji}`;
        }
        rateUpString += "\n";
    }
    if (rateUpString == "") {
        rateUpString = "None";
    }

    const embed = new EmbedBuilder();
    embed.setTitle(`${displayPokemon.emoji} ${bannerData.name}`);
    embed.setDescription(`${linebreakString(bannerData.description, 50)}`);
    embed.setColor(0xffffff);
    embed.setThumbnail(`${displayPokemon.sprite}`);
    embed.addFields(
        { name: "Type", value: `${bannerTypeConfig[type].name}`, inline: true },
        { name: "Pity", value: `${pity}/100`, inline: true },
        { name: "Rate Up", value: `${rateUpString}`, inline: false },
        { name: "Your Pokeballs", value: getPokeballsString(trainer), inline: false }
    );
    embed.setFooter( { text: "Get more Pokeballs with /daily, /vote, /levelrewards, /pokemart" } );

    if (bannerData.image) {
        embed.setImage(bannerData.image);
    }

    return embed;
}

const buildGachaInfoString = () => {
    let infoString = "**Gacha Info**\nUse Pokeballs to draw Pokemon from the Gacha! Each Pokeball has a different chance of drawing a Pokemon, with **better Pokeballs being more likely to draw rarer Pokemon.** The higher the rarity, the lower the chance of drawing that Pokemon.\n\n";
    infoString += "**Getting Pokeballs**\n";
    infoString += "You can get Pokeballs from `/daily` (3 random), `/vote` (2 per vote), `/levelrewards`. and `/pokemart`.\n\n";
    infoString += "**Banners**\n";
    infoString += "Scroll through the banners using the buttons. Each banner has a different set of rate-up Pokemon. **When a rarity is drawn, there is a 50% chance to get a random rate-up Pokemon of that rarity instead.** If there are no rate-ups for that rarity, the Pokemon is random. There are also 3 banner types: Standard, Rotating, and Special.\n\n";
    infoString += "**Pity**\n";
    infoString += "Each banner has a pity counter. When a Pokemon is drawn, the pity counter increases according to the Pokeball used. **When the pity counter reaches 100, the next Pokemon drawn will be a random rate-up Legendary Pokemon,** or a random availible Legendary if no rate up. The pity counter resets when a rate-up Legendary Pokemon is drawn. Additionally, **pity is shared between all banners of the same type, and does not reset when rotating.**\n\n";
    infoString += "**Pokeballs**\n";
    for (const pokeball in pokeballConfig) {
        const chances = pokeballConfig[pokeball].chances;
        const pity = pokeballConfig[pokeball].pity;
        infoString += `${backpackItemConfig[pokeball].emoji} ${backpackItemConfig[pokeball].name}:`;
        for (const rarity in chances) {
            infoString += ` ${rarity}: ${Math.floor(chances[rarity] * 100)}% | `;
        }
        infoString += `Pity: ${pity}\n`;
    }
    return infoString;
}

// pokemon: user's pokemon data
// speciesData: pokemon species config data
const buildNewPokemonEmbed = (pokemon, pokeballId=backpackItems.POKEBALL, remaining=0) => {
    const speciesData = pokemonConfig[pokemon.speciesId];
    const pokeballData = backpackItemConfig[pokeballId];
    const pokeballString = `${pokeballData.emoji} You have ${remaining} ${pokeballData.name}s remaining.`;
    
    let typeString = "";
    for (let i = 0; i < speciesData.type.length; i++) {
        typeString += typeConfig[speciesData.type[i]].emoji;
        if (i < speciesData.type.length - 1) {
            typeString += " ";
        }
    }

    const ivString = `HP: ${pokemon.ivs[0]} | Atk: ${pokemon.ivs[1]} | Def: ${pokemon.ivs[2]} | SpA: ${pokemon.ivs[3]} | SpD: ${pokemon.ivs[4]} | Spe: ${pokemon.ivs[5]}`

    const embed = new EmbedBuilder();
    embed.setTitle(`${pokemon.shiny ? "✨" : ""}${speciesData.name} (#${pokemon.speciesId})`);
    const shinyString = pokemon.shiny? "SHINY " : "";
    if (speciesData.rarity == rarities.LEGENDARY) {
        embed.setDescription(`You caught the ${shinyString}LEGENDARY ${speciesData.name}!\n${pokeballString}`);
    } else {
        embed.setDescription(`You caught a ${shinyString}${speciesData.rarity} ${speciesData.name}!\n${pokeballString}`);
    }

    embed.setColor(rarityConfig[speciesData.rarity].color);
    embed.addFields(
        { name: "Type", value: typeString, inline: true },
        { name: "Nature", value: `${natureConfig[pokemon.natureId].name} (${natureConfig[pokemon.natureId].description})`, inline: true },
        { name: "Ability", value: getAbilityName(pokemon.abilityId), inline: true },
        { name: "Shiny", value: pokemon.shiny ? "True" : "False", inline: true },
        { name: "IVs", value: ivString, inline: false },
    );
    embed.setImage(pokemon.shiny ? speciesData.shinySprite : speciesData.sprite);
    const lbHelp = '/info <id> to inspect this Pokemon\n/train <id> to train this Pokemon\n/list to see all your Pokemon';
    const footerText= `ID: ${pokemon._id}\n${lbHelp}`;
    embed.setFooter({ text: footerText });

    return embed;
}

const buildNewPokemonListEmbed = (pokemons, pokeballId=backpackItems.POKEBALL, remaining=0) => {
    let pokemonString = "You caught the following Pokemon:\n\n";
    for (let i = 0; i < pokemons.length; i++) {
        const pokemon = pokemons[i];
        const speciesData = pokemonConfig[pokemons[i].speciesId];
        const ivPercent = pokemon.ivTotal * 100 / (31 * 6);

        pokemonString += `${pokemon.shiny ? "✨" : ""}${speciesData.emoji} **[${speciesData.rarity}] [IV ${Math.round(ivPercent)}%]** ${pokemon.name} (${pokemon._id})\n`;
    }
    const pokeballData = backpackItemConfig[pokeballId];
    const pokeballString = `${pokeballData.emoji} You have ${remaining} ${pokeballData.name}s remaining.`;

    const embed = new EmbedBuilder();
    embed.setTitle(`Gacha Results`);
    embed.setColor(0xffffff);
    embed.setDescription(`${pokemonString}\n${pokeballString}`);
    embed.setFooter({ text: `Select a Pokemon or use /info <id> to inspect it!` });

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

const buildPokemonEmbed = (trainer, pokemon, tab="all", oldPokemon=null) => {
    const speciesData = pokemonConfig[pokemon.speciesId];

    let typeString = "";
    for (let i = 0; i < speciesData.type.length; i++) {
        typeString += typeConfig[speciesData.type[i]].emoji;
        if (i < speciesData.type.length - 1) {
            typeString += " ";
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
    embed.setDescription(`${pokemon.shiny ? "✨" : ""}**[Lv. ${pokemon.level}]** ${speciesData.name} (#${pokemon.speciesId})\n${linebreakString(speciesData.description, 50)}`);
    embed.setColor(rarityConfig[speciesData.rarity].color);
    
    const footerHelp = [];
    if (tab === "info" || tab === "all") {
        embed.addFields(
            { name: "Type", value: typeString, inline: true },
            { name: "Ability", value: getAbilityName(pokemon.abilityId), inline: true },
            { name: "Nature", value: `${natureConfig[pokemon.natureId].name} (${natureConfig[pokemon.natureId].description})`, inline: true },
            { name: "Rarity", value: speciesData.rarity, inline: true },
            { name: "Shiny", value: pokemon.shiny ? "True" : "False", inline: true },
            { name: "Date Caught", value: new Date(pokemon.dateAcquired).toLocaleDateString(), inline: true },
            { name: "Stats (Stat|IVs|EVs)", value: statString, inline: false },
            { name: "Level Progress", value: progressBar, inline: false }
        );

        footerHelp.push("/train <id> to train this Pokemon");
    }

    // moves & abilities
    if (tab === "battle" || tab === "all") {
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
        setTwoInline(fields);

        if (fields.length > 0) {
            embed.addFields(fields);
        }

        // add ability field
        const abilityData = abilityConfig[pokemon.abilityId];
        embed.addFields(
            { name: `Ability: ${getAbilityName(pokemon.abilityId)}`, value: abilityData ? abilityData.description : "Not yet implemented!", inline: false }
        )

        footerHelp.push("/partyadd <id> <position> to add this Pokemon to your party");
    }

    // equipment
    if (tab === "equipment") {
        const fields = Object.entries(pokemon.equipments).map(([equipmentType, equipment]) => {
            const { equipmentHeader, equipmentString } = buildEquipmentString(equipmentType, equipment);
            return {
                name: equipmentHeader,
                value: equipmentString,
                inline: true,
            };
        });

        // every 2 fields, add a blank field
        setTwoInline(fields);

        if (fields.length > 0) {
            embed.addFields(fields);
        }

        // add stat boost field
        if (oldPokemon) {
            embed.addFields(
                { name: "Stat Boost", value: buildBoostString(oldPokemon, pokemon), inline: false }
            );
        }

        footerHelp.push("/equipment <id> to upgrade equipment");
    }

    embed.setImage(pokemon.shiny ? speciesData.shinySprite : speciesData.sprite);

    const lbHelp = footerHelp.join("\n");
    embed.setFooter({ text: `ID: ${pokemon._id}\n${lbHelp}` });

    return embed;
}

const buildEquipmentEmbed = (pokemon, oldPokemon) => {
    const speciesData = pokemonConfig[pokemon.speciesId];
    const embed = new EmbedBuilder();
    embed.setTitle(`${pokemon.name}'s Equipment`);
    embed.setColor(rarityConfig[speciesData.rarity].color);
    
    // equipment
    const fields = Object.entries(pokemon.equipments).map(([equipmentType, equipment]) => {
        const { equipmentHeader, equipmentString } = buildEquipmentString(equipmentType, equipment);
        return {
            name: equipmentHeader,
            value: equipmentString,
            inline: true,
        };
    });

    // every 2 fields, add a blank field
    setTwoInline(fields);

    if (fields.length > 0) {
        embed.addFields(fields);
    }

    // add stat boost field
    if (oldPokemon) {
        embed.addFields(
            { name: "Stat Boost", value: buildBoostString(oldPokemon, pokemon), inline: false }
        );
    }
    embed.setFooter({ text: `Select an equipment below to upgrade it!` });

    return embed;
}

const buildEquipmentUpgradeEmbed = (trainer, pokemon, equipmentType, equipment, upgrade=false) => {
    const equipmentData = equipmentConfig[equipmentType];
    const material = equipmentData.material;
    const materialData = backpackItemConfig[material];
    const levelUpgradeString = equipment.level >= MAX_EQUIPMENT_LEVEL ? "**This equipment is max level.**" : `**₽${levelUpCost(equipment.level) * POKEDOLLAR_MULTIPLIER}, ${materialData.emoji} x${levelUpCost(equipment.level)} to upgrade level.**`;
    const substatUpgradeString = `**₽${STAT_REROLL_COST * POKEDOLLAR_MULTIPLIER}, ${materialData.emoji} x${STAT_REROLL_COST} to reroll stats.**`;

    const embed = new EmbedBuilder();
    const upgradeString = upgrade ? ` -> ${equipment.level + 1}` : "";
    embed.setTitle(`${equipmentData.emoji} [Lv. ${equipment.level}${upgradeString}] ${equipmentData.name} (${pokemon.name})`);
    embed.setColor("#FFFFFF");
    embed.setDescription(`${equipmentData.description}\n\n${levelUpgradeString}\n${substatUpgradeString}`);

    // add substat fields
    const fields = Object.entries(equipment.slots).map(([slotId, slot]) => {
        const slotData = modifierSlotConfig[slotId];
        const modifierData = modifierConfig[slot.modifier];
        const { type, min, max } = modifierData;

        const baseValue = slot.quality / 100 * (max - min) + min;
        const value = Math.round(baseValue * (slotData.level ? equipment.level : 1));
        const upgradeValue = Math.round(baseValue * (slotData.level && upgrade ? equipment.level + 1 : 1));

        const header = `${slotData.name}`
        let valueString = `${modifierData.name}: ${value}${type === "percent" ? "%" : ""}`;
        if (value !== upgradeValue) {
            valueString += ` -> ${upgradeValue}${type === "percent" ? "%" : ""}`;
        }
        valueString += ` | Quality: ${slot.quality}%`;

        return {
            name: header,
            value: valueString,
            inline: false,
        };
    });
    embed.addFields(fields);
    embed.setImage(equipmentData.sprite);
    embed.setFooter({ text: `You have ₽${trainer.money} and ${getItems(trainer, material)} ${materialData.name}s` });

    return embed;
}

const buildSpeciesDexEmbed = (id, speciesData, tab) => {
    const embed = new EmbedBuilder();
    embed.setTitle(`${speciesData.emoji} #${id} ${speciesData.name}`);
    embed.setColor(rarityConfig[speciesData.rarity].color);
    
    if (tab === "info") {
        // display: description, type, abilities, rarity, battleEligibility, evolvable, growth rate
        let typeString = "";
        for (let i = 0; i < speciesData.type.length; i++) {
            typeString += typeConfig[speciesData.type[i]].emoji;
            if (i < speciesData.type.length - 1) {
                typeString += " ";
            }
        }

        let abilityString = "";
        const abilityIds = getAbilityOrder(speciesData.abilities);
        for (let i = 0; i < abilityIds.length; i++) {
            const abilityId = abilityIds[i];
            const abilityProbability = speciesData.abilities[abilityId];
            abilityString += `${getAbilityName(abilityId)} (${Math.floor(abilityProbability * 100)}%)`;
            if (i < abilityIds.length - 1) {
                abilityString += "\n";
            }
        }

        embed.setDescription(`${linebreakString(speciesData.description, 50)}`);
        embed.addFields(
            { name: "Type", value: typeString, inline: true },
            { name: "Abilities", value: abilityString, inline: true },
            { name: "Battle Eligibile", value: speciesData.battleEligible ? "True" : "False", inline: true },
            { name: "Rarity", value: speciesData.rarity, inline: true },
            { name: "Evolvable", value: speciesData.evolution ? "True" : "False", inline: true },
            { name: "Growth Rate", value: growthRateConfig[speciesData.growthRate].name, inline: true },
        );
        embed.setImage(speciesData.sprite);
    } else if (tab === "growth") {
        // display: growth rate, base stats, total, evolutions
        let evolutionString = "";
        if (speciesData.evolution) {
            for (let i = 0; i < speciesData.evolution.length; i++) {
                const evolution = speciesData.evolution[i];
                evolutionString += `Lv. ${evolution.level}: #${evolution.id} ${pokemonConfig[evolution.id].name}`;
                if (i < speciesData.evolution.length - 1) {
                    evolutionString += "\n";
                }
            }
        } else {
            evolutionString = "No evolutions!";
        }

        embed.setDescription(`Growth information for #${id} ${speciesData.name}:`);
        embed.addFields(
            { name: "Growth Rate", value: growthRateConfig[speciesData.growthRate].name, inline: true },
            { name: "Base Stats", value: buildPokemonBaseStatString(speciesData), inline: false },
            { name: "Evolutions", value: evolutionString, inline: false },
        );
    } else if (tab === "moves") {
        // display: move strings
        if (!speciesData.moveIds) {
            embed.setDescription(`No moves!`);
        } else {
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
            setTwoInline(fields);

            embed.setDescription(`Moves for #${id} ${speciesData.name}:`);
            embed.addFields(fields);
        }
    } else if (tab === "abilities") {
        // display: ability strings
        const fields = getAbilityOrder(speciesData.abilities).map((abilityId) => {
            const abilityProbability = speciesData.abilities[abilityId];
            const abilityData = abilityConfig[abilityId];
            const abilityHeader = `${getAbilityName(abilityId)} (${Math.floor(abilityProbability * 100)}%)`;
            const abilityString = abilityData ? abilityData.description : "Not yet implemented!";
            return {
                name: abilityHeader,
                value: abilityString,
                inline: false,
            };
        });

        embed.setDescription(`Abilities for #${id} ${speciesData.name}:`);
        embed.addFields(fields);
    }

    return embed;
}

module.exports = {
    buildBannerEmbed,
    buildNewPokemonEmbed,
    buildNewPokemonListEmbed,
    buildPokemonListEmbed,
    buildPokemonEmbed,
    buildEquipmentEmbed,
    buildEquipmentUpgradeEmbed,
    buildSpeciesDexEmbed,
    buildGachaInfoString
}