const seedrandom = require("seedrandom");
const { backpackItems } = require('./backpackConfig');
const { rarities, rarityBins, pokemonConfig, getGeneration } = require('./pokemonConfig');
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
        "name": "[EVENT] Rubber Infernape",
        "description": "The One Piece Gear 5 event is here! Pull for the limited-time Rubber Infernape, a powerful attacker who can awaken, as well as other event Epics!",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["392-1"],
                [rarities.EPIC]: ["123-1", "237-1", "289-1"]
            }
        },
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/events/pokestar-op-banner.png"
    },
    {
        "bannerType": bannerTypes.SPECIAL,
        "name": "[EVENT] Raykaido",
        "description": "The One Piece Gear 5 event is here! Pull for the limited-time Raykaido, a bruiser tank with lots of healing, as well as other event Epics!",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["384-1"],
                [rarities.EPIC]: ["123-1", "237-1", "289-1"]
            }
        },
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/events/pokestar-op-banner.png"
    },
    {
        "bannerType": bannerTypes.SPECIAL,
        "name": "[EVENT] Red Hair Mewtwo",
        "description": "The One Piece Gear 5 event is here! Pull for the limited-time Red Hair Mewtwo, a super speedy AoE attacker, as well as other event Epics!",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["150-2"],
                [rarities.EPIC]: ["123-1", "237-1", "289-1"]
            }
        },
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/events/pokestar-op-banner.png"
    },
    {
        "bannerType": bannerTypes.SPECIAL,
        "name": "[GEN 3] Legendary Golems Banner",
        "description": "Gen 3 has arrived! Pull for the legendary Regirock, Regice, Registeel, as well as other Gen 3 Pokemon! NOTE: The Golems are NOT limited and are available in all banners.",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["377", "378", "379"],
                [rarities.EPIC]: ["254", "257", "260", "272", "275", "282", "286", "289", "297", "306", "310", "319", "321", "330", "334", "344", "346", "348", "350", "365", "373", "376"],
                [rarities.RARE]: ["264", "267", "269", "277", "279", "302", "303", "324"]
            }
        }
    },
    {
        "bannerType": bannerTypes.SPECIAL,
        "name": "[GEN 3] Eon Banner",
        "description": "Gen 3 has arrived! Pull for the legendary Latias, Latios, as well as other Gen 3 Pokemon! NOTE: The Eon Pokemon are NOT limited and are available in all banners.",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["380", "381"],
                [rarities.EPIC]: ["254", "257", "260", "272", "275", "282", "286", "289", "297", "306", "310", "319", "321", "330", "334", "344", "346", "348", "350", "365", "373", "376"],
                [rarities.RARE]: ["264", "267", "269", "277", "279", "302", "303", "324"]
            }
        }
    },
    {
        "bannerType": bannerTypes.SPECIAL,
        "name": "[GEN 3] Weather Trio Banner",
        "description": "Gen 3 has arrived! Pull for the legendary Kyogre, Groudon, Rayquaza, as well as other Gen 3 Pokemon! NOTE: The Weather Trio are NOT limited and are available in all banners.",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["382", "383", "384"],
                [rarities.EPIC]: ["254", "257", "260", "272", "275", "282", "286", "289", "297", "306", "310", "319", "321", "330", "334", "344", "346", "348", "350", "365", "373", "376"],
                [rarities.RARE]: ["264", "267", "269", "277", "279", "302", "303", "324"]
            }
        }
    },
    /*{
        "bannerType": bannerTypes.SPECIAL,
        "name": "[EVENT] Billionaire Sableye",
        "description": "Trading has arrived! Pull for the rich Sableye who made a fortune trading Pokemon!",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["302-1"]
            }
        },
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/events/pokestar-trade-banner.png"
    },
    {
        "bannerType": bannerTypes.SPECIAL,
        "name": "[EVENT] Scammer Thievul",
        "description": "Trading has arrived! Pull for the devious Thievul who tricks trainers into taking unfavorable deals!",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["828-1"]
            }
        },
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/events/pokestar-trade-banner.png"
    },
    /*{
        "bannerType": bannerTypes.SPECIAL,
        "name": "[EVENT] Shadow Lugia",
        "description": "Shadow Lugia has arrived! Pull for the legendary Shadow Lugia, as well as powerful limited variations of other Gen 2 Pokemon!",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["249-1"],
                [rarities.EPIC]: ["157-1", "248-1"],
            }
        },
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/events/pokestar-gen2-banner.png"
    },
    /*{
        "bannerType": bannerTypes.SPECIAL,
        "name": "[GEN 2] Lugia's Banner",
        "description": "Gen 2 has arrived! Pull for the legendary Lugia, as well as other Gen 2 Pokemon! NOTE: Lugia is NOT limited and is available in all banners.",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["249"],
                [rarities.EPIC]: ["123", "186", "202", "213", "227", "241", "248"],
                [rarities.RARE]: ["166", "168", "184", "192", "195", "204", "228", "231"]
            }
        }
    },
    {
        "bannerType": bannerTypes.SPECIAL,
        "name": "[GEN 2] Ho-oh's Banner",
        "description": "Gen 2 has arrived! Pull for the legendary Ho-oh, as well as other Gen 2 Pokemon! NOTE: Ho-oh is NOT limited and is available in all banners.",
        "rateUp": () => {
            return {
                [rarities.LEGENDARY]: ["250"],
                [rarities.EPIC]: ["123", "186", "202", "213", "227", "241", "248"],
                [rarities.RARE]: ["166", "168", "184", "192", "195", "204", "228", "231"]
            }
        }
    },
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
    /*{
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
        "name": "[GEN 1] Rotating",
        "description": "Banner which rotates rate-up Generation I Pokemon randomly every day.",
        "rateUp": () => {
            // seedrandom using date 
            const date = getFullUTCDate();
            const rng = seedrandom(date);
            const gen1Legendaries = rarityBins[rarities.LEGENDARY].filter(p => getGeneration(p) === 1);
            const gen1Epics = rarityBins[rarities.EPIC].filter(p => getGeneration(p) === 1);
            return {
                [rarities.LEGENDARY]: drawIterable(gen1Legendaries, 1, {
                    replacement: false,
                    rng: rng,
                }),
                [rarities.EPIC]: drawIterable(gen1Epics, 3, {
                    replacement: false,
                    rng: rng,
                }),
            }
        }
    },
    {
        "bannerType": bannerTypes.ROTATING,
        "name": "[GEN 2] Rotating",
        "description": "Banner which rotates rate-up Generation II Pokemon randomly every day.",
        "rateUp": () => {
            // seedrandom using date
            const date = getFullUTCDate();
            const rng = seedrandom(date);
            const gen2Legendaries = rarityBins[rarities.LEGENDARY].filter(p => getGeneration(p) === 2);
            const gen2Epics = rarityBins[rarities.EPIC].filter(p => getGeneration(p) === 2);
            return {
                [rarities.LEGENDARY]: drawIterable(gen2Legendaries, 1, {
                    replacement: false,
                    rng: rng,
                }),
                [rarities.EPIC]: drawIterable(gen2Epics, 3, {
                    replacement: false,
                    rng: rng,
                }),
            }
        }
    },
    {
        "bannerType": bannerTypes.ROTATING,
        "name": "[GEN 3] Rotating",
        "description": "Banner which rotates rate-up Generation III Pokemon randomly every day.",
        "rateUp": () => {
            // seedrandom using date
            const date = getFullUTCDate();
            const rng = seedrandom(date);
            const gen3Legendaries = rarityBins[rarities.LEGENDARY].filter(p => getGeneration(p) === 3);
            const gen3Epics = rarityBins[rarities.EPIC].filter(p => getGeneration(p) === 3);
            return {
                [rarities.LEGENDARY]: drawIterable(gen3Legendaries, 1, {
                    replacement: false,
                    rng: rng,
                }),
                [rarities.EPIC]: drawIterable(gen3Epics, 3, {
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

const getCelebiPool = () => {
    const celebiId = "251";
    const celebiConfig = pokemonConfig[celebiId];
    // seedrandom using date 
    const date = getFullUTCDate();
    const rng = seedrandom(date);
    return {
        [rarities.LEGENDARY]: drawIterable(celebiConfig.mythicConfig[rarities.LEGENDARY], 3, {
            replacement: false,
            rng: rng,
        }),
        [rarities.EPIC]: drawIterable(celebiConfig.mythicConfig[rarities.EPIC], 3, {
            replacement: false,
            rng: rng,
        }),
    }
}

const MAX_PITY = 100;

module.exports = {
    dailyRewardChances,
    pokeballConfig,
    bannerTypes,
    bannerTypeConfig,
    bannerConfig,
    MAX_PITY,
    getCelebiPool,
};
