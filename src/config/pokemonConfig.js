const types = {
    NORMAL: 0,
    FIGHTING: 1,
    FLYING: 2,
    POISON: 3,
    GROUND: 4,
    ROCK: 5,
    BUG: 6,
    GHOST: 7,
    STEEL: 8,
    FIRE: 9,
    WATER: 10,
    GRASS: 11,
    ELECTRIC: 12,
    PSYCHIC: 13,
    ICE: 14,
    DRAGON: 15,
    DARK: 16,
    FAIRY: 17,
    UNKNOWN: 18,
    SHADOW: 19,
}

const typeConfig = {
    0: { name: "Normal", color: "#A8A878", id: 0, emoji: "<:normal:1107083676136783892>" },
    1: { name: "Fighting", color: "#C03028", id: 1, emoji: "<:fighting:1107083600052101160>" },
    2: { name: "Flying", color: "#A890F0", id: 2, emoji: "<:flying:1107083603889885214>" },
    3: { name: "Poison", color: "#A040A0", id: 3, emoji: "<:poison:1107083678401699921>" },
    4: { name: "Ground", color: "#E0C068", id: 4, emoji: "<:ground:1107083673410478100>" },
    5: { name: "Rock", color: "#B8A038", id: 5, emoji: "<:rock:1107083680742125640>" },
    6: { name: "Bug", color: "#A8B820", id: 6, emoji: "<:bug:1107083592779190272>" },
    7: { name: "Ghost", color: "#705898", id: 7, emoji: "<:ghost:1107083605114622123>" },
    8: { name: "Steel", color: "#B8B8D0", id: 8, emoji: "<:steel:1107083687931166862>" },
    9: { name: "Fire", color: "#F08030", id: 9, emoji: "<:fire:1107083601151004764>" },
    10: { name: "Water", color: "#6890F0", id: 10, emoji: "<:water:1107083690422587402>" },
    11: { name: "Grass", color: "#78C850", id: 11, emoji: "<:grass:1107083671372058697>" },
    12: { name: "Electric", color: "#F8D030", id: 12, emoji: "<:electric:1107083597250310214>" },
    13: { name: "Psychic", color: "#F85888", id: 13, emoji: "<:psychic:1107083679588683828>" },
    14: { name: "Ice", color: "#98D8D8", id: 14, emoji: "<:ice:1107083674748469338>" },
    15: { name: "Dragon", color: "#7038F8", id: 15, emoji: "<:dragon:1107083595937484820>" },
    16: { name: "Dark", color: "#705848", id: 16, emoji: "<:dark:1107083594112970853>" },
    17: { name: "Fairy", color: "#EE99AC", id: 17, emoji: "<:fairy:1107083598298886155>" },
    18: { name: "Unknown", color: "#68A090", id: 18, emoji: "❓" },
    19: { name: "Shadow", color: "#705848", id: 19, emoji: "⬛" },
}

const natureConfig = {
    "0": { "name": "Hardy", "description": "No stat changes", "stats": [0, 0, 0, 0, 0, 0],},
    "1": { "name": "Lonely", "description": "Atk +1, Def -1", "stats": [0, 1, -1, 0, 0, 0],},
    "2": { "name": "Brave", "description": "Atk +1, Spe -1", "stats": [0, 1, 0, 0, 0, -1],},
    "3": { "name": "Adamant", "description": "Atk +1, SpA -1", "stats": [0, 1, 0, -1, 0, 0],},
    "4": { "name": "Naughty", "description": "Atk +1, SpD -1", "stats": [0, 1, 0, 0, -1, 0],},
    "5": { "name": "Bold", "description": "Def +1, Atk -1", "stats": [0, -1, 1, 0, 0, 0],},
    "6": { "name": "Docile", "description": "No stat changes", "stats": [0, 0, 0, 0, 0, 0],},
    "7": { "name": "Relaxed", "description": "Def +1, Spe -1", "stats": [0, 0, 1, 0, 0, -1],},
    "8": { "name": "Impish", "description": "Def +1, SpA -1", "stats": [0, 0, 1, -1, 0, 0],},
    "9": { "name": "Lax", "description": "Def +1, SpD -1", "stats": [0, 0, 1, 0, -1, 0],},
    "10": { "name": "Timid", "description": "Spe +1, Atk -1", "stats": [0, -1, 0, 0, 0, 1],},
    "11": { "name": "Hasty", "description": "Spe +1, Def -1", "stats": [0, 0, -1, 0, 0, 1],},
    "12": { "name": "Serious", "description": "No stat changes", "stats": [0, 0, 0, 0, 0, 0],},
    "13": { "name": "Jolly", "description": "Spe +1, SpA -1", "stats": [0, 0, 0, -1, 0, 1],},
    "14": { "name": "Naive", "description": "Spe +1, SpD -1", "stats": [0, 0, 0, 0, -1, 1],},
    "15": { "name": "Modest", "description": "SpA +1, Atk -1", "stats": [0, -1, 0, 1, 0, 0],},
    "16": { "name": "Mild", "description": "SpA +1, Def -1", "stats": [0, 0, -1, 1, 0, 0],},
    "17": { "name": "Quiet", "description": "SpA +1, Spe -1", "stats": [0, 0, 0, 1, 0, -1],},
    "18": { "name": "Bashful", "description": "No stat changes", "stats": [0, 0, 0, 0, 0, 0],},
    "19": { "name": "Rash", "description": "SpA +1, SpD -1", "stats": [0, 0, 0, 1, -1, 0],},
    "20": { "name": "Calm", "description": "SpD +1, Atk -1", "stats": [0, -1, 0, 0, 1, 0],},
    "21": { "name": "Gentle", "description": "SpD +1, Def -1", "stats": [0, 0, -1, 0, 1, 0],},
    "22": { "name": "Sassy", "description": "SpD +1, Spe -1", "stats": [0, 0, 0, 0, 1, -1],},
    "23": { "name": "Careful", "description": "SpD +1, SpA -1", "stats": [0, 0, 0, -1, 1, 0],},
    "24": { "name": "Quirky", "description": "No stat changes", "stats": [0, 0, 0, 0, 0, 0],},
}

const stats = {
    HP: 0,
    ATTACK: 1,
    DEFENSE: 2,
    SPATK: 3,
    SPDEF: 4,
    SPEED: 5,
}

const statConfig = {
    "0": { "name": "HP", "emoji": "❤️", "description": "Hit Points",},
    "1": { "name": "Atk", "emoji": "⚔️", "description": "Attack",},
    "2": { "name": "Def", "emoji": "🛡️", "description": "Defense",},
    "3": { "name": "SpA", "emoji": "🔮", "description": "Special Attack",},
    "4": { "name": "SpD", "emoji": "🛡️", "description": "Special Defense",},
    "5": { "name": "Spe", "emoji": "🏃", "description": "Speed",},
}

const growthRates = {
    ERRATIC: 0,
    FAST: 1,
    MEDIUMFAST: 2,
    MEDIUMSLOW: 3,
    SLOW: 4,
    FLUCTUATING: 5,
}

const growthRateConfig = {
    [growthRates.ERRATIC]: {
        "name": "Erratic",
        "growthFn": function (level) {
            // TODO: change?
            return Math.floor(0.5 * Math.pow(level, 2.5));
        }
    },
    [growthRates.FAST]: {
        "name": "Fast",
        "growthFn": function (level) {
            return Math.floor(0.5 * Math.pow(level, 2.5));
        }
    },
    [growthRates.MEDIUMFAST]: {
        "name": "Medium Fast",
        "growthFn": function (level) {
            return Math.floor(0.8 * Math.pow(level, 2.5));
        }
    },
    [growthRates.MEDIUMSLOW]: {
        "name": "Medium Slow",
        "growthFn": function (level) {
            return Math.floor(Math.pow(level, 2.5));
        }
    },
    [growthRates.SLOW]: {
        "name": "Slow",
        "growthFn": function (level) {
            return Math.floor(1.5 * Math.pow(level, 2.5));
        }
    },
    [growthRates.FLUCTUATING]: {
        "name": "Fluctuating",
        "growthFn": function (level) {
            // TODO: change?
            return Math.floor(1.5 * Math.pow(level, 2.5));
        }
    },
}
const rarities = {
    COMMON: "Common",
    RARE: "Rare",
    EPIC: "Epic",
    LEGENDARY: "Legendary",
    MYTHICAL: "Mythical",
}

const pokemonConfig = {
    "1": {
        "name": "Bulbasaur",
        "emoji": "<:1_:1100279982556708956>",
        "description": "A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.",
        "type": [types.GRASS, types.POISON],
        "baseStats": [45, 49, 49, 65, 65, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png",
        "evolution": [
            {
                "level": 16,
                "id": "2",
            },
        ],
        "abilities": {
            "65": 0.8,
            "34": 0.2
        },
        "moveIds": ["m22", "m33", "m79", "m202"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "2": {
        "name": "Ivysaur",
        "emoji": "<:2_:1100279984922296501>",
        "description": "When the bulb on its back grows large, it appears to lose the ability to stand on its hind legs.",
        "type": [types.GRASS, types.POISON],
        "baseStats": [60, 62, 63, 80, 80, 60],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/2.png",
        "evolution": [{
            "level": 32,
            "id": "3",
        }],
        "abilities": {
            "65": 0.8,
            "34": 0.2
        },
        "moveIds": ["m22", "m79", "m188", "m202"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "3": {
        "name": "Venusaur",
        "emoji": "<:3:1100279986012819536>",
        "description": "The plant blooms when it is absorbing solar energy. It stays on the move to seek sunlight.",
        "type": [types.GRASS, types.POISON],
        "baseStats": [80, 82, 83, 100, 100, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/3.png",
        "abilities": {
            "65": 0.8,
            "34": 0.2
        },
        "moveIds": ["m22", "m79", "m188", "m76"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "4": {
        "name": "Charmander",
        "emoji": "<:4:1100279987057209364>",
        "description": "Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail.",
        "type": [types.FIRE],
        "baseStats": [39, 52, 43, 60, 50, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/4.png",
        "evolution":[ {
            "level": 16,
            "id": "5",
        }],
        "abilities": {
            "66": 0.8,
            "94": 0.2
        },
        "moveIds": ["m10", "m52", "m34", "m53"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "5": {
        "name": "Charmeleon",
        "emoji": "<:5:1100279988156104774>",
        "description": "When it swings its burning tail, it elevates the temperature to unbearably high levels.",
        "type": [types.FIRE],
        "baseStats": [58, 64, 58, 80, 65, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/5.png",
        "evolution": [{
            "level": 36,
            "id": "6",
        }],
        "abilities": {
            "66": 0.8,
            "94": 0.2
        },
        "moveIds": ["m52", "m34", "m53", "m525"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "6": {
        "name": "Charizard",
        "emoji": "<:6:1100279989703819264>",
        "description": "Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally.",
        "type": [types.FIRE, types.FLYING],
        "baseStats": [78, 84, 78, 109, 85, 100],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/6.png",
        "abilities": {
            "66": 0.8,
            "94": 0.2
        },
        "moveIds": ["m17", "m53", "m525", "m394"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "7": {
        "name": "Squirtle",
        "emoji": "<:7:1100279990806904882>",
        "description": "After birth, its back swells and hardens into a shell. Powerfully sprays foam from its mouth.",
        "type": [types.WATER],
        "baseStats": [44, 48, 65, 50, 64, 43],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/7.png",
        "evolution": [{
            "level": 16,
            "id": "8",
        }],
        "abilities": {
            "67": 0.8,
            "44": 0.2
        },
        "moveIds": ["m55", "m110", "m229", "m352"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "8": {
        "name": "Wartortle",
        "emoji": "<:8:1100279991813558332>",
        "description": "Often hides in water to stalk unwary prey. For swimming fast, it moves its ears to maintain balance.",
        "type": [types.WATER],
        "baseStats": [59, 63, 80, 65, 80, 58],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/8.png",
        "evolution": [{
            "level": 36,
            "id": "9",
        }],
        "abilities": {
            "67": 0.8,
            "44": 0.2
        },
        "moveIds": ["m55", "m229", "m334", "m352"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "9": {
        "name": "Blastoise",
        "emoji": "<:9_:1100280018468347974>",
        "description": "A brutal POKéMON with pressurized water jets on its shell. They are used for high speed tackles.",
        "type": [types.WATER],
        "baseStats": [79, 83, 100, 85, 105, 78],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/9.png",
        "abilities": {
            "67": 0.8,
            "44": 0.2
        },
        "moveIds": ["m55", "m229", "m334", "m56"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "9-1": {
        "name": "Gary's Blastoise",
        "emoji": "<:garyblastoise:1109522094645063810>",
        "description": "The ultimate evolution of the Water-type Squirtle. Known for its exceptional power and formidable presence, this Pokémon has rightfully earned its place as one of the most respected members of its trainer's esteemed team.",
        "type": [types.WATER],
        "baseStats": [95, 70, 120, 90, 125, 80],
        "sprite": "https://archives.bulbagarden.net/media/upload/2/2c/Spr_1b_009.png",
        "shinySprite": "https://archives.bulbagarden.net/media/upload/4/43/Spr_2g_009_s.png",
        "abilities": {
            "75": 1
        },
        "moveIds": ["m55", "m229", "m334-1", "m56-1"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.MEDIUMSLOW,
        "noGacha": true
    },
    "10": {
        "name": "Caterpie",
        "emoji": "<:10:1100279993835196418>",
        "description": "Its short feet are tipped with suction pads that enable it to tirelessly climb slopes and walls.",
        "type": [types.BUG],
        "baseStats": [45, 30, 35, 20, 20, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/10.png",
        "evolution": [{
            "level": 7,
            "id": "11",
        }],
        "abilities": {
            "19": 0.8,
            "50": 0.2
        },
        "moveIds": ["m33", "m81", "m450"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST,
    },
    "11": {
        "name": "Metapod",
        "emoji": "<:11:1100280981321162752>",
        "description": "This POKéMON is vulnerable to attack while its shell is soft, exposing its weak and tender body.",
        "type": [types.BUG],
        "baseStats": [50, 20, 55, 25, 25, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/11.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/11.png",
        "evolution": [{
            "level": 10,
            "id": "12",
        }],
        "abilities": {
            "61": 1
        },
        "moveIds": ["m33", "m81", "m106", "m450"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST,
    },
    "12": {
        "name": "Butterfree",
        "emoji": "<:12:1100280983024058418>",
        "description": "In battle, it flaps its wings at high speed to release highly toxic dust into the air.",
        "type": [types.BUG, types.FLYING],
        "baseStats": [60, 45, 50, 90, 80, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/12.png",
        "abilities": {
            "14": 0.8,
            "110": 0.2
        },
        "moveIds": ["m16", "m79", "m483", "m405"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST,
    },
    "13": {
        "name": "Weedle",
        "emoji": "<:13:1100280983837737041>",
        "description": "Often found in forests, eating leaves. It has a sharp venomous stinger on its head.",
        "type": [types.BUG, types.POISON],
        "baseStats": [40, 35, 30, 20, 20, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/13.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/13.png",
        "evolution": [{
            "level": 7,
            "id": "14",
        }],
        "abilities": {
            "19": 0.8,
            "50": 0.2
        },
        "moveIds": ["m40", "m81", "m450"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST,
    },
    "14": {
        "name": "Kakuna",
        "emoji": "<:14:1100280985343508520>",
        "description": "Almost incapable of moving, this POKéMON can only harden its shell to protect itself from predators.",
        "type": [types.BUG, types.POISON],
        "baseStats": [45, 25, 50, 25, 25, 35],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/14.png",
        "evolution": [{
            "level": 10,
            "id": "15",
        }],
        "abilities": {
            "61": 1
        },
        "moveIds": ["m40", "m81", "m106", "m450"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST,
    },
    "15": {
        "name": "Beedrill",
        "emoji": "<:15:1100280987197378610>",
        "description": "Flies at high speed and attacks using its large venomous stingers on its forelegs and tail.",
        "type": [types.BUG, types.POISON],
        "baseStats": [65, 90, 40, 45, 80, 75],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/15.png",
        "abilities": {
            "68": 0.8,
            "97": 0.2
        },
        "moveIds": ["m40", "m398", "m450", "m565"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST,
    },
    "16" : {
        "name": "Pidgey",
        "emoji": "<:16:1100280988304674866>",
        "description": "Very docile. If attacked, it will often kick up sand to protect itself rather than fight back.",
        "type": [types.NORMAL, types.FLYING],
        "baseStats": [40, 45, 40, 35, 35, 56],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/16.png",
        "evolution": [{
            "level": 13,
            "id": "17",
        }],
        "abilities": {
            "51": 0.45,
            "77": 0.45,
            "145": 0.1
        },
        "moveIds": ["m17", "m98", "m36", "m355"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST
    },
    "17" : {
        "name": "Pidgeotto",
        "emoji": "<:17:1100280989403578410>",
        "description": "This POKéMON is full of vitality. It constantly flies around its large territory in search of prey.",
        "type": [types.NORMAL, types.FLYING],
        "baseStats": [63, 60, 55, 50, 50, 71],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/17.png",
        "evolution": [{
            "level": 28,
            "id": "18",
        }],
        "abilities": {
            "51": 0.45,
            "77": 0.45,
            "145": 0.1
        },
        "moveIds": ["m17", "m36", "m355", "m369"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "18" : {
        "name": "Pidgeot",
        "emoji": "<:18:1100280990225662025>",
        "description": "When hunting, it skims the surface of water at high speed to pick off unwary prey such as MAGIKARP.",
        "type": [types.NORMAL, types.FLYING],
        "baseStats": [83, 80, 75, 70, 70, 101],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/18.png",
        "abilities": {
            "51": 0.45,
            "77": 0.45,
            "145": 0.1
        },
        "moveIds": ["m17", "m355", "m369", "m38"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "18-1" : {
        "name": "aaabaaajss",
        "emoji": "<:bjs:1114223245349109830>",
        "description": "The mythical avian given the nickname Bird Jesus, revered for its unwavering guidance and miraculous feats against impossible odds.",
        "type": [types.NORMAL, types.FLYING],
        "baseStats": [85, 120, 80, 80, 75, 110],
        "sprite": "https://archives.bulbagarden.net/media/upload/c/c0/Spr_1b_018.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/bjs-shiny-resized.png",
        "abilities": {
            "20008": 1
        },
        "moveIds": ["m98", "m355", "m369", "m143"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST,
        "noGacha": true
    },
    "19" : {
        "name": "Rattata",
        "emoji": "<:19:1100280992297664552>",
        "description": "Bites anything when it attacks. Small and very quick, it is a common sight in many places.",
        "type": [types.NORMAL],
        "baseStats": [30, 56, 35, 25, 35, 72],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/19.png",
        "evolution": [{
            "level": 12,
            "id": "20",
        }],
        "abilities": {
            "50": 0.45,
            "62": 0.45,
            "55": 0.1
        },
        "moveIds": ["m98", "m116", "m36", "m283"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST
    },
    "20" : {
        "name": "Raticate",
        "emoji": "<:20:1100281012111552562>",
        "description": "It uses its whis­kers to maintain its balance. It apparently slows down if they are cut off.",
        "type": [types.NORMAL],
        "baseStats": [55, 81, 60, 50, 70, 97],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/20.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/20.png",
        "abilities": {
            "50": 0.45,
            "62": 0.45,
            "55": 0.1
        },
        "moveIds": ["m98", "m203", "m283", "m162"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST
    },
    "23": {
        "name": "Ekans",
        "emoji": "<:23:1100282068837081109>",
        "description": "It can freely detach its jaw to swallow large prey whole. It can become too heavy to move, however.",
        "type": [types.POISON],
        "baseStats": [35, 60, 44, 40, 54, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/23.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/23.png",
        "evolution": [{
            "level": 22,
            "id": "24",
        }],
        "abilities": {
            "22": 0.45,
            "61": 0.45,
            "127": 0.1
        },
        "moveIds": ["m40", "m43", "m137", "m398"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST
    },
    "24": {
        "name": "Arbok",
        "emoji": "<:24:1100282070082801670>",
        "description": "The pattern on its belly appears to be a frightening face. Weak foes will flee just at the sight of the pattern.",
        "type": [types.POISON],
        "baseStats": [60, 95, 69, 65, 79, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/24.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/24.png",
        "abilities": {
            "22": 0.45,
            "61": 0.45,
            "127": 0.1
        },
        "moveIds": ["m40", "m137", "m398", "m157"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST
    },
    "24-1": {
        "name": "Jessie's Arbok",
        "emoji": "<:jessiearbok:1117130466479325225>",
        "description": "Jessie's loyal and nefarious partner. Foes are frozen with fear at the sight of it.",
        "type": [types.POISON],
        "baseStats": [75, 125, 70, 70, 80, 110],
        "sprite": "https://archives.bulbagarden.net/media/upload/3/39/Spr_1b_024.png",
        "shinySprite": "https://archives.bulbagarden.net/media/upload/0/00/Spr_2c_024_s.png",
        "abilities": {
            "22": 1,
        },
        "moveIds": ["m40", "m137-1", "m398", "m157"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST,
        "noGacha": true
    },
    "25": {
        "name": "Pikachu",
        "emoji": "<:25:1100282072003772457>",
        "description": "When several of these POKéMON gather, their electricity could build and cause lightning storms.",
        "type": [types.ELECTRIC],
        "baseStats": [35, 55, 40, 50, 50, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png",
        "evolution": [{
            "level": 16,
            "id": "26",
        }],
        "abilities": {
            "9": 0.8,
            "31": 0.2
        },
        "moveIds": ["m84", "m57", "m85", "m417"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "25-1": {
        "name": "Ash's Pikachu",
        "emoji": "<:ashpikachu:1109522092283658250>",
        "description": "This Pikachu wears its partner's cap, which is brimming with memories of traveling through many different regions.",
        "type": [types.ELECTRIC],
        "baseStats": [85, 120, 70, 115, 80, 130],
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/ash-pikachu-small.gif",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/ash-pikachu-shiny-small.gif",
        "abilities": {
            "9": 1,
        },
        "moveIds": ["m98", "m57", "m344", "m719"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.MEDIUMSLOW,
        "noGacha": true
    },
    "26": {
        "name": "Raichu",
        "emoji": "<:26:1100282073509527672>",
        "description": "Its long tail serves as a ground to protect itself from its own high-voltage power.",
        "type": [types.ELECTRIC],
        "baseStats": [60, 90, 55, 90, 80, 110],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/26.png",
        "abilities": {
            "9": 0.8,
            "31": 0.2
        },
        "moveIds": ["m84", "m57", "m417", "m87"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "29": {
        "name": "Nidoran ♀",
        "emoji": "<:29:1100282077531865088>",
        "description": "While this Pokémon does not prefer to fight, even one drop of the venom it secretes from its barbs can be fatal.",
        "type": [types.POISON],
        "baseStats": [55, 47, 52, 40, 40, 41],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/29.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/29.png",
        "evolution": [{
            "level": 16,
            "id": "30",
        }],
        "abilities": {
            "38": 0.45,
            "79": 0.45,
            "55": 0.1
        },
        "moveIds": ["m10", "m270", "m188", "m414"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "30": {
        "name": "Nidorina",
        "emoji": "<:30:1100282100952858664>",
        "description": "When it senses danger, it raises all the barbs on its body. These barbs grow more slowly than Nidorino's.",
        "type": [types.POISON],
        "baseStats": [70, 62, 67, 55, 55, 56],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/30.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/30.png",
        "evolution": [{
            "level": 36,
            "id": "31",
        }],
        "abilities": {
            "38": 0.45,
            "79": 0.45,
            "55": 0.1
        },
        "moveIds": ["m270", "m188", "m276", "m414"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "31": {
        "name": "Nidoqueen",
        "emoji": "<:31:1100282806065696768>",
        "description": "Its hard scales provide strong protection. It uses its hefty bulk to execute powerful moves.",
        "type": [types.POISON, types.GROUND],
        "baseStats": [90, 92, 87, 75, 85, 76],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/31.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/31.png",
        "abilities": {
            "38": 0.45,
            "79": 0.45,
            "125": 0.1
        },
        "moveIds": ["m270", "m188", "m276", "m89"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "32": {
        "name": "Nidoran ♂",
        "emoji": "<:32:1100282808032833536>",
        "description": "It scans its surroundings by raising its ears out of the grass. Its toxic horn is for protection.",
        "type": [types.POISON],
        "baseStats": [46, 57, 40, 40, 40, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/32.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/32.png",
        "evolution": [{
            "level": 16,
            "id": "33",
        }],
        "abilities": {
            "38": 0.45,
            "79": 0.45,
            "55": 0.1
        },
        "moveIds": ["m40", "m43", "m398", "m414"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "33": {
        "name": "Nidorino",
        "emoji": "<:33:1100282809089785948>",
        "description": "An aggressive POKéMON that is quick to attack. The horn on its head secretes a powerful venom.",
        "type": [types.POISON],
        "baseStats": [61, 72, 57, 55, 55, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/33.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/33.png",
        "evolution": [{
            "level": 36,
            "id": "34",
        }],
        "abilities": {
            "38": 0.45,
            "79": 0.45,
            "55": 0.1
        },
        "moveIds": ["m40", "m30", "m398", "m414"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "34": {
        "name": "Nidoking",
        "emoji": "<:34:1100282810960449576>",
        "description": "It is recognized by its rock-hard hide and its extended horn. Be careful with the horn as it contains venom.",
        "type": [types.POISON, types.GROUND],
        "baseStats": [81, 102, 77, 85, 75, 85],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/34.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/34.png",
        "abilities": {
            "38": 0.45,
            "79": 0.45,
            "125": 0.1
        },
        "moveIds": ["m40", "m224", "m414", "m482"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "34-1": {
        "name": "AAAAAAAAAA",
        "emoji": "<:fonz:1114223247601455204>",
        "description": "A majestic Pokemon whos fierce power and commanding presence earns its title as King.",
        "type": [types.POISON, types.GROUND],
        "baseStats": [95, 120, 80, 90, 75, 90],
        "sprite": "https://archives.bulbagarden.net/media/upload/b/b8/Spr_1b_034.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/fonz-shiny-resized.png",
        "abilities": {
            "20009": 1
        },
        "moveIds": ["m40", "m57", "m414", "m482"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
        "noGacha": true
    },
    "35": {
        "name": "Clefairy",
        "emoji": "<:35:1100282812810137600>",
        "description": "Its magical and cute appeal has many admirers. It is rare and found only in certain areas.",
        "type": [types.FAIRY],
        "baseStats": [70, 45, 48, 60, 65, 35],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/35.png",
        "evolution": [{
            "level": 26,
            "id": "36",
        }],
        "abilities": {
            "56": 0.45,
            "98": 0.45,
            "132": 0.1
        },
        "moveIds": ["m118", "m266", "m309", "m361"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "36": {
        "name": "Clefable",
        "emoji": "<:36:1100282814701781032>",
        "description": "A timid fairy POKéMON that is rarely seen. It will run and hide the moment it senses people.",
        "type": [types.FAIRY],
        "baseStats": [95, 70, 73, 95, 90, 60],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/36.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/36.png",
        "abilities": {
            "56": 0.45,
            "98": 0.45,
            "109": 0.1
        },
        "moveIds": ["m118", "m266", "m361", "m585"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "37": {
        "name": "Vulpix",
        "emoji": "<:37:1100282816270438432>",
        "description": "At the time of birth, it has just one tail. The tail splits from its tip as it grows older.",
        "type": [types.FIRE],
        "baseStats": [38, 41, 40, 65, 65, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/37.png",
        "evolution": [{
            "level": 26,
            "id": "38",
        }],
        "abilities": {
            "18": 0.8,
            "70": 0.2
        },
        "moveIds": ["m52", "m53", "m219", "m288"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "38": {
        "name": "Ninetales",
        "emoji": "<:38:1100282817818144809>",
        "description": "Very smart and very vengeful. Grabbing one of its many tails could result in a 1000-year curse.",
        "type": [types.FIRE],
        "baseStats": [73, 76, 75, 100, 100, 100],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/38.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/38.png",
        "abilities": {
            "18": 0.8,
            "70": 0.2
        },
        "moveIds": ["m52", "m219", "m288", "m257"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "39" : {
        "name": "Jigglypuff",
        "emoji": "<:39:1100282819411972116>",
        "description": "When its huge eyes light up, it sings a mysteriously soothing melody that lulls its enemies to sleep.",
        "type": [types.NORMAL, types.FAIRY],
        "baseStats": [115, 45, 20, 45, 25, 20],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/39.png",
        "evolution": [{
            "level": 26,
            "id": "40",
        }],
        "abilities": {
            "56": 0.45,
            "172": 0.45,
            "132": 0.1
        },
        "moveIds": ["m574", "m34", "m47", "m186"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "40" : {
        "name": "Wigglytuff",
        "emoji": "<:40:1100282821093904484>",
        "description": "The body is soft and rubbery. When angered, it will suck in air and inflate itself to an enormous size.",
        "type": [types.NORMAL, types.FAIRY],
        "baseStats": [140, 70, 45, 85, 50, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/40.png",
        "abilities": {
            "56": 0.45,
            "172": 0.45,
            "119": 0.1
        },
        "moveIds": ["m574", "m47", "m186", "m304"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "41" : {
        "name": "Zubat",
        "emoji": "<:41:1100283650458779648>",
        "description": "Forms colonies in perpetually dark places. Uses ultrasonic waves to identify and approach targets.",
        "type": [types.POISON, types.FLYING],
        "baseStats": [40, 45, 35, 30, 40, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/41.png",
        "evolution": [{
            "level": 14,
            "id": "42",
        }],
        "abilities": {
            "39": 0.8,
            "16": 0.2
        },
        "moveIds": ["m17", "m71", "m269", "m305"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST
    },
    "42" : {
        "name": "Golbat",
        "emoji": "<:42:1100283652367200276>",
        "description": "Once it strikes, it will not stop draining energy from the victim even if it gets too heavy to fly.",
        "type": [types.POISON, types.FLYING],
        "baseStats": [75, 80, 70, 65, 75, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/42.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/42.png",
        "abilities": {
            "39": 0.8,
            "16": 0.2
        },
        "moveIds": ["m17", "m269", "m305", "m355"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "43": {
        "name": "Oddish",
        "emoji": "<:43:1100283653122170963>",
        "description": "During the day, it keeps its face buried in the ground. At night, it wanders around sowing its seeds.",
        "type": [types.GRASS, types.POISON],
        "baseStats": [45, 50, 55, 30, 75, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/43.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/43.png",
        "evolution": [{
            "level": 21,
            "id": "44",
        }],
        "abilities": {
            "34": 0.8,
            "50": 0.2
        },
        "moveIds": ["m51", "m71", "m73", "m79"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST
    },
    "44": {
        "name": "Gloom",
        "emoji": "<:44:1100283654749552771>",
        "description": "The fluid that oozes from its mouth isn't drool. It is a nectar that is used to attract prey.",
        "type": [types.GRASS, types.POISON],
        "baseStats": [60, 65, 70, 40, 85, 75],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/44.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/44.png",
        "evolution": [{
            "level": 31,
            "id": "45",
        }],
        "abilities": {
            "34": 0.8,
            "1": 0.2
        },
        "moveIds": ["m71", "m73", "m79", "m202"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "45": {
        "name": "Vileplume",
        "emoji": "<:45:1100283656561512509>",
        "description": "The larger its petals, the more toxic pollen it contains. Its big head is heavy and hard to hold up.",
        "type": [types.GRASS, types.POISON],
        "baseStats": [130, 80, 85, 90, 100, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/45.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/45.png",
        "abilities": {
            "34": 0.8,
            "27": 0.2
        },
        "moveIds": ["m71", "m73", "m79", "m572"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "46": {
        "name": "Paras",
        "emoji": "<:46:1100283657832386611>",
        "description": "Burrows to suck tree roots. The mushrooms on its back grow by drawing nutrients from the bug host.",
        "type": [types.BUG, types.GRASS],
        "baseStats": [35, 70, 55, 25, 55, 25],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/46.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/46.png",
        "evolution": [{
            "level": 24,
            "id": "47",
        }],
        "abilities": {
            "27": 0.45,
            "87": 0.45,
            "6": 0.1
        },
        "moveIds": ["m71", "m77", "m450", "m147"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST
    },
    "47": {
        "name": "Parasect",
        "emoji": "<:47:1100283658994200637>",
        "description": "A host-parasite pair in which the parasite mushroom has taken over the host bug. Prefers damp places.",
        "type": [types.BUG, types.GRASS],
        "baseStats": [60, 95, 80, 30, 80, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/47.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/47.png",
        "abilities": {
            "27": 0.45,
            "87": 0.45,
            "6": 0.1
        },
        "moveIds": ["m77", "m202", "m450", "m147"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST
    },
    "48": {
        "name": "Venonat",
        "emoji": "<:48:1100283660852273213>",
        "description": "Its big eyes are actually clusters of tiny eyes. At night, its kind is drawn by light.",
        "type": [types.BUG, types.POISON],
        "baseStats": [60, 55, 50, 45, 40, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/48.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/48.png",
        "evolution": [{
            "level": 21,
            "id": "49",
        }],
        "abilities": {
            "14": 0.45,
            "110": 0.45,
            "50": 0.1
        },
        "moveIds": ["m77", "m50", "m188", "m450"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST
    },
    "49": {
        "name": "Venomoth",
        "emoji": "<:49:1100283661900861541>",
        "description": "The dust-like scales covering its wings are color coded to indicate the kinds of poison it has.",
        "type": [types.BUG, types.POISON],
        "baseStats": [70, 65, 60, 90, 75, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/49.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/49.png",
        "abilities": {
            "19": 0.45,
            "110": 0.45,
            "147": 0.1
        },
        "moveIds": ["m77", "m50", "m188", "m405"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST
    },
    "49-1": {
        "name": "AATTVVV",
        "emoji": "<:atv:1114223244363431996>",
        "description": "An oddly mechanical Pokemon; its mere presence is rumored to completely prevent Pokemon attacks.",
        "type": [types.BUG, types.STEEL],
        "baseStats": [80, 75, 105, 90, 85, 115],
        "sprite": "https://archives.bulbagarden.net/media/upload/2/28/Spr_1b_049.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/atv-shiny-resized.png",
        "abilities": {
            "19": 1,
        },
        "moveIds": ["m77", "m269-1", "m430", "m405"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST,
        "noGacha": true
    },
    "50": {
        "name": "Diglett",
        "emoji": "<:50:1100283701142757397>",
        "description": "Lives about one yard underground where it feeds on plant roots. It sometimes appears above ground.",
        "type": [types.GROUND],
        "baseStats": [10, 55, 25, 35, 45, 95],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/50.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/50.png",
        "evolution": [{
            "level": 26,
            "id": "51",
        }],
        "abilities": {
            "8": 0.45,
            "71": 0.45,
            "159": 0.1
        },
        "moveIds": ["m189", "m91", "m103", "m523"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "51": {
        "name": "Dugtrio",
        "emoji": "<:51:1100285026106613840>",
        "description": "A team of DIGLETT triplets. It triggers huge earthquakes by burrowing 60 miles underground.",
        "type": [types.GROUND],
        "baseStats": [35, 100, 50, 50, 70, 120],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/51.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/51.png",
        "abilities": {
            "8": 0.45,
            "71": 0.45,
            "159": 0.1
        },
        "moveIds": ["m189", "m91", "m103", "m89"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "52": {
        "name": "Meowth",
        "emoji": "<:52:1100285028157640704>",
        "description": "Adores circular objects. Wanders the streets on a nightly basis to look for dropped loose change.",
        "type": [types.NORMAL],
        "baseStats": [40, 45, 35, 40, 40, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/52.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/52.png",
        "evolution": [{
            "level": 18,
            "id": "53",
        }],
        "abilities": {
            "53": 0.45,
            "101": 0.45,
            "127": 0.1
        },
        "moveIds": ["m6", "m10", "m269", "m369"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST
    },
    "52-1": {
        "name": "Rocket Meowth",
        "emoji": "<:rocketmeowth:1117130468014428293>",
        "description": "A cunning member of the notorious Team Rocket, known for its iconic ability to speak human language.",
        "type": [types.NORMAL],
        "baseStats": [85, 100, 75, 90, 90, 140],
        "sprite": "https://archives.bulbagarden.net/media/upload/4/4d/Spr_1b_052.png",
        "shinySprite": "https://archives.bulbagarden.net/media/upload/9/95/Spr_2c_052_s.png",
        "abilities": {
            "53": 1,
        },
        "moveIds": ["m6", "m6-1", "m252", "m20003"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.MEDIUMSLOW,
        "noGacha": true
    },
    "53": {
        "name": "Persian",
        "emoji": "<:53:1100285029122318406>",
        "description": "Although its fur has many admirers, it is tough to raise as a pet because of its fickle meanness.",
        "type": [types.NORMAL],
        "baseStats": [65, 70, 60, 65, 65, 115],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/53.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/53.png",
        "abilities": {
            "7": 0.45,
            "101": 0.45,
            "127": 0.1
        },
        "moveIds": ["m6", "m252", "m269", "m369"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST
    },
    "58": {
        "name": "Growlithe",
        "emoji": "<:58:1100285035745136650>",
        "description": "Very protective of its territory. It will bark and bite to repel intruders from its space.",
        "type": [types.FIRE],
        "baseStats": [55, 70, 45, 70, 50, 60],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/58.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/58.png",
        "evolution": [{
            "level": 36,
            "id": "59",
        }],
        "abilities": {
            "22": 0.45,
            "18": 0.45,
            "154": 0.1
        },
        "moveIds": ["m52", "m36", "m46", "m424"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "59": {
        "name": "Arcanine",
        "emoji": "<:59:1100285037452202024>",
        "description": "A POKéMON that has been admired since the past for its beauty. It runs agilely as if on wings.",
        "type": [types.FIRE],
        "baseStats": [90, 110, 80, 100, 80, 95],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/59.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/59.png",
        "abilities": {
            "22": 0.45,
            "18": 0.45,
            "154": 0.1
        },
        "moveIds": ["m52", "m46", "m245", "m394"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "63": {
        "name": "Abra",
        "emoji": "<:63:1100286235064414279>",
        "description": "Using its ability to read minds, it will identify impending danger and TELEPORT to safety.",
        "type": [types.PSYCHIC],
        "baseStats": [25, 20, 15, 105, 55, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/63.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/63.png",
        "evolution": [{
            "level": 16,
            "id": "64",
        }],
        "abilities": {
            "28": 0.45,
            "39": 0.45,
            "98": 0.1
        },
        "moveIds": ["m93", "m100", "m247", "m417"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "64": {
        "name": "Kadabra",
        "emoji": "<:64:1100286236280754206>",
        "description": "It emits special alpha waves from its body that induce headaches just by being close by.",
        "type": [types.PSYCHIC],
        "baseStats": [40, 35, 30, 120, 70, 105],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/64.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/64.png",
        "evolution": [{
            "level": 36,
            "id": "65",
        }],
        "abilities": {
            "28": 0.45,
            "39": 0.45,
            "98": 0.1
        },
        "moveIds": ["m134", "m60", "m247", "m417"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "65": {
        "name": "Alakazam",
        "emoji": "<:65:1100286237836836914>",
        "description": "Its brain can outperform a supercomputer. Its intelligence quotient is said to be 5,000.",
        "type": [types.PSYCHIC],
        "baseStats": [55, 50, 45, 135, 95, 120],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/65.png",
        "abilities": {
            "28": 0.45,
            "39": 0.45,
            "98": 0.1
        },
        "moveIds": ["m134", "m247", "m417", "m248"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "66": {
        "name": "Machop",
        "emoji": "<:66:1100286238864449616>",
        "description": "Loves to build its muscles. It trains in all styles of martial arts to become even stronger.",
        "type": [types.FIGHTING],
        "baseStats": [70, 80, 50, 35, 35, 35],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/66.png",
        "evolution": [{
            "level": 28,
            "id": "67",
        }],
        "abilities": {
            "62": 0.45,
            "99": 0.45,
            "80": 0.1
        },
        "moveIds": ["m43", "m418", "m70", "m238"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST
    },
    "67": {
        "name": "Machoke",
        "emoji": "<:67:1100286239929815050>",
        "description": "Its muscular body is so powerful, it must wear a power save belt to be able to regulate its motions.",
        "type": [types.FIGHTING],
        "baseStats": [80, 100, 70, 50, 60, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/67.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/67.png",
        "evolution": [{
            "level": 42,
            "id": "68",
        }],
        "abilities": {
            "62": 0.45,
            "99": 0.45,
            "80": 0.1
        },
        "moveIds": ["m418", "m70", "m238", "m282"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "68": {
        "name": "Machamp",
        "emoji": "<:68:1100286241376849941>",
        "description": "Using its heavy muscles, it throws powerful punches that can send the victim clear over the horizon.",
        "type": [types.FIGHTING],
        "baseStats": [90, 130, 80, 65, 85, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/68.png",
        "abilities": {
            "62": 0.45,
            "99": 0.45,
            "80": 0.1
        },
        "moveIds": ["m418", "m238", "m282", "m223"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "69": {
        "name": "Bellsprout",
        "emoji": "<:69:1100286243637559316>",
        "description": "A carnivorous Pokémon that traps and eats bugs. It uses its root feet to soak up needed moisture.",
        "type": [types.GRASS, types.POISON],
        "baseStats": [50, 75, 35, 70, 30, 40],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/69.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/69.png",
        "evolution": [{
            "level": 21,
            "id": "70",
        }],
        "abilities": {
            "34": 0.8,
            "82": 0.2,
        },
        "moveIds": ["m22", "m51", "m202", "m398"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "70": {
        "name": "Weepinbell",
        "emoji": "<:70:1100286274746716230>",
        "description": "It spits out PoisonPowder to immobilize the enemy and then finishes it with a spray of Acid.",
        "type": [types.GRASS, types.POISON],
        "baseStats": [65, 90, 50, 85, 45, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/70.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/70.png",
        "evolution": [{
            "level": 36,
            "id": "71",
        }],
        "abilities": {
            "34": 0.8,
            "82": 0.2,
        },
        "moveIds": ["m51", "m202", "m398", "m668"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "71": {
        "name": "Victreebel",
        "emoji": "<:71:1100287549051777144>",
        "description": "Said to live in huge colonies deep in jungles, although no one has ever returned from there.",
        "type": [types.GRASS, types.POISON],
        "baseStats": [80, 105, 65, 100, 60, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/71.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/71.png",
        "abilities": {
            "34": 0.8,
            "82": 0.2,
        },
        "moveIds": ["m51", "m398", "m668", "m437"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "74": {
        "name": "Geodude",
        "emoji": "<:74:1100287553464184933>",
        "description": "Found in fields and mountains. Mistaking them for boulders, people often step or trip on them.",
        "type": [types.ROCK, types.GROUND],
        "baseStats": [40, 80, 100, 30, 30, 20],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/74.png",
        "evolution": [{
            "level": 25,
            "id": "75",
        }],
        "abilities": {
            "69": 0.45,
            "5": 0.45,
            "8": 0.1
        },
        "moveIds": ["m106", "m205", "m444", "m523"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST
    },
    "75": {
        "name": "Graveler",
        "emoji": "<:75:1100287555330654320>",
        "description": "Rolls down slopes to move. It rolls over any obstacle without slowing or changing its direction.",
        "type": [types.ROCK, types.GROUND],
        "baseStats": [55, 95, 115, 45, 45, 35],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/75.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/75.png",
        "evolution": [{
            "level": 40,
            "id": "76",
        }],
        "abilities": {
            "69": 0.45,
            "5": 0.45,
            "8": 0.1
        },
        "moveIds": ["m205", "m444", "m446", "m523"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "76": {
        "name": "Golem",
        "emoji": "<:76:1100287556530212914>",
        "description": "Its boulder-like body is extremely hard. It can easily withstand dynamite blasts without damage.",
        "type": [types.ROCK, types.GROUND],
        "baseStats": [80, 120, 130, 55, 65, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/76.png",
        "abilities": {
            "69": 0.45,
            "5": 0.45,
            "8": 0.1
        },
        "moveIds": ["m205", "m444", "m446", "m89"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "81": {
        "name": "Magnemite",
        "emoji": "<:81:1100288375589699594>",
        "description": "Uses anti-gravity to stay suspended. Appears without warning and uses THUNDER WAVE and similar moves.",
        "type": [types.ELECTRIC, types.STEEL],
        "baseStats": [25, 35, 70, 95, 55, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/81.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/81.png",
        "evolution": [{
            "level": 18,
            "id": "82",
        }],
        "abilities": {
            "42": 0.45,
            "5": 0.45,
            "148": 0.1
        },
        "moveIds": ["m33", "m84", "m85", "m430"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST
    },
    "82": {
        "name": "Magneton",
        "emoji": "<:82:1100288377275818068>",
        "description": "Formed by several MAGNEMITEs linked together. They frequently appear when sunspots flare up.",
        "type": [types.ELECTRIC, types.STEEL],
        "baseStats": [50, 60, 95, 120, 70, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/82.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/82.png",
        "abilities": {
            "42": 0.45,
            "5": 0.45,
            "148": 0.1
        },
        "moveIds": ["m84", "m85", "m430", "m521"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "83": {
        "name": "Farfetch'd",
        "emoji": "<:83:1100288378076942449>",
        "description": "The sprig of green onions it holds is its weapon. It is used much like a metal sword.",
        "type": [types.NORMAL, types.FLYING],
        "baseStats": [52, 90, 55, 58, 62, 60],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/83.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/83.png",
        "abilities": {
            "51": 0.45,
            "39": 0.45,
            "128": 0.1
        },
        "moveIds": ["m64", "m14", "m348", "m413"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "88": {
        "name": "Grimer",
        "emoji": "<:88:1100288386092245062>",
        "description": "Appears in filthy areas. Thrives by sucking up polluted sludge that is pumped out of factories.",
        "type": [types.POISON],
        "baseStats": [80, 80, 50, 40, 50, 25],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/88.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/88.png",
        "evolution": [{
            "level": 38,
            "id": "89",
        }],
        "abilities": {
            "1": 0.45,
            "60": 0.45,
            "143": 0.1
        },
        "moveIds": ["m876", "m92", "m398", "m441"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "89": {
        "name": "Muk",
        "emoji": "<:89:1100288387363119235>",
        "description": "Thickly covered with a filthy, vile sludge. It is so toxic, even its footprints contain poison.",
        "type": [types.POISON],
        "baseStats": [105, 105, 75, 65, 100, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/89.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/89.png",
        "abilities": {
            "1": 0.45,
            "60": 0.45,
            "143": 0.1
        },
        "moveIds": ["m876", "m92", "m441", "m482"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "90": {
        "name": "Shellder",
        "emoji": "<:90:1100288411937546250>",
        "description": "Its hard shell repels any kind of attack. It is vulnerable only when its shell is open.",
        "type": [types.WATER],
        "baseStats": [30, 65, 100, 45, 25, 40],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/90.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/90.png",
        "evolution": [{
            "level": 38,
            "id": "91",
        }],
        "abilities": {
            "75": 0.45,
            "91": 0.45,
            "142": 0.1,
        },
        "moveIds": ["m43", "m420", "m191", "m334"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "91": {
        "name": "Cloyster",
        "emoji": "<:91:1100288966881718342>",
        "description": "When attacked, it launches its horns in quick volleys. Its innards have never been seen.",
        "type": [types.WATER, types.ICE],
        "baseStats": [50, 95, 180, 85, 45, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/91.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/91.png",
        "abilities": {
            "75": 0.45,
            "91": 0.45,
            "142": 0.1,
        },
        "moveIds": ["m420", "m191", "m334", "m534"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "92": {
        "name": "Gastly",
        "emoji": "<:92:1100288967909322783>",
        "description": "Almost invisible, this gaseous POKéMON cloaks the target and puts it to sleep without notice.",
        "type": [types.GHOST, types.POISON],
        "baseStats": [30, 35, 30, 100, 35, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/92.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/92.png",
        "evolution": [{
            "level": 25,
            "id": "93",
        }],
        "abilities": {
            "26": 1
        },
        "moveIds": ["m122", "m506", "m101", "m247"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "93": {
        "name": "Haunter",
        "emoji": "<:93:1100288969935175750>",
        "description": "Because of its ability to slip through block walls, it is said to be from another dimension.",
        "type": [types.GHOST, types.POISON],
        "baseStats": [45, 50, 45, 115, 55, 95],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/93.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/93.png",
        "evolution": [{
            "level": 40,
            "id": "94",
        }],
        "abilities": {
            "26": 1
        },
        "moveIds": ["m506", "m101", "m247", "m269"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "94": {
        "name": "Gengar",
        "emoji": "<:94:1100288971067633765>",
        "description": "Under a full moon, this POKéMON likes to mimic the shadows of people and laugh at their fright.",
        "type": [types.GHOST, types.POISON],
        "baseStats": [60, 65, 60, 130, 75, 110],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/94.png",
        "abilities": {
            "130": 1
        },
        "moveIds": ["m506", "m247", "m269", "m482"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "95": {
        "name": "Onix",
        "emoji": "<:95:1100288972938285177>",
        "description": "As it grows, the stone portions of its body harden to become similar to a diamond, but colored black.",
        "type": [types.ROCK, types.GROUND],
        "baseStats": [35, 45, 160, 70, 30, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/95.png",
        "abilities": {
            "69": 0.45,
            "5": 0.45,
            "133": 0.1
        },
        "moveIds": ["m175", "m203", "m469", "m157"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "98": {
        "name": "Krabby",
        "emoji": "<:98:1100288977631711252>",
        "description": "Its pincers are not only powerful weapons, they are used for balance when walking sideways.",
        "type": [types.WATER],
        "baseStats": [30, 105, 90, 25, 25, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/98.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/98.png",
        "evolution": [{
            "level": 28,
            "id": "99",
        }],
        "abilities": {
            "52": 0.45,
            "75": 0.45,
            "125": 0.1
        },
        "moveIds": ["m175", "m14", "m70", "m127"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "99": {
        "name": "Kingler",
        "emoji": "<:99:1100288979040993314>",
        "description": "The large pincer has 10000 hp of crushing power. However, its huge size makes it unwieldy to use.",
        "type": [types.WATER],
        "baseStats": [55, 130, 115, 75, 50, 75],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/99.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/99.png",
        "abilities": {
            "52": 0.45,
            "75": 0.45,
            "125": 0.1
        },
        "moveIds": ["m175", "m14", "m282", "m152"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "100": {
        "name": "Voltorb",
        "emoji": "<:100:1100288981884751922>",
        "description": "Usually found in power plants. Easily mistaken for a POKé BALL, they have zapped many people.",
        "type": [types.ELECTRIC],
        "baseStats": [40, 30, 50, 55, 55, 100],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/100.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/100.png",
        "evolution": [{
            "level": 30,
            "id": "101",
        }],
        "abilities": {
            "43": 0.45,
            "9": 0.45,
            "106": 0.1
        },
        "moveIds": ["m84", "m269", "m435", "m153"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "101": {
        "name": "Electrode",
        "emoji": "<:101:1100290179073331240>",
        "description": "It stores electric energy under very high pressure. It often explodes with little or no provocation.",
        "type": [types.ELECTRIC],
        "baseStats": [60, 50, 70, 80, 80, 150],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/101.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/101.png",
        "abilities": {
            "43": 0.45,
            "9": 0.45,
            "106": 0.1
        },
        "moveIds": ["m84", "m269", "m435", "m153"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "102": {
        "name": "Exeggcute",
        "emoji": "<:102:1100290181124337685>",
        "description": "Often mistaken for eggs. When disturbed, they quickly gather and attack in swarms.",
        "type": [types.GRASS, types.PSYCHIC],
        "baseStats": [60, 40, 80, 60, 45, 40],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/102.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/102.png",
        "evolution": [{
            "level": 35,
            "id": "103",
        }],
        "abilities": {
            "34": 0.8,
            "139": 0.2
        },
        "moveIds": ["m71", "m94", "m188", "m202"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "103": {
        "name": "Exeggutor",
        "emoji": "<:103:1100290182420369419>",
        "description": "Legend has it that on rare occasions, one of its heads will drop off and continue on as an EXEGGCUTE.",
        "type": [types.GRASS, types.PSYCHIC],
        "baseStats": [95, 95, 85, 125, 65, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/103.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/103.png",
        "abilities": {
            "34": 0.8,
            "139": 0.2
        },
        "moveIds": ["m71", "m94", "m402", "m433"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "107": {
        "name": "Hitmonchan",
        "emoji": "<:107:1100290188539854898>",
        "description": "While apparently doing nothing, it fires punches in lightning fast volleys that are impossible to see.",
        "type": [types.FIGHTING],
        "baseStats": [50, 105, 79, 35, 110, 76],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/107.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/107.png",
        "abilities": {
            "51": 0.45,
            "89": 0.45,
            "39": 0.1
        },
        "moveIds": ["m418", "m68", "m409", "m157"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "108": {
        "name": "Lickitung",
        "emoji": "<:108:1100290190532169819>",
        "description": "Its tongue can be extended like a chameleon's. It leaves a tingling sensation when it licks enemies.",
        "type": [types.NORMAL],
        "baseStats": [90, 55, 75, 60, 75, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/108.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/108.png",
        "abilities": {
            "20": 0.45,
            "12": 0.45,
            "13": 0.1
        },
        "moveIds": ["m122", "m23", "m34", "m428"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "109": {
        "name": "Koffing",
        "emoji": "<:109:1100290191874347008>",
        "description": "Because it stores several kinds of toxic gases in its body, it is prone to exploding without warning.",
        "type": [types.POISON],
        "baseStats": [40, 65, 95, 60, 45, 35],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/109.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/109.png",
        "evolution": [{
            "level": 35,
            "id": "110",
        }],
        "abilities": {
            "26": 0.45,
            "256": 0.45,
            "1": 0.1
        },
        "moveIds": ["m33", "m123", "m108", "m194"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "110": {
        "name": "Weezing",
        "emoji": "<:110:1100290193061318686>",
        "description": "Where two kinds of poison gases meet, 2 KOFFINGs can fuse into a WEEZING over many years.",
        "type": [types.POISON],
        "baseStats": [65, 90, 120, 85, 70, 60],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/110.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/110.png",
        "abilities": {
            "26": 0.45,
            "256": 0.45,
            "1": 0.1
        },
        "moveIds": ["m123", "m108", "m194", "m153"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "110-1": {
        "name": "James's Weezing",
        "emoji": "<:jamesweezing:1117130463186800640>",
        "description": "James's loyal and formidable companion. Its noxious fumes can incapacitate fields of foes.",
        "type": [types.POISON],
        "baseStats": [75, 95, 125, 85, 80, 70],
        "sprite": "https://archives.bulbagarden.net/media/upload/1/1b/Spr_1b_110.png",
        "shinySprite": "https://archives.bulbagarden.net/media/upload/3/3f/Spr_2c_110_s.png",
        "abilities": {
            "26": 1
        },
        "moveIds": ["m123", "m108-1", "m194", "m153"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST,
        "noGacha": true
    },
    "111": {
        "name": "Rhyhorn",
        "emoji": "<:111:1100290441380888576>",
        "description": "Its massive bones are 1000 times harder than human bones. It can easily knock a trailer flying.",
        "type": [types.GROUND, types.ROCK],
        "baseStats": [80, 85, 95, 30, 30, 25],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/111.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/111.png",
        "evolution": [{
            "level": 42,
            "id": "112",
        }],
        "abilities": {
            "31": 0.45,
            "69": 0.45,
            "120": 0.1
        },
        "moveIds": ["m33", "m479", "m444", "m529"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "112": {
        "name": "Rhydon",
        "emoji": "<:112:1100290443150901320>",
        "description": "Protected by an armor-like hide, it is capable of living in molten lava of 3,600 degrees.",
        "type": [types.GROUND, types.ROCK],
        "baseStats": [105, 130, 120, 45, 45, 40],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/112.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/112.png",
        "abilities": {
            "31": 0.45,
            "69": 0.45,
            "120": 0.1
        },
        "moveIds": ["m479", "m14", "m444", "m529"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "113": {
        "name": "Chansey",
        "emoji": "<:113:1100290444249804800>",
        "description": "A rare and elusive POKéMON that is said to bring happiness to those who manage to get it.",
        "type": [types.NORMAL],
        "baseStats": [250, 5, 5, 35, 105, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/113.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/113.png",
        "abilities": {
            "30": 0.45,
            "32": 0.45,
            "131": 0.1
        },
        "moveIds": ["m574", "m113", "m505", "m135"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "120": {
        "name": "Staryu",
        "emoji": "<:120:1100290515284525177>",
        "description": "An enigmatic POKéMON that can effortlessly regenerate any appendage it loses in battle.",
        "type": [types.WATER],
        "baseStats": [30, 45, 55, 70, 55, 85],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/120.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/120.png",
        "evolution": [{
            "level": 36,
            "id": "121",
        }],
        "abilities": {
            "35": 0.45,
            "30": 0.45,
            "148": 0.1
        },
        "moveIds": ["m106", "m94", "m229", "m352"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "121": {
        "name": "Starmie",
        "emoji": "<:121:1100290825935671307>",
        "description": "Its central core glows with the seven colors of the rainbow. Some people value the core as a gem.",
        "type": [types.WATER, types.PSYCHIC],
        "baseStats": [60, 75, 85, 100, 85, 115],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/121.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/121.png",
        "abilities": {
            "35": 0.45,
            "30": 0.45,
            "148": 0.1
        },
        "moveIds": ["m106", "m94", "m229", "m56"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "122": {
        "name": "Mr. Mime",
        "emoji": "<:122:1100290827466575914>",
        "description": "If interrupted while it is miming, it will slap around the offender with its broad hands.",
        "type": [types.PSYCHIC, types.FAIRY],
        "baseStats": [40, 45, 65, 100, 120, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/122.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/122.png",
        "abilities": {
            "43": 0.45,
            "111": 0.45,
            "101": 0.1
        },
        "moveIds": ["m102", "m113", "m115", "m433"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "124": {
        "name": "Jynx",
        "emoji": "<:124:1100290830440333374>",
        "description": "It seductively wiggles its hips as it walks. It can cause people to dance in unison with it.",
        "type": [types.ICE, types.PSYCHIC],
        "baseStats": [65, 50, 35, 115, 95, 95],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/124.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/124.png",
        "abilities": {
            "12": 0.45,
            "108": 0.45,
            "87": 0.1
        },
        "moveIds": ["m93", "m47", "m58", "m195"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "127": {
        "name": "Pinsir",
        "emoji": "<:127:1100290834290720798>",
        "description": "If it fails to crush the victim in its pincers, it will swing it around and toss it hard.",
        "type": [types.BUG],
        "baseStats": [65, 125, 100, 55, 70, 85],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/127.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/127.png",
        "abilities": {
            "52": 0.45,
            "104": 0.45,
            "153": 0.1
        },
        "moveIds": ["m116", "m450", "m276", "m416"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "129": {
        "name": "Magikarp",
        "emoji": "<:129:1100290837092515870>",
        "description": "In the distant past, it was somewhat stronger than the horribly weak descendants that exist today.",
        "type": [types.WATER],
        "baseStats": [20, 10, 55, 15, 20, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/129.png",
        "evolution": [{
            "level": 20,
            "id": "130",
        }],
        "abilities": {
            "33": 0.8,
            "155": 0.2
        },
        "moveIds": ["m33", "m150", "m175", "m340"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "130": {
        "name": "Gyarados",
        "emoji": "<:130:1100290880952348762>",
        "description": "Rarely seen in the wild. Huge and vicious, it is capable of destroying entire cities in a rage.",
        "type": [types.WATER, types.FLYING],
        "baseStats": [95, 125, 79, 60, 100, 81],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/130.png",
        "abilities": {
            "22": 0.8,
            "153": 0.2
        },
        "moveIds": ["m175", "m127", "m349", "m416"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "131": {
        "name": "Lapras",
        "emoji": "<:131:1100291594927742976>",
        "description": "A POKéMON that has been overhunted almost to extinction. It can ferry people across the water.",
        "type": [types.WATER, types.ICE],
        "baseStats": [130, 85, 80, 85, 95, 60],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/131.png",
        "abilities": {
            "11": 0.45,
            "75": 0.45,
            "93": 0.1
        },
        "moveIds": ["m55", "m58", "m573", "m56"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "131-1": {
        "name": "AIIIIIIRRR",
        "emoji": "<:air:1114223243075801198>",
        "description": "A POKéMON that has been overhunted almost to extinction. It helps people traverse harsh terrain of any variety.",
        "type": [types.WATER, types.ICE],
        "baseStats": [130, 90, 80, 90, 95, 65],
        "sprite": "https://archives.bulbagarden.net/media/upload/7/77/Spr_1b_131.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/air-shiny-resized.png",
        "abilities": {
            "11": 1,
        },
        "moveIds": ["m420", "m57", "m70", "m20002"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
        "noGacha": true
    },
    "133": {
        "name": "Eevee",
        "emoji": "<:133:1100291598564204634>",
        "description": "Its genetic code is irregular. It may mutate if it is exposed to radiation from element STONES.",
        "type": [types.NORMAL],
        "baseStats": [55, 55, 50, 45, 65, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/133.png",
        "evolution": [
            {
                "level": 25,
                "id": "134",
            },
            {
                "level": 25,
                "id": "135",
            },
            {
                "level": 25,
                "id": "136",
            },
        ],
        "abilities": {
            "50": 0.45,
            "91": 0.45,
            "107": 0.1
        },
        "moveIds": ["m98", "m36", "m204", "m387"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "134": {
        "name": "Vaporeon",
        "emoji": "<:134:1100291601311486052>",
        "description": "Hey guys, did you know that in terms of...",
        "type": [types.WATER],
        "baseStats": [130, 65, 60, 110, 95, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/134.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/134.png",
        "abilities": {
            "11": 0.8,
            "93": 0.2
        },
        "moveIds": ["m98", "m182", "m273", "m392"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "135": {
        "name": "Jolteon",
        "emoji": "<:135:1100291602402005073>",
        "description": "It accumulates negative ions in the atmosphere to blast out 10000-volt lightning bolts.",
        "type": [types.ELECTRIC],
        "baseStats": [65, 65, 60, 110, 95, 130],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/135.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/135.png",
        "abilities": {
            "10": 0.8,
            "95": 0.2
        },
        "moveIds": ["m98", "m97", "m226", "m528"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "136": {
        "name": "Flareon",
        "emoji": "<:136:1100291603635126402>",
        "description": "When storing thermal energy in its body, its temperature could soar to over 1600 degrees.",
        "type": [types.FIRE],
        "baseStats": [65, 130, 60, 95, 110, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/136.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/136.png",
        "abilities": {
            "18": 0.8,
            "62": 0.2
        },
        "moveIds": ["m98", "m216", "m276", "m394"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "136-1": {
        "name": "False Prophet",
        "emoji": "<:falseprophet:1114045843369119785>",
        "description": "The Deceptive Pokémon known as the False Prophet, its fiery appearance belies its controversial actions and mysterious intentions.",
        "type": [types.FIRE, types.DARK],
        "baseStats": [90, 140, 75, 80, 120, 95],
        "sprite": "https://archives.bulbagarden.net/media/upload/1/1f/Spr_1b_136.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/false-prophet-shiny-resized.png",
        "abilities": {
            "20005": 1
        },
        "moveIds": ["m98", "m276", "m20001", "m394-1"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.MEDIUMSLOW,
        "noGacha": true
    },
    "138": {
        "name": "Omanyte",
        "emoji": "<:138:1100291607103819806>",
        "description": "Although long extinct, in rare cases, it can be genetically resurrected from fossils.",
        "type": [types.ROCK, types.WATER],
        "baseStats": [35, 40, 100, 90, 55, 35],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/138.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/138.png",
        "abilities": {
            "33": 0.45,
            "75": 0.45,
            "133": 0.1
        },
        "moveIds": ["m110", "m57", "m182", "m317"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "139": {
        "name": "Omastar",
        "emoji": "<:139:1100291608139796490>",
        "description": "A prehistoric POKéMON that died out when its heavy shell made it impossible to catch prey.",
        "type": [types.ROCK, types.WATER],
        "baseStats": [70, 60, 125, 115, 70, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/139.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/139.png",
        "abilities": {
            "33": 0.45,
            "75": 0.45,
            "133": 0.1
        },
        "moveIds": ["m110", "m182", "m317", "m56"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "139-1": {
        "name": "Lord Helix",
        "emoji": "<:lordhelix:1114224346873991268>",
        "description": "The Divine Fossil Pokémon revered as a symbol of balance and divine intervention, worshipped for its guidance and miracles during tumultuous times of anarchy.",
        "type": [types.ROCK, types.PSYCHIC],
        "baseStats": [120, 80, 140, 115, 80, 65],
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/lord-helix-resized.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/lord-helix-shiny-resized.png",
        "abilities": {
            "20006": 1
        },
        "moveIds": ["m110", "m182", "m317-1", "m56-2"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.MEDIUMSLOW,
        "noGacha": true
    },
    "142": {
        "name": "Aerodactyl",
        "emoji": "<:142:1100294776689004546>",
        "description": "A ferocious, prehistoric POKéMON that goes for the enemy's throat with its serrated saw-like fangs.",
        "type": [types.ROCK, types.FLYING],
        "baseStats": [80, 105, 65, 60, 75, 130],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/142.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/142.png",
        "abilities": {
            "69": 0.45,
            "46": 0.45,
            "127": 0.1
        },
        "moveIds": ["m17", "m317", "m446", "m157"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "143": {
        "name": "Snorlax",
        "emoji": "<:143:1100294778157027328>",
        "description": "Very lazy. Just eats and sleeps. As its rotund bulk builds, it becomes steadily more slothful.",
        "type": [types.NORMAL],
        "baseStats": [160, 110, 65, 65, 110, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/143.png",
        "abilities": {
            "17": 0.45,
            "47": 0.45,
            "82": 0.1
        },
        "moveIds": ["m214", "m34", "m484", "m156"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "144" : {
        "name": "Articuno",
        "emoji": "<:144:1100294779419504680>",
        "description": "A legendary bird POKéMON that is said to appear to doomed people who are lost in icy mountains.",
        "type": [types.ICE, types.FLYING],
        "baseStats": [90, 85, 100, 95, 125, 85],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/144.png",
        "abilities": {
            "46": 0.8,
            "81": 0.2
        },
        "moveIds": ["m420", "m215", "m355", "m542"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW
    },
    "145" : {
        "name": "Zapdos",
        "emoji": "<:145:1100294781789286500>",
        "description": "A legendary bird POKéMON that is said to appear from clouds while dropping enormous lightning bolts.",
        "type": [types.ELECTRIC, types.FLYING],
        "baseStats": [90, 90, 85, 125, 90, 100],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/145.png",
        "abilities": {
            "46": 0.8,
            "9": 0.2
        },
        "moveIds": ["m64", "m86", "m435", "m366"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW
    },
    "145-1" : {
        "name": "AA-j",
        "emoji": "<:aaj:1114223240047493241>",
        "description": "Known for its unpredictability and immense power, many were sacrificed to bring this electrifying Pokemon into being.",
        "type": [types.ELECTRIC, types.FLYING],
        "baseStats": [90, 95, 85, 130, 90, 90],
        "sprite": "https://archives.bulbagarden.net/media/upload/d/dd/Spr_1b_145.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/aaj-shiny-resized.png",
        "abilities": {
            "20007": 1
        },
        "moveIds": ["m84", "m65", "m435-1", "m87-1"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW,
        "noGacha": true
    },
    "146" : {
        "name": "Moltres",
        "emoji": "<:146:1100294783097917490>",
        "description": "Known as the legendary bird of fire. Every flap of its wings creates a dazzling flash of flames.",
        "type": [types.FIRE, types.FLYING],
        "baseStats": [90, 100, 90, 125, 85, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/146.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/146.png",
        "abilities": {
            "46": 0.8,
            "49": 0.2
        },
        "moveIds": ["m52", "m53", "m97", "m143"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW
    },
    "147": {
        "name": "Dratini", 
        "emoji": "<:147:1100294785367015434>",
        "description": "Long considered a mythical POKéMON until recently when a small colony was found living underwater.",
        "type": [types.DRAGON],
        "baseStats": [41, 64, 45, 50, 50, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/147.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/147.png",
        "evolution": [{
            "level": 30,
            "id": "148",
        }],
        "abilities": {
            "61": 0.8,
            "63": 0.2
        },
        "moveIds": ["m35", "m239", "m21", "m349"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW
    },
    "148": {
        "name": "Dragonair",
        "emoji": "<:148:1100294786474332230>",
        "description": "A mystical POKéMON that exudes a gentle aura. Has the ability to change climate conditions.",
        "type": [types.DRAGON],
        "baseStats": [61, 84, 65, 70, 70, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/148.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/148.png",
        "evolution": [{
            "level": 55,
            "id": "149",
        }],
        "abilities": {
            "61": 0.8,
            "63": 0.2
        },
        "moveIds": ["m239", "m245", "m349", "m407"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW
    },
    "149": {
        "name": "Dragonite",
        "emoji": "<:149:1100294787996860508>",
        "description": "An extremely rarely seen marine POKéMON. Its intelligence is said to match that of humans.",
        "type": [types.DRAGON, types.FLYING],
        "baseStats": [91, 134, 95, 100, 100, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/149.png",
        "abilities": {
            "39": 0.8,
            "138": 0.2
        },
        "moveIds": ["m239", "m245", "m349", "m200"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW
    },
    "150": {
        "name": "Mewtwo",
        "emoji": "<:150:1100294789867520052>",
        "description": "It was created by a scientist after years of horrific gene splicing and DNA engineering experiments.",
        "type": [types.PSYCHIC],
        "baseStats": [106, 110, 90, 154, 90, 130],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/150.png",
        "abilities": {
            "46": 0.8,
            "127": 0.2
        },
        "moveIds": ["m246", "m53", "m58", "m540"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW
    },
    "150-1": {
        "name": "Armored Mewtwo",
        "emoji": "<:armoredmewtwo:1117130461282578535>",
        "description": "A genetic clone donning inpenetrable armor. Its powers are dedicated to battling.",
        "type": [types.PSYCHIC, types.STEEL],
        "baseStats": [120, 95, 120, 135, 105, 105],
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/armored-mewtwo.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/armored-mewtwo-shiny.png",
        "abilities": {
            "46": 1
        },
        "moveIds": ["m246", "m334-2", "m430", "m540"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW,
        "noGacha": true
    },
    "151": {
        "name": "Mew",
        "emoji": "<:151:1116755839919853670>",
        "description": "So rare that it is still said to be a mirage by many experts. Only a few people have seen it worldwide.",
        "type": [types.PSYCHIC],
        "baseStats": [100, 100, 100, 100, 100, 100],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/151.png",
        "abilities": {
            "28": 1
        },
        "moveIds": ["m246", "m94", "m396", "m63"],
        "battleEligible": true,
        "rarity": rarities.MYTHICAL,
        "growthRate": growthRates.MEDIUMSLOW,
        "noGacha": true,
        "mythicConfig": {
            "basicMoveIds": [
                "m16", "m17", "m22", "m35", "m40", "m43", "m51", "m52", "m55", "m71", "m77", "m81", 
                "m84", "m93", "m98", "m100", "m102", "m106", "m116", "m118", "m122", "m123", "m175", 
                "m189", "m205", "m214", "m239", "m246", "m270", "m418", "m420", "m479", "m506",
                "m574", "m876"
            ],
            "powerMoveIds": [
                "m14", "m34", "m36", "m46",  "m53", "m57", "m58", "m60", "m65", "m68",
                "m70", "m85", "m86", "m91", "m92", "m94", "m113", "m115", "m127", "m182", "m188", "m191",
                "m203", "m215",  "m216", "m219", "m226", "m247", "m269", "m202", "m276", "m283",
                "m317", "m334", "m340", "m352", "m355", "m369", "m387", "m396", "m398", "m402",
                "m409", "m414", "m417", "m424", "m430", "m441", "m444", "m446", "m450", "m521", "m523",
                "m525", "m529"
            ],
            "ultimateMoveIds": [
                "m38", "m56", "m63", "m76", "m87", "m89", "m135", "m143", "m153", "m156", "m157", 
                "m162", "m200", "m223", "m257", "m304", "m366", "m394", "m405", "m413", "m416", 
                "m428", "m433", "m437", "m482", "m528", "m542"
            ]
        }
    },
    "20091": {
        "name": "Temple Guardian Cloyster",
        "emoji": "<:91:1100288966881718342>",
        "description": "Faithful guardian of the ancient Mind Temple. It's said to be untouchable through centuries of perfecting its mind.",
        "type": [types.WATER, types.ICE],
        "baseStats": [160, 105, 180, 90, 75, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/91.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/91.png",
        "abilities": {
            "20001": 1
        },
        "moveIds": ["m420", "m191", "m334", "m534"],
        "battleEligible": true,
        "rarity": rarities.MYTHICAL,
        "growthRate": growthRates.MEDIUMSLOW,
        "unobtainable": true,
    },
    "20101": {
        "name": "Cave Dweller Electrode",
        "emoji": "<:101:1100290179073331240>",
        "description": "The provider and powerhouse of the Soul Cave's primordial energy. It's said to harness the energy from every emotion ever experienced.",
        "type": [types.ELECTRIC],
        "baseStats": [115, 90, 75, 115, 80, 225],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/101.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/101.png",
        "abilities": {
            "20003": 1
        },
        "moveIds": ["m84", "m269", "m435", "m528"],
        "battleEligible": true,
        "rarity": rarities.MYTHICAL,
        "growthRate": growthRates.MEDIUMFAST,
        "unobtainable": true,
    },
    "20113": {
        "name": "Cave Dweller Chansey",
        "emoji": "<:113:1100290444249804800>",
        "description": "The life force of the Soul Cave. A millenia of harnessing soul energy has made it an unbreakable guardian.",
        "type": [types.NORMAL],
        "baseStats": [350, 40, 45, 80, 100, 85],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/113.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/113.png",
        "abilities": {
            "20002": 1
        },
        "moveIds": ["m574", "m113", "m505", "m585"],
        "battleEligible": true,
        "rarity": rarities.MYTHICAL,
        "growthRate": growthRates.MEDIUMFAST,
        "unobtainable": true,
    },
    "20144" : {
        "name": "Temple Guardian Articuno",
        "emoji": "<:144:1100294779419504680>",
        "description": "Stalwart guardian of the Mind Temple. It's been bestowed wisdom from the ancient gods.",
        "type": [types.ICE, types.FLYING],
        "baseStats": [170, 85, 90, 100, 160, 95],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/144.png",
        "abilities": {
            "20001": 1
        },
        "moveIds": ["m420", "m58", "m215", "m542"],
        "battleEligible": true,
        "rarity": rarities.MYTHICAL,
        "growthRate": growthRates.SLOW,
        "unobtainable": true,
    },
    "20149": {
        "name": "Spirit Priest Dragonite",
        "emoji": "<:149:1100294787996860508>",
        "description": "The protector and most devout follower of the Spirit Altar. Its unstoppable will has been hardened through communion with the ancient gods.",
        "type": [types.DRAGON, types.FLYING],
        "baseStats": [120, 165, 80, 100, 90, 145],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/149.png",
        "abilities": {
            "20004": 1
        },
        "moveIds": ["m239", "m245", "m349", "m200"],
        "battleEligible": true,
        "rarity": rarities.MYTHICAL,
        "growthRate": growthRates.SLOW,
        "unobtainable": true,
    },
    "20150": {
        "name": "Spirit Priest Mewtwo",
        "emoji": "<:150:1100294789867520052>",
        "description": "The sole founder of the Spirit Altar. It was created by the gods after centuries of meditation and prayer.",
        "type": [types.PSYCHIC],
        "baseStats": [125, 85, 85, 170, 85, 150],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/150.png",
        "abilities": {
            "20004": 1
        },
        "moveIds": ["m246", "m53", "m58", "m540"],
        "battleEligible": true,
        "rarity": rarities.MYTHICAL,
        "growthRate": growthRates.SLOW,
        "unobtainable": true,
    },
}

const rarityBins = {
    [rarities.COMMON]: [],
    [rarities.RARE]: [],
    [rarities.EPIC]: [],
    [rarities.LEGENDARY]: []
}

for (const id in pokemonConfig) {
    const speciesData = pokemonConfig[id];
    if (speciesData.noGacha || speciesData.unobtainable) {
        continue;
    }
    if (speciesData.rarity === rarities.MYTHICAL) {
        continue;
    }

    rarityBins[speciesData.rarity].push(id);
}

// TODO: fix pokemon rarity bins
const rarityConfig = {
    [rarities.COMMON]: {
        pokemon: [],
        color: 0x00ff00,
        money: 25,
    },
    [rarities.RARE]: {
        pokemon: [],
        color: 0x0000ff,
        money: 50,
    },
    [rarities.EPIC]: {
        pokemon: [],
        color: 0xff00ff,
        money: 75,
    },
    [rarities.LEGENDARY]: {
        pokemon: [],
        color: 0xffff00,
        money: 200,
    },
    [rarities.MYTHICAL]: {
        pokemon: [],
        color: 0xff0000,
        money: 10000,
    },
}

MAX_TOTAL_EVS = 510;
MAX_SINGLE_EVS = 252;

module.exports = {
    pokemonConfig,
    rarities,
    rarityBins,
    rarityConfig,
    types,
    typeConfig,
    growthRates,
    growthRateConfig,
    natureConfig,
    MAX_TOTAL_EVS,
    MAX_SINGLE_EVS,
    stats,
    statConfig
}
