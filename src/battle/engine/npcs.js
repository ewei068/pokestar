/* eslint-disable no-case-declarations */
// TODO: probably fix both
/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */

const { v4: uuidv4 } = require("uuid");
const { npcConfig } = require("../../config/npcConfig");
const { drawIterable, drawUniform } = require("../../utils/gachaUtils");
const { generateRandomPokemon } = require("../../services/gacha");
const { npcTurnAction } = require("../../utils/battleUtils");
/** @typedef {NPC} BattleNPC */

class NPC {
  constructor(
    npcData,
    difficulty,
    // eslint-disable-next-line no-unused-vars
    { userId = null, user = null, party = null } = {}
  ) {
    this.userId = userId || uuidv4();
    this.user = {
      username: npcData.name,
      discriminator: "0",
      npc: this,
      id: this.userId,
      // data: npcData,
      // difficulty: difficulty,
    };

    // this.setPokemon(npcData, difficulty);
  }

  // eslint trippin dawg
  // eslint-disable-next-line class-methods-use-this
  setPokemon() {
    throw new Error("setPokemon not implemented");
  }

  initializeParty(rows, cols) {
    this.party = {
      rows,
      cols,
      pokemons: Array(rows * cols).fill(null),
    };
  }

  action(battle) {
    const { activePokemon } = battle;
    if (activePokemon.userId !== this.userId) {
      return;
    }

    npcTurnAction(battle);
  }
}

class BasicNPC extends NPC {
  setPokemon(npcData, difficulty) {
    const npcDifficultyData = npcData.difficulties[difficulty];
    this.initializeParty(3, 4);

    // generate party
    // generate numPokemon - 1 pokemon, then 1 for the ace
    const { numPokemon } = npcDifficultyData;
    const pokemons = [];
    const pokemonIds = drawIterable(
      npcDifficultyData.pokemonIds,
      numPokemon - 1
    );
    for (const pokemonId of pokemonIds) {
      const pokemon = generateRandomPokemon(
        this.userId,
        pokemonId,
        drawUniform(
          npcDifficultyData.minLevel,
          npcDifficultyData.maxLevel,
          1
        )[0]
      );
      // give random id
      pokemon._id = uuidv4();
      pokemons.push(pokemon);
    }
    // push ace
    const acePokemon = generateRandomPokemon(
      this.userId,
      npcDifficultyData.aceId,
      npcDifficultyData.maxLevel + 1
    );
    acePokemon._id = uuidv4();
    pokemons.push(acePokemon);

    // put parties in random indices with no overlap
    let i = 0;
    while (i < numPokemon) {
      const index = drawUniform(0, this.party.rows * this.party.cols - 1, 1)[0];
      if (this.party.pokemons[index] === null) {
        this.party.pokemons[index] = pokemons[i];
        i += 1;
      }
    }
  }
}

class DungeonNPC extends NPC {
  constructor(dungeonData, difficulty) {
    super(dungeonData, difficulty);
    this.phaseNumber = 0;
    this.phases = dungeonData.difficulties[difficulty].phases;
    this.dungeonData = dungeonData;
    this.difficulty = difficulty;
    // suuper hacky, probably a better way to do this
    this.user.nextPhase = (battle) => this.nextPhase(battle);
  }

  setPokemon() {
    const phase = this.phases[this.phaseNumber];
    if (phase === undefined) {
      return;
    }
    this.initializeParty(phase.rows, phase.cols);

    // generate party
    for (const pokemonData of phase.pokemons) {
      const pokemon = generateRandomPokemon(
        this.userId,
        pokemonData.speciesId,
        pokemonData.level
      );
      // give random id
      pokemon._id = uuidv4();
      this.party.pokemons[pokemonData.position - 1] = pokemon;
    }
  }

  // eslint-disable-next-line no-unused-vars
  nextPhase(battle) {
    this.phaseNumber += 1;
    if (this.phaseNumber >= this.phases.length) {
      return false;
    }
    this.setPokemon();

    return {
      trainer: this,
      ...this.party,
    };
  }
}

class TowerNPC extends BasicNPC {
  constructor(towerData, difficulty) {
    const npcData = npcConfig[towerData.npcId];
    super(npcData, difficulty);
  }

  setPokemon(towerData, difficulty) {
    const npcData = npcConfig[towerData.npcId];
    super.setPokemon(npcData, difficulty);
  }
}

class RaidNPC extends NPC {
  constructor(raidData, difficulty, raidUserId, boss) {
    super(raidData, difficulty, {
      userId: raidUserId,
    });
    this.raidData = raidData;
    this.difficulty = difficulty;
    this.boss = boss;
  }

  setPokemon(raidData, difficulty) {
    const raidDifficultyData = raidData.difficulties[difficulty];
    this.initializeParty(raidDifficultyData.rows, raidDifficultyData.cols);

    // generate party
    for (const pokemonData of raidDifficultyData.pokemons) {
      const pokemon =
        pokemonData.speciesId === this.boss.speciesId
          ? { ...this.boss }
          : generateRandomPokemon(
              this.userId,
              pokemonData.speciesId,
              pokemonData.level
            );
      // give random id
      pokemon._id = pokemon._id || uuidv4();
      this.party.pokemons[pokemonData.position - 1] = pokemon;
    }
  }
}

module.exports = {
  BasicNPC,
  DungeonNPC,
  TowerNPC,
  RaidNPC,
};
