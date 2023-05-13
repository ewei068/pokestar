const npcs = {
    BUG_CATCHER: "bugCatcher",
    YOUNGSTER: "youngster",
    LASS: "lass",
    RED: "red",
    FISHERMAN: "fisherman",
}

const difficulties = {
    VERY_EASY: "veryEasy",
    EASY: "easy",
    MEDIUM: "medium",
    HARD: "hard",
    VERY_HARD: "veryHard",
}

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
                pokemonIds: ["12", "15"],
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
                pokemonIds: ["4", "18", "20"],
                aceId: "18",
            },
            [difficulties.EASY]: {
                minLevel: 15,
                maxLevel: 18,
                numPokemon: 4,
                pokemonIds: ["4", "18", "20", "76"],
                aceId: "18",
            },
            [difficulties.MEDIUM]: {
                minLevel: 27,
                maxLevel: 33,
                numPokemon: 5,
                pokemonIds: ["5", "18", "20", "76", "135"],
                aceId: "18",
            },
            [difficulties.HARD]: {
                minLevel: 46,
                maxLevel: 57,
                numPokemon: 6,
                pokemonIds: ["6", "18", "20", "76", "135"],
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
                pokemonIds: ["1", "10", "36", "40"],
                aceId: "40",
            },
            [difficulties.EASY]: {
                minLevel: 16,
                maxLevel: 20,
                numPokemon: 4,
                pokemonIds: ["1", "11", "36", "40"],
                aceId: "40",
            },
            [difficulties.MEDIUM]: {
                minLevel: 29,
                maxLevel: 36,
                numPokemon: 5,
                pokemonIds: ["2", "12", "36", "40", "136"],
                aceId: "40",
            },
            [difficulties.HARD]: {
                minLevel: 49,
                maxLevel: 59,
                numPokemon: 6,
                pokemonIds: ["3", "12", "40", "136", "143"],
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
                pokemonIds: ["129"],
                aceId: "7",
            },
            [difficulties.EASY]: {
                minLevel: 21,
                maxLevel: 26,
                numPokemon: 4,
                pokemonIds: ["7", "129"],
                aceId: "7",
            },
            [difficulties.MEDIUM]: {
                minLevel: 34,
                maxLevel: 41,
                numPokemon: 5,
                pokemonIds: ["8", "130", "134"],
                aceId: "130",
            },
            [difficulties.HARD]: {
                minLevel: 54,
                maxLevel: 62,
                numPokemon: 6,
                pokemonIds: ["9", "130", "131", "134"],
                aceId: "130",
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
                aceId: "26",
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
    difficultyConfig,
}