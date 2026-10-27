const { buildBattleCatalog } = require("../battleCatalog");
const { statusConditions, statusConditionConfig } = require("../../config/battleConfig");

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
    expect(catalog.types[9].name).toBe("Fire");
    expect(Object.values(catalog.effects).some((effect) => effect.type === "Buff")).toBe(true);
    expect(catalog.statuses.Burn.description).toContain("damage");
    expect(JSON.parse(JSON.stringify(catalog))).toEqual(catalog);
  });

  it("projects every status from the shared display configuration", () => {
    const { statuses } = buildBattleCatalog();
    expect(Object.keys(statuses).sort()).toEqual(Object.values(statusConditions).sort());
    for (const [statusId, display] of Object.entries(statuses)) {
      expect(display).toEqual({
        name: statusConditionConfig[statusId].name,
        description: statusConditionConfig[statusId].description,
      });
      expect(display.name).toEqual(expect.any(String));
      expect(display.description).toEqual(expect.any(String));
    }
  });

  it("keeps non-display status configuration out of the catalog", () => {
    const burn = statusConditionConfig[statusConditions.BURN];
    statusConditionConfig[statusConditions.BURN] = {
      ...burn,
      execute: () => {},
      internalOnly: true,
    };
    try {
      const { statuses } = buildBattleCatalog();
      expect(statuses[statusConditions.BURN]).toEqual({
        name: burn.name,
        description: burn.description,
      });
      expect(JSON.parse(JSON.stringify(statuses))).toEqual(statuses);
    } finally {
      statusConditionConfig[statusConditions.BURN] = burn;
    }
  });
});
