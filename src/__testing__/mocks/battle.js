const { Battle } = require("../../battle/engine/Battle");
const { createMockTrainer } = require("./trainer");

const createMockBattle = ({
  team1Trainer = null,
  team2Trainer = null,
  team1Party = null,
  team2Party = null,
  team1Name = "Team1",
  team2Name = "Team2",
  level = null,
  autoStart = false,
} = {}) => {
  const battle = new Battle({ level });

  battle.addTeam(team1Name, false);
  battle.addTeam(team2Name, true);

  const team1 = team1Trainer || createMockTrainer({ party: team1Party });
  const team2 =
    team2Trainer || createMockTrainer({ party: team2Party, isNpc: true });

  battle.addTrainer(
    team1.trainer,
    team1.party.pokemons,
    team1Name,
    team1.party.rows,
    team1.party.cols,
  );
  battle.addTrainer(
    team2.trainer,
    team2.party.pokemons,
    team2Name,
    team2.party.rows,
    team2.party.cols,
  );

  if (autoStart) {
    battle.start();
  }

  return {
    battle,
    team1,
    team2,
  };
};

module.exports = {
  createMockBattle,
};
