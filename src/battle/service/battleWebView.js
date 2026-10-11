const { restoreBattle } = require("../persistence/battleRecord");

const participantTeams = (record, userId) => new Set(
  record.setup.trainers
    .filter((trainer) => trainer.userId === userId)
    .map((trainer) => trainer.teamName),
);

/**
 * Keep the browser view independent of the engine's persisted snapshot shape.
 * Opponent moves, ability, held item, and private stat modifiers stay server-side.
 * @param {object} snapshot
 * @param {Set<string>} ownTeams
 */
const projectSnapshot = (snapshot, ownTeams) => ({
  battleId: snapshot.battleId,
  ended: snapshot.ended,
  winner: snapshot.winner,
  turn: snapshot.turn,
  activePokemonId: snapshot.activePokemonId,
  weather: snapshot.weather,
  teams: snapshot.teams,
  pokemon: Object.fromEntries(
    Object.entries(snapshot.pokemon).map(([id, pokemon]) => [
      id,
      {
        id: pokemon.id,
        speciesId: pokemon.speciesId,
        name: pokemon.name,
        shiny: pokemon.shiny,
        hp: pokemon.hp,
        maxHp: pokemon.maxHp,
        level: pokemon.level,
        isFainted: pokemon.isFainted,
        combatReadiness: pokemon.combatReadiness,
        position: pokemon.position,
        teamName: pokemon.teamName,
        type1: pokemon.type1,
        type2: pokemon.type2,
        status: pokemon.status,
        effectIds: pokemon.effectIds,
        ...(ownTeams.has(pokemon.teamName) ? {
          abilityId: pokemon.abilityId,
          heldItemId: pokemon.heldItemId,
          moveIds: pokemon.moveIds,
          allStatData: pokemon.allStatData,
          acc: pokemon.acc,
          eva: pokemon.eva,
        } : {}),
      },
    ]),
  ),
});

const availableActions = (record, battle, userId) => {
  const pokemon = battle.activePokemon;
  if (record.status !== "active" || !pokemon || pokemon.userId !== userId) {
    return { canSkip: false, moves: [] };
  }
  if (!pokemon.canMove()) return { canSkip: true, moves: [] };

  return {
    canSkip: true,
    moves: Object.entries(pokemon.moveIds).flatMap(([moveId, state]) => {
      if (state.cooldown > 0 || state.disabledCounter > 0) return [];
      const targets = battle.getEligibleTargets(
        pokemon,
        /** @type {MoveIdEnum} */ (moveId),
      );
      return targets.length > 0 ? [{
        moveId,
        targetPokemonIds: targets.map((target) => target.id),
      }] : [];
    }),
  };
};

const projectBattleRecord = (record, userId, sinceRevision = null) => {
  const ownTeams = participantTeams(record, userId);
  const battle = restoreBattle(record);
  return {
    found: true,
    battleId: record._id,
    rulesetVersion: record.rulesetVersion,
    revision: record.revision,
    status: record.status,
    completionStatus: record.completionStatus,
    mode: { type: record.mode.type },
    updatedAt: record.updatedAt,
    expiresAt: record.expiresAt,
    resultExpiresAt: record.resultExpiresAt,
    myTeamNames: [...ownTeams],
    isMyTurn: record.status === "active" && battle.activePokemon?.userId === userId,
    view: projectSnapshot(record.view, ownTeams),
    availableActions: availableActions(record, battle, userId),
    updates: sinceRevision === null ? [] : record.actions
      .filter((entry) => entry.revision > sinceRevision)
      .map((entry) => ({
        revision: entry.revision,
        action: entry.action,
        events: entry.events,
        log: entry.log,
        view: projectSnapshot(entry.view, ownTeams),
      })),
  };
};

module.exports = { projectBattleRecord };
