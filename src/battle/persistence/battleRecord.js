const { Battle } = require("../engine/Battle");

// Bump when the engine or rule-affecting Pokémon data changes incompatibly.
const BATTLE_RULESET_VERSION = 1;

const plainData = (value) => JSON.parse(JSON.stringify(value));

/**
 * Capture the generated party and RNG seed before the first turn.
 * @param {Battle} battle
 */
const captureBattleSetup = (battle) => {
  if (battle.hasStarted) {
    throw new Error("Capture battle setup before starting the battle");
  }
  if (battle.winCallback || battle.loseCallback) {
    throw new Error("Battle completion callbacks need a durable mode handler");
  }

  const trainers = Object.entries(battle.users).map(([userId, user]) => {
    if (user.nextPhase && battle.phaseQueues[userId] === undefined) {
      throw new Error("Battle phase callbacks need a durable mode handler");
    }
    const { parties, teamName, ...profile } = user;
    return {
      userId,
      teamName,
      profile: plainData(profile),
      parties: parties.map(({ pokemons, rows, cols }) => ({
        pokemons: plainData(pokemons),
        rows,
        cols,
      })),
    };
  });

  return {
    initialParams: plainData({ ...battle.initialParams, enableReplay: true }),
    teams: Object.values(battle.teams).map(({ name, isNpc }) => ({
      name,
      isNpc,
    })),
    trainers,
    phaseQueues: plainData(battle.phaseQueues),
  };
};

/**
 * @param {object} record
 * @param {number=} rulesetVersion
 */
const restoreBattle = (record, rulesetVersion = BATTLE_RULESET_VERSION) => {
  if (record.rulesetVersion !== rulesetVersion) {
    throw new Error(`Unsupported battle ruleset ${record.rulesetVersion}`);
  }

  const battle = new Battle(record.setup.initialParams);
  for (const team of record.setup.teams) {
    battle.addTeam(team.name, team.isNpc);
  }
  for (const trainer of record.setup.trainers) {
    for (const party of trainer.parties) {
      // addTrainer creates the first party; later phase setup needs a mode handler.
      if (battle.users[trainer.userId]) {
        throw new Error("Multi-party recovery needs a durable mode handler");
      }
      battle.addTrainer(
        { userId: trainer.userId, user: plainData(trainer.profile) },
        plainData(party.pokemons),
        trainer.teamName,
        party.rows,
        party.cols,
      );
    }
  }
  for (const [userId, phases] of Object.entries(record.setup.phaseQueues || {})) {
    battle.setPhaseQueue(userId, phases);
  }
  battle.start();
  for (const entry of record.actions) {
    const outcome = battle.performAction(entry.action);
    if (!outcome.accepted) {
      throw new Error(`Cannot replay battle action at revision ${entry.revision}`);
    }
  }
  if (JSON.stringify(battle.takeSnapshot()) !== JSON.stringify(record.view)) {
    throw new Error(`Battle ${record._id} replay diverged from stored view`);
  }
  return battle;
};

module.exports = {
  BATTLE_RULESET_VERSION,
  captureBattleSetup,
  restoreBattle,
};
