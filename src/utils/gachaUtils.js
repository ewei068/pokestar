const { backpackCategories } = require('../config/backpackConfig');
const { dailyRewardChances, NUM_DAILY_REWARDS } = require('../config/gachaConfig');
const { updateDocument } = require('../database/mongoHandler');
const { stageNames } = require('../config/stageConfig');

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

const drawDaily = async (trainer) => {
    // check if new day; if in alpha, ignore
    const now = new Date();
    const lastDaily = new Date(trainer.lastDaily);
    if (now.getDate() != lastDaily.getDate() || process.env.STAGE == stageNames.ALPHA) {
        trainer.lastDaily = now.getTime();
    } else {
        return { data: [], err: null };
    }

    const results = drawDiscrete(dailyRewardChances, NUM_DAILY_REWARDS);
    const pokeballs = trainer.backpack[backpackCategories.POKEBALLS] || {};
    for (const result of results) {
        const oldVal = pokeballs[result] || 0;
        pokeballs[result] = oldVal + 1;
    }
    trainer.backpack[backpackCategories.POKEBALLS] = pokeballs;
    try {
        res = await updateDocument('users', { userId: trainer.userId }, { $set: { backpack: trainer.backpack, lastDaily: trainer.lastDaily } });
        if (res.modifiedCount === 0) {
            return { data: null, err: "Error updating trainer." };
        }
    } catch (error) {
        return { data: null, err: "Error updating trainer." };
    }

    return { data: results, err: null };
}

module.exports = {
    drawDaily
};
