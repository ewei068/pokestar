const seedrandom = require("seedrandom");
const { backpackItems } = require('./backpackConfig');
const { rarities, rarityBins } = require('./pokemonConfig');
const { drawIterable } = require("../utils/gachaUtils");
const { stageNames } = require("./stageConfig");
const { getFullUTCDate } = require("../utils/utils");

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
        "bannerType": bannerTypes.SPECIAL,
        "name": "[EVENT] Team Rocket Trio",
        "description": "Prepare for trouble... and make it double! Pull for the Team Rocket Trio's limited signature Pokemon as well as the limited legendary Meowth! For more information, use `/events`.",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["52-1"],
                [rarities.EPIC]: ["24-1", "110-1"]
            }
        },
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/events/pokestar-rocket-banner.png"
    },
    {
        "bannerType": bannerTypes.SPECIAL,
        "name": "[EVENT] Mewtwo Strikes Back",
        "description": "Mewtwo has returned to Pokestar! Pull for the powerful limited Armored Mewtwo, as well as the (non-limited) other clones! For more information, use `/events`.",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["150-1"],
                [rarities.EPIC]: ["3", "6", "9"]
            }
        },
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/events/pokestar-rocket-banner.png"
    },
    {
        "bannerType": bannerTypes.SPECIAL,
        "name": "[EVENT] God of Anarchy",
        "description": "The Lord Helix has graced Pokestar with its presence! Pull for the powerful limited Lord Helix, as well as Twitch Plays Red's other Pokemon! For more information, use `/events`.",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["139-1"],
                [rarities.EPIC]: ["18-1", "34-1", "49-1", "131-1"]
            }
        },
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/events/pokestar-tpp-banner.png"
    },
    {
        "bannerType": bannerTypes.SPECIAL,
        "name": "[EVENT] False Prophet",
        "description": "To rival the Lord Helix, the False Prophet of Democracy comes to challenge! Pull for the powerful limited False Prophet, as well as the Eeveelutions who could have been! For more information, use `/events`.",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["136-1"],
                [rarities.EPIC]: ["134", "135", "136"]
            }
        },
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/events/pokestar-tpp-banner.png"
    },
    {
        "bannerType": bannerTypes.SPECIAL,
        "name": "[EVENT] Bloody Sunday",
        "description": "Sacrifices must be made to gain powerful Pokemon! Pull for the powerful limited AA-j Zapdos, as well as those who passed in Bloody Sunday! For more information, use `/events`.",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["145-1"],
                [rarities.EPIC]: ["34", "45", "76", "103"],
                [rarities.RARE]: ["20", "47", "49"]
            }
        },
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/events/pokestar-tpp-banner.png"
    },
    /* {
        "bannerType": bannerTypes.SPECIAL,
        "name": "[EVENT] Ash's Banner",
        "description": "The launch celebration has arrived! Pull for some of Ash and Red's best Pokemon, as well as a powerful limited Pikachu variant! For more information, use `/events`.",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["25-1"],
                [rarities.EPIC]: ["3", "6", "9", "131", "143"],
                [rarities.RARE]: ["1", "4", "7"]
            }
        },
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/events/pokestar-launch-banner.png"
    },
    {
        "bannerType": bannerTypes.SPECIAL,
        "name": "[EVENT] Gary's Banner",
        "description": "The launch celebration has arrived! Pull for some of Gary and Blue's best Pokemon, as well as a powerful limited Blastoise variant! For more information, use `/events`.",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["9-1"],
                [rarities.EPIC]: ["18", "59", "65", "103"],
                [rarities.RARE]: ["7", "112", "133"]
            }
        },
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/events/pokestar-launch-banner.png"
    }, */
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
    {
        "bannerType": bannerTypes.STANDARD,
        "name": "Standard",
        "description": "Standard banner with all currently available gacha Pokemon.",
        "rateUp": () => {},
    },
]

const MAX_PITY = 100;

module.exports = {
    dailyRewardChances,
    pokeballConfig,
    bannerTypes,
    bannerTypeConfig,
    bannerConfig,
    MAX_PITY,
};
