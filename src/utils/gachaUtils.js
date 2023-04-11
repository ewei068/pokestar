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

const drawIterable = (iterable, times) => {
    const results = [];
    for (let i = 0; i < times; i++) {
        results.push(iterable[Math.floor(Math.random() * iterable.length)]);
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
