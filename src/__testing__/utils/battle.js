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
  source.useMove(moveId, target.id);
  return target;
};

const describeProbability = ({ probability }, callback) => {
  const cases = [];
  if (probability > 0.01) {
    cases.push({ triggered: true, mockValue: probability - 0.01 });
  }
  if (probability < 0.99) {
    cases.push({ triggered: false, mockValue: probability + 0.01 });
  }

  describe.each(cases)(
    "when probability roll $triggered",
    ({ triggered, mockValue }) => {
      beforeEach(() => {
        jest.spyOn(Math, "random").mockReturnValue(mockValue);
      });

      afterEach(() => {
        jest.restoreAllMocks();
      });

      callback(triggered);
    },
  );
};

const describeStatusProbability = ({ statusId, probability, setup }) => {
  describe(`${statusId} (${probability * 100}% chance)`, () => {
    describeProbability({ probability }, (triggered) => {
      it(`should ${triggered ? "" : "not "}apply ${statusId}`, () => {
        const { target } = setup();
        if (triggered) {
          expect(target.status.statusId).toBe(statusId);
        } else {
          expect(target.status.statusId).not.toBe(statusId);
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
};
