/**
 * @file
 * @author Elvis Wei
 *
 * pokemonEmbeds.js is a file that creates all relevant embeds for pokemon-related actions by the user.
 */
const { EmbedBuilder } = require("discord.js");
const {
  rarities,
  rarityConfig,
  natureConfig,
  pokemonConfig,
  typeConfig,
  growthRateConfig,
} = require("../config/pokemonConfig");
const { getAbility } = require("../battle/data/abilityRegistry");
const { getMove } = require("../battle/data/moveRegistry");
const {
  getWhitespace,
  getPBar,
  linebreakString,
  setTwoInline,
  getOrSetDefault,
  formatMoney,
  getNextTimeIntervalDate,
  buildBlockQuoteString,
} = require("../utils/utils");
const {
  getPokemonExpNeeded,
  buildPokemonStatString,
  buildPokemonBaseStatString,
  getAbilityName,
  getAbilityOrder,
  buildEquipmentString,
  buildBoostString,
  getMoveIds,
  buildCompactEquipmentString,
  buildSpeciesEvolutionString,
  buildPokemonNameString,
  buildPokemonEmojiString,
} = require("../utils/pokemonUtils");
const { buildMoveString } = require("../utils/battleUtils");
const {
  backpackItems,
  backpackItemConfig,
} = require("../config/backpackConfig");
const { trainerFields } = require("../config/trainerConfig");
const {
  bannerTypeConfig,
  pokeballConfig,
  getCelebiPool,
} = require("../config/gachaConfig");
const {
  getPokeballsString,
  getItems,
  formatDreamCardsForTrainer,
} = require("../utils/trainerUtils");
const {
  MAX_EQUIPMENT_LEVEL,
  levelUpCost,
  STAT_REROLL_COST,
  POKEDOLLAR_MULTIPLIER,
  modifierSlotConfig,
  modifierConfig,
  equipmentConfig,
  SWAP_COST,
} = require("../config/equipmentConfig");
const { pokemonIdEnum } = require("../enums/pokemonEnums");
const { timeEnum } = require("../enums/miscEnums");
const {
  formatItemQuantityFromBackpack,
  getItemDisplay,
} = require("../utils/itemUtils");
const { emojis } = require("../enums/emojis");

/**
 *
 * @param {Trainer} trainer
 * @param {BannerData} bannerData
 * @returns {EmbedBuilder}
 */
const buildBannerEmbed = (trainer, bannerData) => {
  const type = bannerData.bannerType;
  const rateUp = bannerData.rateUp() || {};
  const { pity } = getOrSetDefault(
    trainer,
    "banners",
    trainerFields.banners.default
  )[type];

  let displayPokemon = pokemonConfig["25"];
  if (rateUp[rarities.LEGENDARY]) {
    displayPokemon = pokemonConfig[rateUp[rarities.LEGENDARY][0]];
  }

  const rateUpRarities = Object.keys(rateUp);
  const rateUpWhitespace = getWhitespace(rateUpRarities);

  let rateUpString = "";
  for (let i = 0; i < rateUpRarities.length; i += 1) {
    const rarity = rateUpRarities[i];
    if (rateUp[rarity].length <= 0) {
      continue;
    }
    rateUpString += `\`${rateUpWhitespace[i]} ${rarity} \``;
    for (const speciesId of rateUp[rarity].slice(0, 15)) {
      const speciesData = pokemonConfig[speciesId];
      rateUpString += ` ${speciesData.emoji}`;
    }
    if (rateUp[rarity].length > 15) {
      rateUpString += ` ...and ${rateUp[rarity].length - 15} more!`;
    }
    rateUpString += "\n";
  }
  if (rateUpString === "") {
    rateUpString = "None";
  }

  const embed = new EmbedBuilder();
  embed.setTitle(`${displayPokemon.emoji} ${bannerData.name}`);
  embed.setDescription(
    buildBlockQuoteString(linebreakString(bannerData.description, 45))
  );
  embed.setColor(0xffffff);
  embed.setThumbnail(`${displayPokemon.sprite}`);
  embed.addFields(
    { name: "Type", value: `${bannerTypeConfig[type].name}`, inline: true },
    { name: "Pity", value: `${pity}/100`, inline: true },
    { name: "Rate Up", value: `${rateUpString}`, inline: false },
    {
      name: "Your Pokeballs",
      value: getPokeballsString(trainer),
      inline: false,
    }
  );
  embed.setFooter({
    text: "Get more Pokeballs with /daily, /vote, /levelrewards, /pokemart",
  });

  if (bannerData.image) {
    embed.setImage(bannerData.image);
  }

  return embed;
};

const buildGachaInfoString = () => {
  let infoString =
    "**Gacha Info**\nUse Pokeballs to draw Pokemon from the Gacha! Each Pokeball has a different chance of drawing a Pokemon, with **better Pokeballs being more likely to draw rarer Pokemon.** The higher the rarity, the lower the chance of drawing that Pokemon.\n\n";
  infoString += "**Getting Pokeballs**\n";
  infoString +=
    "You can get Pokeballs from `/daily` (3 random), `/vote` (2 per vote), `/tutorial`, `/pve` (daily), `/levelrewards`. and `/pokemart`.\n\n";
  infoString += "**Banners**\n";
  infoString +=
    "Scroll through the banners using the buttons. Each banner has a different set of rate-up Pokemon. **When a rarity is drawn, there is a 50% chance to get a random rate-up Pokemon of that rarity instead.** If there are no rate-ups for that rarity, the Pokemon is random. There are also 3 banner types: Standard, Rotating, and Special.\n\n";
  infoString += "**Pity**\n";
  infoString +=
    "Each banner has a pity counter. When a Pokemon is drawn, the pity counter increases according to the Pokeball used. **When the pity counter reaches 100, the next Pokemon drawn will be a random rate-up Legendary Pokemon,** or a random availible Legendary if no rate up. The pity counter resets when a rate-up Legendary Pokemon is drawn. Additionally, **pity is shared between all banners of the same type, and does not reset when rotating.**\n\n";
  infoString += "**Pokeballs**\n";
  for (const pokeball in pokeballConfig) {
    const { chances } = pokeballConfig[pokeball];
    const { pity } = pokeballConfig[pokeball];
    infoString += `${backpackItemConfig[pokeball].emoji} ${backpackItemConfig[pokeball].name}:`;
    for (const rarity in chances) {
      infoString += ` ${rarity}: ${Math.floor(chances[rarity] * 100)}% | `;
    }
    infoString += `Pity: ${pity}\n`;
  }
  return infoString;
};

/**
 * @param {PokemonIdEnum} speciesId
 * @param {number} level
 * @param {boolean=} shiny
 * @returns {EmbedBuilder}
 */
const buildPokemonSpawnEmbed = (speciesId, level, shiny = false) => {
  const speciesData = pokemonConfig[speciesId];
  const embed = new EmbedBuilder();
  embed.setTitle(
    buildPokemonNameString({
      speciesId,
      shiny,
    })
  );
  embed.setDescription(
    `A wild **Level ${level} ${speciesData.name}** has appeared!`
  );
  embed.setColor(rarityConfig[speciesData.rarity].color);
  embed.setImage(`${shiny ? speciesData.shinySprite : speciesData.sprite}`);
  embed.setFooter({
    text: "Use '/spawn manage' to manage where Pokemon can spawn!",
  });
  return embed;
};

// pokemon: user's pokemon data
// speciesData: pokemon species config data
/**
 *
 * @param {Pokemon} pokemon
 * @param {BackpackItemEnum} pokeballId
 * @param {number=} remaining
 * @returns {EmbedBuilder}
 */
const buildNewPokemonEmbed = (
  pokemon,
  pokeballId = backpackItems.POKEBALL,
  remaining = -1
) => {
  const speciesData = pokemonConfig[pokemon.speciesId];
  const pokeballData = backpackItemConfig[pokeballId];
  const pokeballString =
    remaining === -1
      ? ``
      : `${pokeballData.emoji} You have ${remaining} ${pokeballData.name}s remaining.`;

  let typeString = "";
  for (let i = 0; i < speciesData.type.length; i += 1) {
    typeString += typeConfig[speciesData.type[i]].emoji;
    if (i < speciesData.type.length - 1) {
      typeString += " ";
    }
  }

  const ivString = `HP: ${pokemon.ivs[0]} | Atk: ${pokemon.ivs[1]} | Def: ${pokemon.ivs[2]} | SpA: ${pokemon.ivs[3]} | SpD: ${pokemon.ivs[4]} | Spe: ${pokemon.ivs[5]}`;

  const embed = new EmbedBuilder();
  embed.setTitle(`${buildPokemonNameString(pokemon)} (#${pokemon.speciesId})`);
  const shinyString = pokemon.shiny ? "SHINY " : "";
  if (speciesData.rarity === rarities.LEGENDARY) {
    embed.setDescription(
      `<@${pokemon.userId}> caught the ${shinyString}LEGENDARY ${speciesData.name}!\n${pokeballString}`
    );
  } else {
    embed.setDescription(
      `<@${pokemon.userId}> caught a ${shinyString}${speciesData.rarity} ${speciesData.name}!\n${pokeballString}`
    );
  }

  embed.setColor(rarityConfig[speciesData.rarity].color);
  embed.addFields(
    { name: "Type", value: typeString, inline: true },
    {
      name: "Nature",
      value: `${natureConfig[pokemon.natureId].name} (${
        natureConfig[pokemon.natureId].description
      })`,
      inline: true,
    },
    { name: "Ability", value: getAbilityName(pokemon.abilityId), inline: true },
    { name: "Shiny", value: pokemon.shiny ? "True" : "False", inline: true }
  );
  if (pokemon.heldItemId) {
    embed.addFields({
      name: "Held Item",
      value: getItemDisplay(pokemon.heldItemId),
      inline: true,
    });
  }
  embed.addFields({ name: "IVs", value: ivString, inline: false });
  embed.setImage(pokemon.shiny ? speciesData.shinySprite : speciesData.sprite);
  const lbHelp =
    "/info <id> to inspect this Pokemon\n/train <id> to train this Pokemon\n/list to see all your Pokemon";
  const footerText = `ID: ${pokemon._id}\n${lbHelp}`;
  embed.setFooter({ text: footerText });

  return embed;
};

/**
 * @param {WithId<Pokemon>[]} pokemons
 * @param {BackpackItemEnum} pokeballId
 * @param {number=} remaining
 * @returns {EmbedBuilder}
 */
const buildNewPokemonListEmbed = (
  pokemons,
  pokeballId = backpackItems.POKEBALL,
  remaining = 0
) => {
  let pokemonString = "You caught the following Pokemon:\n\n";
  for (let i = 0; i < pokemons.length; i += 1) {
    const pokemon = pokemons[i];
    const speciesData = pokemonConfig[pokemons[i].speciesId];
    const ivPercent = (pokemon.ivTotal * 100) / (31 * 6);
    const heldItemEmoji = pokemon.heldItemId
      ? `${backpackItemConfig[pokemon.heldItemId].emoji} `
      : "";

    pokemonString += `${pokemon.shiny ? "✨" : ""}${speciesData.emoji} **[${
      speciesData.rarity
    }] [IV ${Math.round(ivPercent)}%]** ${pokemon.name} ${heldItemEmoji}(${
      pokemon._id
    })\n`;
  }
  const pokeballData = backpackItemConfig[pokeballId];
  const pokeballString = `${pokeballData.emoji} You have ${remaining} ${pokeballData.name}s remaining.`;

  const embed = new EmbedBuilder();
  embed.setTitle(`Gacha Results`);
  embed.setColor(0xffffff);
  embed.setDescription(`${pokemonString}\n${pokeballString}`);
  embed.setFooter({
    text: `Select a Pokemon or use /info <id> to inspect it!`,
  });

  return embed;
};

/**
 * @param {string} username
 * @param {Pokemon[]} pokemons
 * @param {number} page
 * @returns {EmbedBuilder}
 */
const buildPokemonListEmbed = (username, pokemons, page) => {
  let pokemonString = "\n";
  for (let i = 0; i < pokemons.length; i += 1) {
    const pokemon = pokemons[i];
    const speciesData = pokemonConfig[pokemons[i].speciesId];
    const ivPercent = (pokemon.ivTotal * 100) / (31 * 6);
    const heldItemEmoji = pokemon.heldItemId
      ? `${backpackItemConfig[pokemon.heldItemId].emoji} `
      : "";

    pokemonString += `${pokemon.shiny ? "✨" : ""}${speciesData.emoji} **[Lv. ${
      pokemon.level
    }] [IV ${Math.round(ivPercent)}%]** ${pokemon.name} ${heldItemEmoji}(${
      pokemon._id
    })\n`;
  }

  const embed = new EmbedBuilder();
  embed.setTitle(`Trainer ${username}'s Pokemon`);
  embed.setColor(0xffffff);
  embed.setDescription(pokemonString);
  embed.setFooter({
    text: `Page ${page} | Select a Pokemon or use /info <id> to inspect it!`,
  });

  return embed;
};

/**
 * @param {CompactUser | DiscordUser} user
 * @param {WithId<Pokemon>} pokemon
 * @param {("info" | "battle" | "equipment" | "all")=} tab
 * @param {Pokemon=} oldPokemon
 * @param {string=} originalOwnerId
 * @returns {EmbedBuilder}
 */
const buildPokemonEmbed = (
  user,
  pokemon,
  tab = "all",
  oldPokemon = null,
  originalOwnerId = null
) => {
  const speciesData = pokemonConfig[pokemon.speciesId];

  let typeString = "";
  for (let i = 0; i < speciesData.type.length; i += 1) {
    typeString += typeConfig[speciesData.type[i]].emoji;
    if (i < speciesData.type.length - 1) {
      typeString += " ";
    }
  }

  let sixthField = {
    name: "Shiny",
    value: pokemon.shiny ? "✨ True" : "🚫 False",
    inline: true,
  };
  if (originalOwnerId) {
    sixthField = {
      name: "Original Owner",
      value: `👑 <@${originalOwnerId}>`,
      inline: true,
    };
  }

  const oldLevelExp = getPokemonExpNeeded(
    pokemon.level,
    speciesData.growthRate
  );
  const newLevelExp = getPokemonExpNeeded(
    pokemon.level + 1,
    speciesData.growthRate
  );
  const levelPercent =
    pokemon.level >= 100
      ? 0
      : (((pokemon.exp || 0) - oldLevelExp) / (newLevelExp - oldLevelExp)) *
        100;
  const progressBar = `${getPBar(levelPercent, 20)} -- ${Math.round(
    levelPercent
  )}%`;

  const statString = buildPokemonStatString(pokemon);

  // TODO: display original owner?
  const embed = new EmbedBuilder();
  embed.setTitle(
    `${buildPokemonEmojiString(pokemon)} ${user.username}'s ${pokemon.name}`
  );
  embed.setDescription(
    `${pokemon.shiny ? "✨" : ""}**[Lv. ${pokemon.level}]** ${
      speciesData.name
    } (#${pokemon.speciesId})\n${buildBlockQuoteString(
      speciesData.description
    )}`
  );
  embed.setColor(rarityConfig[speciesData.rarity].color);

  const footerHelp = [];
  if (tab === "info" || tab === "all") {
    const heldItemString =
      tab === "info" && pokemon.heldItemId
        ? `\n**Held Item:** ${getItemDisplay(pokemon.heldItemId)}`
        : "";

    embed.addFields(
      { name: "Type", value: typeString, inline: true },
      {
        name: "Ability",
        value: `💫 ${getAbilityName(pokemon.abilityId)}`,
        inline: true,
      },
      {
        name: "Nature",
        value: `🧬 ${natureConfig[pokemon.natureId].name} (${
          natureConfig[pokemon.natureId].description
        })`,
        inline: true,
      },
      {
        name: "Rarity",
        value: `${rarityConfig[speciesData.rarity].emoji} ${
          speciesData.rarity
        }`,
        inline: true,
      },
      {
        name: "Date Caught",
        value: `🗓️ ${new Date(pokemon.dateAcquired).toLocaleDateString()}`,
        inline: true,
      },
      sixthField,
      {
        name: "💪 Stats (Stat|IVs|EVs)",
        value: `${statString}${heldItemString}`, // TODO: can't find a better place to put this lol
        inline: false,
      },
      { name: "Level Progress", value: `⏳ ${progressBar}`, inline: false }
    );

    footerHelp.push("/train <id> to train this Pokemon");
  }

  // moves & abilities
  if (tab === "battle" || tab === "all") {
    const fields = getMoveIds(pokemon).map((moveId) => {
      const moveData = getMove(moveId);
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
    const abilityData = getAbility(pokemon.abilityId);
    embed.addFields({
      name: `Ability: ${getAbilityName(pokemon.abilityId)}`,
      value: abilityData
        ? buildBlockQuoteString(abilityData.description)
        : "Not yet implemented!",
      inline: false,
    });

    // add held item field
    if (pokemon.heldItemId) {
      embed.addFields({
        name: `Held Item: ${getItemDisplay(pokemon.heldItemId)}`,
        value: buildBlockQuoteString(
          backpackItemConfig[pokemon.heldItemId].description
        ),
        inline: false,
      });
    }
  }

  // equipment
  if (tab === "equipment") {
    const fields = Object.entries(pokemon.equipments).map(
      ([equipmentType, equipment]) => {
        const { equipmentHeader, equipmentString } = buildEquipmentString(
          equipmentType,
          equipment
        );
        return {
          name: equipmentHeader,
          value: equipmentString,
          inline: true,
        };
      }
    );

    // every 2 fields, add a blank field
    setTwoInline(fields);

    if (fields.length > 0) {
      embed.addFields(fields);
    }

    // add stat boost field
    if (oldPokemon) {
      embed.addFields({
        name: "⬆️ Stat Boost",
        value: buildBoostString(oldPokemon, pokemon),
        inline: false,
      });
    }

    footerHelp.push("/equipment <id> to upgrade equipment");
  }

  embed.setImage(pokemon.shiny ? speciesData.shinySprite : speciesData.sprite);

  const lbHelp = footerHelp.join("\n");
  embed.setFooter({ text: `ID: ${pokemon._id}\n${lbHelp}` });

  return embed;
};

/**
 * @param {Trainer} trainer
 * @param {WithId<Pokemon>} pokemon
 * @param {("info" | "battle" | "equipment" | "all")=} tab
 * @param {Pokemon=} oldPokemon
 * @param {string=} originalOwnerId
 * @returns {EmbedBuilder}
 */
// eslint-disable-next-line camelcase
const DEPRECATEDbuildPokemonEmbed = (
  trainer,
  pokemon,
  tab,
  oldPokemon,
  originalOwnerId
) => buildPokemonEmbed(trainer.user, pokemon, tab, oldPokemon, originalOwnerId);

/**
 * @param {Pokemon} pokemon
 * @param {Pokemon} oldPokemon
 * @returns {EmbedBuilder}
 */
const buildEquipmentEmbed = (pokemon, oldPokemon) => {
  const speciesData = pokemonConfig[pokemon.speciesId];
  const embed = new EmbedBuilder();
  embed.setTitle(`${pokemon.name}'s Equipment`);
  embed.setColor(rarityConfig[speciesData.rarity].color);

  // equipment
  const fields = Object.entries(pokemon.equipments).map(
    ([equipmentType, equipment]) => {
      const { equipmentHeader, equipmentString } = buildEquipmentString(
        equipmentType,
        equipment
      );
      return {
        name: equipmentHeader,
        value: equipmentString,
        inline: true,
      };
    }
  );

  // every 2 fields, add a blank field
  setTwoInline(fields);

  if (fields.length > 0) {
    embed.addFields(fields);
  }

  // add stat boost field
  if (oldPokemon) {
    embed.addFields({
      name: "Stat Boost",
      value: buildBoostString(oldPokemon, pokemon),
      inline: false,
    });
  }
  embed.setFooter({ text: `Select an equipment below to upgrade it!` });

  return embed;
};

/**
 * @param {Trainer} trainer
 * @param {Pokemon} pokemon
 * @param {EquipmentTypeEnum} equipmentType
 * @param {Equipment} equipment
 * @param {boolean=} upgrade
 * @param {(boolean | string)=} slotReroll
 * @returns {EmbedBuilder}
 */
const buildEquipmentUpgradeEmbed = (
  trainer,
  pokemon,
  equipmentType,
  equipment,
  upgrade = false,
  slotReroll = false
) => {
  const equipmentData = equipmentConfig[equipmentType];
  const { material } = equipmentData;
  const materialData = backpackItemConfig[material];
  const levelUpgradeString =
    equipment.level >= MAX_EQUIPMENT_LEVEL
      ? "**This equipment is max level.**"
      : `**${formatMoney(
          levelUpCost(equipment.level) * POKEDOLLAR_MULTIPLIER
        )}, ${materialData.emoji} x${levelUpCost(
          equipment.level
        )} to upgrade level.**`;
  const substatUpgradeString = `**${formatMoney(
    STAT_REROLL_COST * POKEDOLLAR_MULTIPLIER
  )}, ${materialData.emoji} x${STAT_REROLL_COST} to reroll stats.**`;

  const embed = new EmbedBuilder();
  const upgradeString = upgrade ? ` -> ${equipment.level + 1}` : "";
  embed.setTitle(
    `${equipmentData.emoji} [Lv. ${equipment.level}${upgradeString}] ${equipmentData.name} (${pokemon.name})`
  );
  embed.setColor("#FFFFFF");
  embed.setDescription(
    `${equipmentData.description}\n\n${levelUpgradeString}\n${substatUpgradeString}`
  );

  // add substat fields
  const fields = Object.entries(equipment.slots).map(([slotId, slot]) => {
    const slotData = modifierSlotConfig[slotId];
    const modifierData = modifierConfig[slot.modifier];
    const { type, min, max } = modifierData;

    const baseValue = (slot.quality / 100) * (max - min) + min;
    const value = Math.round(
      baseValue * (slotData.level ? equipment.level : 1)
    );
    const upgradeLevel = upgrade ? equipment.level + 1 : equipment.level;
    const upgradeValue = Math.round(
      baseValue * (slotData.level ? upgradeLevel : 1)
    );

    const header = `${slotData.name}`;
    const rerollingString = slotReroll === slotId ? "[REROLLING] " : "";
    const modifierString =
      modifierData.name + (slotReroll === slotId ? " -> ???" : "");
    let valueString = `${rerollingString}${modifierString}: ${value}${
      type === "percent" ? "%" : ""
    }`;
    if (value !== upgradeValue) {
      valueString += ` -> ${upgradeValue}${type === "percent" ? "%" : ""}`;
    } else if (slotReroll === slotId) {
      valueString += ` -> ???`;
    }
    valueString += ` | Quality: ${slot.quality}%`;
    if (slotReroll === slotId) {
      valueString += ` -> ???%`;
    }

    return {
      name: header,
      value: valueString,
      inline: false,
    };
  });
  embed.addFields(fields);
  embed.setImage(equipmentData.sprite);
  embed.setFooter({
    text: `You have ${formatMoney(trainer.money)} and ${getItems(
      trainer,
      material
    )} ${materialData.name}s\nGet more in the /dungeons`,
  });

  return embed;
};

/**
 * @param {Trainer} trainer
 * @param {any[]} equipments This is complicated
 * @param {number} page
 * @returns {EmbedBuilder}
 */
const buildEquipmentListEmbed = (trainer, equipments, page) => {
  const equipmentString = equipments
    .map((equipment) => {
      const { equipmentType } = equipment;
      return buildCompactEquipmentString(equipmentType, equipment, {
        _id: equipment._id,
        speciesId: equipment.speciesId,
        level: equipment.pokemonLevel,
      });
    })
    .join("\n\n");

  const embed = new EmbedBuilder();
  embed.setTitle(`Trainer ${trainer.user.username}'s Equipment`);
  embed.setColor(0xffffff);
  embed.setDescription(equipmentString);
  embed.setFooter({
    text: `Page ${page} | Select an equipment to inspect it!`,
  });

  return embed;
};

/**
 * @param {Trainer} trainer
 * @param {Pokemon} pokemon1
 * @param {Pokemon} pokemon2
 * @param {EquipmentTypeEnum} equipmentType
 * @returns {EmbedBuilder}
 */
const buildEquipmentSwapEmbed = (
  trainer,
  pokemon1,
  pokemon2,
  equipmentType
) => {
  const equipmentData = equipmentConfig[equipmentType];
  const embed = new EmbedBuilder();
  embed.setTitle(`${equipmentData.emoji} Swap ${equipmentData.name}`);
  embed.setColor("#FFFFFF");
  embed.setDescription(
    `Confirm swap of ${equipmentData.name} between ${pokemon1.name} and ${pokemon2.name}.`
  );

  const pokemonEmoji1 = pokemonConfig[pokemon1.speciesId].emoji;
  const pokemonEmoji2 = pokemonConfig[pokemon2.speciesId].emoji;
  const {
    equipmentHeader: equipmentHeader1,
    equipmentString: equipmentString1,
  } = buildEquipmentString(equipmentType, pokemon1.equipments[equipmentType]);
  const {
    equipmentHeader: equipmentHeader2,
    equipmentString: equipmentString2,
  } = buildEquipmentString(equipmentType, pokemon2.equipments[equipmentType]);
  embed.addFields(
    {
      name: `${pokemonEmoji1} ${equipmentHeader1}`,
      value: equipmentString1,
      inline: true,
    },
    { name: "** **", value: "** **\n➡️\n\n⬅️", inline: true },
    {
      name: `${pokemonEmoji2} ${equipmentHeader2}`,
      value: equipmentString2,
      inline: true,
    }
  );

  const { material } = equipmentData;
  const materialData = backpackItemConfig[material];
  const costString = `${formatMoney(SWAP_COST * POKEDOLLAR_MULTIPLIER)}\n${
    materialData.emoji
  } x${SWAP_COST}`;
  embed.addFields({ name: "Cost", value: costString, inline: true });

  embed.setFooter({
    text: `You have ${formatMoney(trainer.money)} and ${getItems(
      trainer,
      material
    )} ${materialData.name}s\nGet more in the /dungeons`,
  });

  return embed;
};

/**
 * @param {PokemonIdEnum[]} speciesIds
 * @param {number} page
 * @returns {EmbedBuilder}
 */
const buildDexListEmbed = (speciesIds, page) => {
  const pokedexString = speciesIds
    .map((id) => {
      const speciesData = pokemonConfig[id];
      return `${speciesData.emoji} #${id} ${speciesData.name}`;
    })
    .join("\n");

  const embed = new EmbedBuilder();
  embed.setTitle(
    `Pokédex Entries ${speciesIds[0]} - ${speciesIds[speciesIds.length - 1]}`
  );
  embed.setColor("#FFFFFF");
  embed.setDescription(pokedexString);
  embed.setFooter({ text: `Page ${page}` });

  return embed;
};

/**
 * @param {PokemonIdEnum} id
 * @param {PokemonConfigData} speciesData
 * @param {string} tab
 * @param {any} ownershipData
 * @returns {EmbedBuilder}
 */
const buildSpeciesDexEmbed = (id, speciesData, tab, ownershipData) => {
  const embed = new EmbedBuilder();
  embed.setTitle(`${speciesData.emoji} #${id} ${speciesData.name}`);
  embed.setColor(rarityConfig[speciesData.rarity].color);

  if (tab === "info") {
    // display: description, type, abilities, rarity, battleEligibility, evolvable, growth rate
    let typeString = "";
    for (let i = 0; i < speciesData.type.length; i += 1) {
      typeString += typeConfig[speciesData.type[i]].emoji;
      if (i < speciesData.type.length - 1) {
        typeString += " ";
      }
    }

    let abilityString = "";
    const abilityIds = getAbilityOrder(speciesData.abilities);
    for (let i = 0; i < abilityIds.length; i += 1) {
      const abilityId = abilityIds[i];
      const abilityProbability = speciesData.abilities[abilityId];
      abilityString += `${getAbilityName(abilityId)} (${Math.floor(
        abilityProbability * 100
      )}%)`;
      if (i < abilityIds.length - 1) {
        abilityString += "\n";
      }
    }

    embed.setDescription(
      `${buildBlockQuoteString(linebreakString(speciesData.description, 45))}`
    );
    embed.addFields(
      { name: "Type", value: typeString, inline: true },
      { name: "Abilities", value: abilityString, inline: true },
      {
        name: "Obtainable",
        value: speciesData.unobtainable ? "❌ False" : "✅ True",
        inline: true,
      },
      {
        name: "Rarity",
        value: `${rarityConfig[speciesData.rarity].emoji} ${
          speciesData.rarity
        }`,
        inline: true,
      },
      {
        name: "Evolvable",
        value: speciesData.evolution ? "🧬 True" : "🧬 False",
        inline: true,
      },
      {
        name: "Growth Rate",
        value: `📈 ${growthRateConfig[speciesData.growthRate].name}`,
        inline: true,
      }
    );
    embed.setImage(speciesData.sprite);
  } else if (tab === "growth") {
    // display: growth rate, base stats, total, evolutions
    const evolutionString = buildSpeciesEvolutionString(speciesData);

    embed.setDescription(`Growth information for #${id} ${speciesData.name}:`);
    embed.addFields(
      {
        name: "📈 Growth Rate",
        value: growthRateConfig[speciesData.growthRate].name,
        inline: true,
      },
      {
        name: "💪 Base Stats",
        value: buildPokemonBaseStatString(speciesData),
        inline: false,
      },
      { name: "🧬 Evolutions", value: evolutionString, inline: false }
    );
  } else if (tab === "moves") {
    // display: move strings
    if (!speciesData.moveIds) {
      embed.setDescription(`No moves!`);
    } else {
      const fields = speciesData.moveIds.map((moveId) => {
        const moveData = getMove(moveId);
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
      const abilityData = getAbility(abilityId);
      const abilityHeader = `${getAbilityName(abilityId)} (${Math.floor(
        abilityProbability * 100
      )}%)`;
      const abilityString = abilityData
        ? buildBlockQuoteString(abilityData.description)
        : "Not yet implemented!";
      return {
        name: abilityHeader,
        value: abilityString,
        inline: false,
      };
    });

    embed.setDescription(`Abilities for #${id} ${speciesData.name}:`);
    embed.addFields(fields);
  } else if (tab === "rarity") {
    // display: rarity & ownership
    embed.setDescription(`Rarity information for #${id} ${speciesData.name}:`);
    embed.addFields(
      { name: "Rarity", value: speciesData.rarity, inline: false },
      {
        name: "Total",
        value: `${ownershipData.totalOwnership[0].count}`,
        inline: true,
      },
      {
        name: "Shiny",
        value: `${ownershipData.totalOwnership[0].shinyCount}`,
        inline: true,
      },
      { name: "** **", value: "** **", inline: false },
      {
        name: "Users Owned",
        value: `${ownershipData.uniqueOwnership[0].users}`,
        inline: true,
      },
      {
        name: "Users w/ Shiny",
        value: `${ownershipData.uniqueOwnership[0].shinyUsers}`,
        inline: true,
      }
    );
  }

  return embed;
};

/**
 * @param {Trainer} trainer
 * @returns {EmbedBuilder}
 */
const buildCelebiAbilityEmbed = (trainer) => {
  const celebiPool = getCelebiPool();
  let timeTravelString =
    "Celebi's time powers allow it to travel back in time. Every day, you can sacrifice **20 Pokeballs** to get a random event Pokemon from the past (options change daily).";
  timeTravelString += "\n\n**Today's options:**";
  timeTravelString += "\nLegendary (10%): ";
  // eslint-disable-next-line no-unexpected-multiline
  timeTravelString += celebiPool[rarities.LEGENDARY]
    .map((pokemonId) => `#${pokemonId} ${pokemonConfig[pokemonId].emoji}`)
    .join(", ");
  timeTravelString += "\nEpic (90%): ";
  timeTravelString += celebiPool[rarities.EPIC]
    .map((pokemonId) => `#${pokemonId} ${pokemonConfig[pokemonId].emoji}`)
    .join(", ");

  const timeTravelCooldown = trainer.usedTimeTravel ? "[USED] " : "";

  const embed = new EmbedBuilder();
  embed.setTitle(`Celebi's Abilities`);
  embed.setColor("#FFFFFF");
  embed.setDescription(`Celebi has two special abilities!`);
  embed.addFields(
    {
      name: "Time Acceleration",
      value:
        "Celebi's time powers allow it to accelerate time, tripling money & shards from `/daily`, and doubling Pokemon EXP gain!",
      inline: false,
    },
    {
      name: `${timeTravelCooldown}Time Travel`,
      value: timeTravelString,
      inline: false,
    }
  );
  embed.setThumbnail(
    "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/misc/celebi-thumbnail.png"
  );

  return embed;
};

/**
 * @param {Trainer} trainer
 */
const buildJirachiAbilityEmbed = (trainer) => {
  const { mythicConfig } = pokemonConfig[pokemonIdEnum.JIRACHI];
  const embed = new EmbedBuilder();
  embed.setTitle(`Jirachi's Abilities`);
  embed.setColor("#FFFFFF");
  embed.setDescription(
    "Jirachi has one passive ability and a special Wish ability!"
  );

  embed.addFields({
    name: "Passive: Serene Luck",
    value: `Jirachi calls upon the stars to grant you improved luck! **You are ${mythicConfig.shinyChanceMultiplier}x more likely to find Shiny Pokemon** from most methods (spawning excluded).`,
    inline: false,
  });

  const nextWeek = getNextTimeIntervalDate(timeEnum.WEEK);
  const remainingTimeString = trainer.usedWish
    ? `(next Wish: <t:${Math.floor(nextWeek.getTime() / 1000)}:R>) `
    : "";
  let wishString = `Wish upon a star **once a week** ${remainingTimeString}for one of the following powerful effects:\n`;
  for (const wish of Object.values(mythicConfig.wishes)) {
    wishString += `* **[${
      backpackItemConfig[backpackItems.STAR_PIECE].emoji
    } x${wish.starPieceCost}] Wish for ${wish.name}:** ${wish.description}\n`;
  }
  wishString += `\nYou currently have ${formatItemQuantityFromBackpack(
    backpackItems.STAR_PIECE,
    trainer.backpack
  )}.`;
  embed.addFields({
    name: "Active: Wishmaker",
    value: wishString,
    inline: false,
  });

  embed.setImage(
    "https://i.pinimg.com/originals/e3/70/fe/e370fea53723b0e260c60d1de31e3a39.jpg"
  );

  return embed;
};

/**
 * @param {Trainer} trainer
 */
const buildDarkraiAbilityEmbed = (trainer) => {
  const embed = new EmbedBuilder();
  embed.setTitle(`Darkrai's Ability`);
  embed.setColor("#FFFFFF");

  const descriptionString =
    "**Sleepwalking**\n\n" +
    `Darkrai puts your Pokemon to sleep and can control them for you **(auto-battling)!** In eligible PvE battles, you may expend ${emojis.DREAM_CARD} Dream Cards to automatically battle. Once this is done, you may not control them again until the end of battle.\n\n` +
    `Dream Cards recharge once every 5 minutes. They recharge up to a maximum limit, determined by: 100 + your trainer level.\n\n` +
    `**You Have: ${formatDreamCardsForTrainer(trainer)}**`;
  embed.setDescription(descriptionString);

  embed.setImage(
    "https://www.dearplayers.com/_next/image?url=https%3A%2F%2Fassets.dearplayers.com%2Fgplay-data%2Fevents%2Fdarkrai-joins-the-fray-6680176898-1280x720sr.jpg&w=1920&q=75"
  );

  return embed;
};

module.exports = {
  buildBannerEmbed,
  buildPokemonSpawnEmbed,
  buildNewPokemonEmbed,
  buildNewPokemonListEmbed,
  buildPokemonListEmbed,
  // eslint-disable-next-line camelcase
  DEPRECATEDbuildPokemonEmbed,
  buildPokemonEmbed,
  buildEquipmentEmbed,
  buildEquipmentUpgradeEmbed,
  buildEquipmentListEmbed,
  buildEquipmentSwapEmbed,
  buildDexListEmbed,
  buildSpeciesDexEmbed,
  buildGachaInfoString,
  buildCelebiAbilityEmbed,
  buildJirachiAbilityEmbed,
  buildDarkraiAbilityEmbed,
};
