const {
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
} = require("discord.js");

const isDeactCreateElement = (element) => element.isDeactCreateElement;

const isActionRowBuilder = (element) => element instanceof ActionRowBuilder;
const isButtonBuilder = (element) => element instanceof ButtonBuilder;
const isSelectMenuBuilder = (element) =>
  element instanceof StringSelectMenuBuilder; // TODO: add other types

/**
 * @param {string?} accumulator
 * @param {string?} currentValue
 * @returns {string?}
 */
const reduceContent = (accumulator, currentValue) => {
  if (accumulator === undefined && currentValue === undefined) {
    return undefined;
  }

  return (accumulator || "") + (currentValue || "");
};

const reduceEmbeds = (accumulator, currentValue) => {
  if (accumulator === undefined && currentValue === undefined) {
    return undefined;
  }

  const rv = (accumulator || []).concat(currentValue || []);
  return rv.slice(0, 10);
};

const reduceComponentRows = (accumulator, currentValue) => {
  if (accumulator === undefined && currentValue === undefined) {
    return undefined;
  }
  if (accumulator === undefined) {
    return currentValue;
  }
  if (currentValue === undefined) {
    return accumulator;
  }

  const rv = accumulator.concat(currentValue);
  return rv.slice(0, 5);
};

const reduceComponents = (accumulator, currentValue) => {
  if (accumulator === undefined && currentValue === undefined) {
    return undefined;
  }

  let actionRow = accumulator;
  if (!isActionRowBuilder(accumulator)) {
    actionRow = new ActionRowBuilder();
  }

  if (isButtonBuilder(currentValue)) {
    if (actionRow.components.length > 4) {
      return actionRow;
    }
    actionRow.addComponents(currentValue);
  } else if (isSelectMenuBuilder(currentValue)) {
    if (actionRow.components.length > 0) {
      return actionRow;
    }
    actionRow.addComponents(currentValue);
  } else if (isActionRowBuilder(currentValue)) {
    actionRow.addComponents(
      currentValue.components.slice(0, 5 - actionRow.components.length)
    );
  }

  return actionRow;
};

module.exports = {
  isDeactCreateElement,
  reduceContent,
  reduceEmbeds,
  reduceComponentRows,
  reduceComponents,
};
