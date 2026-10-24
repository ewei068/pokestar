const { existsSync } = require("fs");
const { join } = require("path");
const { battleMusicThemeId } = require("../battleMusic");
const musicCatalog = require("../../../../web/src/battles/audio/musicCatalog.json");

const record = (type, mode = {}, npcId = null) => ({
  mode: { type, ...mode }, setup: { initialParams: { npcId } },
});

describe("battle music presentation", () => {
  it("resolves configured trainer, raid and dungeon themes without exposing mode details", () => {
    expect(battleMusicThemeId(record("pve", { npcId: "cynthia" }))).toBe("trainer-cynthia");
    expect(battleMusicThemeId(record("pve", { npcId: "palmer" }))).toBe("trainer-frontier");
    expect(battleMusicThemeId(record("raid", { raidInstanceId: "private-instance" }, "armoredMewtwoRaid")))
      .toBe("raid-mewtwo");
    expect(battleMusicThemeId(record("raid", {}, "teamAquasKyogreRaid"))).toBe("raid-kyogre-groudon");
    expect(battleMusicThemeId(record("raid", {}, "teamMagmasGroudonRaid"))).toBe("raid-kyogre-groudon");
    expect(battleMusicThemeId(record("dungeon", { dungeonId: "mountCoronet" }))).toBe("dungeon");
    expect(battleMusicThemeId(record("dungeon", { dungeonId: "mindTemple" }))).toBe("dungeon");
  });

  it("lets a battle override its encounter, with a default pool for others", () => {
    expect(battleMusicThemeId(record("pve", { npcId: "cynthia", musicThemeId: "default" })))
      .toBe("default");
    expect(battleMusicThemeId(record("pvp"))).toBeNull();
    expect(battleMusicThemeId(record("pve", { npcId: "bugCatcher" }))).toBeNull();
    expect(battleMusicThemeId(record("pve", { npcId: "volo" }))).toBeNull();
  });

  it("keeps every configured theme and track in the shipped web catalog", () => {
    for (const themeId of Object.keys(musicCatalog.themes)) {
      expect(musicCatalog.themes[themeId]?.length).toBeGreaterThan(0);
      for (const trackId of musicCatalog.themes[themeId]) {
        expect(musicCatalog.tracks[trackId]?.file).toMatch(/\.mp3$/);
        expect(existsSync(join(__dirname, "../../../../web/public/music", musicCatalog.tracks[trackId].file)))
          .toBe(true);
      }
    }
  });
});
