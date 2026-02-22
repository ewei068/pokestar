const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { Battle } = require("../Battle");
const { pokemonConfig } = require("../../../config/pokemonConfig");
const { npcTurnAction } = require("../../../utils/battleUtils");
const { createMockPokemon } = require("../../../__testing__/mocks/pokemon");

const PARTY_SIZE = 6;
const ROWS = 3;
const COLS = 4;

const getEligibleSpeciesIds = () =>
  Object.entries(pokemonConfig)
    .filter(([, data]) => data.battleEligible)
    .map(([id]) => id);

const pickRandomSpecies = (count, rng = Math.random) => {
  const eligible = getEligibleSpeciesIds();
  const picked = [];
  for (let i = 0; i < count; i += 1) {
    const idx = Math.floor(rng() * eligible.length);
    picked.push(eligible[idx]);
  }
  return picked;
};

const createRandomParty = ({ userId, size = PARTY_SIZE, level = 50 }) => {
  const speciesIds = pickRandomSpecies(size);
  const pokemons = Array(ROWS * COLS).fill(null);
  for (let i = 0; i < size; i += 1) {
    pokemons[i] = createMockPokemon({
      // @ts-ignore
      speciesId: speciesIds[i],
      level,
      userId,
      position: i + 1,
    });
  }
  return { pokemons, rows: ROWS, cols: COLS };
};

const createRandomTrainer = ({ username = "Trainer", isNpc = false } = {}) => {
  const userId = uuidv4();
  const party = createRandomParty({ userId });
  for (const pokemon of party.pokemons) {
    if (pokemon) {
      pokemon.userId = userId;
    }
  }
  return {
    trainer: {
      userId,
      user: { id: userId, username, discriminator: "0", isNpc },
    },
    party,
  };
};

const runBattleToCompletion = (battle) => {
  const snapshots = [];
  const allLogs = [];

  battle.start();
  snapshots.push(battle.takeSnapshot());
  allLogs.push([...battle.log]);

  let safety = 0;
  while (!battle.ended && safety < 500) {
    npcTurnAction(battle);
    snapshots.push(battle.takeSnapshot());
    allLogs.push([...battle.log]);
    safety += 1;
  }

  return { snapshots, allLogs };
};

const replayBattle = (battle, actions) => {
  const snapshots = [];
  const allLogs = [];

  try {
    battle.start();
    snapshots.push(battle.takeSnapshot());
    allLogs.push([...battle.log]);

    for (const action of actions) {
      if (battle.ended) break;
      battle.performAction(action);
      snapshots.push(battle.takeSnapshot());
      allLogs.push([...battle.log]);
    }
  } catch (error) {
    /* empty */
  }

  return { snapshots, allLogs };
};

const serializeBattleSetup = (battle) => ({
  initialParams: battle.initialParams,
  teams: JSON.parse(JSON.stringify(battle.teams)),
  users: Object.fromEntries(
    Object.entries(battle.users).map(([userId, user]) => [
      userId,
      {
        ...user,
        nextPhase: undefined,
      },
    ]),
  ),
  allPokemonIds: Object.keys(battle.allPokemon),
});

const saveDebugData = (debugDir, data) => {
  fs.mkdirSync(debugDir, { recursive: true });

  fs.writeFileSync(
    path.join(debugDir, "original-actions.json"),
    JSON.stringify(data.originalActions, null, 2),
  );
  fs.writeFileSync(
    path.join(debugDir, "clone-actions.json"),
    JSON.stringify(data.cloneActions, null, 2),
  );
  fs.writeFileSync(
    path.join(debugDir, "original-logs.json"),
    JSON.stringify(data.originalLogs, null, 2),
  );
  fs.writeFileSync(
    path.join(debugDir, "clone-logs.json"),
    JSON.stringify(data.cloneLogs, null, 2),
  );
  fs.writeFileSync(
    path.join(debugDir, "original-setup.json"),
    JSON.stringify(data.originalSetup, null, 2),
  );
  fs.writeFileSync(
    path.join(debugDir, "clone-setup.json"),
    JSON.stringify(data.cloneSetup, null, 2),
  );
  fs.writeFileSync(
    path.join(debugDir, "original-snapshots.json"),
    JSON.stringify(data.originalSnapshots, null, 2),
  );
  fs.writeFileSync(
    path.join(debugDir, "clone-snapshots.json"),
    JSON.stringify(data.cloneSnapshots, null, 2),
  );

  const originalLogsFlat = data.originalLogs.flat().join("\n");
  const cloneLogsFlat = data.cloneLogs.flat().join("\n");
  fs.writeFileSync(path.join(debugDir, "original-logs.txt"), originalLogsFlat);
  fs.writeFileSync(path.join(debugDir, "clone-logs.txt"), cloneLogsFlat);
};

const findSnapshotDiff = (original, clone) => {
  const diffs = [];

  if (original.turn !== clone.turn) {
    diffs.push({ field: "turn", original: original.turn, clone: clone.turn });
  }
  if (original.activePokemonId !== clone.activePokemonId) {
    diffs.push({
      field: "activePokemonId",
      original: original.activePokemonId,
      clone: clone.activePokemonId,
    });
  }
  if (
    original.weather.weatherId !== clone.weather.weatherId ||
    original.weather.duration !== clone.weather.duration
  ) {
    diffs.push({
      field: "weather",
      original: original.weather,
      clone: clone.weather,
    });
  }

  const allPokemonIds = new Set([
    ...Object.keys(original.pokemon),
    ...Object.keys(clone.pokemon),
  ]);
  for (const pokemonId of allPokemonIds) {
    const origPoke = original.pokemon[pokemonId];
    const clonePoke = clone.pokemon[pokemonId];
    if (!origPoke || !clonePoke) {
      diffs.push({
        field: `pokemon.${pokemonId}`,
        original: origPoke ? "exists" : "missing",
        clone: clonePoke ? "exists" : "missing",
      });
      continue;
    }
    if (JSON.stringify(origPoke) !== JSON.stringify(clonePoke)) {
      for (const key of Object.keys(origPoke)) {
        const origVal = JSON.stringify(origPoke[key]);
        const cloneVal = JSON.stringify(clonePoke[key]);
        if (origVal !== cloneVal) {
          diffs.push({
            field: `pokemon.${pokemonId}.${key}`,
            pokemonName: origPoke.name,
            original: origPoke[key],
            clone: clonePoke[key],
          });
        }
      }
    }
  }

  return diffs;
};

const iterations = 100;

describe.each(Array.from({ length: iterations }, (_, i) => i + 1))(
  "Battle replay iteration %i",
  () => {
    it("should replay a battle with 12 random Pokemon per team and produce identical snapshots", () => {
      const battleId = uuidv4();

      const team1 = createRandomTrainer({ username: "Player1" });
      const team2 = createRandomTrainer({ username: "Player2", isNpc: true });

      const battle = new Battle({ enableReplay: true, id: battleId });
      battle.addTeam("Team1", false);
      battle.addTeam("Team2", true);
      battle.addTrainer(
        team1.trainer,
        team1.party.pokemons,
        "Team1",
        team1.party.rows,
        team1.party.cols,
      );
      battle.addTrainer(
        team2.trainer,
        team2.party.pokemons,
        "Team2",
        team2.party.rows,
        team2.party.cols,
      );

      const { snapshots: originalSnapshots, allLogs: originalLogs } =
        runBattleToCompletion(battle);

      expect(battle.ended).toBe(true);
      expect(originalSnapshots.length).toBeGreaterThan(1);

      const recordedActions = [...battle.actions];
      expect(recordedActions.length).toBeGreaterThan(0);

      const clone = battle.cloneAndReset();

      const { snapshots: cloneSnapshots, allLogs: cloneLogs } = replayBattle(
        clone,
        recordedActions,
      );

      const minLen = Math.min(originalSnapshots.length, cloneSnapshots.length);
      let firstDiffTurn = -1;
      let firstDiffs = null;

      for (let i = 0; i < minLen; i += 1) {
        const diffs = findSnapshotDiff(originalSnapshots[i], cloneSnapshots[i]);
        if (diffs.length > 0) {
          firstDiffTurn = i;
          firstDiffs = diffs;
          break;
        }
      }

      if (originalSnapshots.length !== cloneSnapshots.length) {
        firstDiffTurn = firstDiffTurn === -1 ? minLen : firstDiffTurn;
        firstDiffs = firstDiffs || [
          {
            field: "snapshotCount",
            original: originalSnapshots.length,
            clone: cloneSnapshots.length,
          },
        ];
      }

      if (firstDiffTurn !== -1) {
        const debugDir = path.join(
          __dirname,
          "__debug__",
          `replay-failure-${battleId}`,
        );
        saveDebugData(debugDir, {
          originalActions: recordedActions,
          cloneActions: clone.actions,
          originalLogs,
          cloneLogs,
          originalSetup: serializeBattleSetup(battle),
          cloneSetup: serializeBattleSetup(clone),
          originalSnapshots,
          cloneSnapshots,
        });

        const diffSummary = firstDiffs
          .map(
            (d) =>
              `  ${d.field}${d.pokemonName ? ` (${d.pokemonName})` : ""}:\n    original: ${JSON.stringify(d.original)}\n    clone:    ${JSON.stringify(d.clone)}`,
          )
          .join("\n");

        throw new Error(
          `Replay diverged at snapshot index ${firstDiffTurn}:\n${diffSummary}\n\nDebug data saved to: ${debugDir}`,
        );
      }
    });
  },
);
