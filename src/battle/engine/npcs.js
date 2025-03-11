/* eslint-disable no-case-declarations */
// TODO: probably fix both
/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */

const { v4: uuidv4 } = require("uuid");
const {
  statusConditions,
  moveTiers,
  calculateDamage,
} = require("../../config/battleConfig");
const { npcConfig } = require("../../config/npcConfig");
const { drawIterable, drawUniform } = require("../../utils/gachaUtils");
const { generateRandomPokemon } = require("../../services/gacha");
const { getMove } = require("../data/moveRegistry");

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
    const validMoveIdsToTargets = {};
    Object.entries(moveIds).forEach(([moveId, move]) => {
      if (move.disabledCounter || move.cooldown > 0) {
        return;
      }

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
        const targetsHit = source.getTargets(moveId, target);
        const heuristic = this.calculateHeuristic(moveId, source, targetsHit);
        if (heuristic > bestHeuristic) {
          bestMoveId = moveId;
          bestTarget = target;
          bestHeuristic = heuristic;
        }
      }
    }

    // use move
    activePokemon.useMove(bestMoveId, bestTarget.id);
  }

  // eslint-disable-next-line class-methods-use-this
  calculateHeuristic(moveId, source, targetsHit) {
    const moveData = getMove(moveId);

    let heuristic = 0;
    // special case: if asleep and sleep talk, use sleep talk
    if (
      source.status.statusId === statusConditions.SLEEP &&
      moveId === "m214"
    ) {
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
        const damage = calculateDamage(moveData, source, target, false);
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
