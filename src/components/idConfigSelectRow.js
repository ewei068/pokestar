/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * idConfigSelectRow.js <Insert description here>
 */
const { StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");

/**
 *
 * @param {*} ids
 * @param {*} config
 * @param {*} placeholder
 * @param {*} data
 * @param {*} eventName
 * @param {*} showId
 * @param {*} extraFields
 * @param {*} defaultId
 * @returns
 */
const buildIdConfigSelectRow = (
  ids,
  config,
  placeholder,
  data,
  eventName,
  showId = true,
  extraFields = [],
  defaultId = null
) => {
  const menuId = {
    eventName,
    ...data,
  };

  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId(`${JSON.stringify(menuId)}`)
    .setPlaceholder(placeholder)
    .addOptions(
      ids.map((id) => {
        const entryData = config[id];
        const extra = extraFields.map((field) => entryData[field]).join(" | ");
        const option = {
          label: `${entryData.name}${extra ? ` | ${extra}` : ""}${
            showId ? ` #${id.toString()}` : ""
          }`,
          value: `${id}`,
          default: defaultId === id,
        };
        if (entryData.emoji) {
          option.emoji = entryData.emoji;
        }
        return option;
      })
    );

  const actionRow = new ActionRowBuilder().addComponents(selectMenu);

  return actionRow;
};

module.exports = {
  buildIdConfigSelectRow,
};
