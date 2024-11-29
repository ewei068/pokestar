/* eslint-disable no-case-declarations */
// TODO: probably fix both
/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */

/**
 * @file
 * @author Elvis Wei
 *
 * battle.js Handles all battle interactions from the user at a base level down to creating the teams.
 */
const { Battle } = require("../battle/engine/Battle");
const { getOrSetDefault } = require("../utils/utils");
const {
  buildBattleEmbed,
  buildPveListEmbed,
  buildPveNpcEmbed,
  buildDungeonListEmbed,
  buildDungeonEmbed,
  buildBattleTowerEmbed,
} = require("../embeds/battleEmbeds");
const {
  buildSelectBattleMoveRow,
} = require("../components/selectBattleMoveRow");
const { buildButtonActionRow } = require("../components/buttonActionRow");
const {
  buildBattleInfoActionRow,
} = require("../components/battleInfoActionRow");
const { getTrainer, addExpAndMoney, updateTrainer } = require("./trainer");
const { addPokemonExpAndEVs, getPokemon } = require("./pokemon");
const { logger } = require("../log");
const { buildNextTurnActionRow } = require("../components/battleNextTurnRow");
const { deleteState } = require("./state");
const {
  npcConfig,
  difficultyConfig,
  dungeons,
  dungeonConfig,
  battleTowerConfig,
} = require("../config/npcConfig");
const { buildScrollActionRow } = require("../components/scrollActionRow");
const { getState } = require("./state");
const { eventNames } = require("../config/eventConfig");
const { buildIdConfigSelectRow } = require("../components/idConfigSelectRow");
const { validateParty } = require("./party");
const { addRewards, getRewardsString } = require("../utils/trainerUtils");
const { getIdFromTowerStage } = require("../utils/battleUtils");
const {
  BasicNPC,
  DungeonNPC,
  TowerNPC,
  RaidNPC,
} = require("../battle/engine/npcs");

const getStartTurnSend = async (battle, stateId) => {
  // clip log to last 20 lines
  if (battle.log.length > 20) {
    battle.log = battle.log.slice(battle.log.length - 20);
  }
  let content = battle.log.join("\n");
  battle.clearLog();

  const stateEmbed = buildBattleEmbed(battle);

  const components = [];
  if (!battle.ended) {
    const infoRow = buildBattleInfoActionRow(
      battle,
      stateId,
      Object.keys(battle.teams).length + 1
    );
    components.push(infoRow);

    // check if active pokemon can move
    // TODO: deal with NPC case
    if (
      battle.activePokemon.canMove() &&
      !battle.isNpc(battle.activePokemon.userId)
    ) {
      const selectMoveComponent = buildSelectBattleMoveRow(battle, stateId);
      components.push(selectMoveComponent);
    } else {
      const nextTurnComponent = buildNextTurnActionRow(stateId);
      components.push(nextTurnComponent);
    }
  } else {
    // if game ended, add rewards to trainers and pokemon
    // for non-NPC teams, for all trainers, add rewards
    try {
      // if winner is NPC, no rewards
      if (!battle.teams[battle.winner].isNpc) {
        if (battle.rewardString) {
          content += `\n${battle.rewardString}`;
        }
        const rewardRecipients = [];
        content += `\n**The following Pokemon leveled up:**`;
        for (const teamName in battle.teams) {
          const team = battle.teams[teamName];
          if (team.isNpc) {
            continue;
          }

          const moneyReward =
            teamName === battle.winner
              ? battle.moneyReward
              : Math.floor(battle.moneyReward / 2);
          const expReward =
            teamName === battle.winner
              ? battle.expReward
              : Math.floor(battle.expReward / 2);
          const pokemonExpReward =
            teamName === battle.winner
              ? battle.pokemonExpReward
              : Math.floor(battle.pokemonExpReward / 2);

          // TODO: optimize this it makes too many db calls
          for (const userId of team.userIds) {
            const user = battle.users[userId];
            // get trainer
            const trainer = await getTrainer(user);
            if (trainer.err) {
              logger.warn(
                `Failed to get trainer for user ${user.id} after battle`
              );
              continue;
            }

            // trigger battle win callback
            if (battle.winCallback) {
              await battle.winCallback(battle, trainer.data);
            }

            // add trainer rewards
            await addExpAndMoney(user, expReward, moneyReward);
            const defeatedDifficultiesToday =
              trainer.data.defeatedNPCsToday[battle.npcId];
            const defeatedDifficulties =
              trainer.data.defeatedNPCs[battle.npcId];
            const allRewards = {};
            let modified = false;
            // add battle rewards
            if (battle.rewards) {
              addRewards(trainer.data, battle.rewards, allRewards);
              modified = true;
            }
            // add daily rewards
            if (
              battle.dailyRewards &&
              (!defeatedDifficultiesToday ||
                !defeatedDifficultiesToday.includes(battle.difficulty))
            ) {
              addRewards(trainer.data, battle.dailyRewards, allRewards);
              getOrSetDefault(
                trainer.data.defeatedNPCsToday,
                battle.npcId,
                []
              ).push(battle.difficulty);
              modified = true;
            }
            // add to defeated difficulties if not already there
            if (
              !defeatedDifficulties ||
              !defeatedDifficulties.includes(battle.difficulty)
            ) {
              getOrSetDefault(trainer.data.defeatedNPCs, battle.npcId, []).push(
                battle.difficulty
              );
              modified = true;
            }

            // attempt to add rewards
            if (modified) {
              const { err } = await updateTrainer(trainer.data);
              if (err) {
                logger.warn(
                  `Failed to update daily trainer for user ${user.id} after battle`
                );
                continue;
              } else {
                // this is kinda hacky there may be a better way to do this
                rewardRecipients.push({
                  username: user.username,
                  rewards: allRewards,
                });
              }
            }

            const levelUps = [];
            // add pokemon rewards
            for (const pokemon of Object.values(battle.allPokemon).filter(
              (p) => p.originalUserId === trainer.data.userId
            )) {
              // get db pokemon
              const dbPokemon = await getPokemon(trainer.data, pokemon.id);
              if (dbPokemon.err) {
                logger.warn(`Failed to get pokemon ${pokemon.id} after battle`);
                continue;
              }

              const oldLevel = dbPokemon.data.level;
              const trainResult = await addPokemonExpAndEVs(
                trainer.data,
                dbPokemon.data,
                pokemonExpReward
              );
              if (trainResult.err) {
                continue;
              }
              const newLevel = trainResult.data.level;

              if (newLevel > oldLevel) {
                levelUps.push({
                  pokemonName: dbPokemon.data.name,
                  oldLevel,
                  newLevel,
                });
              }
            }
            if (levelUps.length > 0) {
              content += `\n${user.username}'s Pokemon: ${levelUps
                .map((l) => `${l.pokemonName} (${l.oldLevel} -> ${l.newLevel})`)
                .join(", ")}`;
            }
          }

          if (rewardRecipients.length > 0) {
            content += `\n**${rewardRecipients
              .map((r) => r.username)
              .join(", ")} received rewards for their victory:**`;
            content += getRewardsString(rewardRecipients[0].rewards, false);
          }
        }
      } else if (battle.loseCallback) {
        await battle.loseCallback(battle);
      }
    } catch (err) {
      logger.error(`Failed to add battle rewards: ${err}`);
    }

    // re-add log to content
    content += `\n${battle.log.join("\n")}`;

    // if state has an NPC id, add a replay button
    const state = getState(stateId);
    if (state && state.endBattleComponents) {
      components.push(...state.endBattleComponents);
    } else {
      deleteState(stateId);
    }
  }

  return {
    content,
    embeds: [stateEmbed],
    components,
  };
};

const buildPveSend = async ({
  stateId = null,
  user = null,
  view = "list",
  option = null,
  page = 1,
} = {}) => {
  // get state
  const state = getState(stateId);

  // get trainer
  let trainer = await getTrainer(user);
  if (trainer.err) {
    return { send: null, err: trainer.err };
  }
  trainer = trainer.data;

  const send = {
    embeds: [],
    components: [],
  };
  const pageSize = 10;
  const npcIds = Object.keys(npcConfig);
  if (view === "list") {
    const maxPages = Math.ceil(npcIds.length / pageSize);
    if (page < 1 || page > maxPages) {
      return { embed: null, err: `Invalid page!` };
    }
    // get npc ids for page
    const npcIdsForPage = npcIds.slice((page - 1) * pageSize, page * pageSize);

    // build list embed
    const embed = buildPveListEmbed(npcIdsForPage, page);
    send.embeds.push(embed);

    // build scroll buttons
    const scrollData = {
      stateId,
    };
    const scrollRow = buildScrollActionRow(
      page,
      page === maxPages,
      scrollData,
      eventNames.PVE_SCROLL
    );
    send.components.push(scrollRow);

    // build npc select menu
    const npcSelectRowData = {
      stateId,
    };
    const npcSelectRow = buildIdConfigSelectRow(
      npcIdsForPage,
      npcConfig,
      "Select an NPC to battle:",
      npcSelectRowData,
      eventNames.PVE_SELECT,
      false
    );
    send.components.push(npcSelectRow);
  } else if (view === "npc") {
    // validate npc id
    const npcData = npcConfig[option];
    if (npcData === undefined) {
      return { embed: null, err: `Invalid NPC!` };
    }

    // build npc embed
    const embed = buildPveNpcEmbed(option);
    send.embeds.push(embed);

    // build difficulty row
    const difficultySelectData = {
      stateId,
    };
    const difficultyButtonConfigs = Object.keys(npcData.difficulties).map(
      (difficulty) => ({
        label: difficultyConfig[difficulty].name,
        disabled: false,
        data: {
          ...difficultySelectData,
          difficulty,
        },
      })
    );
    const difficultyRow = buildButtonActionRow(
      difficultyButtonConfigs,
      eventNames.PVE_ACCEPT
    );
    send.components.push(difficultyRow);

    // build return button
    const index = npcIds.indexOf(option);
    const returnToPage = Math.floor(index / pageSize) + 1;
    const returnData = {
      stateId,
      page: returnToPage,
    };
    const returnButtonConfigs = [
      {
        label: "Return",
        disabled: false,
        data: returnData,
      },
    ];
    const returnRow = buildButtonActionRow(
      returnButtonConfigs,
      eventNames.PVE_SCROLL
    );

    state.npcId = option;
    send.components.push(returnRow);
    send.content = "";
  } else if (view === "battle") {
    // validate npc id
    const npcData = npcConfig[state.npcId];
    if (npcData === undefined) {
      return { embed: null, err: `Invalid NPC!` };
    }

    // validate difficulty
    const npcDifficultyData = npcData.difficulties[state.difficulty];
    if (npcDifficultyData === undefined) {
      return {
        embed: null,
        err: `Difficulty doesn't exist for ${npcData.name}!`,
      };
    }

    // get trainer
    const trainerResult = await getTrainer(user);
    if (trainerResult.err) {
      return { embed: null, err: trainerResult.err };
    }

    // validate party
    const validate = await validateParty(trainerResult.data);
    if (validate.err) {
      return { err: validate.err };
    }

    // add npc to battle
    const npc = new BasicNPC(npcData, state.difficulty);
    npc.setPokemon(npcData, state.difficulty);
    const rewardMultipliers =
      npcDifficultyData.rewardMultipliers ||
      difficultyConfig[state.difficulty].rewardMultipliers;
    const battle = new Battle({
      ...rewardMultipliers,
      dailyRewards: npcDifficultyData.dailyRewards,
      npcId: state.npcId,
      difficulty: state.difficulty,
    });
    battle.addTeam("NPC", true);
    battle.addTrainer(
      npc,
      npc.party.pokemons,
      "NPC",
      npc.party.rows,
      npc.party.cols
    );
    battle.addTeam("Player", false);
    battle.addTrainer(trainerResult.data, validate.data, "Player");

    // start battle and add to state
    battle.start();
    state.battle = battle;

    // add a replay button to state for later
    // build difficulty row
    const difficultySelectData = {
      stateId,
      difficulty: state.difficulty,
    };
    const difficultyButtonConfigs = [
      {
        label: "Replay",
        disabled: false,
        data: difficultySelectData,
      },
    ];
    const difficultyRow = buildButtonActionRow(
      difficultyButtonConfigs,
      eventNames.PVE_ACCEPT
    );

    const returnData = {
      stateId,
    };
    const returnButtonConfigs = [
      {
        label: "Return",
        disabled: false,
        data: returnData,
      },
    ];
    const returnRow = buildButtonActionRow(
      returnButtonConfigs,
      eventNames.PVE_SELECT
    );

    state.endBattleComponents = [difficultyRow, returnRow];

    return {
      send: await getStartTurnSend(battle, stateId),
      err: null,
    };
  }

  return { send, err: null };
};

const buildDungeonSend = async ({
  stateId = null,
  user = null,
  view = "list",
  option = null,
} = {}) => {
  // get state
  const state = getState(stateId);

  // get trainer
  let trainer = await getTrainer(user);
  if (trainer.err) {
    return { send: null, err: trainer.err };
  }
  trainer = trainer.data;

  const send = {
    embeds: [],
    components: [],
  };
  if (view === "list") {
    // build list embed
    const embed = buildDungeonListEmbed();
    send.embeds.push(embed);

    // build dungeon select menu
    const dungeonSelectRowData = {
      stateId,
    };
    const dungeonSelectRow = buildIdConfigSelectRow(
      Object.values(dungeons),
      dungeonConfig,
      "Select a Dungeon to battle:",
      dungeonSelectRowData,
      eventNames.DUNGEON_SELECT,
      false
    );
    send.components.push(dungeonSelectRow);
  } else if (view === "dungeon") {
    // validate npc id
    const dungeonData = dungeonConfig[option];
    if (dungeonData === undefined) {
      return { embed: null, err: `Invalid Dungeon!` };
    }

    // build npc embed
    const embed = buildDungeonEmbed(option);
    send.embeds.push(embed);

    // build difficulty row
    const difficultySelectData = {
      stateId,
    };
    const difficultyButtonConfigs = Object.keys(dungeonData.difficulties).map(
      (difficulty) => ({
        label: difficultyConfig[difficulty].name,
        disabled: false,
        data: {
          ...difficultySelectData,
          difficulty,
        },
      })
    );
    const difficultyRow = buildButtonActionRow(
      difficultyButtonConfigs,
      eventNames.DUNGEON_ACCEPT
    );
    send.components.push(difficultyRow);

    // build return button
    const returnData = {
      stateId,
    };
    const returnButtonConfigs = [
      {
        label: "Return",
        disabled: false,
        data: returnData,
      },
    ];
    const returnRow = buildButtonActionRow(
      returnButtonConfigs,
      // im lazy and using the same event name
      eventNames.DUNGEON_ACCEPT
    );

    state.dungeonId = option;
    send.components.push(returnRow);
  } else if (view === "battle") {
    // validate npc id
    const dungeonData = dungeonConfig[state.dungeonId];
    if (dungeonData === undefined) {
      return { embed: null, err: `Invalid Dungeon!` };
    }

    // validate difficulty
    const dungeonDifficultyData = dungeonData.difficulties[state.difficulty];
    if (dungeonDifficultyData === undefined) {
      return {
        embed: null,
        err: `Difficulty doesn't exist for ${dungeonData.name}!`,
      };
    }

    // get trainer
    const trainerResult = await getTrainer(user);
    if (trainerResult.err) {
      return { embed: null, err: trainerResult.err };
    }

    // validate party
    const validate = await validateParty(trainerResult.data);
    if (validate.err) {
      return { err: validate.err };
    }

    // add npc to battle
    const npc = new DungeonNPC(dungeonData, state.difficulty);
    npc.setPokemon();
    const rewardMultipliers =
      dungeonDifficultyData.rewardMultipliers ||
      difficultyConfig[state.difficulty].rewardMultipliers;
    const battle = new Battle({
      ...rewardMultipliers,
      rewards: dungeonDifficultyData.rewards,
      rewardString: dungeonDifficultyData.rewardString,
      npcId: state.dungeonId,
      difficulty: state.difficulty,
    });
    battle.addTeam("Dungeon", true);
    battle.addTrainer(
      npc,
      npc.party.pokemons,
      "Dungeon",
      npc.party.rows,
      npc.party.cols
    );
    battle.addTeam("Player", false);
    battle.addTrainer(trainerResult.data, validate.data, "Player");

    // start battle and add to state
    battle.start();
    state.battle = battle;

    // add a replay button to state for later
    // build difficulty row
    const difficultySelectData = {
      stateId,
      difficulty: state.difficulty,
    };
    const difficultyButtonConfigs = [
      {
        label: "Replay",
        disabled: false,
        data: difficultySelectData,
      },
    ];
    const difficultyRow = buildButtonActionRow(
      difficultyButtonConfigs,
      eventNames.DUNGEON_ACCEPT
    );
    state.endBattleComponents = [difficultyRow];

    return {
      send: await getStartTurnSend(battle, stateId),
      err: null,
    };
  }

  return { send, err: null };
};

const towerWinCallback = async (battle, trainer) => {
  // validate tower stage
  const towerStage = trainer.lastTowerStage + 1;
  if (getIdFromTowerStage(towerStage) !== battle.npcId) {
    battle.rewards = null;
    return;
  }

  // make sure that stage exists
  const battleTowerData = battleTowerConfig[towerStage];
  if (!battleTowerData) {
    battle.rewards = null;
    return;
  }

  // update trainer
  trainer.lastTowerStage = towerStage;
  const updateRes = await updateTrainer(trainer);
  if (updateRes.err) {
    battle.rewards = null;
    return;
  }

  // add rewards to battle
  battle.rewards = {
    ...battleTowerData.rewards,
  };
};

const onBattleTowerAccept = async ({ stateId = null, user = null } = {}) => {
  // get state
  const state = getState(stateId);

  // get battle tower stage data
  const towerStage = state.towerStage || 1;
  const battleTowerData = battleTowerConfig[towerStage];
  if (!battleTowerData) {
    return { send: null, err: `Invalid Battle Tower stage!` };
  }
  // validate npc id
  const npcData = npcConfig[battleTowerData.npcId];
  if (npcData === undefined) {
    return { embed: null, err: `Invalid NPC!` };
  }
  // validate difficulty
  const npcDifficultyData = npcData.difficulties[battleTowerData.difficulty];
  if (npcDifficultyData === undefined) {
    return {
      embed: null,
      err: `Difficulty doesn't exist for ${npcData.name}!`,
    };
  }

  // get trainer
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { embed: null, err: trainer.err };
  }
  // validate that last stage is correct
  if (trainer.data.lastTowerStage !== towerStage - 1) {
    return { embed: null, err: `You must complete the previous stage first!` };
  }
  // validate party
  const validate = await validateParty(trainer.data);
  if (validate.err) {
    return { err: validate.err };
  }

  // add npc to battle
  const npc = new TowerNPC(battleTowerData, battleTowerData.difficulty);
  npc.setPokemon(battleTowerData, battleTowerData.difficulty);
  const rewardMultipliers =
    npcDifficultyData.rewardMultipliers ||
    difficultyConfig[battleTowerData.difficulty].rewardMultipliers;
  const battle = new Battle({
    ...rewardMultipliers,
    npcId: getIdFromTowerStage(towerStage),
    difficulty: battleTowerData.difficulty,
    winCallback: towerWinCallback,
  });
  battle.addTeam("Battle Tower", true);
  battle.addTrainer(
    npc,
    npc.party.pokemons,
    "Battle Tower",
    npc.party.rows,
    npc.party.cols
  );
  battle.addTeam("Player", false);
  battle.addTrainer(trainer.data, validate.data, "Player");

  // start battle and add to state
  battle.start();
  state.battle = battle;

  // build return button
  const returnData = {
    stateId,
    page: towerStage,
  };
  const returnButtonConfigs = [
    {
      label: "Return",
      disabled: false,
      data: returnData,
    },
  ];
  const returnRow = buildButtonActionRow(
    returnButtonConfigs,
    // im lazy and using the same event name
    eventNames.TOWER_SCROLL
  );
  state.endBattleComponents = [returnRow];

  return { err: null };
};

/**
 *
 * @param {object} param0
 * @param {string?=} param0.stateId
 * @param {any?=} param0.user
 * @returns {Promise<any>}
 */
const buildBattleTowerSend = async ({ stateId = null, user = null } = {}) => {
  // get state
  const state = getState(stateId);

  // get battle tower stage data
  const towerStage = state.towerStage || 1;
  const battleTowerData = battleTowerConfig[towerStage];
  if (!battleTowerData) {
    return { send: null, err: `Invalid Battle Tower stage!` };
  }
  const maxPages = Object.keys(battleTowerConfig).length;

  // get trainer
  let trainer = await getTrainer(user);
  if (trainer.err) {
    return { send: null, err: trainer.err };
  }
  trainer = trainer.data;

  const send = {
    content: "",
    embeds: [],
    components: [],
  };

  const embed = buildBattleTowerEmbed(towerStage);
  send.embeds.push(embed);

  // build scroll buttons
  const scrollData = {
    stateId,
  };
  const scrollRow = buildScrollActionRow(
    towerStage,
    towerStage === maxPages,
    scrollData,
    eventNames.TOWER_SCROLL
  );
  send.components.push(scrollRow);

  // build battle button
  const battleData = {
    stateId,
  };
  const battleButtonConfigs = [
    {
      label: "Battle",
      disabled: towerStage !== trainer.lastTowerStage + 1,
      data: battleData,
    },
  ];
  const battleRow = buildButtonActionRow(
    battleButtonConfigs,
    eventNames.TOWER_ACCEPT
  );
  send.components.push(battleRow);

  return { send, err: null };
};

module.exports = {
  getStartTurnSend,
  buildPveSend,
  buildDungeonSend,
  onBattleTowerAccept,
  buildBattleTowerSend,
  RaidNPC,
};
