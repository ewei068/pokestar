const { backpackCategories, backpackItems, backpackItemConfig } = require("./backpackConfig");
const { getFullUTCDate } = require("../utils/utils");
const { rarities, rarityBins } = require("./pokemonConfig");
const { drawIterable } = require("../utils/gachaUtils");
const seedrandom = require("seedrandom");

const npcs = {
    BUG_CATCHER: "bugCatcher",
    YOUNGSTER: "youngster",
    LASS: "lass",
    BLUE: "blue",
    RED: "red",
    GOLD: "gold",
    // TWITCH_PLAYS_RED: "tppRed",
    FISHERMAN: "fisherman",
    HIKER: "hiker",
    AROMA_LADY: "aromaLady",
    DRAGON_TAMER: "dragonTamer",
    ACE_TRAINER: "aceTrainer",
    PALMER: "palmer",
    //TEAM_ROCKET: "teamRocket",
    //GOLD_RUSH: "goldRush",
}

const difficulties = {
    VERY_EASY: "veryEasy",
    EASY: "easy",
    MEDIUM: "medium",
    HARD: "hard",
    VERY_HARD: "veryHard",
}

// seed in case of changing days
const seed = getFullUTCDate();

const npcConfig = {
    [npcs.BUG_CATCHER]: {
        name: "Bug Catcher",
        sprite: "https://archives.bulbagarden.net/media/upload/0/0b/Spr_DP_Bug_Catcher.png",
        emoji: "<:bugcatcher:1117871382399815812>",
        catchphrase: "I caught a bunch of bugs! Let's battle with them!",
        difficulties: {
            [difficulties.VERY_EASY]: {
                minLevel: 3,
                maxLevel: 5,
                numPokemon: 3,
                pokemonIds: ["10", "13", "165", "167"],
                aceId: "14",
            },
            [difficulties.EASY]: {
                minLevel: 12,
                maxLevel: 16,
                numPokemon: 4,
                pokemonIds: ["10", "11", "13", "14", "165", "167"],
                aceId: "14",
            },
            [difficulties.MEDIUM]: {
                minLevel: 24,
                maxLevel: 29,
                numPokemon: 5,
                pokemonIds: ["11", "12", "14", "15", "123", "166", "168"],
                aceId: "15",
            },
            [difficulties.HARD]: {
                minLevel: 42,
                maxLevel: 51,
                numPokemon: 6,
                pokemonIds: ["12", "15", "123", "127", "166", "168", "212"],
                aceId: "15",
            },
        }
    },
    [npcs.YOUNGSTER]: {
        name: "Youngster",
        sprite: "https://archives.bulbagarden.net/media/upload/c/cd/Spr_B2W2_Youngster.png",
        emoji: "<:youngster:1117871511844421662>",
        catchphrase: "I like shorts! They're comfy and easy to wear!",
        difficulties: {
            [difficulties.VERY_EASY]: {
                minLevel: 5,
                maxLevel: 7,
                numPokemon: 3,
                pokemonIds: ["16", "19", "74", "102", "163"],
                aceId: "16",
            },
            [difficulties.EASY]: {
                minLevel: 15,
                maxLevel: 18,
                numPokemon: 4,
                pokemonIds: ["4", "16", "19", "74", "102", "133", "164"],
                aceId: "16",
            },
            [difficulties.MEDIUM]: {
                minLevel: 27,
                maxLevel: 33,
                numPokemon: 5,
                pokemonIds: ["5", "17", "20", "75", "103", "135", "197"],
                aceId: "17",
            },
            [difficulties.HARD]: {
                minLevel: 46,
                maxLevel: 57,
                numPokemon: 6,
                pokemonIds: ["6", "18", "20", "76", "103", "135", "197"],
                aceId: "18",
            },
        }
    },
    [npcs.LASS]: {
        name: "Lass",
        sprite: "https://archives.bulbagarden.net/media/upload/f/f9/Spr_B2W2_Lass.png",
        emoji: "<:lass:1117871390087991458>",
        catchphrase: "I'm cute, but deadly!",
        difficulties: {
            [difficulties.VERY_EASY]: {
                minLevel: 6,
                maxLevel: 8,
                numPokemon: 3,
                pokemonIds: ["1", "10", "35", "39"],
                aceId: "39",
            },
            [difficulties.EASY]: {
                minLevel: 16,
                maxLevel: 20,
                numPokemon: 4,
                pokemonIds: ["1", "11", "35", "39", "133"],
                aceId: "39",
            },
            [difficulties.MEDIUM]: {
                minLevel: 29,
                maxLevel: 36,
                numPokemon: 5,
                pokemonIds: ["2", "12", "25", "36", "40", "136", "196"],
                aceId: "40",
            },
            [difficulties.HARD]: {
                minLevel: 49,
                maxLevel: 59,
                numPokemon: 6,
                pokemonIds: ["3", "12", "26", "40", "136", "143", "196"],
                aceId: "40",
            },
        }
    },
    [npcs.FISHERMAN]: {
        name: "Fisherman",
        sprite: "https://archives.bulbagarden.net/media/upload/c/c2/Spr_DP_Fisherman.png",
        emoji: "<:fisherman:1117871385264533604>",
        catchphrase: "I'm a natural born fisherman!",
        difficulties: {
            [difficulties.VERY_EASY]: {
                minLevel: 9,
                maxLevel: 11,
                numPokemon: 3,
                pokemonIds: ["120", "129", "183"],
                aceId: "7",
            },
            [difficulties.EASY]: {
                minLevel: 21,
                maxLevel: 26,
                numPokemon: 4,
                pokemonIds: ["7", "120", "129", "183"],
                aceId: "7",
            },
            [difficulties.MEDIUM]: {
                minLevel: 34,
                maxLevel: 41,
                numPokemon: 5,
                pokemonIds: ["8", "121", "130", "134", "184"],
                aceId: "130",
            },
            [difficulties.HARD]: {
                minLevel: 54,
                maxLevel: 62,
                numPokemon: 6,
                pokemonIds: ["9", "121", "130", "131", "134", "184"],
                aceId: "130",
            },
        }
    },
    [npcs.HIKER]: {
        name: "Hiker",
        sprite: "https://archives.bulbagarden.net/media/upload/b/bc/Spr_BW_Hiker.png",
        emoji: "<:hiker:1117871386535407827>",
        catchphrase: "I'm a Hiker, and I'm more than a match for you!",
        difficulties: {
            [difficulties.VERY_EASY]: {
                minLevel: 7,
                maxLevel: 9,
                numPokemon: 3,
                pokemonIds: ["50", "66", "74", "95", "111"],
                aceId: "74",
            },
            [difficulties.EASY]: {
                minLevel: 17,
                maxLevel: 21,
                numPokemon: 4,
                pokemonIds: ["50", "66", "74", "95", "111"],
                aceId: "74",
            },
            [difficulties.MEDIUM]: {
                minLevel: 30,
                maxLevel: 36,
                numPokemon: 5,
                pokemonIds: ["51", "67", "75", "95", "112"],
                aceId: "75",
            },
            [difficulties.HARD]: {
                minLevel: 50,
                maxLevel: 59,
                numPokemon: 6,
                pokemonIds: ["51", "68", "76", "112", "142", "208"],
                aceId: "248",
            },
        }
    },
    [npcs.AROMA_LADY]: {
        name: "Aroma Lady",
        sprite: "https://archives.bulbagarden.net/media/upload/6/6f/Spr_DP_Aroma_Lady.png",
        emoji: "<:aromalady:1125493188942102538>",
        catchphrase: "I'm a bit of a handful!",
        difficulties: {
            [difficulties.VERY_EASY]: {
                minLevel: 8,
                maxLevel: 10,
                numPokemon: 3,
                pokemonIds: ["43", "187", "191"],
                aceId: "152",
            },
            [difficulties.EASY]: {
                minLevel: 18,
                maxLevel: 22,
                numPokemon: 4,
                pokemonIds: ["43", "152", "187", "192"],
                aceId: "44",
            },
            [difficulties.MEDIUM]: {
                minLevel: 33,
                maxLevel: 40,
                numPokemon: 5,
                pokemonIds: ["44", "153", "188", "192"],
                aceId: "44",
            },
            [difficulties.HARD]: {
                minLevel: 53,
                maxLevel: 62,
                numPokemon: 6,
                pokemonIds: ["3", "45", "154", "189", "192"],
                aceId: "182",
            },
        }
    },
    [npcs.DRAGON_TAMER]: {
        name: "Dragon Tamer",
        sprite: "https://archives.bulbagarden.net/media/upload/7/70/Spr_DP_Dragon_Tamer.png",
        emoji: "<:dragontamer:1117871383599382650>",
        catchphrase: "Dragons are totally my thing!",
        difficulties: {
            [difficulties.EASY]: {
                minLevel: 20,
                maxLevel: 24,
                numPokemon: 4,
                pokemonIds: ["5", "147"],
                aceId: "147",
            },
            [difficulties.MEDIUM]: {
                minLevel: 32,
                maxLevel: 38,
                numPokemon: 5,
                pokemonIds: ["6", "130", "148"],
                aceId: "148",
            },
            [difficulties.HARD]: {
                minLevel: 52,
                maxLevel: 59,
                numPokemon: 6,
                pokemonIds: ["6", "130", "149"],
                aceId: "149",
            },
            [difficulties.VERY_HARD]: {
                minLevel: 70,
                maxLevel: 78,
                numPokemon: 6,
                pokemonIds: ["6", "130", "149"],
                aceId: "149",
            },
        }
    },
    [npcs.ACE_TRAINER]: {
        name: "Ace Trainer",
        sprite: "https://archives.bulbagarden.net/media/upload/c/c9/Spr_BW_Ace_Trainer_F.png",
        emoji: "<:acetrainer:1117871378855645295>",
        catchphrase: "I'm an Ace Trainer, got it?",
        difficulties: {
            [difficulties.MEDIUM]: {
                minLevel: 33,
                maxLevel: 38,
                numPokemon: 5,
                pokemonIds: drawIterable(rarityBins[rarities.RARE], 10, {
                    replacement: false, 
                    rng: seedrandom(seed)
                }),
                aceId: "25",
            },
            [difficulties.HARD]: {
                minLevel: 53,
                maxLevel: 60,
                numPokemon: 6,
                pokemonIds: drawIterable(rarityBins[rarities.EPIC], 10, {
                    replacement: false, 
                    rng: seedrandom(seed)
                }),
                aceId: "149",
            },
            [difficulties.VERY_HARD]: {
                minLevel: 75,
                maxLevel: 83,
                numPokemon: 6,
                pokemonIds: drawIterable(rarityBins[rarities.EPIC], 10, {
                    replacement: false, 
                    rng: seedrandom(seed)
                }),
                aceId: "149",
            },
        }
    },
    [npcs.BLUE]: {
        name: "Blue",
        sprite: "https://archives.bulbagarden.net/media/upload/f/f4/Spr_B2W2_Blue.png",
        emoji: "<:blue:1117871380172648600>",
        catchphrase: "Smell ya later!",
        difficulties: {
            [difficulties.EASY]: {
                minLevel: 15,
                maxLevel: 18,
                numPokemon: 4,
                pokemonIds: ["17", "20", "63"],
                aceId: "8",
                dailyRewards: {
                    backpack: {
                        [backpackCategories.POKEBALLS]: {
                            [backpackItems.POKEBALL]: 1,
                        },
                    }
                }
            },
            [difficulties.MEDIUM]: {
                minLevel: 35,
                maxLevel: 39,
                numPokemon: 5,
                pokemonIds: ["18", "58", "65", "102"],
                aceId: "9-1",
                dailyRewards: {
                    backpack: {
                        [backpackCategories.POKEBALLS]: {
                            [backpackItems.POKEBALL]: 1,
                        },
                    }
                }
            },
            [difficulties.HARD]: {
                minLevel: 59,
                maxLevel: 64,
                numPokemon: 6,
                pokemonIds: ["18", "59", "65", "103", "112"],
                aceId: "9-1",
                dailyRewards: {
                    backpack: {
                        [backpackCategories.POKEBALLS]: {
                            [backpackItems.POKEBALL]: 1,
                        },
                    }
                }
            },
        }
    },    
    [npcs.RED]: {
        name: "Red",
        sprite: "https://www.serebii.net/heartgoldsoulsilver/gym/red.png",
        emoji: "<:red:1117871509185249280>",
        catchphrase: "...!",
        difficulties: {
            [difficulties.VERY_HARD]: {
                minLevel: 80,
                maxLevel: 87,
                numPokemon: 6,
                pokemonIds: ["3", "6", "9", "131", "143"],
                aceId: "25-1",
                dailyRewards: {
                    backpack: {
                        [backpackCategories.POKEBALLS]: {
                            [backpackItems.POKEBALL]: 2,
                        },
                    }
                }
            },
        }
    },
    [npcs.GOLD]: {
        name: "Gold",
        sprite: "https://archives.bulbagarden.net/media/upload/a/a5/Spr_HGSS_Ethan.png",
        emoji: "<:gold:1125493190900854784>",
        catchphrase: "Nobody reads these, right?",
        difficulties: {
            [difficulties.MEDIUM]: {
                minLevel: 40,
                maxLevel: 45,
                numPokemon: 5,
                pokemonIds: ["180", "184", "231", "247"],
                aceId: "156",
                dailyRewards: {
                    backpack: {
                        [backpackCategories.POKEBALLS]: {
                            [backpackItems.POKEBALL]: 1,
                        },
                    }
                }
            },
            [difficulties.VERY_HARD]: {
                minLevel: 85,
                maxLevel: 99,
                numPokemon: 6,
                pokemonIds: ["157", "181", "184", "232", "248"],
                aceId: "249",
                dailyRewards: {
                    backpack: {
                        [backpackCategories.POKEBALLS]: {
                            [backpackItems.POKEBALL]: 2,
                        },
                    }
                }
            },
        }
    },
    [npcs.PALMER]: {
        name: "Tower Tycoon Palmer",
        sprite: "https://archives.bulbagarden.net/media/upload/f/f4/Spr_DP_Palmer.png",
        emoji: "<:palmer:1119396349604020294>",
        catchphrase: "Show me the skill you've acquired as a Trainer!",
        difficulties: {
            [difficulties.VERY_HARD]: {
                minLevel: 100,
                maxLevel: 119,
                numPokemon: 6,
                pokemonIds: ["9-1", "52-1", "136-1", "144", "145-1", "150", "150-1", "249", "250"],
                aceId: "20101",
                dailyRewards: {
                    backpack: {
                        [backpackCategories.MATERIALS]: {
                            [backpackItems.MINT]: 1,
                        },
                    }
                }
            },
        }
    },
    /*[npcs.TWITCH_PLAYS_RED]: {
        name: "Twitch Plays Red",
        sprite: "https://archives.bulbagarden.net/media/upload/6/66/Spr_RG_Red_1.png",
        emoji: "<:tppRed:1117871510804254760>",
        catchphrase: "⬆⬆⬇⬇⬅➔⬅➔BAAAAAAAAAAAAAAAAA",
        difficulties: {
            [difficulties.VERY_HARD]: {
                minLevel: 90,
                maxLevel: 100,
                numPokemon: 6,
                pokemonIds: ["18-1", "34-1", "49-1", "131-1", "145-1"],
                aceId: "139-1",
                dailyRewards: {
                    backpack: {
                        [backpackCategories.POKEBALLS]: {
                            [backpackItems.GREATBALL]: 2,
                        },
                    }
                }
            },
        }
    },
    [npcs.TEAM_ROCKET]: {
        name: "Team Rocket",
        sprite: "https://archives.bulbagarden.net/media/upload/8/8f/Spr_Y_Jessie_James.png",
        emoji: "<:james:1117871387399426090><:jessie:1117871388653531167>",
        catchphrase: "Prepare for trouble... and make it double!",
        difficulties: {
            [difficulties.HARD]: {
                minLevel: 59,
                maxLevel: 68,
                numPokemon: 6,
                pokemonIds: ["24-1", "71", "108", "110-1"],
                aceId: "52-1",
                dailyRewards: {
                    backpack: {
                        [backpackCategories.POKEBALLS]: {
                            [backpackItems.GREATBALL]: 1,
                        },
                    }
                }
            },
        }
    },
    [npcs.GOLD_RUSH]: {
        name: "Gold Rush",
        sprite: "https://archives.bulbagarden.net/media/upload/9/95/Spr_2c_052_s.png",
        emoji: "<:rocketmeowth:1117873583537016832>",
        catchphrase: "Meow...",
        difficulties: {
            [difficulties.HARD]: {
                minLevel: 49,
                maxLevel: 55,
                numPokemon: 6,
                pokemonIds: ["52", "52-1", "53"],
                aceId: "52-1",
                rewardMultipliers: {
                    moneyMultiplier: 5,
                    expMultiplier: 1.5,
                    pokemonExpMultiplier: 0.15,
                }
            },
        }
    },      */
}

const dungeons = {
    MIND_TEMPLE: "mindTemple",
    SOUL_CAVE: "soulCave",
    SPIRIT_ALTAR: "spiritAltar",
    NEW_ISLAND: "newIsland",
    //BLOODY_SUNDAY: "bloodySunday",
}

const dungeonConfig = {
    [dungeons.MIND_TEMPLE]: {
        name: "Mind Temple",
        sprite: "https://archives.bulbagarden.net/media/upload/thumb/1/17/LA_Temple_of_Sinnoh.png/500px-LA_Temple_of_Sinnoh.png",
        emoji: "🏛️",
        description: `An ancient sanctuary of knowledge and wisdom. Defeat its guardians to earn ${backpackItemConfig[backpackItems.KNOWLEDGE_SHARD].emoji} ${backpackItemConfig[backpackItems.KNOWLEDGE_SHARD].name}s.`,
        bosses: ["20091", "20144"],
        difficulties: {
            [difficulties.MEDIUM]: {
                phases: [
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "213",
                                level: 55,
                                position: 1
                            },
                            {
                                speciesId: "213",
                                level: 55,
                                position: 4,
                            },
                            {
                                speciesId: "208",
                                level: 60,
                                position: 9,
                            },
                            {
                                speciesId: "208",
                                level: 60,
                                position: 12,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "197",
                                level: 55,
                                position: 1
                            },
                            {
                                speciesId: "197",
                                level: 55,
                                position: 4,
                            },
                            {
                                speciesId: "122",
                                level: 60,
                                position: 10,
                            },
                            {
                                speciesId: "122",
                                level: 60,
                                position: 11,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 5,
                        pokemons: [
                            {
                                speciesId: "213",
                                level: 60,
                                position: 1,
                            },
                            {
                                speciesId: "122",
                                level: 65,
                                position: 2
                            },
                            {
                                speciesId: "208",
                                level: 65,
                                position: 4,
                            },
                            {
                                speciesId: "197",
                                level: 60,
                                position: 5,
                            },
                            {
                                speciesId: "20091",
                                level: 70,
                                position: 12,
                            },
                            {
                                speciesId: "20144",
                                level: 70,
                                position: 14,
                            },
                        ]
                    },
                ],
                rewards: {
                    backpack: {
                        [backpackCategories.MATERIALS]: {
                            [backpackItems.KNOWLEDGE_SHARD]: 3,
                        },
                    }
                }
            },
            [difficulties.HARD]: {
                phases: [
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "213",
                                level: 85,
                                position: 1
                            },
                            {
                                speciesId: "213",
                                level: 85,
                                position: 4,
                            },
                            {
                                speciesId: "208",
                                level: 90,
                                position: 9,
                            },
                            {
                                speciesId: "208",
                                level: 90,
                                position: 12,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "197",
                                level: 85,
                                position: 1
                            },
                            {
                                speciesId: "197",
                                level: 85,
                                position: 4,
                            },
                            {
                                speciesId: "122",
                                level: 90,
                                position: 10,
                            },
                            {
                                speciesId: "122",
                                level: 90,
                                position: 11,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 5,
                        pokemons: [
                            {
                                speciesId: "213",
                                level: 90,
                                position: 1,
                            },
                            {
                                speciesId: "122",
                                level: 95,
                                position: 2
                            },
                            {
                                speciesId: "208",
                                level: 95,
                                position: 4,
                            },
                            {
                                speciesId: "197",
                                level: 90,
                                position: 5,
                            },
                            {
                                speciesId: "20091",
                                level: 100,
                                position: 12,
                            },
                            {
                                speciesId: "20144",
                                level: 100,
                                position: 14,
                            },
                        ]
                    },
                ],
                rewards: {
                    backpack: {
                        [backpackCategories.MATERIALS]: {
                            [backpackItems.KNOWLEDGE_SHARD]: 6,
                        },
                    }
                }
            },
            [difficulties.VERY_HARD]: {
                phases: [
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "213",
                                level: 115,
                                position: 1
                            },
                            {
                                speciesId: "213",
                                level: 115,
                                position: 4,
                            },
                            {
                                speciesId: "208",
                                level: 120,
                                position: 9,
                            },
                            {
                                speciesId: "208",
                                level: 120,
                                position: 12,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "197",
                                level: 115,
                                position: 1
                            },
                            {
                                speciesId: "197",
                                level: 115,
                                position: 4,
                            },
                            {
                                speciesId: "122",
                                level: 120,
                                position: 10,
                            },
                            {
                                speciesId: "122",
                                level: 120,
                                position: 11,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 5,
                        pokemons: [
                            {
                                speciesId: "213",
                                level: 115,
                                position: 1,
                            },
                            {
                                speciesId: "122",
                                level: 120,
                                position: 2
                            },
                            {
                                speciesId: "208",
                                level: 120,
                                position: 4,
                            },
                            {
                                speciesId: "197",
                                level: 115,
                                position: 5,
                            },
                            {
                                speciesId: "20091",
                                level: 130,
                                position: 12,
                            },
                            {
                                speciesId: "20144",
                                level: 130,
                                position: 14,
                            },
                        ]
                    },
                ],
                rewards: {
                    backpack: {
                        [backpackCategories.MATERIALS]: {
                            [backpackItems.KNOWLEDGE_SHARD]: 10,
                        },
                    }
                }
            },
        }
    },
    [dungeons.SOUL_CAVE]: {
        name: "Soul Cave",
        sprite: "https://archives.bulbagarden.net/media/upload/0/06/Echo_Cave_RTDX.png",
        emoji: "⛰",
        description: `An ancient cavern containing the primordial energy that birthed the souls of all Pokemon. Defeat its dwellers to earn ${backpackItemConfig[backpackItems.EMOTION_SHARD].emoji} ${backpackItemConfig[backpackItems.EMOTION_SHARD].name}s.`,
        bosses: ["20101", "20113"],
        difficulties: {
            [difficulties.MEDIUM]: {
                phases: [
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "131",
                                level: 55,
                                position: 2
                            },
                            {
                                speciesId: "131",
                                level: 55,
                                position: 3,
                            },
                            {
                                speciesId: "51",
                                level: 60,
                                position: 9,
                            },
                            {
                                speciesId: "51",
                                level: 60,
                                position: 12,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "40",
                                level: 55,
                                position: 2
                            },
                            {
                                speciesId: "40",
                                level: 55,
                                position: 3,
                            },
                            {
                                speciesId: "135",
                                level: 60,
                                position: 10,
                            },
                            {
                                speciesId: "135",
                                level: 60,
                                position: 11,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 5,
                        pokemons: [
                            {
                                speciesId: "142",
                                level: 60,
                                position: 1,
                            },
                            {
                                speciesId: "143",
                                level: 65,
                                position: 2
                            },
                            {
                                speciesId: "202",
                                level: 65,
                                position: 4,
                            },
                            {
                                speciesId: "169",
                                level: 60,
                                position: 5,
                            },
                            {
                                speciesId: "20113",
                                level: 70,
                                position: 8,
                            },
                            {
                                speciesId: "20101",
                                level: 70,
                                position: 13,
                            },
                        ]
                    },
                ],
                rewards: {
                    backpack: {
                        [backpackCategories.MATERIALS]: {
                            [backpackItems.EMOTION_SHARD]: 3,
                        },
                    }
                }
            },
            [difficulties.HARD]: {
                phases: [
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "131",
                                level: 85,
                                position: 2
                            },
                            {
                                speciesId: "131",
                                level: 85,
                                position: 3,
                            },
                            {
                                speciesId: "51",
                                level: 90,
                                position: 9,
                            },
                            {
                                speciesId: "51",
                                level: 90,
                                position: 12,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "40",
                                level: 85,
                                position: 2
                            },
                            {
                                speciesId: "40",
                                level: 85,
                                position: 3,
                            },
                            {
                                speciesId: "135",
                                level: 90,
                                position: 10,
                            },
                            {
                                speciesId: "135",
                                level: 90,
                                position: 11,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 5,
                        pokemons: [
                            {
                                speciesId: "142",
                                level: 90,
                                position: 1,
                            },
                            {
                                speciesId: "143",
                                level: 95,
                                position: 2
                            },
                            {
                                speciesId: "202",
                                level: 95,
                                position: 4,
                            },
                            {
                                speciesId: "169",
                                level: 90,
                                position: 5,
                            },
                            {
                                speciesId: "20113",
                                level: 100,
                                position: 8,
                            },
                            {
                                speciesId: "20101",
                                level: 100,
                                position: 13,
                            },
                        ]
                    },
                ],
                rewards: {
                    backpack: {
                        [backpackCategories.MATERIALS]: {
                            [backpackItems.EMOTION_SHARD]: 6,
                        },
                    }
                }
            },
            [difficulties.VERY_HARD]: {
                phases: [
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "131",
                                level: 110,
                                position: 2
                            },
                            {
                                speciesId: "131",
                                level: 110,
                                position: 3,
                            },
                            {
                                speciesId: "51",
                                level: 110,
                                position: 9,
                            },
                            {
                                speciesId: "51",
                                level: 110,
                                position: 12,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "40",
                                level: 115,
                                position: 2
                            },
                            {
                                speciesId: "40",
                                level: 115,
                                position: 3,
                            },
                            {
                                speciesId: "135",
                                level: 115,
                                position: 10,
                            },
                            {
                                speciesId: "135",
                                level: 115,
                                position: 11,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 5,
                        pokemons: [
                            {
                                speciesId: "142",
                                level: 115,
                                position: 1,
                            },
                            {
                                speciesId: "143",
                                level: 120,
                                position: 2
                            },
                            {
                                speciesId: "202",
                                level: 120,
                                position: 4,
                            },
                            {
                                speciesId: "169",
                                level: 115,
                                position: 5,
                            },
                            {
                                speciesId: "20113",
                                level: 130,
                                position: 8,
                            },
                            {
                                speciesId: "20101",
                                level: 130,
                                position: 13,
                            },
                        ]
                    },
                ],
                rewards: {
                    backpack: {
                        [backpackCategories.MATERIALS]: {
                            [backpackItems.EMOTION_SHARD]: 10,
                        },
                    }
                }
            },
        }
    },
    [dungeons.SPIRIT_ALTAR]: {
        name: "Spirit Altar",
        sprite: "https://static.wikia.nocookie.net/victoryroad/images/a/ab/Altar_of_the_Moone_TCG.png/revision/latest?cb=20190329010127",
        emoji: "⛩️",
        description: `An ancient shrine dedicated to the sacred spirits of Pokemon. Defeat its worshippers to earn ${backpackItemConfig[backpackItems.WILLPOWER_SHARD].emoji} ${backpackItemConfig[backpackItems.WILLPOWER_SHARD].name}s.`,
        bosses: ["20149", "20150"],
        difficulties: {
            [difficulties.MEDIUM]: {
                phases: [
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "99",
                                level: 55,
                                position: 2
                            },
                            {
                                speciesId: "99",
                                level: 55,
                                position: 3,
                            },
                            {
                                speciesId: "136",
                                level: 60,
                                position: 10,
                            },
                            {
                                speciesId: "136",
                                level: 60,
                                position: 11,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "94",
                                level: 55,
                                position: 2
                            },
                            {
                                speciesId: "94",
                                level: 55,
                                position: 3,
                            },
                            {
                                speciesId: "65",
                                level: 60,
                                position: 9,
                            },
                            {
                                speciesId: "65",
                                level: 60,
                                position: 12,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 5,
                        pokemons: [
                            {
                                speciesId: "99",
                                level: 60,
                                position: 2,
                            },
                            {
                                speciesId: "94",
                                level: 60,
                                position: 4,
                            },
                            {
                                speciesId: "65",
                                level: 65,
                                position: 6,
                            },
                            {
                                speciesId: "248",
                                level: 65,
                                position: 10,
                            },
                            {
                                speciesId: "20149",
                                level: 70,
                                position: 12,
                            },
                            {
                                speciesId: "20150",
                                level: 70,
                                position: 14,
                            },
                        ]
                    },
                ],
                rewards: {
                    backpack: {
                        [backpackCategories.MATERIALS]: {
                            [backpackItems.WILLPOWER_SHARD]: 3,
                        },
                    }
                }
            },
            [difficulties.HARD]: {
                phases: [
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "99",
                                level: 85,
                                position: 2
                            },
                            {
                                speciesId: "99",
                                level: 85,
                                position: 3,
                            },
                            {
                                speciesId: "136",
                                level: 90,
                                position: 10,
                            },
                            {
                                speciesId: "136",
                                level: 90,
                                position: 11,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "94",
                                level: 85,
                                position: 2
                            },
                            {
                                speciesId: "94",
                                level: 85,
                                position: 3,
                            },
                            {
                                speciesId: "65",
                                level: 90,
                                position: 9,
                            },
                            {
                                speciesId: "65",
                                level: 90,
                                position: 12,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 5,
                        pokemons: [
                            {
                                speciesId: "99",
                                level: 70,
                                position: 2,
                            },
                            {
                                speciesId: "94",
                                level: 70,
                                position: 4,
                            },
                            {
                                speciesId: "65",
                                level: 95,
                                position: 6,
                            },
                            {
                                speciesId: "248",
                                level: 95,
                                position: 10,
                            },
                            {
                                speciesId: "20149",
                                level: 100,
                                position: 12,
                            },
                            {
                                speciesId: "20150",
                                level: 100,
                                position: 14,
                            },
                        ]
                    },
                ],
                rewards: {
                    backpack: {
                        [backpackCategories.MATERIALS]: {
                            [backpackItems.WILLPOWER_SHARD]: 6,
                        },
                    }
                }
            },
            [difficulties.VERY_HARD]: {
                phases: [
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "99",
                                level: 115,
                                position: 2
                            },
                            {
                                speciesId: "99",
                                level: 115,
                                position: 3,
                            },
                            {
                                speciesId: "136",
                                level: 120,
                                position: 10,
                            },
                            {
                                speciesId: "136",
                                level: 120,
                                position: 11,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "94",
                                level: 115,
                                position: 2
                            },
                            {
                                speciesId: "94",
                                level: 115,
                                position: 3,
                            },
                            {
                                speciesId: "65",
                                level: 120,
                                position: 9,
                            },
                            {
                                speciesId: "65",
                                level: 120,
                                position: 12,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 5,
                        pokemons: [
                            {
                                speciesId: "99",
                                level: 115,
                                position: 2,
                            },
                            {
                                speciesId: "94",
                                level: 115,
                                position: 4,
                            },
                            {
                                speciesId: "65",
                                level: 120,
                                position: 6,
                            },
                            {
                                speciesId: "248",
                                level: 120,
                                position: 10,
                            },
                            {
                                speciesId: "20149",
                                level: 130,
                                position: 12,
                            },
                            {
                                speciesId: "20150",
                                level: 130,
                                position: 14,
                            },
                        ]
                    },
                ],
                rewards: {
                    backpack: {
                        [backpackCategories.MATERIALS]: {
                            [backpackItems.WILLPOWER_SHARD]: 10,
                        },
                    }
                }
            },
        },
    },
    [dungeons.NEW_ISLAND]: {
        name: "New Island",
        sprite: "https://e0.pxfuel.com/wallpapers/343/331/desktop-wallpaper-pokemon-the-movie-mewtwo-strikes-back-anime-board-pokemon-the-first-movie-mewtwo-strikes-back.jpg",
        emoji: "🏝️",
        description: `The secret Team Rocket hideout and the birthplace of Mewtwo. Defeat Giovanni, Armored Mewtwo, and his clones to receive the Mythical <:151:1116755839919853670> Mew!`,
        bosses: ["25-1", "52-1", "150-1"],
        difficulties: {
            [difficulties.HARD]: {
                phases: [
                    {
                        rows: 3,
                        cols: 5,
                        pokemons: [
                            {
                                speciesId: "31",
                                level: 90,
                                position: 2,
                            },
                            {
                                speciesId: "34",
                                level: 90,
                                position: 4,
                            },
                            {
                                speciesId: "51",
                                level: 90,
                                position: 6,
                            },
                            {
                                speciesId: "112",
                                level: 90,
                                position: 10,
                            },
                            {
                                speciesId: "53",
                                level: 100,
                                position: 13,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 5,
                        pokemons: [
                            {
                                speciesId: "3",
                                level: 100,
                                position: 1,
                            },
                            {
                                speciesId: "6",
                                level: 100,
                                position: 3,
                            },
                            {
                                speciesId: "9",
                                level: 100,
                                position: 5,
                            },
                            {
                                speciesId: "25-1",
                                level: 105,
                                position: 7,
                            },
                            {
                                speciesId: "52-1",
                                level: 105,
                                position: 9,
                            },
                            {
                                speciesId: "150-1",
                                level: 110,
                                position: 13,
                            },
                        ]
                    },
                ],
                rewards: {
                    backpack: {
                        [backpackCategories.MATERIALS]: {
                            [backpackItems.KNOWLEDGE_SHARD]: 1,
                            [backpackItems.EMOTION_SHARD]: 1,
                            [backpackItems.WILLPOWER_SHARD]: 1,
                        },
                    }
                },
                rewardString: "**Congratulations! If this is your first time defeating New Island, use `/mew` to obtain your Mew!**",
            },
        }
    },
    /*[dungeons.BLOODY_SUNDAY]: {
        name: "Bloody Sunday",
        sprite: "https://external-preview.redd.it/mJjUWHxEKQ674NI4m7hUSJ108UlpTgTH2vWSmwMHfdA.jpg?auto=webp&s=6c0601add4b5a74185844ebaff16bebb3ada41a5",
        emoji: "🖥️",
        description: `The site of the terrifying massacre and sacrifice known as Bloody Sunday. First, capture Zapdos from the Power Plant. Then, retrieve it from the PC...`,
        bosses: ["136-1", "145-1"],
        difficulties: {
            [difficulties.HARD]: {
                phases: [
                    {
                        rows: 3,
                        cols: 5,
                        pokemons: [
                            {
                                speciesId: "145",
                                level: 90,
                                position: 8,
                            },
                            {
                                speciesId: "101",
                                level: 85,
                                position: 11,
                            },
                            {
                                speciesId: "82",
                                level: 85,
                                position: 12,
                            },
                            {
                                speciesId: "26",
                                level: 85,
                                position: 13,
                            },
                            {
                                speciesId: "82",
                                level: 85,
                                position: 14,
                            },
                            {
                                speciesId: "101",
                                level: 85,
                                position: 15,
                            },
                        ]
                    },
                    {
                        rows: 3,
                        cols: 5,
                        pokemons: [
                            {
                                speciesId: "32",
                                level: 95,
                                position: 1,
                            },
                            {
                                speciesId: "44",
                                level: 95,
                                position: 2,
                            },
                            {
                                speciesId: "20",
                                level: 95,
                                position: 3,
                            },
                            {
                                speciesId: "83",
                                level: 95,
                                position: 4,
                            },
                            {
                                speciesId: "32",
                                level: 95,
                                position: 5,
                            },
                            {
                                speciesId: "48",
                                level: 95,
                                position: 6,
                            },
                            {
                                speciesId: "46",
                                level: 95,
                                position: 7,
                            },
                            {
                                speciesId: "74",
                                level: 95,
                                position: 8,
                            },
                            {
                                speciesId: "102",
                                level: 95,
                                position: 9,
                            },
                            {
                                speciesId: "48",
                                level: 95,
                                position: 10,
                            },
                            {
                                speciesId: "136-1",
                                level: 100,
                                position: 12,
                            },
                            {
                                speciesId: "145-1",
                                level: 100,
                                position: 14,
                            },
                        ]
                    },
                ],
                rewards: {
                    backpack: {
                        [backpackCategories.MATERIALS]: {
                            [backpackItems.KNOWLEDGE_SHARD]: 2,
                            [backpackItems.EMOTION_SHARD]: 2,
                            [backpackItems.WILLPOWER_SHARD]: 2,
                        },
                    }
                }
            },
        },
    },*/
}


const difficultyConfig = {
    [difficulties.VERY_EASY]: {
        name: "Very Easy",
        rewardMultipliers: {
            moneyMultiplier: 0.5,
            expMultiplier: 0.5,
            pokemonExpMultiplier: 0.15,
        }
    },
    [difficulties.EASY]: {
        name: "Easy",
        rewardMultipliers: {
            moneyMultiplier: 1,
            expMultiplier: 1,
            pokemonExpMultiplier: 0.15,
        }
    },
    [difficulties.MEDIUM]: {
        name: "Medium",
        rewardMultipliers: {
            moneyMultiplier: 1.5,
            expMultiplier: 1.5,
            pokemonExpMultiplier: 0.175,
        }
    },
    [difficulties.HARD]: {
        name: "Hard",
        rewardMultipliers: {
            moneyMultiplier: 2,
            expMultiplier: 2,
            pokemonExpMultiplier: 0.2,
        }
    },
    [difficulties.VERY_HARD]: {
        name: "Very Hard",
        rewardMultipliers: {
            moneyMultiplier: 3.5,
            expMultiplier: 3.5,
            pokemonExpMultiplier: 0.25,
        }
    },
}

module.exports = {
    npcs,
    difficulties,
    npcConfig,
    dungeons,
    dungeonConfig,
    difficultyConfig,
}