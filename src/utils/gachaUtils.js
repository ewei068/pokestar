/**
 * @file
 * @author Elvis Wei
 *
 * gachaUtils.js the lowest level of gacha code used by gacha.js
 */

/**
 * @template {string | number | symbol} T
 * @param {Record<T, number>} probabilityDistribution
 * @param {number} times
 * @returns {T[]}
 */
const drawDiscrete = (probabilityDistribution, times) => {
  const results = [];
  for (let i = 0; i < times; i += 1) {
    const rand = Math.random();
    let sum = 0;
    for (const item in probabilityDistribution) {
      sum += probabilityDistribution[item];
      if (rand < sum) {
        results.push(item);
        break;
      }
    }
  }
  // @ts-ignore
  return results;
};

/**
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

module.exports = {
  drawDiscrete,
  drawIterable,
  drawUniform,
};
