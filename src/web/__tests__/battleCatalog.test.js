const { buildBattleCatalog } = require("../battleCatalog");

describe("battle display catalog", () => {
  it("contains serializable display data without combat callbacks", () => {
    const catalog = buildBattleCatalog();
    expect(catalog.rulesetVersion).toBeGreaterThan(0);
    expect(Object.keys(catalog.species).length).toBeGreaterThan(400);
    expect(catalog.species[1]).toEqual(expect.objectContaining({
      name: "Bulbasaur",
      sprite: expect.stringContaining(".png"),
    }));
    expect(catalog.moves.m84.name).toBeTruthy();
    expect(catalog.moves.m84.execute).toBeUndefined();
    expect(Object.values(catalog.effects).some((effect) => effect.type === "Buff")).toBe(true);
    expect(catalog.statuses.Burn.description).toContain("damage");
    expect(JSON.parse(JSON.stringify(catalog))).toEqual(catalog);
  });
});
