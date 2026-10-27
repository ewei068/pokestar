const { DungeonNPC } = require("../npcs");

describe("DungeonNPC durable phases", () => {
  it("generates later parties without replacing the current party", () => {
    const phase = (level) => ({
      rows: 1,
      cols: 1,
      pokemons: [{ speciesId: "1", level, position: 1 }],
    });
    const dungeon = {
      name: "Test Dungeon",
      difficulties: {
        easy: { phases: [phase(10), phase(20), phase(30)] },
      },
    };
    const npc = new DungeonNPC(dungeon, "easy", {});
    npc.setPokemon();
    const currentId = npc.party.pokemons[0]._id;

    const remaining = npc.getRemainingPhaseParties();

    expect(remaining).toHaveLength(2);
    expect(remaining.map((party) => party.pokemons[0].level)).toEqual([20, 30]);
    expect(npc.phaseNumber).toBe(0);
    expect(npc.party.pokemons[0]._id).toBe(currentId);
    expect(remaining[0].pokemons[0]._id).not.toBe(currentId);
  });
});
