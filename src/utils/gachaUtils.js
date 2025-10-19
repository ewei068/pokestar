/**
 * @file
 * @author Elvis Wei
 *
 * gachaUtils.js the lowest level of gacha code used by gacha.js
 */

const { rarityConfig } = require("../config/pokemonConfig");
const { ansiTokens } = require("../enums/miscEnums");
const { getWhitespace, buildAnsiString } = require("./utils");

/**
 * Draws a random item from a probability distribution.
 * @template {string | number} T
 * @param {Record<T, number>} probabilityDistribution
 * @param {number} times
 * @returns {T[]}
 */
const drawDiscrete = (probabilityDistribution, times) => {
  const results = [];
  const totalProbability = Object.values(probabilityDistribution).reduce(
    (acc, curr) => acc + curr,
    0
  );
  for (let i = 0; i < times; i += 1) {
    const rand = Math.random() * totalProbability;
    let sum = 0;
    let item;
    for (item in probabilityDistribution) {
      sum += probabilityDistribution[item];
      if (rand < sum) {
        results.push(item);
        break;
      }
    }
    // if rand is greater than sum due to some floating point bs, push the last item
    if (rand >= sum) {
      results.push(item);
    }
  }
  // @ts-ignore
  return results;
};

/**
 * Draws a random item from an iterable such as an array.
 * @template T
 * @param {T[]} iterable
 * @param {number} times
 * @param {object} param2
 * @param {boolean?=} param2.replacement
 * @param {(() => number)?=} param2.rng
 * @returns {T[]}
 */
const drawIterable = (
  iterable,
  times,
  { replacement = true, rng = Math.random } = {}
) => {
  // check replacement and times
  if (!replacement && times > iterable.length) {
    throw new Error(
      "Cannot draw without replacement more times than there are items in the iterable."
    );
  }

  const results = [];
  if (replacement) {
    for (let i = 0; i < times; i += 1) {
      results.push(iterable[Math.floor(rng() * iterable.length)]);
    }
  } else {
    const iterableCopy = iterable.slice();
    for (let i = 0; i < times; i += 1) {
      const randIndex = Math.floor(rng() * iterableCopy.length);
      results.push(iterableCopy[randIndex]);
      iterableCopy.splice(randIndex, 1);
    }
  }
  return results;
};

/**
 * Draws a random number between min and max times.
 * @param {number} min
 * @param {number} max
 * @param {number} times
 * @returns {number[]}
 */
const drawUniform = (min, max, times) => {
  const results = [];
  for (let i = 0; i < times; i += 1) {
    results.push(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return results;
};

/**
 * Formats a probability as a percentage.
 * @param {number} probability
 * @returns {string}
 */
const formatProbability = (probability) => {
  if (probability >= 0.0001) {
    // For probabilities >= 0.01%, show up to 2 decimal places
    return `${(probability * 100).toFixed(2)}%`;
  }

  // For very small probabilities, find minimum decimals needed
  let decimals = 3;
  while ((probability * 100).toFixed(decimals).endsWith("0") && decimals < 10) {
    decimals += 1;
  }
  return `${(probability * 100).toFixed(decimals)}%`;
};

/**
 * Builds a string of rarity probabilities.
 * @param {PartialRecord<RarityEnum, number>} rarityProbabilityDistribution
 * @returns {string}
 */
const buildRarityProbabilityString = (rarityProbabilityDistribution) => {
  const rarityNames = Object.keys(rarityProbabilityDistribution).map(
    (rarity) => `[${rarityConfig[rarity].name}]`
  );
  const headerWhitespace = getWhitespace(rarityNames);

  // this can be done with maps and format strings but it's easier to read this way
  let probabilityString = "";
  for (let i = 0; i < rarityNames.length; i += 1) {
    const rarity = Object.keys(rarityProbabilityDistribution)[i];
    probabilityString += `${rarityConfig[rarity].emoji} `;
    probabilityString += ansiTokens.BOLD + rarityConfig[rarity].ansiColor;
    probabilityString += rarityNames[i];
    probabilityString += ansiTokens.RESET;
    probabilityString += `${headerWhitespace[i]}`;
    probabilityString += ": ";
    probabilityString += formatProbability(
      rarityProbabilityDistribution[rarity] ?? 0
    );
    if (i < rarityNames.length - 1) {
      probabilityString += "\n";
    }
  }
  return buildAnsiString(probabilityString);
};

module.exports = {
  drawDiscrete,
  drawIterable,
  drawUniform,
  formatProbability,
  buildRarityProbabilityString,
};
