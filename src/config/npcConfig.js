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
    FISHERMAN: "fisherman",
    HIKER: "hiker",
    DRAGON_TAMER: "dragonTamer",
    ACE_TRAINER: "aceTrainer",
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
        emoji: "🐛",
        catchphrase: "I caught a bunch of bugs! Let's battle with them!",
        difficulties: {
            [difficulties.VERY_EASY]: {
                minLevel: 3,
                maxLevel: 5,
                numPokemon: 3,
                pokemonIds: ["10", "13"],
                aceId: "14",
            },
            [difficulties.EASY]: {
                minLevel: 12,
                maxLevel: 16,
                numPokemon: 4,
                pokemonIds: ["10", "11", "13", "14"],
                aceId: "14",
            },
            [difficulties.MEDIUM]: {
                minLevel: 24,
                maxLevel: 29,
                numPokemon: 5,
                pokemonIds: ["11", "12", "14", "15"],
                aceId: "15",
            },
            [difficulties.HARD]: {
                minLevel: 42,
                maxLevel: 51,
                numPokemon: 6,
                pokemonIds: ["12", "15", "127"],
                aceId: "15",
            },
        }
    },
    [npcs.YOUNGSTER]: {
        name: "Youngster",
        sprite: "https://archives.bulbagarden.net/media/upload/c/cd/Spr_B2W2_Youngster.png",
        emoji: "👦",
        catchphrase: "I like shorts! They're comfy and easy to wear!",
        difficulties: {
            [difficulties.VERY_EASY]: {
                minLevel: 5,
                maxLevel: 7,
                numPokemon: 3,
                pokemonIds: ["16", "19", "74", "102"],
                aceId: "16",
            },
            [difficulties.EASY]: {
                minLevel: 15,
                maxLevel: 18,
                numPokemon: 4,
                pokemonIds: ["4", "16", "19", "74", "102", "133"],
                aceId: "16",
            },
            [difficulties.MEDIUM]: {
                minLevel: 27,
                maxLevel: 33,
                numPokemon: 5,
                pokemonIds: ["5", "17", "20", "75", "103", "135"],
                aceId: "17",
            },
            [difficulties.HARD]: {
                minLevel: 46,
                maxLevel: 57,
                numPokemon: 6,
                pokemonIds: ["6", "18", "20", "76", "103", "135"],
                aceId: "18",
            },
        }
    },
    [npcs.LASS]: {
        name: "Lass",
        sprite: "https://archives.bulbagarden.net/media/upload/f/f9/Spr_B2W2_Lass.png",
        emoji: "👧",
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
                pokemonIds: ["2", "12", "25", "36", "40", "136"],
                aceId: "40",
            },
            [difficulties.HARD]: {
                minLevel: 49,
                maxLevel: 59,
                numPokemon: 6,
                pokemonIds: ["3", "12", "26", "40", "136", "143"],
                aceId: "40",
            },
        }
    },
    [npcs.FISHERMAN]: {
        name: "Fisherman",
        sprite: "https://archives.bulbagarden.net/media/upload/c/c2/Spr_DP_Fisherman.png",
        emoji: "🎣",
        catchphrase: "I'm a natural born fisherman!",
        difficulties: {
            [difficulties.VERY_EASY]: {
                minLevel: 9,
                maxLevel: 11,
                numPokemon: 3,
                pokemonIds: ["120", "129"],
                aceId: "7",
            },
            [difficulties.EASY]: {
                minLevel: 21,
                maxLevel: 26,
                numPokemon: 4,
                pokemonIds: ["7", "120", "129"],
                aceId: "7",
            },
            [difficulties.MEDIUM]: {
                minLevel: 34,
                maxLevel: 41,
                numPokemon: 5,
                pokemonIds: ["8", "121", "130", "134"],
                aceId: "130",
            },
            [difficulties.HARD]: {
                minLevel: 54,
                maxLevel: 62,
                numPokemon: 6,
                pokemonIds: ["9", "121", "130", "131", "134"],
                aceId: "130",
            },
        }
    },
    [npcs.HIKER]: {
        name: "Hiker",
        sprite: "https://archives.bulbagarden.net/media/upload/b/bc/Spr_BW_Hiker.png",
        emoji: "🧗",
        catchphrase: "I'm a Hiker, and I'm more than a match for you!",
        difficulties: {
            [difficulties.VERY_EASY]: {
                minLevel: 7,
                maxLevel: 9,
                numPokemon: 3,
                pokemonIds: ["50", "66", "74", "111"],
                aceId: "74",
            },
            [difficulties.EASY]: {
                minLevel: 17,
                maxLevel: 21,
                numPokemon: 4,
                pokemonIds: ["50", "66", "74", "81", "111"],
                aceId: "74",
            },
            [difficulties.MEDIUM]: {
                minLevel: 30,
                maxLevel: 36,
                numPokemon: 5,
                pokemonIds: ["51", "67", "75", "82", "112"],
                aceId: "75",
            },
            [difficulties.HARD]: {
                minLevel: 50,
                maxLevel: 59,
                numPokemon: 6,
                pokemonIds: ["51", "68", "76", "82", "112", "142"],
                aceId: "76",
            },
        }
    },
    [npcs.DRAGON_TAMER]: {
        name: "Dragon Tamer",
        sprite: "https://archives.bulbagarden.net/media/upload/7/70/Spr_DP_Dragon_Tamer.png",
        emoji: "🐉",
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
        emoji: "👩‍🎤",
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
        emoji: "🕶️",
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
                            [backpackItems.POKEBALL]: 2,
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
                            [backpackItems.GREATBALL]: 1,
                        },
                    }
                }
            },
        }
    },    
    [npcs.RED]: {
        name: "Red",
        sprite: "https://www.serebii.net/heartgoldsoulsilver/gym/red.png",
        emoji: "🧢",
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
                            [backpackItems.GREATBALL]: 2,
                        },
                    }
                }
            },
        }
    },
}

const dungeons = {
    MIND_TEMPLE: "mindTemple",
    //SPIRIT_ALTAR: "spiritAltar",
    //SOUL_CAVE: "soulCave",
}

const dungeonConfig = {
    [dungeons.MIND_TEMPLE]: {
        name: "Mind Temple",
        sprite: "https://archives.bulbagarden.net/media/upload/thumb/1/17/LA_Temple_of_Sinnoh.png/500px-LA_Temple_of_Sinnoh.png",
        emoji: "🏛️",
        description: `An ancient sanctuary of knowledge and wisdom. Defeat its guardians to earn ${backpackItemConfig[backpackItems.KNOWLEDGE_SHARD].emoji} ${backpackItemConfig[backpackItems.KNOWLEDGE_SHARD].name}s.`,
        difficulties: {
            [difficulties.MEDIUM]: {
                phases: [
                    {
                        rows: 3,
                        cols: 4,
                        pokemons: [
                            {
                                speciesId: "25",
                                level: 10,
                                position: 2
                            },
                            {
                                speciesId: "25",
                                level: 10,
                                position: 11,
                            },
                        ]
                    }
                ],
                rewards: {
                    backpack: {
                        [backpackCategories.MATERIALS]: {
                            [backpackItems.KNOWLEDGE_SHARD]: 3,
                        },
                    }
                }
            },
        }
    },
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