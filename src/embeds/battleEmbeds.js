/**
 * @file
 * @author Elvis Wei
 *
 * battleEmbeds.js Handles all embedded instructions for battles.
 */
const { EmbedBuilder } = require("discord.js");
const { weatherConditions } = require("../config/battleConfig");
const { getMove } = require("../battle/data/moveRegistry");
const {
  buildPartyString,
  buildMoveString,
  buildBattlePokemonString,
  buildNpcDifficultyString,
  buildDungeonDifficultyString,
  buildCompactPartyString,
  buildRaidDifficultyString,
  buildActivePokemonFieldStrings,
} = require("../utils/battleUtils");
const {
  buildPokemonStatString,
  getAbilityName,
  buildPokemonEmojiString,
} = require("../utils/pokemonUtils");
const {
  setTwoInline,
  linebreakString,
  fortnightToUTCTime,
  getFullUTCFortnight,
  getPBar,
  formatMoney,
  buildBlockQuoteString,
} = require("../utils/utils");
const {
  npcConfig,
  dungeonConfig,
  battleTowerConfig,
  raidConfig,
} = require("../config/npcConfig");
const { pokemonConfig } = require("../config/pokemonConfig");
const {
  getFullUsername,
  getFlattenedRewardsString,
  flattenRewards,
  flattenCategories,
} = require("../utils/trainerUtils");
const { backpackItemConfig } = require("../config/backpackConfig");
const { getItemDisplay } = require("../utils/itemUtils");
const { emojis } = require("../enums/emojis");

/**
 * Builds the header string for a pokemon in the party.
 * @param {Pokemon} pokemon the pokemon to build the header for.
 * @param {number=} position the position of the pokemon in the party.
 * @returns {string} the header string.
 */
const buildPokemonPartyHeaderString = (pokemon, position) =>
  `${position ?? "\\-"} ${buildPokemonEmojiString(pokemon)}  •  Lv. ${
    pokemon.level
  }  •  ${Math.round((pokemon.ivTotal * 100) / (31 * 6))}%  •  ${pokemon.name}`;

/**
 * Builds the compact info string for a pokemon.
 * @param {WithId<Pokemon>} pokemon the pokemon to build the compact info for.
 * @returns {string} the compact info string.
 */
const buildPokemonCompactInfoString = (pokemon) => {
  const statString = buildPokemonStatString(pokemon, 10, true);
  const heldItemString = pokemon.heldItemId
    ? `\n**Held Item:** ${getItemDisplay(pokemon.heldItemId)}`
    : "";
  return `${statString}\n**Ability:** ${getAbilityName(
    pokemon.abilityId
  )}${heldItemString}\n_${pokemon._id}_`;
};

/**
 * Handles building the party embedded instructions for building a party.
 * @param {Trainer} trainer the trainer to build the party for.
 * @param {WithId<Pokemon>[]} pokemons the pokemon the trainer has.
 * @param {object} options
 * @param {0 | 1 | 2=} options.verbosity whether it's a detailed party formation.
 * @param {boolean=} options.isMobile whether it's a mobile device.
 * @returns {EmbedBuilder} an embeded.
 */
const buildPartyEmbed = (
  trainer,
  pokemons,
  { verbosity = 0, isMobile = false } = {}
) => {
  const { party } = trainer;

  const power = pokemons.reduce(
    (acc, pokemon) => acc + (pokemon?.combatPower ?? 0),
    0
  );

  const embed = new EmbedBuilder();
  embed.setTitle(`${trainer.user.username}'s Party`);
  embed.setColor(0xffffff);
  embed.setThumbnail(
    `https://cdn.discordapp.com/avatars/${trainer.userId}/${trainer.user.avatar}.webp`
  );
  embed.addFields(
    { name: "💪 Power", value: `${power}`, inline: true },
    {
      name: `${emojis.POKEBALL} Pokemon`,
      value: buildPartyString(pokemons, party.rows, party.cols, { isMobile }),
      inline: false,
    }
  );

  if (verbosity === 1) {
    const pokemonFields = pokemons
      .filter((p) => p !== null)
      .map((pokemon) => ({
        name: buildPokemonPartyHeaderString(
          pokemon,
          pokemons.indexOf(pokemon) + 1
        ),
        value: `${pokemon.combatPower} Power  •  ${getAbilityName(
          pokemon.abilityId
        )}  •  ${
          pokemon.heldItemId
            ? backpackItemConfig[pokemon.heldItemId].emoji
            : "🚫"
        }\n_${pokemon._id}_`,
        inline: true,
      }));
    embed.addFields(pokemonFields);
  }

  if (verbosity === 2) {
    const pokemonFields = pokemons
      .filter((p) => p !== null)
      .map((pokemon) => ({
        name: buildPokemonPartyHeaderString(
          pokemon,
          pokemons.indexOf(pokemon) + 1
        ),
        value: buildPokemonCompactInfoString(pokemon),
        inline: true,
      }));
    // every 2 fields, add a blank field
    setTwoInline(pokemonFields);
    embed.addFields(pokemonFields);
  }

  const footerString = "Modify your party with `/party manage`";
  embed.setFooter({ text: footerString });

  return embed;
};

/**
 * Builds the embed for adding or moving a pokemon to the party.
 * @param {WithId<Pokemon>} pokemon the pokemon to add or move.
 * @param {number=} currentPosition the current position of the pokemon in the party.
 * @returns {EmbedBuilder} an embeded.
 */
const buildAddOrMoveToPartyEmbed = (pokemon, currentPosition) => {
  const embed = new EmbedBuilder();
  embed.setTitle(
    `${buildPokemonEmojiString(pokemon)} Add or Move ${
      pokemon.name
    } to which position?`
  );
  embed.setColor(0xffffff);
  embed.setDescription(
    `**${buildPokemonPartyHeaderString(
      pokemon,
      currentPosition
    )}**\n${buildPokemonCompactInfoString(pokemon)}`
  );
  return embed;
};

const buildMoveOrRemoveFromPartyEmbed = () => {
  const embed = new EmbedBuilder();
  embed.setTitle("Select Pokemon to Move or Remove");
  embed.setColor(0xffffff);
  return embed;
};

/**
 * Shows the built parties of the user.
 * @param {Trainer} trainer the trainer who's parties we're showing.
 * @param {Record<string, Pokemon>} pokemonMap map of pokemon ID to pokemon
 * @returns {EmbedBuilder} an embeded.
 */
const buildPartiesEmbed = (trainer, pokemonMap) => {
  // active party field
  const activeParty = trainer.party;
  const { partyHeader: activePartyHeader, partyString: activePartyString } =
    buildCompactPartyString(activeParty, "active", pokemonMap, true);
  const activePartyField = {
    name: activePartyHeader,
    value: activePartyString,
    inline: true,
  };
  const fields = [activePartyField];

  // saved parties fields
  const { savedParties } = trainer;
  for (const [partyId, party] of Object.entries(savedParties)) {
    const { partyHeader, partyString } = buildCompactPartyString(
      party,
      partyId,
      pokemonMap
    );
    const field = {
      name: partyHeader,
      value: partyString,
      inline: true,
    };
    fields.push(field);
  }

  const embed = new EmbedBuilder();
  embed.setTitle(`${trainer.user.username}'s Parties`);
  embed.setColor(0xffffff);
  embed.setThumbnail(
    `https://cdn.discordapp.com/avatars/${trainer.userId}/${trainer.user.avatar}.webp`
  );
  embed.addFields(fields);
  embed.setFooter({ text: "Use /partyload <id> to load a party" });

  return embed;
};

/**
 * Builds the battle the players/players and npcs will use.
 * @param {Battle} battle the battle itself.
 * @param {object} options
 * @param {Record<string, number[]>=} options.targetIndices map of team name to target indices.
 * @param {boolean=} options.isMobile
 * @param {MoveIdEnum=} options.selectedMoveId the move id selected.
 * @returns {EmbedBuilder} an embeded.
 */
const buildBattleEmbed = (
  battle,
  { targetIndices = null, isMobile = false, selectedMoveId } = {}
) => {
  // assume two teams
  const team1 = Object.values(battle.teams)[0];
  const team2 = Object.values(battle.teams)[1];
  const team1Party = battle.parties[team1.name];
  const team2Party = battle.parties[team2.name];
  const team1EmphPosition =
    battle.activePokemon.teamName === team1.name
      ? battle.activePokemon.position
      : null;
  const team2EmphPosition =
    battle.activePokemon.teamName === team2.name
      ? battle.activePokemon.position
      : null;
  const team1TargetIndicies = targetIndices?.[team1.name];
  const team2TargetIndicies = targetIndices?.[team2.name];

  // TODO: deal with NPCs
  const team1UserString = team1.userIds
    .map((userId) => {
      const user = battle.users[userId];
      return `${getFullUsername(user)}`;
    })
    .join(" ");
  const team2UserString = team2.userIds
    .map((userId) => {
      const user = battle.users[userId];
      return `${getFullUsername(user)}`;
    })
    .join(" ");

  const embed = new EmbedBuilder();
  embed.setTitle(`Battle State`);
  embed.setColor(0xffffff);
  // build weather field
  const negatedString = battle.isWeatherNegated() ? " (negated)" : "";
  if (battle.weather.weatherId) {
    switch (battle.weather.weatherId) {
      case weatherConditions.SUN:
        embed.addFields({
          name: "Weather",
          value: `Harsh Sun${negatedString} (${battle.weather.duration})`,
          inline: false,
        });
        break;
      case weatherConditions.RAIN:
        embed.addFields({
          name: "Weather",
          value: `Rain${negatedString} (${battle.weather.duration})`,
          inline: false,
        });
        break;
      case weatherConditions.SANDSTORM:
        embed.addFields({
          name: "Weather",
          value: `Sandstorm${negatedString} (${battle.weather.duration})`,
          inline: false,
        });
        break;
      case weatherConditions.HAIL:
        embed.addFields({
          name: "Weather",
          value: `Hail${negatedString} (${battle.weather.duration})`,
          inline: false,
        });
        break;
      default:
        break;
    }
  }

  if (battle.activePokemon) {
    const { pokemonHeader, pokemonString } = buildActivePokemonFieldStrings(
      battle.activePokemon
    );
    embed.addFields({
      name: pokemonHeader,
      value: pokemonString,
      inline: false,
    });
  }

  const upNextPokemon = battle.getNextNPokemon(3);
  const fields = [
    {
      name: `${team1.emoji} ${team1.name} | ${team1UserString}`,
      value: buildPartyString(
        team1Party.pokemons,
        team1Party.rows,
        team1Party.cols,
        {
          reverse: true,
          showHp: true,
          emphPosition: team1EmphPosition,
          targetIndices: team1TargetIndicies,
          isMobile,
        }
      ),
      inline: !isMobile,
    },
    {
      name: `${team2.emoji} ${team2.name} | ${team2UserString}`,
      value: buildPartyString(
        team2Party.pokemons,
        team2Party.rows,
        team2Party.cols,
        {
          showHp: true,
          emphPosition: team2EmphPosition,
          targetIndices: team2TargetIndicies,
          isMobile,
        }
      ),
      inline: !isMobile && upNextPokemon.length > 0,
    },
  ];

  if (upNextPokemon.length > 0) {
    const upNextStringTop = upNextPokemon
      .map((pokemon) => pokemonConfig[pokemon.speciesId].emoji)
      .join("\u2001");
    const upNextBottomString = upNextPokemon
      .map((pokemon) => {
        const team = battle.teams[pokemon.teamName];
        return `${team?.emoji}`;
      })
      .join("\u2001");
    // if mobile, append. else, add to index 1
    const upNextField = {
      name: "Up Next (Estimate)",
      value: `${upNextStringTop}\n${upNextBottomString}`,
      inline: !isMobile,
    };
    if (isMobile) {
      fields.push(upNextField);
    } else {
      fields.splice(1, 0, upNextField);
    }
  }

  const move = selectedMoveId ? getMove(selectedMoveId) : null;
  if (move) {
    const { moveHeader, moveString } = buildMoveString({
      moveData: move,
      source: battle.activePokemon,
    });
    fields.push({
      name: moveHeader,
      value: moveString,
      inline: !isMobile,
    });
  }

  embed.addFields(isMobile ? fields : setTwoInline(fields));

  return embed;
};

/**
 * Builds the moveset of the pokemon in the battle.
 * @param {BattlePokemon} pokemon the pokemon to build the moves for.
 * @returns {EmbedBuilder} an embeded
 */
const buildBattleMovesetEmbed = (pokemon) => {
  const fields = Object.keys(pokemon.moveIds).map(
    (/** @type {MoveIdEnum} */ moveId) => {
      const { cooldown } = pokemon.moveIds[moveId];
      const moveData = getMove(moveId);
      const { moveHeader, moveString } = buildMoveString({
        moveData,
        source: pokemon,
        cooldown,
      });
      return {
        name: moveHeader,
        value: moveString,
        inline: true,
      };
    }
  );

  setTwoInline(fields);

  const embed = new EmbedBuilder();
  embed.setTitle(`[${pokemon.position}] ${pokemon.name}'s Moveset`);
  embed.setColor(0xffffff);
  embed.addFields(fields);
  embed.setFooter({
    text: "Use the buttons for battle info | Use the selection menus to select & use a move",
  });

  return embed;
};
/**
 * Builds the team for the battle to be embeded.
 * @param {Battle} battle the battle itself.
 * @param {string} teamName the name of the team we're looking at. (a specific user's team)
 * @returns {EmbedBuilder} an embeded.
 */
const buildBattleTeamEmbed = (battle, teamName) => {
  const teamUserIds = battle.teams[teamName].userIds;
  const teamPokemons = battle.parties[teamName].pokemons;
  const teamUserString = teamUserIds
    .map((userId) => {
      const user = battle.users[userId];
      return `${getFullUsername(user)}`;
    })
    .join(" ");

  const embed = new EmbedBuilder();
  embed.setTitle(`${teamName}'s Pokemon | ${teamUserString}`);
  embed.setColor(0xffffff);
  embed.addFields(
    teamPokemons
      .filter((pokemon) => pokemon !== null)
      .map((pokemon) => {
        const { pokemonHeader, pokemonString } =
          buildBattlePokemonString(pokemon);
        return {
          name: pokemonHeader,
          value: pokemonString,
          inline: true,
        };
      })
  );
  embed.setFooter({
    text: "Use the buttons for battle info | Use the selection menus to select & use a move",
  });

  return embed;
};

/**
 * TODO: maybe make embed functionality reusable idk
 * TODO: dream card string may be lazy idk. but I don't want every embed to have to pass all dream card data
 * Builds the list of pve options as an embeded.
 * @param {NpcEnum[]} npcIds the npc's available for battle.
 * @param {number} page the page number.
 * @param {object} options
 * @param {string=} options.dreamCardString the dream card string to display.
 * @returns {EmbedBuilder} an embeded
 */
const buildPveListEmbed = (npcIds, page, { dreamCardString } = {}) => {
  let npcString = "";
  npcIds.forEach((npcId) => {
    const npcData = npcConfig[npcId];
    let levelString = "**[Lv. ";
    for (const difficultyConfig of Object.values(npcData.difficulties)) {
      const level = Math.ceil(
        (difficultyConfig.minLevel + difficultyConfig.maxLevel) / 2
      );
      levelString += `${level}/`;
    }
    levelString = levelString.slice(0, -1);
    levelString += "]**";
    npcString += `${npcData.emoji} ${levelString} ${
      // @ts-ignore
      npcData.displayName || npcData.name
    } (${npcId})\n`;
  });

  const embed = new EmbedBuilder();
  embed.setTitle(`NPCs`);
  embed.setColor(0xffffff);
  embed.setDescription(npcString);
  if (dreamCardString) {
    embed.addFields({
      name: "Dream Cards",
      value: dreamCardString,
      inline: false,
    });
  }
  embed.setFooter({ text: `Page ${page} | Use the buttons to select an NPC` });

  return embed;
};

/**
 * Builds a specific npc for pve.
 * @param {NpcEnum} npcId the id of the npc we're building.
 * @param {object} options
 * @param {string=} options.dreamCardString the dream card string to display.
 * @returns {EmbedBuilder} an embeded
 */
const buildPveNpcEmbed = (npcId, { dreamCardString } = {}) => {
  const npc = npcConfig[npcId];
  const fields = Object.entries(npc.difficulties).map(
    ([difficulty, difficultyData]) => {
      const { difficultyHeader, difficultyString } = buildNpcDifficultyString(
        difficulty,
        difficultyData
      );
      return {
        name: difficultyHeader,
        value: difficultyString,
        inline: false,
      };
    }
  );

  const embed = new EmbedBuilder();
  // @ts-ignore
  embed.setTitle(`${npc.emoji} ${npc.displayName || npc.name} (${npcId})`);
  embed.setColor(0xffffff);
  embed.setDescription(buildBlockQuoteString(npc.catchphrase));
  embed.addFields(fields);
  if (dreamCardString) {
    embed.addFields({
      name: "Dream Cards",
      value: dreamCardString,
      inline: false,
    });
  }
  embed.setImage(npc.sprite);
  embed.setFooter({ text: "Use the buttons to select a difficulty" });

  return embed;
};

/**
 * Builds the list of Dungeons as an embeded.
 * @param {object} options
 * @param {string=} options.dreamCardString the dream card string to display.
 * @returns {EmbedBuilder} an embeded list of the dungeons.
 */
const buildDungeonListEmbed = ({ dreamCardString } = {}) => {
  let dungeonString = "";
  Object.entries(dungeonConfig).forEach(([, dungeonData]) => {
    dungeonString += `**${dungeonData.emoji} ${dungeonData.name}** • ${dungeonData.description}\n\n`;
  });

  const embed = new EmbedBuilder();
  embed.setTitle(`Dungeons`);
  embed.setColor(0xffffff);
  embed.setDescription(dungeonString);
  embed.setFooter({ text: `Defeat dungeons to power up your /equipment!` });
  if (dreamCardString) {
    embed.addFields({
      name: "Dream Cards",
      value: dreamCardString,
      inline: false,
    });
  }
  return embed;
};
/**
 * Builds a specific dungeon for the embeded dungeon list.
 * @param {DungeonEnum} dungeonId the Id of the specific dungeon we're building.
 * @param {object} options
 * @param {string=} options.dreamCardString the dream card string to display.
 * @returns {EmbedBuilder} an embeded dungeon.
 */
const buildDungeonEmbed = (dungeonId, { dreamCardString } = {}) => {
  const dungeonData = dungeonConfig[dungeonId];
  let bossString = "";
  for (const bossId of dungeonData.bosses) {
    const bossData = pokemonConfig[bossId];
    bossString += `${bossData.emoji} #${bossId} **${bossData.name}** \`/pokedex ${bossId}\`\n`;
  }
  const fields = Object.entries(dungeonData.difficulties).map(
    ([difficulty, difficultyData]) => {
      const { difficultyHeader, difficultyString } =
        buildDungeonDifficultyString(difficulty, difficultyData);
      return {
        name: difficultyHeader,
        value: difficultyString,
        inline: false,
      };
    }
  );

  const embed = new EmbedBuilder();
  embed.setTitle(`${dungeonData.emoji} ${dungeonData.name}`);
  embed.setColor(0xffffff);
  embed.setDescription(dungeonData.description);
  embed.addFields({ name: "Bosses", value: bossString, inline: false });
  embed.addFields(fields);
  embed.setImage(dungeonData.sprite);
  embed.setFooter({ text: "Use the buttons to select a difficulty" });
  if (dreamCardString) {
    embed.addFields({
      name: "Dream Cards",
      value: dreamCardString,
      inline: false,
    });
  }
  return embed;
};

/**
 * @param {number} towerStage
 * @param {object} options
 * @param {string=} options.dreamCardString the dream card string to display.
 * @returns {EmbedBuilder}
 */
const buildBattleTowerEmbed = (towerStage, { dreamCardString } = {}) => {
  const battleTowerData = battleTowerConfig[towerStage];
  const npcData = npcConfig[battleTowerData.npcId];
  const npcDifficultyData = npcData.difficulties[battleTowerData.difficulty];

  const nextFortnight = Math.floor(
    fortnightToUTCTime(getFullUTCFortnight() + 1) / 1000
  );
  const towerDescription = `Climb the Battle Tower every other week to earn rewards at increasing difficulties! The Battle Tower resets <t:${nextFortnight}:R>.`;

  const difficultyHeader = `**[Lv. ${battleTowerData.minLevel}-${
    battleTowerData.maxLevel + 1
  }]**`;

  const { pokemonIds } = npcDifficultyData;
  let difficultyString = "";
  difficultyString += `**Possible Pokemon:** ${npcDifficultyData.numPokemon}x`;
  for (let i = 0; i < pokemonIds.length; i += 1) {
    const pokemonId = pokemonIds[i];
    const pokemonData = pokemonConfig[pokemonId];
    difficultyString += ` ${pokemonData.emoji}`;
  }
  difficultyString += "\n";
  const bossData = pokemonConfig[npcDifficultyData.aceId];
  const bossString = `**Boss**: ${bossData.emoji} #${npcDifficultyData.aceId} **${bossData.name}** \`/pokedex ${npcDifficultyData.aceId}\``;
  difficultyString += `${bossString}\n`;
  difficultyString += `**Rewards:**\n${getFlattenedRewardsString(
    flattenRewards(battleTowerData.rewards),
    false
  )}`;

  const embed = new EmbedBuilder();
  embed.setTitle(
    `${npcData.emoji} Battle Tower Floor ${towerStage}: ${npcData.name}`
  );
  embed.setColor(0xffffff);
  embed.setDescription(
    `${linebreakString(
      towerDescription,
      50
    )}\n\n${difficultyHeader}\n${difficultyString}`
  );
  embed.setImage(npcData.sprite);
  if (dreamCardString) {
    embed.addFields({
      name: "Dream Cards",
      value: dreamCardString,
      inline: false,
    });
  }
  return embed;
};

/**
 * @returns {EmbedBuilder}
 */
const buildRaidListEmbed = () => {
  let raidString = "";
  Object.entries(raidConfig).forEach(([, raidData]) => {
    raidString += `**${raidData.emoji} ${raidData.name}** • ${raidData.description}\n\n`;
  });

  const embed = new EmbedBuilder();
  embed.setTitle(`Raids`);
  embed.setColor(0xffffff);
  embed.setDescription(raidString);
  embed.setFooter({ text: `Defeat raids with your server!` });

  return embed;
};

/**
 * @param {RaidEnum} raidId
 * @returns {EmbedBuilder}
 */
const buildRaidEmbed = (raidId) => {
  const raidData = raidConfig[raidId];

  const bossId = raidData.boss;
  const bossData = pokemonConfig[bossId];
  const bossString = `${bossData.emoji} #${bossId} **${bossData.name}** \`/pokedex ${bossId}\`\n`;

  const shinyIds = raidData.shinyRewards;
  let shinyString = "";
  for (const shinyId of shinyIds) {
    const shinyData = pokemonConfig[shinyId];
    shinyString += `${shinyData.emoji}`;
  }

  const fields = Object.entries(raidData.difficulties).map(
    ([difficulty, difficultyData]) => {
      const { difficultyHeader, difficultyString } = buildRaidDifficultyString(
        difficulty,
        difficultyData
      );
      return {
        name: difficultyHeader,
        value: difficultyString,
        inline: false,
      };
    }
  );

  const embed = new EmbedBuilder();
  embed.setTitle(`${raidData.emoji} ${raidData.name}`);
  embed.setColor(0xffffff);
  embed.setDescription(raidData.description);
  embed.addFields({ name: "Boss", value: bossString, inline: true });
  embed.addFields({
    name: "Possible Shinies",
    value: shinyString,
    inline: true,
  });
  embed.addFields(fields);
  embed.setImage(raidData.sprite);
  embed.setFooter({ text: "Use the buttons to select a difficulty" });

  return embed;
};

/**
 * @param {Raid} raid
 * @returns {EmbedBuilder}
 */
const buildRaidInstanceEmbed = (raid) => {
  const { userId, raidId, boss, ttl, participants } = raid;
  const raidData = raidConfig[raidId];
  const bossData = pokemonConfig[boss.speciesId];
  const bossTotalHp = boss.stats[0];

  const percentHp = Math.floor((boss.remainingHp / bossTotalHp) * 100);
  let descriptionString = `HP: ${getPBar(percentHp, 20)} ${percentHp}%\n`;
  descriptionString += `**Raid Despawns <t:${Math.floor(ttl / 1000)}:R>**`;

  // build top 10 participant string sorted by damage dealt
  const topParticipants = Object.keys(participants)
    .sort((a, b) => participants[b] - participants[a])
    .slice(0, 10);
  let participantString = "";
  for (const participantId of topParticipants) {
    const participantDamage = participants[participantId];
    participantString += `**<@${participantId}>** • ${participantDamage} (${Math.floor(
      (participantDamage / bossTotalHp) * 100
    )}%)\n`;
  }

  const embed = new EmbedBuilder();
  embed.setTitle(`${raidData.emoji} ${raidData.name} Raid`);
  embed.setColor(0xffffff);
  embed.setDescription(descriptionString);
  embed.addFields(
    { name: "Owner", value: `<@${userId}>`, inline: false },
    {
      name: "Boss",
      value: `${bossData.emoji} #${boss.speciesId} **${bossData.name}** \`/pokedex ${boss.speciesId}\``,
      inline: true,
    }
  );
  if (participantString) {
    embed.addFields({
      name: "Top Participants",
      value: participantString,
      inline: false,
    });
  }
  embed.setImage(raidData.sprite);

  return embed;
};

/**
 * @param {Raid} raid
 * @param {Rewards & {shiny?: boolean}} rewards
 * @returns {EmbedBuilder}
 */
const buildRaidWinEmbed = (raid, rewards) => {
  const { raidId, boss, participants } = raid;
  const raidData = raidConfig[raidId];
  const bossTotalHp = boss.stats[0];

  // build participant rewards
  const topParticipants = Object.keys(participants).sort(
    (a, b) => participants[b] - participants[a]
  );
  let participantString = "**Rewards Recevied **\n";
  for (const participantId of topParticipants) {
    const participantDamage = participants[participantId];
    const participantRewards = rewards[participantId];
    if (!participantRewards) continue;
    const { money, backpack, shiny } = participantRewards;
    const backpackRewards = flattenCategories(backpack);

    const rewardsForTrainer = [];
    if (money) {
      rewardsForTrainer.push(formatMoney(money));
    }
    if (Object.keys(backpackRewards)) {
      let backpackString = "";
      for (const itemId in backpackRewards) {
        const itemData = backpackItemConfig[itemId];
        backpackString += `${itemData.emoji} x${backpackRewards[itemId]} `;
      }
      rewardsForTrainer.push(backpackString);
    }
    if (shiny) {
      const shinyData = pokemonConfig[shiny];
      if (shinyData) {
        rewardsForTrainer.push(`✨ ${shinyData.emoji}`);
      }
    }

    participantString += `**<@${participantId}>** • ${rewardsForTrainer.join(
      " • "
    )} • ${participantDamage} damage (${Math.floor(
      (participantDamage / bossTotalHp) * 100
    )}%)\n`;
  }

  const embed = new EmbedBuilder();
  embed.setTitle(`${raidData.emoji} ${raidData.name} Raid Defeated!`);
  embed.setColor(0xffffff);
  embed.setDescription(participantString);
  embed.setImage(raidData.sprite);

  return embed;
};

module.exports = {
  buildPartyEmbed,
  buildAddOrMoveToPartyEmbed,
  buildMoveOrRemoveFromPartyEmbed,
  buildPartiesEmbed,
  buildBattleEmbed,
  buildBattleMovesetEmbed,
  buildBattleTeamEmbed,
  buildPveListEmbed,
  buildPveNpcEmbed,
  buildDungeonListEmbed,
  buildDungeonEmbed,
  buildBattleTowerEmbed,
  buildRaidListEmbed,
  buildRaidEmbed,
  buildRaidInstanceEmbed,
  buildRaidWinEmbed,
};
