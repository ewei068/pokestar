/**
 * @type {DefaultFieldConfig}
 */
const guildFields = {
  guildId: {
    type: "string",
  },
  lastCommand: {
    type: "number",
    default: 0,
  },
  spawnSettings: {
    type: "object",
    default: {},
    config: {
      mode: {
        type: "string",
        default: "denylist",
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
