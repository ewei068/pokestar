const { npcConfig, dungeonConfig, raidConfig } = require("../../config/npcConfig");

/**
 * Resolve only a public presentation key; private mode details stay in the record.
 * @param {object} record
 */
const battleMusicThemeId = (record) => {
  const mode = record.mode || {};
  if (typeof mode.musicThemeId === "string") return mode.musicThemeId;
  const npcId = mode.npcId || record.setup?.initialParams?.npcId;
  switch (mode.type) {
    case "pve":
    case "tower":
      return npcConfig[npcId]?.musicThemeId || null;
    case "dungeon":
      return dungeonConfig[mode.dungeonId || npcId]?.musicThemeId || null;
    case "raid":
      return raidConfig[mode.raidId || npcId]?.musicThemeId || null;
    default:
      return null;
  }
};

module.exports = { battleMusicThemeId };
