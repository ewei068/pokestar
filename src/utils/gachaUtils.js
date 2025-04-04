/**
 * @file
 * @author Elvis Wei
 *
 * gachaUtils.js the lowest level of gacha code used by gacha.js
 */

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

module.exports = {
  drawDiscrete,
  drawIterable,
  drawUniform,
};
