/**
 * @file
 * @author Elvis Wei
 *
 * battleUtils.js the lowest level of code for battles used by the battle.js
 */
const { statusConditions } = require("../config/battleConfig");
const { difficultyConfig } = require("../config/npcConfig");
const { pokemonConfig, typeConfig } = require("../config/pokemonConfig");
const { getRewardsString, flattenRewards } = require("./trainerUtils");
const { getPBar, formatMoney } = require("./utils");
const { getEffect } = require("../battle/data/effectRegistry");

/**
 *
 * @param {Pokemon[] | BattlePokemon[]} pokemons
 * @param {number} rows
 * @param {number} cols
 * @param {object} options
 * @param {boolean?=} options.reverse
 * @param {boolean?=} options.showHp
 * @param {number?=} options.emphPosition
 * @returns {string}
 */
const buildPartyString = (
  pokemons,
  rows,
  cols,
  { reverse = false, showHp = false, emphPosition = null } = {}
) => {
  let globalIndex = 0;
  let partyString = "";
  // set rows to be a range to iterate over
  const iter = reverse
    ? [...Array(rows).keys()].reverse()
    : [...Array(rows).keys()];
  for (const i of iter) {
    // build top line and HP if needed
    let rowString = "`";
    globalIndex = i * cols;
    for (let j = 0; j < cols; j += 1) {
      const lplus =
        emphPosition &&
        (emphPosition - 1 === globalIndex ||
          (emphPosition === globalIndex && j !== 0))
          ? "╬"
          : "+";
      const rplus =
        emphPosition && emphPosition - 1 === globalIndex ? "╬" : "+";
      const border =
        emphPosition && emphPosition - 1 === globalIndex ? "=" : "-";
      let pokemon = pokemons[globalIndex];
      let headerString = "";
      if (showHp && pokemon) {
        // eslint-disable-next-line no-self-assign
        pokemon = /** @type {BattlePokemon} */ (pokemon);
        // get hp percent
        let hpPercent = 0;
        if (pokemon.hp > 0) {
          hpPercent = Math.max(
            Math.round(Math.floor((pokemon.hp * 100) / pokemon.maxHp)),
            1
          );
        } else {
          hpPercent = 0;
        }
        // make string
        headerString = `${hpPercent}%`;
      } else if (pokemon) {
        headerString = `L${pokemon.level}`;
      }

      // add to row string based on length of hp string
      const headerLength = headerString.length;
      if (headerLength === 0) {
        rowString += `${lplus}${border}${border}${border}${border}${border}`;
      } else if (headerLength === 2) {
        rowString += `${lplus}${border}${border}${headerString}${border}`;
      } else if (headerLength === 3) {
        rowString += `${lplus}${border}${headerString}${border}`;
      } else if (headerLength === 4) {
        rowString += `${lplus}${border}${headerString}`;
      }

      if (j === cols - 1) {
        rowString += `${rplus}\``;
      }
      globalIndex += 1;
    }
    globalIndex -= cols;
    partyString += `${rowString}\n`;

    // build pokemon line
    rowString = "`";
    for (let j = 0; j < cols; j += 1) {
      const lborder =
        emphPosition &&
        (emphPosition - 1 === globalIndex ||
          (emphPosition === globalIndex && j !== 0))
          ? "║"
          : "|";
      const rborder =
        emphPosition && emphPosition - 1 === globalIndex ? "║" : "|";
      const pokemon = pokemons[globalIndex];
      const emoji = pokemon ? pokemonConfig[pokemon.speciesId].emoji : "⬛";
      // if j is divisible by 3 and not 0, remove a space from the left
      const leftSpace = j % 3 === 0 && j !== 0 ? "" : " ";
      rowString += `${lborder} \`${emoji}\`${leftSpace}`;
      globalIndex += 1;
      if (j === cols - 1) {
        rowString += `${rborder}\``;
      }
    }
    globalIndex -= cols;
    partyString += `${rowString}\n`;

    // build bottom line with position
    rowString = "`";
    for (let j = 0; j < cols; j += 1) {
      const lplus =
        emphPosition &&
        (emphPosition - 1 === globalIndex ||
          (emphPosition === globalIndex && j !== 0))
          ? "╬"
          : "+";
      const rplus =
        emphPosition && emphPosition - 1 === globalIndex ? "╬" : "+";
      const border =
        emphPosition && emphPosition - 1 === globalIndex ? "=" : "-";
      const position = globalIndex + 1;
      if (position < 10) {
        rowString += `${lplus}${border}${border}${position}${border}${border}`;
      } else {
        rowString += `${lplus}${border}${border}${position}${border}`;
      }
      if (j === cols - 1) {
        rowString += `${rplus}\``;
      }
      globalIndex += 1;
    }
    partyString += rowString;
    if (iter.indexOf(i) !== iter.length - 1) {
      partyString += "\n";
    }
  }

  return partyString;
};

/**
 * @param {PartyInfo} party
 * @param {any} id
 * @param {Record<string, Pokemon>} pokemonMap
 * @param {boolean=} active
 * @returns {{partyHeader: string, partyString: string}}
 */
const buildCompactPartyString = (party, id, pokemonMap, active = false) => {
  const partyHeader = active
    ? "Active Party"
    : `Party ${id} \`/partyload ${id}\``;

  const pokemons = party.pokemonIds.map(
    (pokemonId) => pokemonMap[pokemonId] || null
  );
  const { rows } = party;
  const { cols } = party;
  const power = pokemons.reduce(
    (acc, pokemon) => acc + (pokemon ? pokemon.combatPower : 0),
    0
  );

  let partyString = `Power: ${power}\n`;
  let partyIndex = 0;
  for (let i = 0; i < rows; i += 1) {
    let rowString = "";
    for (let j = 0; j < cols; j += 1) {
      const pokemon = pokemons[partyIndex];
      const emoji = pokemon ? pokemonConfig[pokemon.speciesId].emoji : "⬛";
      rowString += `${emoji}`;
      partyIndex += 1;
    }
    partyString += `${rowString}\n`;
  }

  return {
    partyHeader,
    partyString,
  };
};

/**
 * @param {Move} moveData
 * @param {number=} cooldown
 * @returns {{moveHeader: string, moveString: string}}
 */
const buildMoveString = (moveData, cooldown = 0) => {
  let moveHeader = "";
  if (cooldown) {
    moveHeader += `[ON COOLDOWN: ${cooldown} TURNS]\n`;
  }
  moveHeader += `${typeConfig[moveData.type].emoji} **${moveData.name}** | ${
    moveData.damageType
  } `;

  let moveString = "";
  moveString += `**[${moveData.tier}]** PWR: ${moveData.power || "-"} | ACC: ${
    moveData.accuracy || "-"
  } | CD: ${moveData.cooldown}\n`;
  moveString += `**Target:** ${moveData.targetType}/${moveData.targetPosition}/${moveData.targetPattern}\n`;
  moveString += `${moveData.description}`;

  return {
    moveHeader,
    moveString,
  };
};

/**
 * @param {BattlePokemon} pokemon
 * @returns {{pokemonHeader: string, pokemonString: string}}
 */
const buildBattlePokemonString = (pokemon) => {
  let pokemonHeader = "";
  if (pokemon.isFainted) {
    pokemonHeader += "[FNT] ";
  } else {
    switch (pokemon.status.statusId) {
      case statusConditions.BURN:
        pokemonHeader += "[BRN] ";
        break;
      case statusConditions.FREEZE:
        pokemonHeader += "[FRZ] ";
        break;
      case statusConditions.PARALYSIS:
        pokemonHeader += "[PAR] ";
        break;
      case statusConditions.POISON:
        pokemonHeader += "[PSN] ";
        break;
      case statusConditions.BADLY_POISON:
        pokemonHeader += "[PSN] ";
        break;
      case statusConditions.SLEEP:
        pokemonHeader += "[SLP] ";
        break;
      default:
        break;
    }
  }

  pokemonHeader += `[${pokemon.position}] [Lv. ${pokemon.level}] ${pokemon.name}`;
  let pokemonString = "";
  // build hp percent string
  const hpPercent = Math.min(
    Math.round(Math.floor((pokemon.hp * 100) / pokemon.maxHp)),
    100
  );
  pokemonString += `**HP** ${getPBar(hpPercent, 10)} ${hpPercent}\n`;
  // build cr string
  const crPercent = Math.min(
    Math.round(Math.floor((pokemon.combatReadiness * 100) / 100)),
    100
  );
  pokemonString += `**CR** ${getPBar(crPercent, 10)} ${crPercent}\n`;
  // build effects string
  if (Object.keys(pokemon.effectIds).length > 0) {
    pokemonString += `**Effects:** ${Object.keys(pokemon.effectIds)
      .map((effectId) => {
        // special case for shield
        let shieldString = "";
        if (
          effectId === "shield" &&
          pokemon.effectIds[effectId].args &&
          pokemon.effectIds[effectId].args.shield
        ) {
          shieldString = `${pokemon.effectIds[effectId].args.shield} HP `;
        }
        return `${shieldString}${getEffect(effectId).name} (${
          pokemon.effectIds[effectId].duration
        })`;
      })
      .join(", ")}`;
  } else {
    pokemonString += `**Effects:** None`;
  }

  return {
    pokemonHeader,
    pokemonString,
  };
};

/**
 * @param {NpcDifficultyEnum} difficulty
 * @param {any} npcDifficultyData
 * @returns {{difficultyHeader: string, difficultyString: string}}
 */
const buildNpcDifficultyString = (difficulty, npcDifficultyData) => {
  const difficultyData = difficultyConfig[difficulty];
  // + 1 here because ace pokemon is one level higher than max level
  const difficultyHeader = `[Lv. ${npcDifficultyData.minLevel}-${
    npcDifficultyData.maxLevel + 1
  }] ${difficultyData.name}`;

  const rewardMultipliers =
    npcDifficultyData.rewardMultipliers || difficultyData.rewardMultipliers;
  const { pokemonIds } = npcDifficultyData;

  let difficultyString = "";
  difficultyString += `**Possible Pokemon:** ${npcDifficultyData.numPokemon}x`;
  for (let i = 0; i < pokemonIds.length; i += 1) {
    const pokemonId = pokemonIds[i];
    const pokemonData = pokemonConfig[pokemonId];
    difficultyString += ` ${pokemonData.emoji}`;
  }
  difficultyString += pokemonIds.includes(npcDifficultyData.aceId)
    ? ""
    : ` ${pokemonConfig[npcDifficultyData.aceId].emoji}`;
  difficultyString += "\n";
  difficultyString += `**Multipliers:** Money: ${rewardMultipliers.moneyMultiplier} | EXP: ${rewardMultipliers.expMultiplier} | Pkmn. EXP: ${rewardMultipliers.pokemonExpMultiplier}`;
  if (npcDifficultyData.dailyRewards) {
    difficultyString += `\n**Daily Rewards:** ${getRewardsString(
      flattenRewards(npcDifficultyData.dailyRewards),
      false
    )}`;
  }

  return {
    difficultyHeader,
    difficultyString,
  };
};

/**
 * @param {NpcDifficultyEnum} difficulty
 * @param {any} dungeonDifficultyData
 * @returns {{difficultyHeader: string, difficultyString: string}}
 */
const buildDungeonDifficultyString = (difficulty, dungeonDifficultyData) => {
  const difficultyData = difficultyConfig[difficulty];
  const allDungeonPokemons = dungeonDifficultyData.phases.reduce(
    (acc, phase) => acc.concat(phase.pokemons),
    []
  );
  const { rewards } = dungeonDifficultyData;

  const maxLevel = Math.max(
    ...allDungeonPokemons.map((pokemon) => pokemon.level)
  );
  const difficultyHeader = `[Lv. ${maxLevel}] ${difficultyData.name}`;

  let difficultyString = "";
  const uniqueSpeciesIds = [
    ...new Set(allDungeonPokemons.map((pokemon) => pokemon.speciesId)),
  ];
  const pokemonEmojis = uniqueSpeciesIds.map(
    (speciesId) => pokemonConfig[speciesId].emoji
  );
  difficultyString += `**Phases:** ${dungeonDifficultyData.phases.length}\n`;
  difficultyString += `**Pokemon:** ${pokemonEmojis.join(" ")}\n`;
  difficultyString += `**Rewards:** ${getRewardsString(
    flattenRewards(rewards),
    false
  )}`;

  return {
    difficultyHeader,
    difficultyString,
  };
};

/**
 * @param {RaidDifficultyEnum} difficulty
 * @param {any} raidDifficultyData
 * @returns {{difficultyHeader: string, difficultyString: string}}
 */
const buildRaidDifficultyString = (difficulty, raidDifficultyData) => {
  const difficultyData = difficultyConfig[difficulty];
  const allRaidPokemons = raidDifficultyData.pokemons;

  const maxLevel = Math.max(...allRaidPokemons.map((pokemon) => pokemon.level));
  const difficultyHeader = `[Lv. ${maxLevel}] ${difficultyData.name}`;

  let difficultyString = "";
  const uniqueSpeciesIds = [
    ...new Set(allRaidPokemons.map((pokemon) => pokemon.speciesId)),
  ];
  const pokemonEmojis = uniqueSpeciesIds.map(
    (speciesId) => pokemonConfig[speciesId].emoji
  );
  difficultyString += `**Pokemon:** ${pokemonEmojis.join(" ")}\n`;
  // TODO: make time better
  // display shiny chance as percentage rounded to 2 decimal places
  const shinyChance = Math.round(raidDifficultyData.shinyChance * 10000) / 100;

  difficultyString += `**Shiny Chance:** ${shinyChance}% • **Money/%:** ${formatMoney(
    raidDifficultyData.moneyPerPercent
  )} • **Time:** ${raidDifficultyData.ttl / (1000 * 60 * 60)} hours`;

  return {
    difficultyHeader,
    difficultyString,
  };
};

/**
 * @param {number} towerStage
 * @returns {string}
 */
const getIdFromTowerStage = (towerStage) => `battleTowerStage${towerStage}`;

module.exports = {
  buildPartyString,
  buildCompactPartyString,
  buildMoveString,
  buildBattlePokemonString,
  buildNpcDifficultyString,
  buildDungeonDifficultyString,
  getIdFromTowerStage,
  buildRaidDifficultyString,
};
