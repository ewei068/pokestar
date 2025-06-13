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
// eslint-disable-next-line no-unused-vars
const { MessageComponentInteraction, Message } = require("discord.js");
const { Battle } = require("../battle/engine/Battle");
const { getOrSetDefault, errorlessAsync } = require("../utils/utils");
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
const {
  getTrainer,
  addExpAndMoney,
  updateTrainer,
  getTrainerFromId,
} = require("./trainer");
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
const { validatePartyForBattle } = require("./party");
const {
  addRewards,
  getFlattenedRewardsString,
  getUserSelectedDevice,
  formatDreamCardsForTrainer,
} = require("../utils/trainerUtils");
const { getIdFromTowerStage, npcTurnAction } = require("../utils/battleUtils");
const {
  BasicNPC,
  DungeonNPC,
  TowerNPC,
  RaidNPC,
} = require("../battle/engine/npcs");
const { heldItemIdEnum } = require("../enums/battleEnums");
const { emojis } = require("../enums/emojis");

/**
 * @param {Trainer} trainer
 * @returns {{ err?: string }}
 */
const getDoesTrainerHaveAutoBattle = (trainer) => {
  if (!trainer.hasDarkrai) {
    return {
      err: "You don't have access to auto battle yet! Use `/mythic darkrai` to gain access to auto battle.",
    };
  }
  return { err: null };
};

/**
 * @param {Trainer} trainer
 * @param {number} cost
 * @returns {{ err?: string }}
 */
const getCanTrainerAutoBattle = (trainer, cost) => {
  const doesTrainerHaveAutoBattle = getDoesTrainerHaveAutoBattle(trainer);
  if (doesTrainerHaveAutoBattle.err) {
    return doesTrainerHaveAutoBattle;
  }
  if (trainer.dreamCards < cost) {
    return {
      err: `You don't have enough ${emojis.DREAM_CARD} Dream Cards to auto battle! You have ${trainer.dreamCards} and need ${cost}. Dream Cards recharge once every 5 minutes.`,
    };
  }
  return { err: null };
};
/**
 * @param {DiscordUser} user
 * @param {number} cost
 * @returns {Promise<{ err?: string }>}
 */
const getCanUserAutoBattle = async (user, cost) => {
  const trainer = await getTrainer(user);
  if (trainer.err) {
    return { err: trainer.err };
  }
  return getCanTrainerAutoBattle(trainer.data, cost);
};

/**
 * @param {Battle} battle
 * @param {string} stateId
 */
const getStartTurnSend = async (battle, stateId) => {
  // clip log to last 20 lines
  if (battle.log.length > 20) {
    battle.log = battle.log.slice(battle.log.length - 20);
  }
  let content = battle.log.join("\n");

  // get current user, or first other user if NPC
  let activeUserId = battle.activePokemon.userId;
  if (battle.isNpc(activeUserId)) {
    for (const team of Object.values(battle.teams)) {
      for (const userId of team.userIds) {
        if (!battle.isNpc(userId)) {
          activeUserId = userId;
          break;
        }
      }
    }
  }
  const { data: activeTrainer } = await getTrainerFromId(activeUserId);

  const stateEmbed = buildBattleEmbed(battle, {
    // TODO: get user from client
    // @ts-ignore
    isMobile: getUserSelectedDevice({}, activeTrainer?.settings) === "mobile",
  });

  battle.clearLog();
  const components = [];
  if (!battle.ended) {
    // TODO: stop button?
    if (!battle.autoData.isAutoMode) {
      const infoRow = buildBattleInfoActionRow(battle, stateId, {});
      components.push(infoRow);

      // check if active pokemon can move
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
            // @ts-ignore
            const trainer = await getTrainer(user);
            if (trainer.err) {
              logger.warn(
                // @ts-ignore
                `Failed to get trainer for user ${user.id} after battle`
              );
              continue;
            }

            // trigger battle win callback
            if (battle.winCallback) {
              await battle.winCallback(battle, trainer.data);
            }

            // add trainer rewards
            // @ts-ignore
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
                  // @ts-ignore
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
              const thisPokemonExpReward =
                pokemon.originalHeldItemId === heldItemIdEnum.LUCKY_EGG
                  ? pokemonExpReward * 2
                  : pokemonExpReward;
              const trainResult = await addPokemonExpAndEVs(
                trainer.data,
                dbPokemon.data,
                thisPokemonExpReward
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
            content += getFlattenedRewardsString(
              rewardRecipients[0].rewards,
              false
            );
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

/**
 * @param {Battle} battle
 * @param {string} stateId
 * @param {MessageComponentInteraction} interaction
 */
const instantAutoBattle = async (battle, stateId, interaction) => {
  await interaction.deferUpdate();
  for (let i = 0; i < 300; i += 1) {
    for (let retry = 0; retry < 3; retry += 1) {
      try {
        if (battle.ended || !battle.autoData.isAutoMode) {
          const componentToSend = await getStartTurnSend(battle, stateId);
          return await interaction.editReply(componentToSend);
        }
        npcTurnAction(battle);
        continue;
      } catch (err) {
        logger.error(`Failed to instant auto turn: ${err}`);
        logger.error(battle.log?.join?.("\n"));
      }
      logger.error("Failed to instant auto turn after 3 retries");
      return;
    }
  }
  logger.error("Failed to instant auto complete after 300 turns");
};

/**
 * @param {Battle} battle
 * @param {string} stateId
 * @param {object} options
 * @param {MessageComponentInteraction=} options.interaction
 * @param {Message=} options.messageRef
 * @param {number=} options.retry
 * @param {number=} options.totalTurns
 */
const nextAutoTurn = async (
  battle,
  stateId,
  { messageRef, interaction, retry = 0, totalTurns = 0 }
) => {
  if (totalTurns > 300) {
    logger.error("Auto turn timed out");
    return;
  }
  if (battle.ended || !battle.autoData.isAutoMode) {
    return;
  }
  let newMessageRef;
  try {
    npcTurnAction(battle);
    const componentToSend = await getStartTurnSend(battle, stateId);
    if (interaction) {
      newMessageRef = await interaction.update(componentToSend);
    } else if (messageRef) {
      newMessageRef = await messageRef.edit(componentToSend);
    } else {
      logger.error("No interaction or message ref provided");
      return;
    }
  } catch (err) {
    logger.error(`Failed to send auto turn: ${err}`);
    logger.error(battle.log?.join?.("\n"));
    if (retry < 3) {
      return await nextAutoTurn(battle, stateId, {
        messageRef,
        interaction,
        retry: retry + 1,
        totalTurns,
      });
    }
    logger.error("Failed to send auto turn after 3 retries");
    return;
  }

  return await setTimeout(
    async () =>
      await nextAutoTurn(battle, stateId, {
        // @ts-ignore
        messageRef: newMessageRef,
        totalTurns: totalTurns + 1,
      }),
    1000
  );
};

/**
 * @param {object} options
 * @param {Battle} options.battle
 * @param {string} options.stateId
 * @param {MessageComponentInteraction} options.interaction
 * @param {DiscordUser} options.user
 */
const startAuto = async ({ battle, stateId, interaction, user }) => {
  const { data: trainer } = await getTrainer(user);
  const canAutoRes = getCanTrainerAutoBattle(
    trainer,
    battle.autoData.autoBattleCost
  );
  if (canAutoRes.err) {
    return { err: canAutoRes.err };
  }
  if (!battle.autoData.shouldShowAutoBattle) {
    return { err: "This battle can't be auto'd!" };
  }

  // remove dream cards
  trainer.dreamCards -= battle.autoData.autoBattleCost;
  const updateResult = await updateTrainer(trainer);
  if (updateResult.err) {
    return { err: updateResult.err };
  }

  errorlessAsync(() => {
    if (trainer.settings.instantAutoBattle) {
      return instantAutoBattle(battle, stateId, interaction);
    }
    return nextAutoTurn(battle, stateId, {
      interaction,
    });
  });
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
  const trainerResult = await getTrainer(user);
  if (trainerResult.err) {
    return { send: null, err: trainerResult.err };
  }
  const trainer = trainerResult.data;

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
    // @ts-ignore
    const embed = buildPveListEmbed(npcIdsForPage, page, {
      dreamCardString: getDoesTrainerHaveAutoBattle(trainer).err
        ? null
        : formatDreamCardsForTrainer(trainer),
    });
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
    const embed = buildPveNpcEmbed(option, {
      dreamCardString: getDoesTrainerHaveAutoBattle(trainer).err
        ? null
        : formatDreamCardsForTrainer(trainer),
    });
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
    const newTrainerResult = await getTrainer(user);
    if (newTrainerResult.err) {
      return { embed: null, err: newTrainerResult.err };
    }

    // validate party
    const validate = await validatePartyForBattle(newTrainerResult.data);
    if (validate.err) {
      return { err: validate.err };
    }

    // add npc to battle
    const npc = new BasicNPC(npcData, state.difficulty);
    npc.setPokemon(npcData, state.difficulty);
    const rewardMultipliers =
      npcDifficultyData.rewardMultipliers ||
      difficultyConfig[state.difficulty].rewardMultipliers;
    const { autoBattleCost } = difficultyConfig[state.difficulty];
    const battle = new Battle({
      ...rewardMultipliers,
      dailyRewards: npcDifficultyData.dailyRewards,
      npcId: state.npcId,
      difficulty: state.difficulty,
      canAuto: !getCanTrainerAutoBattle(newTrainerResult.data, autoBattleCost)
        .err,
      autoBattleCost,
      shouldShowAutoBattle: !getDoesTrainerHaveAutoBattle(newTrainerResult.data)
        .err,
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
    battle.addTrainer(newTrainerResult.data, validate.data, "Player");

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
  const trainerResult = await getTrainer(user);
  if (trainerResult.err) {
    return { send: null, err: trainerResult.err };
  }
  const trainer = trainerResult.data;

  const send = {
    embeds: [],
    components: [],
  };
  if (view === "list") {
    // build list embed
    const embed = buildDungeonListEmbed({
      dreamCardString: getDoesTrainerHaveAutoBattle(trainer).err
        ? null
        : formatDreamCardsForTrainer(trainer),
    });
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
    const embed = buildDungeonEmbed(option, {
      dreamCardString: getDoesTrainerHaveAutoBattle(trainer).err
        ? null
        : formatDreamCardsForTrainer(trainer),
    });
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
    const newTrainerResult = await getTrainer(user);
    if (newTrainerResult.err) {
      return { embed: null, err: newTrainerResult.err };
    }

    // validate party
    const validate = await validatePartyForBattle(newTrainerResult.data);
    if (validate.err) {
      return { err: validate.err };
    }

    // add npc to battle
    const npc = new DungeonNPC(dungeonData, state.difficulty);
    npc.setPokemon();
    const rewardMultipliers =
      dungeonDifficultyData.rewardMultipliers ||
      difficultyConfig[state.difficulty].rewardMultipliers;
    const autoBattleCost =
      difficultyConfig[state.difficulty].autoBattleCost + 6;
    const battle = new Battle({
      ...rewardMultipliers,
      rewards: dungeonDifficultyData.rewards,
      rewardString: dungeonDifficultyData.rewardString,
      npcId: state.dungeonId,
      difficulty: state.difficulty,
      canAuto: !getCanTrainerAutoBattle(newTrainerResult.data, autoBattleCost)
        .err,
      autoBattleCost,
      shouldShowAutoBattle: !getDoesTrainerHaveAutoBattle(newTrainerResult.data)
        .err,
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
    battle.addTrainer(newTrainerResult.data, validate.data, "Player");

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
  const validate = await validatePartyForBattle(trainer.data);
  if (validate.err) {
    return { err: validate.err };
  }

  // add npc to battle
  const npc = new TowerNPC(battleTowerData, battleTowerData.difficulty);
  npc.setPokemon(battleTowerData, battleTowerData.difficulty);
  const rewardMultipliers =
    npcDifficultyData.rewardMultipliers ||
    difficultyConfig[battleTowerData.difficulty].rewardMultipliers;
  const autoBattleCost =
    difficultyConfig[battleTowerData.difficulty].autoBattleCost + 2;
  const battle = new Battle({
    ...rewardMultipliers,
    npcId: getIdFromTowerStage(towerStage),
    difficulty: battleTowerData.difficulty,
    winCallback: towerWinCallback,
    canAuto: !getCanTrainerAutoBattle(trainer.data, autoBattleCost).err,
    autoBattleCost,
    shouldShowAutoBattle: !getDoesTrainerHaveAutoBattle(trainer.data).err,
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
  const trainerResult = await getTrainer(user);
  if (trainerResult.err) {
    return { send: null, err: trainerResult.err };
  }
  const trainer = trainerResult.data;

  const send = {
    content: "",
    embeds: [],
    components: [],
  };

  const embed = buildBattleTowerEmbed(towerStage, {
    dreamCardString: getDoesTrainerHaveAutoBattle(trainer).err
      ? null
      : formatDreamCardsForTrainer(trainer),
  });
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
      // @ts-ignore
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
  getDoesTrainerHaveAutoBattle,
  getCanTrainerAutoBattle,
  getCanUserAutoBattle,
  getStartTurnSend,
  nextAutoTurn,
  startAuto,
  buildPveSend,
  buildDungeonSend,
  onBattleTowerAccept,
  buildBattleTowerSend,
  RaidNPC,
};
