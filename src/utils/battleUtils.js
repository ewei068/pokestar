/**
 * @file
 * @author Elvis Wei
 *
 * battleUtils.js the lowest level of code for battles used by the battle.js
 */
const {
  statusConditions,
  targetPatterns,
  moveTiers,
  damageTypeConfig,
  moveTierConfig,
} = require("../config/battleConfig");
const { difficultyConfig } = require("../config/npcConfig");
const { pokemonConfig, typeConfig } = require("../config/pokemonConfig");
const {
  getFlattenedRewardsString,
  flattenRewards,
  flattenCategories,
} = require("./trainerUtils");
const {
  getPBar,
  formatMoney,
  getHasTag,
  buildBlockQuoteString,
} = require("./utils");
const { getEffect } = require("../battle/data/effectRegistry");
const { backpackItemConfig } = require("../config/backpackConfig");
const { buildPokemonEmojiString } = require("./pokemonUtils");
const { getHeldItem } = require("../battle/data/heldItemRegistry");
const { getMove } = require("../battle/data/moveRegistry");

const plus = "┼";
const plusEmph = "*";
const plusTarget = "╬";
const hLine = "─";
const hLineEmph = "*";
const hLineTarget = "═";
const vLine = "│";
const vLineEmph = "*";
const vLineTarget = "║";

/**
 *
 * @param {Pokemon[] | BattlePokemon[]} pokemons
 * @param {number} rows
 * @param {number} cols
 * @param {object} options
 * @param {boolean?=} options.reverse
 * @param {boolean?=} options.showHp
 * @param {number?=} options.emphPosition
 * @param {number[]?=} options.targetIndices
 * @param {boolean?=} options.isMobile
 * @returns {string}
 */
const buildPartyString = (
  pokemons,
  rows,
  cols,
  {
    reverse = false,
    showHp = false,
    emphPosition = null,
    targetIndices = null,
    isMobile = false, // TODO
  } = {}
) => {
  const targetIndexSet = new Set(targetIndices || []);
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
      let lplus =
        emphPosition &&
        (emphPosition - 1 === globalIndex ||
          (emphPosition === globalIndex && j !== 0))
          ? plusEmph
          : plus;
      let rplus =
        emphPosition && emphPosition - 1 === globalIndex ? plusEmph : plus;
      let border =
        emphPosition && emphPosition - 1 === globalIndex ? hLineEmph : hLine;
      // check for selected index, OVERRIDES existing border
      const leftIndex = globalIndex - 1;
      const topIndex = reverse ? globalIndex + cols : globalIndex - cols;
      if (targetIndexSet.has(leftIndex) && j !== 0) {
        // position surrounded with targets, *. if the position is also a target, add space instead
        const topLeftIndex = topIndex - 1;
        if (
          targetIndexSet.has(globalIndex) &&
          targetIndexSet.has(topIndex) &&
          targetIndexSet.has(topLeftIndex)
        ) {
          lplus = " ";
        } else {
          lplus = plusTarget;
        }
      } else if (targetIndexSet.has(globalIndex)) {
        // position is target, add indicator to left border
        lplus = plusTarget;
      }

      if (targetIndexSet.has(globalIndex)) {
        // position directly above has target, add space as border. else, add indicator
        if (targetIndexSet.has(topIndex)) {
          border = " ";
        } else {
          border = hLineTarget;
        }
        rplus = plusTarget;
      }
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
      rowString += lplus;
      if (!isMobile) {
        rowString += border;
      }
      if (headerLength === 0) {
        rowString += `${border}${border}${border}${border}`;
      } else if (headerLength === 2) {
        rowString += `${border}${headerString}${border}`;
      } else if (headerLength === 3) {
        rowString += `${headerString}${border}`;
      } else if (headerLength === 4) {
        rowString += `${headerString}`;
      }

      if (j === cols - 1) {
        rowString += `${rplus}\``;
      }
      globalIndex += 1;
    }
    globalIndex -= cols;
    partyString += `${rowString}\n`;

    // build pokemon line
    rowString = "";
    for (let j = 0; j < cols; j += 1) {
      let lborder =
        emphPosition &&
        (emphPosition - 1 === globalIndex ||
          (emphPosition === globalIndex && j !== 0))
          ? vLineEmph
          : vLine;

      const leftIndex = globalIndex - 1;
      if (targetIndexSet.has(leftIndex) && j !== 0) {
        // position directly to the left has target, *. if the position is also a target, add space instead
        if (targetIndexSet.has(globalIndex)) {
          lborder = " ";
        } else {
          lborder = vLineTarget;
        }
      } else if (targetIndexSet.has(globalIndex)) {
        // position is target, add indicator to left border
        lborder = vLineTarget;
      }

      let rborder =
        emphPosition && emphPosition - 1 === globalIndex ? vLineEmph : vLine;
      if (targetIndexSet.has(globalIndex)) {
        rborder = vLineTarget;
      }
      const pokemon = pokemons[globalIndex];
      const emoji = pokemon ? pokemonConfig[pokemon.speciesId].emoji : "⬛";
      // if j is divisible by 3 and not 0, remove a space from the left
      // const leftSpace = j % 3 === 0 && j !== 0 ? "" : " ";
      const leftSpace = isMobile ? "\u2002\u2005" : "\u2005\u2006";
      rowString += `\`${lborder} \`${emoji}${leftSpace}`;
      globalIndex += 1;
      if (j === cols - 1) {
        rowString += `\`${rborder}\``;
      }
    }
    globalIndex -= cols;
    partyString += `${rowString}\n`;

    // build bottom line with position
    rowString = "`";
    for (let j = 0; j < cols; j += 1) {
      let lplus =
        emphPosition &&
        (emphPosition - 1 === globalIndex ||
          (emphPosition === globalIndex && j !== 0))
          ? plusEmph
          : plus;
      let rplus =
        emphPosition && emphPosition - 1 === globalIndex ? plusEmph : plus;
      let border =
        emphPosition && emphPosition - 1 === globalIndex ? hLineEmph : hLine;
      // check for selected index, OVERRIDES existing border
      const leftIndex = globalIndex - 1;
      const buttomIndex = reverse ? globalIndex - cols : globalIndex + cols;
      if (targetIndexSet.has(leftIndex) && j !== 0) {
        // position surrounded with targets, *. if the position is also a target, add space instead
        const bottomLeftIndex = buttomIndex - 1;
        if (
          targetIndexSet.has(globalIndex) &&
          targetIndexSet.has(buttomIndex) &&
          targetIndexSet.has(bottomLeftIndex)
        ) {
          lplus = " ";
        } else {
          lplus = plusTarget;
        }
      } else if (targetIndexSet.has(globalIndex)) {
        // position is target, add indicator to left border
        lplus = plusTarget;
      }

      if (targetIndexSet.has(globalIndex)) {
        // position directly below has target, add space as border. else, add indicator
        if (targetIndexSet.has(buttomIndex)) {
          border = " ";
        } else {
          border = hLineTarget;
        }
        rplus = plusTarget;
      }
      const position = globalIndex + 1;
      rowString += lplus;
      if (!isMobile) {
        rowString += border;
      }
      if (position < 10) {
        rowString += `${border}${position}${border}${border}`;
      } else {
        rowString += `${border}${position}${border}`;
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
    moveHeader += `⏳ [ON COOLDOWN: ${cooldown} TURNS]\n`;
  }
  const damageTypeData = damageTypeConfig[moveData.damageType];
  const moveTierData = moveTierConfig[moveData.tier];
  moveHeader += `${typeConfig[moveData.type].emoji} **${moveData.name}** | ${
    damageTypeData.emoji
  } ${damageTypeData.abbreviation} `;

  let moveString = "";
  moveString += `**[${moveTierData.abbreviation}]**  |  💪 ${
    moveData.power || "N/A"
  }  |  ⌖ ${moveData.accuracy || "N/A"}  |  ⏳ ${moveData.cooldown}\n`;
  moveString += `**Target:** ${moveData.targetType}/${moveData.targetPosition}/${moveData.targetPattern}\n`;
  moveString += buildBlockQuoteString(moveData.description);

  return {
    moveHeader,
    moveString,
  };
};

const buildBattlePokemonHeader = (pokemon) => {
  let pokemonHeader = `${buildPokemonEmojiString(pokemon)} `;
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

  pokemonHeader += `${pokemon.name}`;
  return pokemonHeader;
};

const buildBattlePokemonInfoString = (pokemon) =>
  `Position: ${pokemon.position} • Lv. ${pokemon.level}`;

const buildBattlePokemonHpString = (pokemon, barWidth = 10) => {
  const hpPercent = Math.min(
    Math.round(Math.floor((pokemon.hp * 100) / pokemon.maxHp)),
    100
  );
  return `**HP** ${getPBar(hpPercent, barWidth)} ${hpPercent}`;
};

const buildBattlePokemonEffectsString = (pokemon) => {
  let pokemonString = "";
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
        // @ts-ignore
        return `${shieldString}${getEffect(effectId).name} (${
          pokemon.effectIds[effectId].duration
        })`;
      })
      .join(", ")}`;
  } else {
    pokemonString += `**Effects:** None`;
  }
  return pokemonString;
};

/**
 * @param {BattlePokemon} pokemon
 */
const buildActivePokemonFieldStrings = (pokemon) => {
  const pokemonHeader = buildBattlePokemonHeader(pokemon);
  let pokemonString = "";
  pokemonString += `${buildBattlePokemonInfoString(pokemon)}\n`;
  pokemonString += `${buildBattlePokemonHpString(pokemon, 15)}\n`;
  pokemonString += `${buildBattlePokemonEffectsString(pokemon)}`;
  return {
    pokemonHeader,
    pokemonString,
  };
};

/**
 * @param {BattlePokemon} pokemon
 * @returns {{pokemonHeader: string, pokemonString: string}}
 */
const buildBattlePokemonString = (pokemon) => {
  const pokemonHeader = buildBattlePokemonHeader(pokemon);
  let pokemonString = "";
  pokemonString += `${buildBattlePokemonInfoString(pokemon)}\n`;
  // build hp percent string
  pokemonString += `${buildBattlePokemonHpString(pokemon, 10)}\n`;
  // build cr string
  const crPercent = Math.min(
    Math.round(Math.floor((pokemon.combatReadiness * 100) / 100)),
    100
  );
  pokemonString += `**CR** ${getPBar(crPercent, 10)} ${crPercent}\n`;
  // build effects string
  pokemonString += buildBattlePokemonEffectsString(pokemon);

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
  const difficultyHeader = `${difficultyData.emoji} [Lv. ${
    npcDifficultyData.minLevel
  }-${npcDifficultyData.maxLevel + 1}] ${difficultyData.name}`;

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
    difficultyString += `\n**Daily Rewards:**\n${getFlattenedRewardsString(
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
  difficultyString += `**Rewards:** ${getFlattenedRewardsString(
    flattenRewards(rewards),
    false
  )}`;

  return {
    difficultyHeader,
    difficultyString,
  };
};

/**
 * @param {NpcDifficultyEnum} difficulty
 * @param {RaidConfigData["difficulties"][NpcDifficultyEnum]} raidDifficultyData
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
  )} • **Time:** ${raidDifficultyData.ttl / (1000 * 60 * 60)} hours\n`;

  if (raidDifficultyData.backpackPerPercent) {
    difficultyString += "**Items/%: ** ";
    for (const [item, itemPerPercent] of Object.entries(
      flattenCategories(raidDifficultyData.backpackPerPercent)
    )) {
      const itemData = backpackItemConfig[item];
      difficultyString += `${itemData.emoji} x${itemPerPercent} `;
    }
  }

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

/**
 * @param {string} id
 * @returns {number?}
 */
const getTowerStageFromId = (id) => {
  const towerStage = id.split("battleTowerStage")[1];
  return towerStage ? parseInt(towerStage, 10) : null;
};

const clearCurrentTargetting = (state) => {
  // eslint-disable-next-line no-param-reassign
  state.currentMoveId = null;
  // eslint-disable-next-line no-param-reassign
  state.currentTargetId = null;
};

/**
 * @param {any} state
 * @returns {{currentMoveId: MoveIdEnum, currentTargetId: string}}
 */
const getCurrentTargetting = (state) => {
  const { currentMoveId, currentTargetId } = state;
  return { currentMoveId, currentTargetId };
};

/**
 * @param {any} state
 * @param {MoveIdEnum} moveId
 * @param {string} targetId
 */
const setCurrentTargetting = (state, moveId, targetId) => {
  // eslint-disable-next-line no-param-reassign
  state.currentMoveId = moveId;
  // eslint-disable-next-line no-param-reassign
  state.currentTargetId = targetId;
};

/**
 * @param {BattleParty} targetParty
 * @param {TargetPatternEnum} targetPattern
 * @param {number} targetPosition
 * @returns {number[]} indices of targets
 */
const getPatternTargetIndices = (
  targetParty,
  targetPattern,
  targetPosition
) => {
  const targetIndex = targetPosition - 1;
  const targetRow = Math.floor(targetIndex / targetParty.cols);
  const targetCol = targetIndex % targetParty.cols;
  const targetIndices = [];

  const { rows: targetNumRows, cols: targetNumCols } = targetParty;

  for (let index = 0; index < targetNumRows * targetNumCols; index += 1) {
    const currentRow = Math.floor(index / targetNumCols);
    const currentCol = index % targetNumCols;
    switch (targetPattern) {
      case targetPatterns.ALL:
        targetIndices.push(index);
        break;
      case targetPatterns.ALL_EXCEPT_SELF:
        if (index !== targetIndex) {
          targetIndices.push(index);
        }
        break;
      case targetPatterns.COLUMN:
        if (currentCol === targetCol) {
          targetIndices.push(index);
        }
        break;
      case targetPatterns.ROW:
        if (currentRow === targetRow) {
          targetIndices.push(index);
        }
        break;
      case targetPatterns.RANDOM:
        // special case; return nothing
        break;
      case targetPatterns.SQUARE:
        // if row index or column index within 1 of target, add to targets
        if (
          Math.abs(targetRow - currentRow) <= 1 &&
          Math.abs(targetCol - currentCol) <= 1
        ) {
          targetIndices.push(index);
        }

        break;
      case targetPatterns.CROSS:
        // target manhattan distance <= 1, add to targets
        if (
          Math.abs(targetRow - currentRow) + Math.abs(targetCol - currentCol) <=
          1
        ) {
          targetIndices.push(index);
        }
        break;
      case targetPatterns.X:
        // if row and column both off by exactly 1 or is self, add to targets
        if (
          (Math.abs(targetRow - currentRow) === 1 &&
            Math.abs(targetCol - currentCol) === 1) ||
          index === targetIndex
        ) {
          targetIndices.push(index);
        }
        break;
      default:
        // default is single

        if (index === targetIndex) {
          targetIndices.push(index);
        }
    }
  }
  return targetIndices;
};

/**
 * @param {HeldItemIdEnum} heldItemId
 * @param {HeldItemTag} tag
 */
const getHeldItemIdHasTag = (heldItemId, tag) => {
  const itemData = getHeldItem(heldItemId);
  return getHasTag(itemData, tag);
};

/**
 * @param {MoveIdEnum} moveId
 * @param {MoveTag} tag
 */
const getMoveIdHasTag = (moveId, tag) => {
  const moveData = getMove(moveId);
  return getHasTag(moveData, tag);
};

/**
 * @param {EffectIdEnum} effectId
 * @param {EffectTag} tag
 */
const getEffectIdHasTag = (effectId, tag) => {
  const effectData = getEffect(effectId);
  return getHasTag(effectData, tag);
};

/**
 * @param {MoveIdEnum} moveId
 * @param {BattlePokemon} source
 * @param {BattlePokemon} primaryTarget
 * @param {BattlePokemon[]} targetsHit
 * @returns {number}
 */
const calculateTurnHeuristic = (moveId, source, primaryTarget, targetsHit) => {
  const moveData = getMove(moveId);

  let heuristic = 0;
  // special case: if asleep and sleep talk, use sleep talk
  if (source.status.statusId === statusConditions.SLEEP && moveId === "m214") {
    return 1000000;
  }
  // special case: if move is rocket thievery and enemy team has no fainted pokemon, return 0
  if (moveId === "m20003") {
    const enemyParty = source.getEnemyParty();
    if (
      enemyParty &&
      enemyParty.pokemons &&
      enemyParty.pokemons.filter((p) => p && p.isFainted).length === 0
    ) {
      return 0;
    }
  }
  // special case: if move is gear fifth, use if under 25% hp
  if (moveId === "m20010") {
    if (source.hp / source.maxHp > 0.25) {
      return 0;
    }
    return 1000000;
  }

  if (moveData.power !== null) {
    // if move does damage, calculate damage that would be dealt
    for (const target of targetsHit) {
      const damage = source.calculateMoveDamage({
        move: moveData,
        primaryTarget,
        allTargets: targetsHit,
        target,
      });
      heuristic += damage;
    }
  } else {
    // else, calculate heuristic = numTargets * source level * 1.5
    heuristic = targetsHit.length * source.level * 1.5;
  }
  // normalize heuristic by move accuracy, or *1.2 if move has no accuracy
  const { accuracy } = moveData;
  heuristic *= accuracy === null ? 1.2 : accuracy / 100;

  // multiply heuristic by move tier. basic = 0.7, power = 1, ultimate = 1.5
  const moveTier = moveData.tier;
  let tierMultiplier;
  if (moveTier === moveTiers.BASIC) {
    tierMultiplier = 0.7;
  } else if (moveTier === moveTiers.POWER) {
    tierMultiplier = 1;
  } else {
    tierMultiplier = 1.5;
  }
  heuristic *= tierMultiplier;

  // calculate nonce for small random variation
  const nonce = Math.random();
  return heuristic + nonce;
};

/**
 * @param {Battle} battle
 */
const npcTurnAction = (battle) => {
  const { activePokemon } = battle;
  /* steps:
        if cant move, skip turn
        get all moves filtered by those with eligible targets and usable
        for all considered moves, get the best move
        best move/target: for all targets:
            get how many targets would be hit by AoE
            calculate heuristic
                if move does damage, calculate damage that would be dealt
                else, calculate heuristic = numTargets * source level * 1.5
            normalize heuristic by move accuracy, or *1.2 if move has no accuracy
            normalize heuristic by move tier
        choose best move & target based off heuristic
        use move */

  // if cant move, skip turn
  if (!activePokemon.canMove()) {
    activePokemon.skipTurn();
    return;
  }

  // get all moves filtered by those with eligible targets and usable
  const { moveIds } = activePokemon;
  /** @type {PartialRecord<MoveIdEnum, BattlePokemon[]>} */ const validMoveIdsToTargets =
    {};
  Object.entries(moveIds).forEach(([moveId, move]) => {
    if (move.disabledCounter || move.cooldown > 0) {
      return;
    }

    // @ts-ignore
    const eligibleTargets = battle.getEligibleTargets(activePokemon, moveId);
    if (eligibleTargets.length > 0) {
      validMoveIdsToTargets[moveId] = eligibleTargets;
    }
  });

  // if for some reason no moves exist, skip turn
  if (Object.keys(validMoveIdsToTargets).length === 0) {
    activePokemon.skipTurn();
    return;
  }

  // for all considered moves, get the best move
  let bestMoveId = null;
  let bestTarget = null;
  let bestHeuristic = -1;
  for (const moveId in validMoveIdsToTargets) {
    for (const target of validMoveIdsToTargets[moveId]) {
      const source = activePokemon;
      // @ts-ignore
      const targetsHit = source.getMoveExecuteTargets(moveId, target);
      const heuristic = calculateTurnHeuristic(
        // @ts-ignore
        moveId,
        source,
        target,
        targetsHit
      );
      if (heuristic > bestHeuristic) {
        bestMoveId = moveId;
        bestTarget = target;
        bestHeuristic = heuristic;
      }
    }
  }

  // use move
  // @ts-ignore
  activePokemon.useMove(bestMoveId, bestTarget.id);
};

module.exports = {
  buildPartyString,
  buildCompactPartyString,
  buildMoveString,
  buildActivePokemonFieldStrings,
  buildBattlePokemonString,
  buildNpcDifficultyString,
  buildDungeonDifficultyString,
  getIdFromTowerStage,
  buildRaidDifficultyString,
  clearCurrentTargetting,
  getCurrentTargetting,
  setCurrentTargetting,
  getPatternTargetIndices,
  getHeldItemIdHasTag,
  getMoveIdHasTag,
  getEffectIdHasTag,
  npcTurnAction,
  getTowerStageFromId,
};
