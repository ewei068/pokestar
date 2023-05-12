const { backpackItems } = require('./backpackConfig');
const { rarities } = require('./pokemonConfig');

const NUM_DAILY_REWARDS = 3;

const dailyRewardChances = {
    [backpackItems.POKEBALL]: 0.7,
    [backpackItems.GREATBALL]: 0.25,
    [backpackItems.ULTRABALL]: 0.04,
    [backpackItems.MASTERBALL]: 0.01,
}

const pokeballChanceConfig = {
    [backpackItems.POKEBALL]: {
        [rarities.COMMON]: 0.7,
        [rarities.RARE]: 0.25,
        [rarities.EPIC]: 0.04,
        [rarities.LEGENDARY]: 0.01,
    },
    [backpackItems.GREATBALL]: {
        [rarities.COMMON]: 0.3,
        [rarities.RARE]: 0.55,
        [rarities.EPIC]: 0.12,
        [rarities.LEGENDARY]: 0.03,
    },
    [backpackItems.ULTRABALL]: {
        [rarities.RARE]: 0.45,
        [rarities.EPIC]: 0.5,
        [rarities.LEGENDARY]: 0.05,
    },
    [backpackItems.MASTERBALL]: {
        [rarities.EPIC]: 0.9,
        [rarities.LEGENDARY]: 0.1,
    }
}

module.exports = {
    dailyRewardChances,
    NUM_DAILY_REWARDS,
    pokeballChanceConfig,
};
