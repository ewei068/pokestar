/**
 * @type {DefaultFieldConfig}
 */
const guildFields = {
  guildId: {
    type: "string",
  },
  lastCommand: {
    type: "number",
  },
  spawnSettings: {
    type: "object",
    default: {},
    config: {
      mode: {
        type: "string",
        default: "allowlist",
      },
      channelIds: {
        type: "array",
        default: [],
      },
    },
  },
};

module.exports = {
  guildFields,
};
