const { backpackItems } = require('./backpackConfig');

const NUM_DAILY_REWARDS = 3;

const dailyRewardChances = {
    [backpackItems.POKEBALL]: 0.7,
    [backpackItems.GREATBALL]: 0.25,
    [backpackItems.ULTRABALL]: 0.04,
    [backpackItems.MASTERBALL]: 0.01,
}

module.exports = {
    dailyRewardChances,
    NUM_DAILY_REWARDS,
};

