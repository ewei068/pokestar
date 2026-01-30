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
    pokemon.moveIds[moveId] = {
      cooldown: 0,
      disabledCounter: 0,
    };
  }
};

module.exports = {
  getFirstActivePokemon,
  getValidTargetForMove,
  givePokemonMove,
};
