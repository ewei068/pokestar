const HIGH_ACCURACY = 9999;

const getFirstActivePokemon = (battle) => {
  const allPokemon = Object.values(battle.allPokemon);
  const livingPokemon = allPokemon.filter((p) => !p.isFainted);
  livingPokemon.sort((a, b) => b.combatReadiness - a.combatReadiness);
  return livingPokemon[0] || null;
};

const getValidTargetForMove = (battle, source, moveId) => {
  const eligibleTargets = battle.getEligibleTargets(source, moveId);
  return eligibleTargets[0] || null;
};

const givePokemonMove = (pokemon, moveId) => {
  if (!pokemon.moveIds[moveId]) {
    // eslint-disable-next-line no-param-reassign
    pokemon.moveIds[moveId] = {
      cooldown: 0,
      disabledCounter: 0,
    };
  }
};

const useMoveOnValidTarget = (battle, source, moveId) => {
  const target = getValidTargetForMove(battle, source, moveId);
  expect(target).not.toBeNull();
  battle.performAction({
    action: "useMove",
    moveId,
    targetPokemonId: target.id,
  });
  return target;
};

const describeProbability = ({ probability }, callback) => {
  const cases = [];
  if (probability > 0.01) {
    cases.push({ triggered: true, rngValue: probability - 0.01 });
  }
  if (probability < 0.99) {
    cases.push({ triggered: false, rngValue: probability + 0.01 });
  }

  describe.each(cases)(
    "when probability roll $triggered",
    ({ triggered, rngValue }) => {
      callback(triggered, rngValue);
    },
  );
};

const describeStatusProbability = ({ statusId, probability, setup }) => {
  describe(`${statusId} (${probability * 100}% chance)`, () => {
    describeProbability({ probability }, (triggered, rngValue) => {
      it(`should ${triggered ? "" : "not "}apply ${statusId}`, () => {
        const { target } = setup(rngValue);
        if (triggered) {
          expect(target.status.statusId).toBe(statusId);
        } else {
          expect(target.status.statusId).not.toBe(statusId);
        }
      });
    });
  });
};

const describeEffectProbability = ({ effectId, probability, setup }) => {
  describe(`${effectId} (${probability * 100}% chance)`, () => {
    describeProbability({ probability }, (triggered, rngValue) => {
      it(`should ${triggered ? "" : "not "}apply ${effectId}`, () => {
        const { target } = setup(rngValue);
        if (triggered) {
          expect(target.effectIds[effectId]).toBeDefined();
        } else {
          expect(target.effectIds[effectId]).toBeUndefined();
        }
      });
    });
  });
};

module.exports = {
  HIGH_ACCURACY,
  getFirstActivePokemon,
  getValidTargetForMove,
  givePokemonMove,
  useMoveOnValidTarget,
  describeProbability,
  describeStatusProbability,
  describeEffectProbability,
};
