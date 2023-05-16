const drawDiscrete = (probabilityDistribution, times) => {
    const results = [];
    for (let i = 0; i < times; i++) {
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
    return results;
}

const drawIterable = (iterable, times, { replacement=true, rng=Math.random } = {}) => {
    // check replacement and times
    if (!replacement && times > iterable.length) {
        throw new Error("Cannot draw without replacement more times than there are items in the iterable.");
    }

    const results = [];
    if (replacement) {
        for (let i = 0; i < times; i++) {
            results.push(iterable[Math.floor(rng() * iterable.length)]);
        }
    } else {
        const iterableCopy = iterable.slice();
        for (let i = 0; i < times; i++) {
            const randIndex = Math.floor(rng() * iterableCopy.length);
            results.push(iterableCopy[randIndex]);
            iterableCopy.splice(randIndex, 1);
        }
    }
    return results;
}

const drawUniform = (min, max, times) => {
    const results = [];
    for (let i = 0; i < times; i++) {
        results.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    return results;
}

module.exports = {
    drawDiscrete,
    drawIterable,
    drawUniform,
};
