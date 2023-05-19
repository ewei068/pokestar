const seedrandom = require("seedrandom");
const { backpackItems } = require('./backpackConfig');
const { rarities, rarityBins } = require('./pokemonConfig');
const { drawIterable } = require("../utils/gachaUtils");
const { stageNames } = require("./stageConfig");
const { getFullUTCDate } = require("../utils/utils");

const NUM_DAILY_REWARDS = process.env.STAGE === stageNames.ALPHA ? 100 : 3;

const dailyRewardChances = {
    [backpackItems.POKEBALL]: 0.7,
    [backpackItems.GREATBALL]: 0.25,
    [backpackItems.ULTRABALL]: 0.04,
    [backpackItems.MASTERBALL]: 0.01,
}

const pokeballConfig = {
    [backpackItems.POKEBALL]: {
        chances: {
            [rarities.COMMON]: 0.7,
            [rarities.RARE]: 0.25,
            [rarities.EPIC]: 0.04,
            [rarities.LEGENDARY]: 0.01,
        },
        pity: 1
    },
    [backpackItems.GREATBALL]: {
        chances: {
            [rarities.COMMON]: 0.3,
            [rarities.RARE]: 0.55,
            [rarities.EPIC]: 0.12,
            [rarities.LEGENDARY]: 0.03,
        },
        pity: 3
    },
    [backpackItems.ULTRABALL]: {
        chances: {
            [rarities.RARE]: 0.45,
            [rarities.EPIC]: 0.5,
            [rarities.LEGENDARY]: 0.05,
        },
        pity: 5
    },
    [backpackItems.MASTERBALL]: {
        chances: {
            [rarities.EPIC]: 0.9,
            [rarities.LEGENDARY]: 0.1,
        },
        pity: 10
    }
}

const bannerTypes = {
    STANDARD: "standard",
    ROTATING: "rotating",
    SPECIAL: "special",
}

const bannerTypeConfig = {
    [bannerTypes.STANDARD]: {
        "name": "Standard",
        "description": "Standard banner with all currently available gacha Pokemon.",
    },
    [bannerTypes.ROTATING]: {
        "name": "Rotating",
        "description": "Banner which rotates rate-up Pokemon randomly every day.",
    },
    [bannerTypes.SPECIAL]: {
        "name": "Special",
        "description": "Special banner with a limited-time or hand-chosen rate-up Pokemon.",
    },
}

const bannerConfig = [
    {
        "bannerType": bannerTypes.STANDARD,
        "name": "Standard",
        "description": "Standard banner with all currently available gacha Pokemon.",
        "rateUp": () => {},
    },
    {
        "bannerType": bannerTypes.ROTATING,
        "name": "Rotating",
        "description": "Banner which rotates rate-up Pokemon randomly every day.",
        "rateUp": () => {
            // seedrandom using date 
            const date = getFullUTCDate();
            const rng = seedrandom(date);
            return {
                [rarities.LEGENDARY]: drawIterable(rarityBins[rarities.LEGENDARY], 1, {
                    replacement: false,
                    rng: rng,
                }),
                [rarities.EPIC]: drawIterable(rarityBins[rarities.EPIC], 3, {
                    replacement: false,
                    rng: rng,
                }),
            }
        }
    },
]

const MAX_PITY = 100;

module.exports = {
    dailyRewardChances,
    NUM_DAILY_REWARDS,
    pokeballConfig,
    bannerTypes,
    bannerTypeConfig,
    bannerConfig,
    MAX_PITY,
};
