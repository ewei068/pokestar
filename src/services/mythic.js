/* eslint-disable no-case-declarations */
/* eslint-disable no-param-reassign */
/**
 * @file
 * @author Elvis Wei
 *
 * mythic.js Creates all mythic pokemon information, moves etc.
 */
const { buildButtonActionRow } = require("../components/buttonActionRow");
const { buildIdConfigSelectRow } = require("../components/idConfigSelectRow");
const {
  backpackItemConfig,
  backpackItems,
  backpackCategories,
} = require("../config/backpackConfig");
const { collectionNames } = require("../config/databaseConfig");
const { eventNames } = require("../config/eventConfig");
const { getCelebiPool, dailyRewardChances } = require("../config/gachaConfig");
const { locations } = require("../config/locationConfig");
const { dungeons } = require("../config/npcConfig");
const {
  pokemonConfig,
  rarities,
  natureConfig,
} = require("../config/pokemonConfig");
const { stageNames } = require("../config/stageConfig");
const { QueryBuilder } = require("../database/mongoHandler");
const {
  DEPRECATEDbuildPokemonEmbed,
  buildCelebiAbilityEmbed,
  buildNewPokemonEmbed,
} = require("../embeds/pokemonEmbeds");
const { logger } = require("../log");
const { getIdFromTowerStage } = require("../utils/battleUtils");
const { drawDiscrete, drawIterable } = require("../utils/gachaUtils");
const {
  getItems,
  removeItems,
  addRewards,
  getRewardsString,
  addItems,
} = require("../utils/trainerUtils");
const { generateRandomPokemon, giveNewPokemons } = require("./gacha");
const {
  listPokemonsFromTrainer: listPokemons,
  getPokemon,
  calculatePokemonStats,
  DEPRECATEDcalculateAndUpdatePokemonStats: calculateAndUpdatePokemonStats,
  checkNumPokemon,
  updatePokemon,
  transformPokemon,
} = require("./pokemon");
const { getTrainer, updateTrainer, emitTrainerEvent } = require("./trainer");
const { getMoves } = require("../battle/data/moveRegistry");
const { pokemonIdEnum } = require("../enums/pokemonEnums");
const { statIndexToBattleStatId } = require("../config/battleConfig");
const {
  getAbilityName,
  buildSpeciesNameString,
} = require("../utils/pokemonUtils");
const { trainerEventEnum } = require("../enums/gameEnums");
const {
  mewMythicConfig,
  deoxysMythicConfig,
  jirachiMythicConfig,
  arceusMythicConfig,
} = require("../config/mythicConfig");

/**
 * @param {Trainer} trainer
 * @param {pokemonIdEnum | (pokemonIdEnum[])} speciesIdOrIds
 * @returns {Promise<{data?: WithId<Pokemon>, err?: string}>}
 */
const getMythic = async (trainer, speciesIdOrIds) => {
  const pokemons = await listPokemons(trainer, {
    filter: Array.isArray(speciesIdOrIds)
      ? { speciesId: { $in: speciesIdOrIds } }
      : { speciesId: speciesIdOrIds },
    pageSize: 1,
    allowNone: true,
  });
  if (pokemons.err) {
    return { err: pokemons.err };
  }

  // if pokemon exists, get pokemon
  if (pokemons.data.length === 0) {
    return { data: null };
  }

  const pokemon = await getPokemon(trainer, pokemons.data[0]._id.toString());
  if (pokemon.err) {
    return { err: pokemon.err };
  }

  return { data: pokemon.data };
};

/**
 * @param {Trainer} trainer
 * @param {PokemonIdEnum} speciesId
 */
const generateMythic = (trainer, speciesId) => {
  const speciesData = pokemonConfig[speciesId];
  const mythic = generateRandomPokemon(trainer.userId, speciesId, 1, {
    heldItemChance: 0,
  });
  // set ivs to 31
  mythic.ivs = [31, 31, 31, 31, 31, 31];
  // set shiny to false
  mythic.shiny = false;
  // set locked to true
  mythic.locked = true;
  // recalculate stats
  calculatePokemonStats(mythic, speciesData);

  return mythic;
};

/**
 * @param {Trainer} trainer
 * @param {Pokemon} mythic
 * @returns {Promise<{err?: string, id?: any}>}
 */
const upsertMythic = async (trainer, mythic) => {
  const mythicData = pokemonConfig[mythic.speciesId];
  try {
    const query = new QueryBuilder(collectionNames.USER_POKEMON)
      .setFilter({ userId: mythic.userId, speciesId: mythic.speciesId })
      .setUpsert({ $set: mythic });
    const res = await query.upsertOne();

    if (res.upsertedCount !== 1) {
      logger.warn(
        `Error updating ${mythicData.name} for ${trainer.user.username}`
      );
    } else {
      logger.info(`Updated ${mythicData.name} for ${trainer.user.username}`);
      await emitTrainerEvent(trainerEventEnum.CAUGHT_POKEMON, {
        trainer,
        pokemons: [mythic],
        method: "mythic",
      });
    }
    return { id: res.upsertedId };
  } catch (err) {
    logger.error(err);
    return { err: `Error updating ${mythicData.name}` };
  }
};

const validateMewMoves = (mew) => {
  // if len moveIds != 4, return false
  if (mew.moveIds.length !== 4) {
    return { err: "Mew must have 4 moves!" };
  }

  // if duplicate moves, return false
  const moveIds = [...mew.moveIds];
  const uniqueMoves = new Set(moveIds);
  if (uniqueMoves.size !== moveIds.length) {
    return { err: "Mew cannot have duplicate moves!" };
  }

  // iterate over moveIds and check if move is in mewData.mythicConfig
  // first move in basic
  if (!mewMythicConfig.basicMoveIds.includes(moveIds[0])) {
    return { err: "Mew's first move must be a valid basic move!" };
  }
  // second move in power
  if (!mewMythicConfig.powerMoveIds.includes(moveIds[1])) {
    return { err: "Mew's second move must be a valid power move!" };
  }
  // third move in power
  if (!mewMythicConfig.powerMoveIds.includes(moveIds[2])) {
    return { err: "Mew's third move must be a valid power move!" };
  }
  // fourth move in ultimate
  if (!mewMythicConfig.ultimateMoveIds.includes(moveIds[3])) {
    return { err: "Mew's fourth move must be a valid ultimate move!" };
  }

  return { err: null };
};

const getMew = async (trainer) => {
  const speciesId = "151";
  const mewData = pokemonConfig[speciesId];

  const mewRes = await getMythic(trainer, speciesId);
  if (mewRes.err) {
    return { err: mewRes.err };
  }

  let mew = mewRes.data;
  let modified = false;
  if (!mew) {
    // if trainer hasn't defeated the newIsland, return err
    if (!trainer.defeatedNPCs[dungeons.NEW_ISLAND]) {
      return {
        err: "You must defeat the New Island in the `/dungeons` before you can get Mew!",
      };
    }

    mew = generateMythic(trainer, speciesId);
    modified = true;
  }

  // if moves not valid, reset moves
  if (validateMewMoves(mew).err) {
    mew.moveIds = [...mewData.moveIds];
    modified = true;
  }

  // update mew if modified
  if (modified) {
    const { err, id } = await upsertMythic(trainer, mew);
    if (err) {
      return { err };
    }
    mew._id = id || mew._id;
  }

  return { data: mew };
};

const updateMew = async (user, tab, selection) => {
  const speciesId = "151";
  const mewData = pokemonConfig[speciesId];

  let trainer = await getTrainer(user);
  if (trainer.err) {
    return { err: trainer.err };
  }
  trainer = trainer.data;

  const mewRes = await getMew(trainer);
  if (mewRes.err) {
    return { err: mewRes.err };
  }
  const mew = mewRes.data;

  // replace move or nature based on tab
  let err = null;
  switch (tab) {
    case "basic":
      mew.moveIds[0] = selection;
      err = validateMewMoves(mew).err;
      break;
    case "power1":
      mew.moveIds[1] = selection;
      err = validateMewMoves(mew).err;
      break;
    case "power2":
      mew.moveIds[2] = selection;
      err = validateMewMoves(mew).err;
      break;
    case "ultimate":
      mew.moveIds[3] = selection;
      err = validateMewMoves(mew).err;
      break;
    case "nature":
      mew.natureId = selection;
      break;
    default:
      return { err: "Invalid tab" };
  }
  if (err) {
    return { err };
  }

  // update mew
  const updateRes = calculateAndUpdatePokemonStats(mew, mewData, true);
  if (updateRes.err) {
    return { err: updateRes.err };
  }

  return { data: mew };
};

const buildMewSend = async ({ user = null, tab = "basic" } = {}) => {
  let trainer = await getTrainer(user);
  if (trainer.err) {
    return { err: trainer.err };
  }
  trainer = trainer.data;

  const mewRes = await getMew(trainer);
  if (mewRes.err) {
    return { err: mewRes.err };
  }
  const mew = mewRes.data;

  // choose selection options based on tab
  let selectIds = [];
  let selectConfig = {};
  let extraFields = [];
  switch (tab) {
    case "basic":
      selectIds = mewMythicConfig.basicMoveIds;
      // filter out moves that mew already knows
      selectIds = selectIds.filter((moveId) => !mew.moveIds.includes(moveId));
      selectConfig = getMoves({});
      break;
    case "power1":
      selectIds = mewMythicConfig.powerMoveIds;
      // filter out moves that mew already knows
      selectIds = selectIds.filter((moveId) => !mew.moveIds.includes(moveId));
      selectConfig = getMoves({});
      break;
    case "power2":
      selectIds = mewMythicConfig.powerMoveIds;
      // filter out moves that mew already knows
      selectIds = selectIds.filter((moveId) => !mew.moveIds.includes(moveId));
      selectConfig = getMoves({});
      break;
    case "ultimate":
      selectIds = mewMythicConfig.ultimateMoveIds;
      // filter out moves that mew already knows
      selectIds = selectIds.filter((moveId) => !mew.moveIds.includes(moveId));
      selectConfig = getMoves({});
      break;
    case "nature":
      selectIds = Object.keys(natureConfig);
      selectConfig = natureConfig;
      extraFields = ["description"];
      break;
    default:
      return { err: "Invalid tab" };
  }

  const send = {
    content: mew._id.toString(),
    embeds: [],
    components: [],
  };

  // build pokemon embed
  const embed = DEPRECATEDbuildPokemonEmbed(trainer, mew, "all");
  send.embeds.push(embed);

  // build tab buttons
  const tabButtonConfigs = [
    {
      label: "Basic",
      disabled: tab === "basic",
      data: {
        tab: "basic",
      },
    },
    {
      label: "Power 1",
      disabled: tab === "power1",
      data: {
        tab: "power1",
      },
    },
    {
      label: "Power 2",
      disabled: tab === "power2",
      data: {
        tab: "power2",
      },
    },
    {
      label: "Ultimate",
      disabled: tab === "ultimate",
      data: {
        tab: "ultimate",
      },
    },
    {
      label: "Nature",
      disabled: tab === "nature",
      data: {
        tab: "nature",
      },
    },
  ];
  const tabButtons = buildButtonActionRow(
    tabButtonConfigs,
    eventNames.MEW_BUTTON
  );
  send.components.push(tabButtons);

  // break up selection options into batches of 25, then append a selection menu for each batch
  const selectBatches = [];
  for (let i = 0; i < selectIds.length; i += 25) {
    const batch = selectIds.slice(i, i + 25);
    selectBatches.push(batch);
  }
  for (const batch of selectBatches) {
    const selectData = {
      tab,
      nonce: Math.random().toString(),
    };
    const selectRow = buildIdConfigSelectRow(
      batch,
      selectConfig,
      "Select Replacement",
      selectData,
      eventNames.MEW_SELECT,
      false,
      extraFields
    );
    send.components.push(selectRow);
  }

  return { send, err: null };
};

const getCelebi = async (trainer) => {
  const speciesId = "251";

  const celebiRes = await getMythic(trainer, speciesId);
  if (celebiRes.err) {
    return { err: celebiRes.err };
  }

  let celebi = celebiRes.data;
  let modified = false;
  if (!celebi) {
    // if trainer isn't level 75, return error
    const levelReq = process.env.STAGE === stageNames.ALPHA ? 40 : 75;
    if (trainer.level < levelReq) {
      return {
        err: `Celebi is busy time travelling! Wait a bit (until you're level ${levelReq}) and try again!`,
      };
    }

    // if trainer doesn't have ilex shrine location, return error
    if (trainer.locations[locations.ILEX_SHRINE] === undefined) {
      return {
        err: "Celebi is currently at a special location (check the `/pokemart`)! Purchase it and try again!",
      };
    }

    celebi = generateMythic(trainer, speciesId);
    modified = true;
  }

  if (!trainer.hasCelebi) {
    trainer.hasCelebi = true;
    const trainerRes = await updateTrainer(trainer);
    if (trainerRes.err) {
      return { err: trainerRes.err };
    }
  }

  // update celebi if modified
  if (modified) {
    const { err, id } = await upsertMythic(trainer, celebi);
    if (err) {
      return { err };
    }
    celebi._id = id || celebi._id;
  }

  return { data: celebi };
};

const canTimeTravel = async (trainer) => {
  if (!trainer.hasCelebi) {
    return { err: "You need to have Celebi to time travel!" };
  }
  if (trainer.usedTimeTravel) {
    return { err: "You've already used time travel today!" };
  }

  // check if trainer has at least 20 pokeballs
  if (getItems(trainer, backpackItems.POKEBALL) < 20) {
    return { err: "You need at least 20 Pokeballs to time travel!" };
  }

  // check for max pokemon
  return await checkNumPokemon(trainer, 1);
};

const buildCelebiSend = async (user) => {
  let trainer = await getTrainer(user);
  if (trainer.err) {
    return { err: trainer.err };
  }
  trainer = trainer.data;

  const celebiRes = await getCelebi(trainer);
  if (celebiRes.err) {
    return { err: celebiRes.err };
  }
  const celebi = celebiRes.data;

  const send = {
    content: celebi._id.toString(),
    embeds: [],
    components: [],
  };

  // build pokemon embed
  const embed = DEPRECATEDbuildPokemonEmbed(trainer, celebi, "info");
  send.embeds.push(embed);
  const abilityEmbed = buildCelebiAbilityEmbed(trainer);
  send.embeds.push(abilityEmbed);

  // build time travel button
  const canTimeTravelRes = await canTimeTravel(trainer);
  const timeTravelDisabled = canTimeTravelRes.err !== null;
  const timeTravelButton = buildButtonActionRow(
    [
      {
        label: "x20 Time Travel",
        disabled: timeTravelDisabled,
        emoji: backpackItemConfig[backpackItems.POKEBALL].emoji,
        data: {},
      },
    ],
    eventNames.CELEBI_TIME_TRAVEL
  );
  send.components.push(timeTravelButton);

  return { send, err: null };
};

const buildTimeTravelSend = async (user) => {
  let trainer = await getTrainer(user);
  if (trainer.err) {
    return { err: trainer.err };
  }
  trainer = trainer.data;

  const canTimeTravelRes = await canTimeTravel(trainer);
  if (canTimeTravelRes.err) {
    return { err: canTimeTravelRes.err };
  }

  // reduce trainer pokeballs by 20, set time travel to true
  removeItems(trainer, backpackItems.POKEBALL, 20);
  trainer.usedTimeTravel = true;
  const updateRes = await updateTrainer(trainer);
  if (updateRes.err) {
    return { err: updateRes.err };
  }

  // get rarity: epic 90%, legendary 10%
  const dist = {
    [rarities.EPIC]: 0.9,
    [rarities.LEGENDARY]: 0.1,
  };
  const rarity = drawDiscrete(dist, 1)[0];
  const possiblePokemons = getCelebiPool()[rarity];
  const pokemonId = drawIterable(possiblePokemons, 1)[0];

  // get new pokemon
  const pokemons = await giveNewPokemons(trainer, [pokemonId]);
  if (pokemons.err) {
    return { err: pokemons.err };
  }
  const pokemon = pokemons.data.pokemons[0];

  const embed = buildNewPokemonEmbed(
    pokemon,
    backpackItems.POKEBALL,
    getItems(trainer, backpackItems.POKEBALL)
  );

  const send = {
    content: pokemon._id.toString(),
    embeds: [embed],
    components: [],
  };

  return { send, err: null };
};

const DEOXYS_SPECIES_IDS = deoxysMythicConfig.speciesIds;

const getDeoxys = async (trainer) => {
  const deoxysRes = await getMythic(trainer, DEOXYS_SPECIES_IDS);
  const deoxys = deoxysRes.data;

  let modified = false;
  const speciesId = (deoxys && deoxys.speciesId) || DEOXYS_SPECIES_IDS[0];
  if (!deoxys) {
    // check if trainer has beat battle tower 20
    if (!trainer.defeatedNPCs[getIdFromTowerStage(20)]) {
      return {
        err: "You must defeat Battle Tower floor 20 to get Deoxys! Use `/battletower` to challenge it!",
      };
    }

    deoxys = generateMythic(trainer, speciesId);
    modified = true;
  }

  // update deoxys if modified
  if (modified) {
    const { err, id } = await upsertMythic(trainer, deoxys);
    if (err) {
      return { err };
    }
    deoxys._id = id || deoxys._id;
  }

  return { data: deoxys };
};

const buildDeoxysSend = async (user) => {
  let trainer = await getTrainer(user);
  if (trainer.err) {
    return { err: trainer.err };
  }
  trainer = trainer.data;

  const deoxysRes = await getDeoxys(trainer);
  if (deoxysRes.err) {
    return { err: deoxysRes.err };
  }
  const deoxys = deoxysRes.data;
  const deoxysId = deoxys.speciesId;

  const send = {
    content: deoxys._id.toString(),
    embeds: [],
    components: [],
  };

  // build pokemon embed
  const embed = DEPRECATEDbuildPokemonEmbed(trainer, deoxys, "all");
  send.embeds.push(embed);

  // build tab buttons
  const tabButtonConfigs = DEOXYS_SPECIES_IDS.map((speciesId) => {
    const speciesData = pokemonConfig[speciesId];
    const splitName = speciesData.name.split("-");
    const formName = splitName[1] || "Normal";
    return {
      label: formName,
      disabled: deoxysId === speciesId,
      data: {
        speciesId,
      },
      emoji: speciesData.emoji,
    };
  });
  const tabButtons = buildButtonActionRow(
    tabButtonConfigs,
    eventNames.DEOXYS_FORM_SELECT
  );
  send.components.push(tabButtons);

  return { send, err: null };
};

const onFormSelect = async (user, speciesId) => {
  if (!DEOXYS_SPECIES_IDS.includes(speciesId)) {
    return { err: "Invalid Deoxys Form" };
  }

  let trainer = await getTrainer(user);
  if (trainer.err) {
    return { err: trainer.err };
  }
  trainer = trainer.data;

  const deoxysRes = await getDeoxys(trainer);
  if (deoxysRes.err) {
    return { err: deoxysRes.err };
  }
  const deoxys = deoxysRes.data;

  const newDeoxysData = pokemonConfig[speciesId];
  if (!newDeoxysData) {
    return { err: "Invalid Deoxys Form" };
  }
  if (deoxys.speciesId === speciesId) {
    return { err: "You already have this Deoxys Form" };
  }

  // update deoxys
  deoxys.speciesId = speciesId;
  deoxys.name = newDeoxysData.name;
  [deoxys.abilityId] = Object.keys(newDeoxysData.abilities);

  // recalculate stats
  const updateRes = await calculateAndUpdatePokemonStats(deoxys, newDeoxysData);
  if (updateRes.err) {
    return { err: updateRes.err };
  }

  return { err: null };
};

/**
 * @param {WithId<Trainer>} trainer
 * @returns {Promise<{err?: string, data?: WithId<Pokemon>}>}
 */
const getJirachi = async (trainer) => {
  const speciesId = pokemonIdEnum.JIRACHI;

  const jirachiRes = await getMythic(trainer, speciesId);
  if (jirachiRes.err) {
    return { err: jirachiRes.err };
  }

  let jirachi = jirachiRes.data;
  let modified = false;
  if (!jirachi) {
    let metRequirements = true;
    // check star piece
    if (getItems(trainer, backpackItems.STAR_PIECE) < 200) {
      metRequirements = false;
    }
    // check for non-original-trainer pokemon
    const pokemonsRes = await listPokemons(trainer, {
      pageSize: 3,
      filter: { originalOwner: { $ne: trainer.userId } },
      allowNone: true,
    });
    if (pokemonsRes.err) {
      return { err: pokemonsRes.err };
    }
    if (pokemonsRes.data.length < 3) {
      metRequirements = false;
    }
    if (!metRequirements) {
      return {
        err: `Jirachi wants you to work with others before granting your wishes! You must obtain 200x ${
          backpackItemConfig[backpackItems.STAR_PIECE].emoji
        } Star Pieces from raids, and have at least 3 traded Pokemon!`,
      };
    }

    // @ts-ignore
    jirachi = generateMythic(trainer, speciesId);
    modified = true;
  }

  if (!trainer.hasJirachi) {
    trainer.hasJirachi = true;
    const trainerRes = await updateTrainer(trainer);
    if (trainerRes.err) {
      return { err: trainerRes.err };
    }
  }

  // update jirachi if modified
  if (modified) {
    const { err, id } = await upsertMythic(trainer, jirachi);
    if (err) {
      return { err };
    }
    jirachi._id = id || jirachi._id;
  }

  return { data: jirachi };
};

/**
 * @param {WithId<Trainer>} trainer
 * @returns {Promise<{err?: string, data?: WithId<Pokemon>}>}
 */
const getDarkrai = async (trainer) => {
  const speciesId = pokemonIdEnum.DARKRAI;

  const darkraiRes = await getMythic(trainer, speciesId);
  if (darkraiRes.err) {
    return { err: darkraiRes.err };
  }

  let darkrai = darkraiRes.data;
  let modified = false;
  if (!darkrai) {
    // requirement: has completed >= 25 tutorial stages
    if (Object.keys(trainer.tutorialData.completedTutorialStages).length < 25) {
      return {
        err: "You must complete at least 25 tutorial stages to get Darkrai! Use `/tutorial` to view your progress.",
      };
    }

    // @ts-ignore
    darkrai = generateMythic(trainer, speciesId);
    modified = true;
  }

  if (!trainer.hasDarkrai) {
    trainer.hasDarkrai = true;
    const trainerRes = await updateTrainer(trainer);
    if (trainerRes.err) {
      return { err: trainerRes.err };
    }
  }

  if (modified) {
    const { err, id } = await upsertMythic(trainer, darkrai);
    if (err) {
      return { err };
    }
    darkrai._id = id || darkrai._id;
  }

  return { data: darkrai };
};

/**
 * @param {Trainer} trainer
 * @param {object} param1
 * @param {string} param1.wishId
 * @param {Pokemon?=} param1.pokemon
 * @returns {{err?: string}}
 */
const canTrainerUseWish = (trainer, { wishId, pokemon }) => {
  const wishData = jirachiMythicConfig.wishes[wishId];
  if (!wishData) {
    return { err: "Invalid wish" };
  }
  if (trainer.usedWish) {
    return { err: "You have already used your wish this week!" };
  }
  const { starPieceCost } = wishData;
  if (getItems(trainer, backpackItems.STAR_PIECE) < starPieceCost) {
    return { err: "Not enough Star Pieces" };
  }

  if (pokemon && wishId === "power") {
    // check that an IV exists that is below 31
    if (pokemon.ivs.every((iv) => iv === 31)) {
      return { err: "All IVs are already at their maximum value!" };
    }
  } else if (pokemon && wishId === "rebirth") {
    // check that the pokemon may learn at least 2 abilites
    if (Object.keys(pokemonConfig[pokemon.speciesId].abilities).length < 2) {
      return { err: "This Pokemon may only have one ability!" };
    }
  }

  return { err: null };
};

/**
 * @param {DiscordUser} user
 * @param {object} param1
 * @param {string} param1.wishId
 * @param {WithId<Pokemon>?=} param1.pokemon
 * @returns {Promise<{result?: string, err?: string}>}
 */
const useWish = async (user, { wishId, pokemon }) => {
  const { data: trainer, err: trainerErr } = await getTrainer(user);
  if (trainerErr) {
    return { err: trainerErr };
  }
  const jirachiRes = await getJirachi(trainer);
  if (jirachiRes.err) {
    return { err: jirachiRes.err };
  }
  const { err: canUseWishErr } = canTrainerUseWish(trainer, {
    wishId,
    pokemon,
  });
  if (canUseWishErr) {
    return { err: canUseWishErr };
  }

  // use wish
  const wishData = jirachiMythicConfig.wishes[wishId];
  const { starPieceCost } = wishData;
  // remove star pieces and set usedWish to true
  removeItems(trainer, backpackItems.STAR_PIECE, starPieceCost);
  trainer.usedWish = true;
  // make wish happen
  let result = "";
  let rewards = {};
  switch (wishId) {
    case "power":
      // set a random non-31 IV to 31
      const non31IvIndices = pokemon.ivs.reduce((acc, iv, index) => {
        if (iv !== 31) {
          return [...acc, index];
        }
        return acc;
      }, []);
      const randomIndex = drawIterable(non31IvIndices, 1)[0];
      pokemon.ivs[randomIndex] = 31;

      // recalculate stats and update pokemon
      const updateStatsRes = await calculateAndUpdatePokemonStats(
        pokemon,
        pokemonConfig[pokemon.speciesId],
        true
      );
      if (updateStatsRes.err) {
        return { err: updateStatsRes.err };
      }
      result = `**${pokemon.name}'s ${statIndexToBattleStatId[
        randomIndex
      ].toUpperCase()}** IV was set to 31!`;
      break;
    case "rebirth":
      // reroll the Pokemon's ability ID, don't keep current ability
      const speciesData = pokemonConfig[pokemon.speciesId];
      const abilityProbabilities = {
        ...speciesData.abilities,
      };
      // remove current ability from probabilities
      delete abilityProbabilities[pokemon.abilityId];
      const newAbilityId = drawDiscrete(abilityProbabilities, 1)[0];
      pokemon.abilityId = newAbilityId;
      const updateRes = await updatePokemon(pokemon);
      if (updateRes.err) {
        return { err: updateRes.err };
      }
      result = `**${pokemon.name}'s** ability was changed to **${getAbilityName(
        newAbilityId
      )}**!`;
      break;
    case "allies":
      // give 50 random Pokeballs
      const pokeballResults = drawDiscrete(dailyRewardChances, 50);
      const backpackRewards = pokeballResults.reduce(
        (acc, curr) => {
          acc[backpackCategories.POKEBALLS][curr] =
            (acc[backpackCategories.POKEBALLS][curr] || 0) + 1;
          return acc;
        },
        {
          [backpackCategories.POKEBALLS]: {},
        }
      );
      rewards = { backpack: backpackRewards };
      addRewards(trainer, rewards);
      result = getRewardsString(rewards);
      break;
    case "wealth":
      rewards = {
        money: 40000,
        backpack: {
          [backpackCategories.MATERIALS]: {
            [backpackItems.EMOTION_SHARD]: 300,
            [backpackItems.KNOWLEDGE_SHARD]: 300,
            [backpackItems.WILLPOWER_SHARD]: 300,
            [backpackItems.MINT]: 5,
          },
        },
      };
      addRewards(trainer, rewards);
      result = getRewardsString(rewards);
      break;
    default:
      return { err: "Invalid wish" };
  }

  const { err: updateTrainerErr } = await updateTrainer(trainer);
  if (updateTrainerErr) {
    return { err: updateTrainerErr };
  }

  return { result, err: null };
};

const ARCEUS_SPECIES_IDS = arceusMythicConfig.speciesIds;

/**
 * @param {WithId<Trainer>} trainer
 * @returns {Promise<{err?: string, data?: WithId<Pokemon>}>}
 */
const getArceus = async (trainer) => {
  // @ts-ignore
  const arceusRes = await getMythic(trainer, ARCEUS_SPECIES_IDS);
  let arceus = arceusRes.data;

  let modified = false;
  const speciesId = (arceus && arceus.speciesId) || ARCEUS_SPECIES_IDS[0];
  if (!arceus) {
    // to get Arceus, the user must complete the following 3 steps:
    // 1. Have at least 1 unown
    // 2. Have at least 1 Dialga Origin, Palkia Origin, Giratina Origin, Azelf, Uxie, and Mesprit
    // 3. Have the following Mythical Pokemon: Mew, Celebi, Jirachi, Deoxys, and Darkrai

    // unown check
    const unownRes = await listPokemons(trainer, {
      filter: { speciesId: pokemonIdEnum.UNOWN },
      pageSize: 1,
      allowNone: true,
    });
    const numUnown = unownRes?.data?.length || 0;
    if (numUnown === 0) {
      return {
        err: `First, Arceus demands its arms of creation! Catch one ${buildSpeciesNameString(
          pokemonIdEnum.UNOWN
        )}!`,
      };
    }

    // dialga, palkia, giratina, azelf, uxie, mesprit check
    const speciesIds = [
      pokemonIdEnum.DIALGA_ORIGIN,
      pokemonIdEnum.PALKIA_ORIGIN,
      pokemonIdEnum.GIRATINA_ORIGIN,
      pokemonIdEnum.AZELF,
      pokemonIdEnum.UXIE,
      pokemonIdEnum.MESPRIT,
    ];
    const promises = speciesIds.map((speciesIdToFind) =>
      listPokemons(trainer, {
        filter: { speciesId: speciesIdToFind },
        pageSize: 1,
        allowNone: true,
      })
    );
    const results = await Promise.allSettled(promises);
    let numNotFound = 0;
    for (const result of results) {
      if (result.status === "rejected") {
        numNotFound += 1;
      } else if (result.value?.data?.length === 0) {
        numNotFound += 1;
      }
    }
    if (numNotFound > 0) {
      return {
        err: `Next, Arceus needs its creation Pokemon! Catch the following Pokemon: ${speciesIds
          .map(buildSpeciesNameString)
          .join(", ")}`,
      };
    }

    // mythical check
    const mythicPromises = [
      listPokemons(trainer, {
        filter: { speciesId: pokemonIdEnum.MEW },
        pageSize: 1,
        allowNone: true,
      }),
      listPokemons(trainer, {
        filter: { speciesId: pokemonIdEnum.CELEBI },
        pageSize: 1,
        allowNone: true,
      }),
      listPokemons(trainer, {
        filter: { speciesId: pokemonIdEnum.JIRACHI },
        pageSize: 1,
        allowNone: true,
      }),
      listPokemons(trainer, {
        filter: { speciesId: { $in: DEOXYS_SPECIES_IDS } },
        pageSize: 1,
        allowNone: true,
      }),
      listPokemons(trainer, {
        filter: { speciesId: pokemonIdEnum.DARKRAI },
        pageSize: 1,
        allowNone: true,
      }),
    ];
    const mythicResults = await Promise.allSettled(mythicPromises);
    numNotFound = 0;
    for (const result of mythicResults) {
      if (result.status === "rejected") {
        numNotFound += 1;
      } else if (result.value?.data?.length === 0 || result.value?.err) {
        numNotFound += 1;
      }
    }
    if (numNotFound > 0) {
      return {
        err: `Finally, Arceus needs its Mythical Pokemon! Use the \`/mythic\` command to catch the following Pokemon: ${[
          pokemonIdEnum.MEW,
          pokemonIdEnum.CELEBI,
          pokemonIdEnum.JIRACHI,
          pokemonIdEnum.DEOXYS,
          pokemonIdEnum.DARKRAI,
        ]
          .map(buildSpeciesNameString)
          .join(", ")}`,
      };
    }

    // @ts-ignore
    arceus = generateMythic(trainer, speciesId);
    modified = true;
  }

  // update arceus if modified
  if (modified) {
    const { err, id } = await upsertMythic(trainer, arceus);
    if (err) {
      return { err };
    }
    // @ts-ignore
    arceus._id = id || arceus._id;
  }

  // @ts-ignore
  return { data: arceus };
};

/**
 * @param {DiscordUser} user
 * @param {PokemonIdEnum} speciesId
 * @returns {Promise<{err?: string, data?: WithId<Pokemon>}>}
 */
const onArceusFormSelect = async (user, speciesId) => {
  if (!ARCEUS_SPECIES_IDS.includes(speciesId)) {
    return { err: "Invalid Arceus Form" };
  }

  const { data: trainer, err: trainerErr } = await getTrainer(user);
  if (trainerErr) {
    return { err: trainerErr };
  }

  const { data: arceus, err: arceusErr } = await getArceus(trainer);
  if (arceusErr) {
    return { err: arceusErr };
  }

  const newArceusData = pokemonConfig[speciesId];
  if (!newArceusData) {
    return { err: "Invalid Arceus Form" };
  }
  if (arceus.speciesId === speciesId) {
    return { err: "You already have this Arceus Form" };
  }

  // update arceus
  const newArceus = transformPokemon(arceus, speciesId);

  // recalculate stats
  const updateRes = await calculateAndUpdatePokemonStats(
    newArceus,
    newArceusData,
    true
  );
  if (updateRes.err) {
    return { err: updateRes.err };
  }

  return { err: null, data: updateRes.data };
};

/**
 * @param {PokemonIdEnum} speciesId
 * @returns {boolean}
 */
const canArceusCreatePokemon = (speciesId) => {
  const pokemonData = pokemonConfig[speciesId];
  if (!pokemonData) {
    return false;
  }
  return !pokemonData.noGacha && !pokemonData.unobtainable;
};

/**
 * Uses Arceus to create a Pokemon of the user's choosing
 * @param {DiscordUser} user
 * @param {PokemonIdEnum} speciesId
 * @returns {Promise<{err?: string, data?: WithId<Pokemon>}>}
 */
const arceusCreatePokemon = async (user, speciesId) => {
  if (!canArceusCreatePokemon(speciesId)) {
    return { err: "Arceus cannot create this Pokemon" };
  }

  const { data: trainer, err: trainerErr } = await getTrainer(user);
  if (trainerErr) {
    return { err: trainerErr };
  }
  if (trainer.usedCreation) {
    return { err: "You have already used Arceus's creation powers this week!" };
  }
  const { err: arceusErr } = await getArceus(trainer);
  if (arceusErr) {
    return { err: arceusErr };
  }

  const givePokemonRes = await giveNewPokemons(trainer, [speciesId], 1, {
    betterIvs: true,
  });
  if (givePokemonRes.err) {
    return { err: givePokemonRes.err };
  }
  const pokemon = givePokemonRes.data.pokemons[0];

  // make updates
  // trainer.usedCreation = true; TODO later
  const updateRes = await updateTrainer(trainer);
  if (updateRes.err) {
    return { err: updateRes.err };
  }

  return { err: null, data: pokemon };
};

/**
 * @param {DiscordUser} user
 * @param {BackpackItemEnum} itemId
 * @returns {Promise<{err?: string}>}
 */
const arceusCreateItem = async (user, itemId) => {
  if (!backpackItemConfig[itemId]) {
    return { err: "Invalid Item" };
  }

  const { data: trainer, err: trainerErr } = await getTrainer(user);
  if (trainerErr) {
    return { err: trainerErr };
  }
  if (trainer.usedCreation) {
    return { err: "You have already used Arceus's creation powers this week!" };
  }

  addItems(trainer, itemId, 1);

  const updateRes = await updateTrainer(trainer);
  if (updateRes.err) {
    return { err: updateRes.err };
  }

  return { err: null };
};

module.exports = {
  getMew,
  updateMew,
  buildMewSend,
  getCelebi,
  buildCelebiSend,
  buildTimeTravelSend,
  getDeoxys,
  buildDeoxysSend,
  onFormSelect,
  getJirachi,
  canTrainerUseWish,
  useWish,
  getDarkrai,
  getArceus,
  onArceusFormSelect,
  arceusCreatePokemon,
  canArceusCreatePokemon,
  arceusCreateItem,
};
