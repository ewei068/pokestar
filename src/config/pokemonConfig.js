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
        "emoji": "<:3_:1100279986012819536>",
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
        "emoji": "<:4_:1100279987057209364>",
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
        "emoji": "<:5_:1100279988156104774>",
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
        "emoji": "<:6_:1100279989703819264>",
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
        "emoji": "<:7_:1100279990806904882>",
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
        "emoji": "<:8_:1100279991813558332>",
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
        "evolution": [{
            "level": 42,
            "id": "169",
        }],
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
        "evolution": [
            {
                "level": 31,
                "id": "45",
            },
            {
                "level": 31,
                "id": "182",
            }
        ],
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
        "emoji": "<:rocketmeowth:1117873583537016832>",
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
    "60": {
        "name": "Poliwag",
        "emoji": "<:60:1100285079281991781>",
        "description": "Its newly grown legs prevent it from running. It appears to prefer swimming than trying to stand.",
        "type": [types.WATER],
        "baseStats": [40, 50, 40, 40, 40, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/60.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/60.png",
        "evolution": [{
            "level": 25,
            "id": "61",
        }],
        "abilities": {
            "11": 0.45,
            "6": 0.45,
            "33": 0.1
        },
        "moveIds": ["m55", "m876", "m34", "m127"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "61": {
        "name": "Poliwhirl",
        "emoji": "<:61:1100286232086454313>",
        "description": "Capable of living in or out of water. When out of water, it sweats to keep its body slimy.",
        "type": [types.WATER],
        "baseStats": [65, 65, 65, 50, 50, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/61.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/61.png",
        "evolution": [
            {
                "level": 36,
                "id": "62",
            },
            {
                "level": 36,
                "id": "186",
            },
        ],
        "abilities": {
            "11": 0.45,
            "6": 0.45,
            "33": 0.1
        },
        "moveIds": ["m876", "m34", "m127", "m187"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "62": {
        "name": "Poliwrath",
        "emoji": "<:62:1100286233449611336>",
        "description": "An adept swimmer at both the front crawl and breast stroke. Easily overtakes the best human swimmers.",
        "type": [types.WATER, types.FIGHTING],
        "baseStats": [90, 95, 95, 70, 90, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/62.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/62.png",
        "abilities": {
            "11": 0.45,
            "6": 0.45,
            "33": 0.1
        },
        "moveIds": ["m876", "m127", "m187", "m223"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
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
    "79": {
        "name": "Slowpoke",
        "emoji": "<:79:1100287560393183233>",
        "description": "Incredibly slow and dopey. It takes 5 seconds for it to feel pain when under attack.",
        "type": [types.WATER, types.PSYCHIC],
        "baseStats": [90, 65, 65, 40, 40, 15],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/79.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/79.png",
        "evolution": [
            {
                "level": 37,
                "id": "80",
            },
            {
                "level": 37,
                "id": "199",
            }
        ],
        "abilities": {
            "12": 0.45,
            "20": 0.45,
            "144": 0.1
        },
        "moveIds": ["m93", "m58", "m94", "m503"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "80": {
        "name": "Slowbro",
        "emoji": "<:80:1100287586657902654>",
        "description": "The SHELLDER that is latched onto SLOWPOKE's tail is said to feed on the host's left over scraps.",
        "type": [types.WATER, types.PSYCHIC],
        "baseStats": [95, 75, 110, 100, 80, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/80.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/80.png",
        "abilities": {
            "12": 0.45,
            "20": 0.45,
            "144": 0.1
        },
        "moveIds": ["m93", "m58", "m503", "m303"],
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
        "evolution": [{
            "id": "208",
            "level": 40
        }],
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
    "106": {
        "name": "Hitmonlee",
        "emoji": "<:106:1100290187147362405>",
        "description": "When in a hurry, its legs lengthen progressively. It runs smoothly with extra long, loping strides.",
        "type": [types.FIGHTING],
        "baseStats": [50, 120, 53, 35, 110, 87],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/106.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/106.png",
        "abilities": {
            "7": 0.45,
            "120": 0.45,
            "84": 0.1
        },
        "moveIds": ["m116", "m68", "m299", "m136"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
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
        "evolution": [{
            "level": 50,
            "id": "242",
        }],
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
    "123": {
        "name": "Scyther",
        "emoji": "<:123:1100290829127516160>",
        "description": "With ninja-like agility and speed, it can create the illusion that there is more than one.",
        "type": [types.BUG, types.FLYING],
        "baseStats": [70, 110, 80, 55, 80, 105],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/123.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/123.png",
        "evolution": [{
            "level": 50,
            "id": "212",
        }],
        "abilities": {
            "68": 0.45,
            "101": 0.45,
            "80": 0.1
        },
        "moveIds": ["m98", "m14", "m332", "m404"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "123-1": {
        "name": "Scoro",
        "emoji": "<:zoro:1136890672775954432>",
        "description": "A Pokemon with another world, it has devoted its life to becomming the world's strongest Bug-type.",
        "type": [types.BUG, types.DARK],
        "baseStats": [80, 125, 90, 65, 90, 90],
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/zoro-resized.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/zoro-shiny-resized.png",
        "abilities": {
            "101": 1
        },
        "moveIds": ["m210", "m14", "m331-1", "m20009"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
        "noGacha": true
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
        "moveIds": ["m55", "m503", "m573", "m59"],
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
        "moveIds": ["m249", "m57", "m70", "m20002"],
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
            {
                "level": 25,
                "id": "196",
            },
            {
                "level": 25,
                "id": "197",
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
    "143-1": {
        "name": "Sleeping Snorlax",
        "emoji": "<:sleepingsnorlax:1132059622979670096>",
        "description": "The star of Pokemon Sleep, this Snorlax is always sleeping. The more it sleeps, the more powerful it gets.",
        "type": [types.NORMAL],
        "baseStats": [160, 100, 70, 60, 80, 80],
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/sleeping-snorlax-resized.png",
        "shinySprite": "https://media.tenor.com/-Uz6xHwMa4gAAAAi/snorlax-snorlax-pokemon.gif",
        "abilities": {
            "62": 1
        },
        "moveIds": ["m214", "m34-1", "m281", "m156"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
        "noGacha": true
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
            "136": 0.2
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
    "150-2": {
        "name": "Red Hair Mewtwo",
        "emoji": "<:shanks:1136890671588970498>",
        "description": "A genetic clone of a powerful emperor. Its conquering presence alone frightens Pokemon to the brink of fainting.",
        "type": [types.PSYCHIC],
        "baseStats": [106, 130, 90, 130, 90, 134],
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/shanks-resized.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/shanks-shiny-resized.png",
        "abilities": {
            "46-1": 1
        },
        "moveIds": ["m210", "m348", "m403", "m540-1"],
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
                "m189", "m205", "m214", "m239", "m246", "m249", "m270", "m311", "m418", "m420", "m453", "m479", "m506", "m526",
                "m574", "m876"
            ],
            "powerMoveIds": [
                "m14", "m34", "m36", "m46",  "m53", "m57", "m58", "m60", "m65", "m68",
                "m70", "m85", "m86", "m91", "m92", "m94", "m113", "m115", "m127", "m168", "m182", "m188", "m191",
                "m203", "m215", "m216", "m219", "m226", "m240", "m241", "m247", "m258", "m269", "m202", "m252", "m276", "m283",
                "m317", "m334", "m340", "m347", "m352", "m355", "m369", "m387", "m396", "m398", "m402", "m406",
                "m409", "m412", "m414", "m417", "m424", "m430", "m432", "m441", "m444", "m446", "m450", "m492", "m503", "m521", "m523",
                "m525", "m529", "m583", "m710"
            ],
            "ultimateMoveIds": [
                "m38", "m56", "m59", "m63", "m76", "m87", "m89", "m126", "m135", "m143", "m153", "m156", "m157", 
                "m162", "m192", "m200", "m223", "m257", "m304", "m366", "m394", "m405", "m413", "m416", 
                "m428", "m433", "m437", "m482", "m528", "m542"
            ]
        }
    },
    "152": {
        "name": "Chikorita",
        "emoji": "<:152:1116755846769168434>",
        "description": "It waves its leaf around to keep foes at bay. However, a sweet fragrance also wafts from the leaf, creating a friendly atmosphere that becalms the battlers.",
        "type": [types.GRASS],
        "baseStats": [45, 49, 65, 49, 65, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/152.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/152.png",
        "evolution": [{
            "level": 16,
            "id": "153"
        }],
        "abilities": {
            "65": 0.8,
            "102": 0.2,
        },
        "moveIds": ["m22", "m77", "m73", "m202"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "153": {
        "name": "Bayleef",
        "emoji": "<:153:1116755847712870470>",
        "description": "The scent that wafts from the leaves on its neck causes anyone who smells it to become energetic.",
        "type": [types.GRASS],
        "baseStats": [60, 62, 80, 63, 80, 60],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/153.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/153.png",
        "evolution": [{
            "level": 32,
            "id": "154"
        }],
        "abilities": {
            "65": 0.8,
            "102": 0.2,
        },
        "moveIds": ["m77", "m73", "m202", "m525"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "154": {
        "name": "Meganium",
        "emoji": "<:154:1116755848803405936>",
        "description": "The flower on its back blooms when it is absorbing solar energy. It stays on the move to seek sunlight.",
        "type": [types.GRASS],
        "baseStats": [80, 82, 100, 83, 100, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/154.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/154.png",
        "abilities": {
            "65": 0.8,
            "102": 0.2,
        },
        "moveIds": ["m77", "m202", "m525", "m316"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "155": {
        "name": "Cyndaquil",
        "emoji": "<:155:1116755850229456969>",
        "description": "It has a timid nature. If it is startled, the flames on its back burn more vigorously.",
        "type": [types.FIRE],
        "baseStats": [39, 52, 43, 60, 50, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/155.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/155.png",
        "evolution": [{
            "level": 14,
            "id": "156"
        }],
        "abilities": {
            "66": 0.8,
            "18": 0.2,
        },
        "moveIds": ["m43", "m52", "m53", "m424"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "156": {
        "name": "Quilava",
        "emoji": "<:156:1116755851542274099>",
        "description": "It intimidates foes with the heat of its flames. The fire burns more strongly when it readies to fight.",
        "type": [types.FIRE],
        "baseStats": [58, 64, 58, 80, 65, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/156.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/156.png",
        "evolution": [{
            "level": 36,
            "id": "157"
        }],
        "abilities": {
            "66": 0.8,
            "18": 0.2,
        },
        "moveIds": ["m52", "m53", "m36", "m424"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "157": {
        "name": "Typhlosion",
        "emoji": "<:157:1116755852565696594>",
        "description": "If its rage peaks, it becomes so hot that anything that touches it will instantly go up in flames.",
        "type": [types.FIRE],
        "baseStats": [78, 84, 78, 109, 85, 100],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/157.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/157.png",
        "abilities": {
            "66": 0.8,
            "18": 0.2,
        },
        "moveIds": ["m52", "m53", "m247", "m284"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "157-1": {
        "name": "Gold's Typhlosion",
        "emoji": "<:goldtyphlosion:1127276634853101688>",
        "description": "Gold's Typhlosion obscures itself behind a shimmering heat haze that it creates using its intensely hot flames. This Pokémon creates blazing explosive blasts that burn everything to cinders.",
        "type": [types.FIRE],
        "baseStats": [90, 70, 78, 115, 85, 102],
        "sprite": "https://archives.bulbagarden.net/media/upload/b/b9/Spr_2g_157.png",
        "shinySprite": "https://archives.bulbagarden.net/media/upload/6/6c/Spr_2g_157_s.png",
        "abilities": {
            "94": 1,
        },
        "moveIds": ["m52", "m53", "m20005", "m284"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
        "noGacha": true
    },
    "158": {
        "name": "Totodile",
        "emoji": "<:158:1116755865123442739>",
        "description": "Its well-developed jaws are powerful and capable of crushing anything. Even its trainer must be careful.",
        "type": [types.WATER],
        "baseStats": [50, 65, 64, 43, 44, 48],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/158.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/158.png",
        "evolution": [{
            "level": 18,
            "id": "159"
        }],
        "abilities": {
            "67": 0.8,
            "125": 0.2,
        },
        "moveIds": ["m10", "m43", "m127", "m242"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "159": {
        "name": "Croconaw",
        "emoji": "<:159:1116755866650153051>",
        "description": "Once it bites down, it won't let go until it loses its fangs. New fangs quickly grow into place, so it tries to bite on everything.",
        "type": [types.WATER],
        "baseStats": [65, 80, 80, 58, 59, 63],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/159.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/159.png",
        "evolution": [{
            "level": 30,
            "id": "160"
        }],
        "abilities": {
            "67": 0.8,
            "125": 0.2,
        },
        "moveIds": ["m10", "m70", "m127", "m242"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "160": {
        "name": "Feraligatr",
        "emoji": "<:160:1116756250579959858>",
        "description": "It opens its huge mouth to intimidate enemies. In battle, it runs using its thick and powerful hind legs to charge the foe with incredible speed.",
        "type": [types.WATER],
        "baseStats": [85, 105, 100, 78, 79, 83],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/160.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/160.png",
        "abilities": {
            "67": 0.8,
            "125": 0.2,
        },
        "moveIds": ["m10", "m127", "m242", "m416"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "161": {
        "name": "Sentret",
        "emoji": "<:161:1116755922249846924>",
        "description": "When acting as a lookout, it warns others of danger by screeching and hitting the ground with its tail.",
        "type": [types.NORMAL],
        "baseStats": [35, 46, 34, 35, 45, 20],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/161.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/161.png",
        "evolution": [{
            "level": 15,
            "id": "162"
        }],
        "abilities": {
            "50": 0.45,
            "51": 0.45,
            "119": 0.1,
        },
        "moveIds": ["m270", "m21", "m97", "m226"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST
    },
    "162": {
        "name": "Furret",
        "emoji": "<:162:1116755923642363924>",
        "description": "It makes a nest to suit its long and skinny body. The nest is impossible for other Pokémon to enter.",
        "type": [types.NORMAL],
        "baseStats": [85, 76, 64, 45, 45, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/162.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/162.png",
        "abilities": {
            "50": 0.45,
            "51": 0.45,
            "119": 0.1,
        },
        "moveIds": ["m270", "m97", "m226", "m38"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST
    },
    "163": {
        "name": "Hoothoot",
        "emoji": "<:163:1116755924858703932>",
        "description": "It has an internal organ that senses the earth's rotation. Using this special organ, a Hoothoot begins hooting at precisely the same time every day.",
        "type": [types.NORMAL, types.FLYING],
        "baseStats": [60, 30, 30, 50, 50, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/163.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/163.png",
        "evolution": [{
            "level": 16,
            "id": "164"
        }],
        "abilities": {
            "15": 0.45,
            "51": 0.45,
            "110": 0.1,
        },
        "moveIds": ["m526", "m97", "m355", "m403"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST
    },
    "164": {
        "name": "Noctowl",
        "emoji": "<:164:1116755926037311490>",
        "description": "Its eyes are specially adapted. They concentrate even faint light and enable it to see in the dark.",
        "type": [types.NORMAL, types.FLYING],
        "baseStats": [100, 50, 50, 76, 96, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/164.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/164.png",
        "abilities": {
            "15": 0.45,
            "51": 0.45,
            "110": 0.1,
        },
        "moveIds": ["m526", "m97", "m355", "m542"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST
    },
    "165": {
        "name": "Ledyba",
        "emoji": "<:165:1116755928121868298>",
        "description": "It is very timid. It will be afraid to move if it is alone. But it will be active if it is in a group.",
        "type": [types.BUG, types.FLYING],
        "baseStats": [40, 20, 30, 40, 80, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/165.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/165.png",
        "evolution": [{
            "level": 18,
            "id": "166"
        }],
        "abilities": {
            "68": 0.45,
            "48": 0.45,
            "155": 0.1,
        },
        "moveIds": ["m33", "m183", "m226", "m450"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST
    },
    "166": {
        "name": "Ledian",
        "emoji": "<:166:1116755929082363985>",
        "description": "When the stars flicker in the night sky, it flutters about, scattering a glowing powder.",
        "type": [types.BUG, types.FLYING],
        "baseStats": [55, 35, 50, 55, 110, 85],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/166.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/166.png",
        "abilities": {
            "68": 0.45,
            "48": 0.45,
            "89": 0.1,
        },
        "moveIds": ["m183", "m226", "m450", "m405"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST
    },
    "167": {
        "name": "Spinarak",
        "emoji": "<:167:1116755930084818967>",
        "description": "It spins a web using fine--but durable--thread. It then waits patiently for prey to be trapped.",
        "type": [types.BUG, types.POISON],
        "baseStats": [40, 60, 40, 40, 40, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/167.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/167.png",
        "evolution": [{
            "level": 18,
            "id": "168"
        }],
        "abilities": {
            "68": 0.45,
            "15": 0.45,
            "97": 0.1,
        },
        "moveIds": ["m40", "m81", "m224", "m564"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST
    },
    "168": {
        "name": "Ariados",
        "emoji": "<:168:1116755931053707316>",
        "description": "It spins string not only from its rear but also from its mouth. It's hard to tell which end is which.",
        "type": [types.BUG, types.POISON],
        "baseStats": [70, 90, 70, 60, 70, 40],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/168.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/168.png",
        "abilities": {
            "68": 0.45,
            "15": 0.45,
            "97": 0.1,
        },
        "moveIds": ["m40", "m224", "m564", "m672"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST
    },
    "169": {
        "name": "Crobat",
        "emoji": "<:169:1116755982895304805>",
        "description": "It flies so silently through the dark on its four wings that it may not be noticed even when nearby.",
        "type": [types.POISON, types.FLYING],
        "baseStats": [85, 90, 80, 70, 80, 130],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/169.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/169.png",
        "abilities": {
            "39": 0.8,
            "151": 0.2,
        },
        "moveIds": ["m17", "m269", "m305", "m366"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "179": {
        "name": "Mareep",
        "emoji": "<:179:1116756067767029843>",
        "description": "Its fluffy wool rubs together and builds a static charge. The more energy is charged, the more brightly the lightbulb at the tip of its tail glows.",
        "type": [types.ELECTRIC],
        "baseStats": [55, 40, 40, 65, 45, 35],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/179.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/179.png",
        "evolution": [{
            "level": 15,
            "id": "180"
        }],
        "abilities": {
            "9": 0.8,
            "57": 0.2,
        },
        "moveIds": ["m33", "m84", "m85", "m527"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST
    },
    "180": {
        "name": "Flaaffy",
        "emoji": "<:180:1116756068941443193>",
        "description": "As a result of storing too much electricity, it developed patches where even downy wool won't grow.",
        "type": [types.ELECTRIC],
        "baseStats": [70, 55, 55, 80, 60, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/180.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/180.png",
        "evolution": [{
            "level": 30,
            "id": "181"
        }],
        "abilities": {
            "9": 0.8,
            "57": 0.2,
        },
        "moveIds": ["m84", "m85", "m215", "m527"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "181": {
        "name": "Ampharos",
        "emoji": "<:181:1116756069931302972>",
        "description": "The tail's tip shines brightly and can be seen from far away. It acts as a beacon for lost people.",
        "type": [types.ELECTRIC],
        "baseStats": [90, 75, 85, 115, 90, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/181.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/181.png",
        "abilities": {
            "9": 0.8,
            "57": 0.2,
        },
        "moveIds": ["m84", "m215", "m527", "m192"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "182": {
        "name": "Bellossom",
        "emoji": "<:182:1116756070740799509>",
        "description": "When Bellossom gets exposed to plenty of sunlight, the leaves ringing its body begin to spin around. This Pokémon's dancing is renowned in the southern lands.",
        "type": [types.GRASS],
        "baseStats": [75, 80, 95, 90, 100, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/182.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/182.png",
        "abilities": {
            "34": 0.8,
            "131": 0.2,
        },
        "moveIds": ["m71", "m73", "m483", "m585"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "183": {
        "name": "Marill",
        "emoji": "<:183:1116756072523378743>",
        "description": "Marill's oil-filled tail acts much like a life preserver. If you see just its tail bobbing on the water's surface, it's a sure indication that this Pokémon is diving beneath the water to feed on aquatic plants.",
        "type": [types.WATER, types.FAIRY],
        "baseStats": [70, 20, 50, 20, 50, 40],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/183.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/183.png",
        "evolution": [{
            "level": 30,
            "id": "184"
        }],
        "abilities": {
            "47": 0.45,
            "37": 0.45,
            "157": 0.1,
        },
        "moveIds": ["m453", "m36", "m187", "m583"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST
    },
    "184": {
        "name": "Azumarill",
        "emoji": "<:184:1116756074121408693>",
        "description": "Azumarill's long ears are indispensable sensors. By focusing its hearing, this Pokémon can identify what kinds of prey are around, even in rough and fast-running rivers.",
        "type": [types.WATER, types.FAIRY],
        "baseStats": [100, 50, 80, 50, 80, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/184.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/184.png",
        "abilities": {
            "47": 0.45,
            "37": 0.45,
            "157": 0.1,
        },
        "moveIds": ["m453", "m187", "m583", "m38"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "186": {
        "name": "Politoed",
        "emoji": "<:186:1116756077007085618>",
        "description": "Whenever three or more of these get together, they sing in a loud voice that sounds like bellowing.",
        "type": [types.WATER],
        "baseStats": [90, 75, 75, 90, 100, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/186.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/186.png",
        "abilities": {
            "11": 0.45,
            "6": 0.45,
            "2": 0.1
        },
        "moveIds": ["m270", "m57", "m58", "m195"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "187": {
        "name": "Hoppip",
        "emoji": "<:187:1116756122334929037>",
        "description": "This Pokémon drifts and floats with the wind. If it senses the approach of strong winds, Hoppip links its leaves with other Hoppip to prepare against being blown away.",
        "type": [types.GRASS, types.FLYING],
        "baseStats": [35, 35, 40, 35, 55, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/187.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/187.png",
        "evolution": [{
            "level": 18,
            "id": "188"
        }],
        "abilities": {
            "34": 0.45,
            "102": 0.45,
            "151": 0.1,
        },
        "moveIds": ["m33", "m270", "m79", "m476"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST
    },
    "188": {
        "name": "Skiploom",
        "emoji": "<:188:1116756124989915270>",
        "description": "Skiploom's flower blossoms when the temperature rises above 64 degrees Fahrenheit. How much the flower opens depends on the temperature. For that reason, this Pokémon is sometimes used as a thermometer.",
        "type": [types.GRASS, types.FLYING],
        "baseStats": [55, 45, 50, 45, 65, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/188.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/188.png",
        "evolution": [{
            "level": 27,
            "id": "189"
        }],
        "abilities": {
            "34": 0.45,
            "102": 0.45,
            "151": 0.1,
        },
        "moveIds": ["m270", "m79", "m340", "m476"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "189": {
        "name": "Jumpluff",
        "emoji": "<:189:1116756126747336754>",
        "description": "Jumpluff rides warm southern winds to cross the sea and fly to foreign lands. The Pokémon descends to the ground when it encounters cold air while it is floating.",
        "type": [types.GRASS, types.FLYING],
        "baseStats": [75, 55, 70, 55, 85, 110],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/189.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/189.png",
        "abilities": {
            "34": 0.45,
            "102": 0.45,
            "151": 0.1,
        },
        "moveIds": ["m270", "m79", "m476", "m366"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "191": {
        "name": "Sunkern",
        "emoji": "<:191:1116756130018906232>",
        "description": "Sunkern tries to move as little as it possibly can. It does so because it tries to conserve all the nutrients it has stored in its body for its evolution. It will not eat a thing, subsisting only on morning dew.",
        "type": [types.GRASS],
        "baseStats": [30, 30, 30, 30, 30, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/191.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/191.png",
        "evolution": [{
            "level": 18,
            "id": "192"
        }],
        "abilities": {
            "34": 0.45,
            "94": 0.45,
            "48": 0.1,
        },
        "moveIds": ["m71", "m202", "m241", "m414"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST
    },
    "192": {
        "name": "Sunflora",
        "emoji": "<:192:1116756131990208564>",
        "description": "Sunflora converts solar energy into nutrition. It moves around actively in the daytime when it is warm. It stops moving as soon as the sun goes down for the night.",
        "type": [types.GRASS],
        "baseStats": [75, 75, 55, 105, 85, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/192.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/192.png",
        "abilities": {
            "34": 0.45,
            "94": 0.45,
            "48": 0.1,
        },
        "moveIds": ["m71", "m241", "m414", "m76"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "194": {
        "name": "Wooper",
        "emoji": "<:194:1116756135303717024>",
        "description": "Wooper usually live in water but come out onto land seeking food occasionally. On land, they coat their bodies with a gooey, toxic film.",
        "type": [types.WATER, types.GROUND],
        "baseStats": [55, 45, 45, 25, 25, 15],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/194.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/194.png",
        "evolution": [{
            "level": 20,
            "id": "195"
        }],
        "abilities": {
            "6": 0.45,
            "11": 0.45,
            "109": 0.1
        },
        "moveIds": ["m189", "m240", "m414", "m710"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST
    },
    "195": {
        "name": "Quagsire",
        "emoji": "<:195:1116756137149202493>",
        "description": "Quagsire hunts for food by leaving its mouth wide open in water and waiting for its prey to blunder in unaware. Because the Pokémon does not move, it does not get very hungry.",
        "type": [types.WATER, types.GROUND],
        "baseStats": [95, 85, 85, 65, 65, 35],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/195.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/195.png",
        "abilities": {
            "6": 0.45,
            "11": 0.45,
            "109": 0.1
        },
        "moveIds": ["m189", "m240", "m710", "m89"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "196": {
        "name": "Espeon",
        "emoji": "<:196:1116756190685319258>",
        "description": "Espeon is extremely loyal to any Trainer it considers to be worthy. It is said that this Pokémon developed its precognitive powers to protect its Trainer from harm.",
        "type": [types.PSYCHIC],
        "baseStats": [65, 65, 60, 130, 95, 110],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/196.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/196.png",
        "abilities": {
            "28": 0.8,
            "156": 0.2,
        },
        "moveIds": ["m98", "m226", "m347", "m248"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "197": {
        "name": "Umbreon",
        "emoji": "<:197:1116756191922630680>",
        "description": "Umbreon evolved as a result of exposure to the moon's waves. It hides silently in darkness and waits for its foes to make a move. The rings on its body glow when it leaps to attack.",
        "type": [types.DARK],
        "baseStats": [95, 65, 110, 60, 130, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/197.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/197.png",
        "abilities": {
            "28": 0.8,
            "39": 0.2,
        },
        "moveIds": ["m98", "m236", "m492", "m212"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "199": {
        "name": "Slowking",
        "emoji": "<:199:1116756194565050408>",
        "description": "Slowking undertakes research every day in an effort to solve the mysteries of the world. However, this Pokémon apparently forgets everything it has learned if the Shellder on its head comes off.",
        "type": [types.WATER, types.PSYCHIC],
        "baseStats": [95, 75, 80, 100, 110, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/199.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/199.png",
        "abilities": {
            "12": 0.45,
            "20": 0.45,
            "144": 0.1
        },
        "moveIds": ["m55", "m94", "m347", "m303"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "202": {
        "name": "Wobbuffet",
        "emoji": "<:202:1119803387874119821>",
        "description": "If two or more Wobbuffet meet, they will turn competitive and try to outdo each other's endurance. However, they may try to see which one can endure the longest without food. Trainers need to beware of this habit.",
        "type": [types.PSYCHIC],
        "baseStats": [190, 33, 58, 33, 58, 33],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/202.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/202.png",
        "abilities": {
            "23": 0.8,
            "140": 0.2,
        },
        "moveIds": ["m68", "m194", "m219", "m243"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "204": {
        "name": "Pineco",
        "emoji": "<:204:1119803389744775209>",
        "description": "Pineco hangs from a tree branch and patiently waits for prey to come along. If the Pokémon is disturbed while eating by someone shaking its tree, it drops down to the ground and explodes with no warning.",
        "type": [types.BUG],
        "baseStats": [50, 65, 90, 35, 35, 15],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/204.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/204.png",
        "evolution": [{
            "level": 31,
            "id": "205",
        }],
        "abilities": {
            "5": 0.8,
            "142": 0.2,
        },
        "moveIds": ["m33", "m36", "m191", "m229"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "205": {
        "name": "Forretress",
        "emoji": "<:205:1119803390772383858>",
        "description": "Forretress conceals itself inside its hardened steel shell. The shell is opened when the Pokémon is catching prey, but it does so at such a quick pace that the shell's inside cannot be seen.",
        "type": [types.BUG, types.STEEL],
        "baseStats": [75, 90, 140, 60, 60, 40],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/205.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/205.png",
        "abilities": {
            "5": 0.8,
            "142": 0.2,
        },
        "moveIds": ["m33", "m191", "m229", "m153"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "208": {
        "name": "Steelix",
        "emoji": "<:208:1119803395272871946>",
        "description": "Steelix lives even further underground than Onix. This Pokémon is known to dig toward the earth's core. There are records of this Pokémon reaching a depth of over six-tenths of a mile underground.",
        "type": [types.STEEL, types.GROUND],
        "baseStats": [75, 85, 200, 55, 65, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/208.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/208.png",
        "abilities": {
            "69": 0.45,
            "5": 0.45,
            "125": 0.1,
        },
        "moveIds": ["m175", "m203", "m469", "m231"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "212": {
        "name": "Scizor",
        "emoji": "<:212:1119803485857267794>",
        "description": "Scizor has a body with the hardness of steel. It is not easily fazed by ordinary sorts of attacks. This Pokémon flaps its wings to regulate its body temperature.",
        "type": [types.BUG, types.STEEL],
        "baseStats": [70, 130, 100, 55, 80, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/212.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/212.png",
        "abilities": {
            "68": 0.45,
            "101": 0.45,
            "135": 0.1,
        },
        "moveIds": ["m418", "m14", "m450", "m404"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "213": {
        "name": "Shuckle",
        "emoji": "<:213:1119803487191044206>",
        "description": "Shuckle quietly hides itself under rocks, keeping its body concealed inside its hard shell while eating berries it has stored away. The berries mix with its body fluids to become a juice.",
        "type": [types.BUG, types.ROCK],
        "baseStats": [20, 10, 230, 10, 230, 5],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/213.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/213.png",
        "abilities": {
            "5": 0.45,
            "82": 0.45,
            "126": 0.1,
        },
        "moveIds": ["m205", "m446", "m564", "m157"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "214": {
        "name": "Heracross",
        "emoji": "<:214:1119803488688410655>",
        "description": "Heracross charges in a straight line at its foe, slips beneath the foe's grasp, and then scoops up and hurls the opponent with its mighty horn. This Pokémon even has enough power to topple a massive tree.",
        "type": [types.BUG, types.FIGHTING],
        "baseStats": [80, 125, 75, 40, 95, 85],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/214.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/214.png",
        "abilities": {
            "68": 0.45,
            "62": 0.45,
            "153": 0.1,
        },
        "moveIds": ["m175", "m14", "m224", "m370"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "227": {
        "name": "Skarmory",
        "emoji": "<:227:1119803619605233664>",
        "description": "Skarmory is entirely encased in hard, protective armor. This Pokémon flies at close to 190 mph. It slashes foes with its wings that possess swordlike cutting edges.",
        "type": [types.STEEL, types.FLYING],
        "baseStats": [65, 80, 140, 40, 70, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/227.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/227.png",
        "abilities": {
            "51": 0.45,
            "5": 0.45,
            "133": 0.1,
        },
        "moveIds": ["m64", "m68", "m191", "m355"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW,
    },
    "228": {
        "name": "Houndour",
        "emoji": "<:228:1119803620993552464>",
        "description": "Houndour hunt as a coordinated pack. They communicate with each other using a variety of cries to corner their prey. This Pokémon's remarkable teamwork is unparalleled.",
        "type": [types.DARK, types.FIRE],
        "baseStats": [45, 60, 30, 65, 50, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/228.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/228.png",
        "evolution": [{
            "level": 24,
            "id": "229",
        }],
        "abilities": {
            "48": 0.45,
            "39": 0.45,
            "127": 0.1,
        },
        "moveIds": ["m52", "m53", "m399", "m417"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "229": {
        "name": "Houndoom",
        "emoji": "<:229:1119803622809665556>",
        "description": "Houndoom's entire body generates heat when it Mega Evolves. Its fearsome fiery breath turns its opponents to ash. Houndoom stores the toxic gases it had previously inhaled in its body. The toxic gases ignite when exposed to air, causing flames to shoot from its back.",
        "type": [types.DARK, types.FIRE],
        "baseStats": [75, 90, 50, 110, 80, 95],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/229.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/229.png",
        "abilities": {
            "48": 0.45,
            "39": 0.45,
            "127": 0.1,
        },
        "moveIds": ["m52", "m399", "m417", "m126"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "231": {
        "name": "Phanpy",
        "emoji": "<:231:1119803681806753833>",
        "description": "Phanpy's big ears serve as broad fans. When it becomes hot, it flaps the ears busily to cool down. Even the young are very strong.",
        "type": [types.GROUND],
        "baseStats": [90, 60, 60, 40, 40, 40],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/231.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/231.png",
        "evolution": [{
            "level": 25,
            "id": "232"
        }],
        "abilities": {
            "53": 0.8,
            "8": 0.2,
        },
        "moveIds": ["m420", "m229", "m282", "m523"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "232": {
        "name": "Donphan",
        "emoji": "<:232:1119803683287351377>",
        "description": "Donphan's favorite attack is curling its body into a ball, then charging at its foe while rolling at high speed. Once it starts rolling, this Pokémon can't stop very easily.",
        "type": [types.GROUND],
        "baseStats": [90, 120, 120, 50, 60, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/232.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/232.png",
        "abilities": {
            "5": 0.8,
            "8": 0.2,
        },
        "moveIds": ["m420", "m229", "m282", "m89"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "234": {
        "name": "Stantler",
        "emoji": "<:234:1119803685808132257>",
        "description": "Stantler's magnificent antlers were traded at high prices as works of art. As a result, this Pokémon was hunted close to extinction by those who were after the priceless antlers.",
        "type": [types.NORMAL],
        "baseStats": [73, 95, 62, 85, 65, 85],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/234.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/234.png",
        "abilities": {
            "22": 0.45,
            "119": 0.45,
            "157": 0.1,
        },
        "moveIds": ["m33", "m50", "m224", "m38"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "236": {
        "name": "Tyrogue",
        "emoji": "<:236:1119803689545240667>",
        "description": "Tyrogue becomes stressed out if it does not get to train every day. When raising this Pokémon, the Trainer must establish and uphold various training methods.",
        "type": [types.FIGHTING],
        "baseStats": [35, 35, 35, 35, 35, 35],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/236.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/236.png",
        "evolution": [
            {
                "level": 20,
                "id": "106",
            },
            {
                "level": 20,
                "id": "107",
            },
            {
                "level": 20,
                "id": "237",
            },
        ],
        "abilities": {
            "62": 0.45,
            "80": 0.45,
            "72": 0.1,
        },
        "moveIds": ["m33", "m116", "m418", "m68"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "237": {
        "name": "Hitmontop",
        "emoji": "<:237:1119803691885674619>",
        "description": "Hitmontop spins on its head at high speed, all the while delivering kicks. This technique is a remarkable mix of both offense and defense at the same time. The Pokémon travels faster spinning than it does walking.",
        "type": [types.FIGHTING],
        "baseStats": [50, 95, 95, 35, 110, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/237.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/237.png",
        "abilities": {
            "22": 0.45,
            "101": 0.45,
            "80": 0.1,
        },
        "moveIds": ["m33", "m68", "m229", "m167"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "237-1": {
        "name": "Vinsmoke Hitmontop",
        "emoji": "<:sanji:1136890669735084053>",
        "description": "A culinary expert, its meals are said to physically strengthen Pokemon who try it. It fights with its legs to avoid damaging its cooking hands.",
        "type": [types.FIGHTING],
        "baseStats": [65, 90, 90, 45, 100, 150],
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/sanji-resized.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/sanji-shiny-resized.png",
        "abilities": {
            "3": 1
        },
        "moveIds": ["m270", "m97-1", "m299", "m226-1"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
        "noGacha": true
    },
    "241": {
        "name": "Miltank",
        "emoji": "<:241:1119803755014144051>",
        "description": "Miltank gives over five gallons of milk on a daily basis. Its sweet milk is enjoyed by children and grown-ups alike. People who can't drink milk turn it into yogurt and eat it instead.",
        "type": [types.NORMAL],
        "baseStats": [95, 80, 105, 40, 70, 100],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/241.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/241.png",
        "abilities": {
            "47": 0.45,
            "113": 0.45,
            "157": 0.1
        },
        "moveIds": ["m205", "m34", "m111", "m208"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "242": {
        "name": "Blissey",
        "emoji": "<:242:1119803756150796309>",
        "description": "Blissey senses sadness with its fluffy coat of fur. If it does so, this Pokémon will rush over to a sad person, no matter how far away, to share a Lucky Egg that brings a smile to any face.",
        "type": [types.NORMAL],
        "baseStats": [255, 10, 10, 75, 135, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/242.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/242.png",
        "abilities": {
            "30": 0.45,
            "32": 0.45,
            "131": 0.1
        },
        "moveIds": ["m574", "m113", "m505", "m135"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "243": {
        "name": "Raikou",
        "emoji": "<:243:1119803757895618650>",
        "description": "The rain clouds it carries let it fire thunderbolts at will. They say that it descended with lightning.",
        "type": [types.ELECTRIC],
        "baseStats": [90, 85, 75, 115, 100, 115],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/243.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/243.png",
        "abilities": {
            "46": 0.8,
            "39": 0.2,
        },
        "moveIds": ["m268", "m336", "m521", "m87"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW
    },
    "244": {
        "name": "Entei",
        "emoji": "<:244:1119803759007109190>",
        "description": "Volcanoes erupt when it barks. Unable to restrain its extreme power, it races headlong around the land.",
        "type": [types.FIRE],
        "baseStats": [115, 115, 85, 90, 75, 100],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/244.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/244.png",
        "abilities": {
            "46": 0.8,
            "39": 0.2,
        },
        "moveIds": ["m52", "m46", "m444", "m221"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW
    },
    "245": {
        "name": "Suicune",
        "emoji": "<:245:1119803760080863314>",
        "description": "Said to be the reincarnation of north winds, it can instantly purify filthy, murky water.",
        "type": [types.WATER],
        "baseStats": [100, 75, 115, 90, 115, 85],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/245.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/245.png",
        "abilities": {
            "46": 0.8,
            "39": 0.2,
        },
        "moveIds": ["m16", "m182", "m243", "m56"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW
    },
    "246": {
        "name": "Larvitar",
        "emoji": "<:246:1119803828120866886>",
        "description": "It feeds on soil. After it has eaten a large mountain, it will fall asleep so it can grow.",
        "type": [types.ROCK, types.GROUND],
        "baseStats": [50, 64, 50, 45, 50, 41],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/246.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/246.png",
        "evolution": [{
            "level": 30,
            "id": "247"
        }],
        "abilities": {
            "62": 0.8,
            "8": 0.2,
        },
        "moveIds": ["m33", "m43", "m242", "m444"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW
    },
    "247": {
        "name": "Pupitar",
        "emoji": "<:247:1119803829676937267>",
        "description": "Its shell is as hard as sheet rock, and it is also very strong. Its thrashing can topple a mountain.",
        "type": [types.ROCK, types.GROUND],
        "baseStats": [70, 84, 70, 65, 70, 51],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/247.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/247.png",
        "evolution": [{
            "level": 55,
            "id": "248"
        }],
        "abilities": {
            "61": 1,
        },
        "moveIds": ["m43", "m36", "m242", "m444"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW
    },
    "248": {
        "name": "Tyranitar",
        "emoji": "<:248:1119803830880702506>",
        "description": "Its body can't be harmed by any sort of attack, so it is very eager to make challenges against enemies.",
        "type": [types.ROCK, types.DARK],
        "baseStats": [100, 134, 110, 95, 100, 61],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/248.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/248.png",
        "abilities": {
            "45": 0.8,
            "127": 0.2,
        },
        "moveIds": ["m43", "m242", "m444", "m157"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW
    },
    "248-1": {
        "name": "Dark Tyranitar",
        "emoji": "<:darktyranitar:1127276632831447091>",
        "description": "Corrupted by Team Rocket's Dark Ball, it has converted its inpenetrable armor into a destructive offense.",
        "type": [types.GROUND, types.DARK],
        "baseStats": [90, 154, 80, 115, 70, 91],
        "sprite": "https://archives.bulbagarden.net/media/upload/b/bb/Spr_2g_248.png",
        "shinySprite": "https://archives.bulbagarden.net/media/upload/1/1c/Spr_2g_248_s.png",
        "abilities": {
            "71": 1,
        },
        "moveIds": ["m479", "m242", "m20006", "m89"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW,
        "noGacha": true
    },
    "249": {
        "name": "Lugia",
        "emoji": "<:249:1119803832050921523>",
        "description": "It is said that it quietly spends its time deep at the bottom of the sea because its powers are too strong.",
        "type": [types.PSYCHIC, types.FLYING],
        "baseStats": [106, 90, 130, 90, 154, 110],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/249.png",
        "abilities": {
            "46": 0.8,
            "136": 0.2,
        },
        "moveIds": ["m311", "m94", "m355", "m177"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW
    },
    "249-1": {
        "name": "Shadow Lugia",
        "emoji": "<:shadowlugia:1127311851278061608>",
        "description": "The legendary Lugia under the influence of a dark organization; it radiates a malevolent aura of corruption.",
        "type": [types.GHOST, types.FLYING],
        "baseStats": [100, 130, 90, 154, 90, 116],
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/shadow-lugia.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/shadow-lugia-shiny.png",
        "abilities": {
            "46": 1,
        },
        "moveIds": ["m311", "m94", "m542-1", "m177-1"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW,
        "noGacha": true
    },
    "250": {
        "name": "Ho-Oh",
        "emoji": "<:250:1119803833187569735>",
        "description": "It will reveal itself before a pure-hearted trainer by shining its bright rainbow-colored wings.",
        "type": [types.FIRE, types.FLYING],
        "baseStats": [106, 130, 90, 110, 154, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/250.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/250.png",
        "abilities": {
            "46": 0.8,
            "144": 0.2,
        },
        "moveIds": ["m311", "m332", "m432", "m221"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW
    },
    "251": {
        "name": "Celebi",
        "emoji": "<:251:1126680965905915944>",
        "description": "This Pokémon came from the future by crossing over time. It is thought that so long as Celebi appears, a bright and shining future awaits us.",
        "type": [types.PSYCHIC, types.GRASS],
        "baseStats": [100, 100, 100, 100, 100, 100],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/251.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/251.png",
        "abilities": {
            "30": 1,
        },
        "moveIds": ["m270", "m94", "m202", "m20004"],
        "battleEligible": true,
        "rarity": rarities.MYTHICAL,
        "growthRate": growthRates.FAST,
        "noGacha": true,
        "mythicConfig": {
            [rarities.LEGENDARY]: ["9-1", "25-1", "52-1", "136-1", "139-1", "145-1", "150-1", "249-1", "302-1", "828-1"],
            [rarities.EPIC]: ["18-1", "24-1", "34-1", "49-1", "110-1", "131-1", "143-1", "157-1", "248-1"]
        }
    },
    "252": {
        "name": "Treecko",
        "emoji": "<:252:1126680967252283392>",
        "description": "Treecko has small hooks on the bottom of its feet that enable it to scale vertical walls. This Pokémon attacks by slamming foes with its thick tail.",
        "type": [types.GRASS],
        "baseStats": [40, 45, 35, 65, 55, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/252.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/252.png",
        "evolution": [{
            "level": 16,
            "id": "253"
        }],
        "abilities": {
            "65": 0.8,
            "84": 0.2,
        },
        "moveIds": ["m71", "m98", "m21", "m202"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "253": {
        "name": "Grovyle",
        "emoji": "<:253:1126680969806622840>",
        "description": "The leaves growing out of Grovyle's body are convenient for camouflaging it from enemies in the forest. This Pokémon is a master at climbing trees in jungles.",
        "type": [types.GRASS],
        "baseStats": [50, 65, 45, 85, 65, 95],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/253.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/253.png",
        "evolution": [{
            "level": 36,
            "id": "254"
        }],
        "abilities": {
            "65": 0.8,
            "84": 0.2,
        },
        "moveIds": ["m98", "m21", "m202", "m348"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "254": {
        "name": "Sceptile",
        "emoji": "<:254:1126680971501109288>",
        "description": "The leaves growing on Sceptile's body are very sharp edged. This Pokémon is very agile - it leaps all over the branches of trees and jumps on its foe from above or behind.",
        "type": [types.GRASS],
        "baseStats": [70, 85, 65, 105, 85, 120],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/254.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/254.png",
        "abilities": {
            "65": 0.8,
            "84": 0.2,
        },
        "moveIds": ["m98", "m202", "m348", "m437"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "255": {
        "name": "Torchic",
        "emoji": "<:255:1126680974080614411>",
        "description": "Torchic sticks with its Trainer, following behind with unsteady steps. This Pokémon breathes fire of over 1,800 degrees Fahrenheit, including fireballs that leave the foe scorched black.",
        "type": [types.FIRE],
        "baseStats": [45, 60, 40, 70, 50, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/255.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/255.png",
        "evolution": [{
            "level": 16,
            "id": "256"
        }],
        "abilities": {
            "66": 0.8,
            "3": 0.2,
        },
        "moveIds": ["m52", "m249", "m53", "m182"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "256": {
        "name": "Combusken",
        "emoji": "<:256:1126680975171129375>",
        "description": "Combusken toughens up its legs and thighs by running through fields and mountains. This Pokémon's legs possess both speed and power, enabling it to dole out ten kicks in one second.",
        "type": [types.FIRE, types.FIGHTING],
        "baseStats": [60, 85, 60, 85, 60, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/256.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/256.png",
        "evolution": [{
            "level": 36,
            "id": "257"
        }],
        "abilities": {
            "66": 0.8,
            "3": 0.2,
        },
        "moveIds": ["m249", "m53", "m182", "m299"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "257": {
        "name": "Blaziken",
        "emoji": "<:257:1126680977759015013>",
        "description": "In battle, Blaziken blows out intense flames from its wrists and attacks foes courageously. The stronger the foe, the more intensely this Pokémon's wrists burn.",
        "type": [types.FIRE, types.FIGHTING],
        "baseStats": [80, 120, 70, 110, 70, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/257.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/257.png",
        "abilities": {
            "66": 0.8,
            "3": 0.2,
        },
        "moveIds": ["m249", "m182", "m299", "m126"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "258": {
        "name": "Mudkip",
        "emoji": "<:258:1126680978891493448>",
        "description": "In water, Mudkip breathes using the gills on its cheeks. If it is faced with a tight situation in battle, this Pokémon will unleash its amazing power - it can crush rocks bigger than itself.",
        "type": [types.WATER],
        "baseStats": [50, 70, 50, 50, 50, 40],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/258.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/258.png",
        "evolution": [{
            "level": 16,
            "id": "259"
        }],
        "abilities": {
            "67": 0.8,
            "6": 0.2,
        },
        "moveIds": ["m55", "m189", "m91", "m276"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "259": {
        "name": "Marshtomp",
        "emoji": "<:259:1126681029546102935>",
        "description": "The surface of Marshtomp's body is enveloped by a thin, sticky film that enables it to live on land. This Pokémon plays in mud on beaches when the ocean tide is low.",
        "type": [types.WATER, types.GROUND],
        "baseStats": [70, 85, 70, 60, 70, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/259.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/259.png",
        "evolution": [{
            "level": 36,
            "id": "260"
        }],
        "abilities": {
            "67": 0.8,
            "6": 0.2,
        },
        "moveIds": ["m189", "m91", "m276", "m330"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "260": {
        "name": "Swampert",
        "emoji": "<:260:1126681031202848778>",
        "description": "Swampert is very strong. It has enough power to easily drag a boulder weighing more than a ton. This Pokémon also has powerful vision that lets it see even in murky water.",
        "type": [types.WATER, types.GROUND],
        "baseStats": [100, 110, 90, 85, 90, 60],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/260.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/260.png",
        "abilities": {
            "67": 0.8,
            "6": 0.2,
        },
        "moveIds": ["m189", "m276", "m330", "m89"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "261": {
        "name": "Poochyena",
        "emoji": "<:261:1126681032498884648>",
        "description": "At first sight, Poochyena takes a bite at anything that moves. This Pokémon chases after prey until the victim becomes exhausted. However, it may turn tail if the prey strikes back.",
        "type": [types.DARK],
        "baseStats": [35, 55, 35, 30, 30, 35],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/261.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/261.png",
        "evolution": [{
            "level": 15,
            "id": "262"
        }],
        "abilities": {
            "50": 0.45,
            "95": 0.45,
            "155": 0.1,
        },
        "moveIds": ["m33", "m189", "m242", "m269"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "262": {
        "name": "Mightyena",
        "emoji": "<:262:1126681033656500275>",
        "description": "Mightyena gives obvious signals when it is preparing to attack. It starts to growl deeply and then flattens its body. This Pokémon will bite savagely with its sharply pointed fangs.",
        "type": [types.DARK],
        "baseStats": [70, 90, 70, 60, 60, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/262.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/262.png",
        "abilities": {
            "22": 0.45,
            "95": 0.45,
            "153": 0.1,
        },
        "moveIds": ["m33", "m168", "m242", "m269"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST,
    },
    "263": {
        "name": "Zigzagoon",
        "emoji": "<:263:1126681035627835462>",
        "description": "Zigzagoon restlessly wanders everywhere at all times. This Pokémon does so because it is very curious. It becomes interested in anything that it happens to see.",
        "type": [types.NORMAL],
        "baseStats": [38, 30, 41, 30, 41, 60],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/263.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/263.png",
        "evolution": [{
            "level": 15,
            "id": "264"
        }],
        "abilities": {
            "53": 0.45,
            "82": 0.45,
            "95": 0.1,
        },
        "moveIds": ["m33", "m175", "m187", "m245"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST,
    },
    "264": {
        "name": "Linoone",
        "emoji": "<:264:1126681036940640317>",
        "description": "Linoone always runs full speed and only in straight lines. If facing an obstacle, it makes a right-angle turn to evade it. This Pokémon is very challenged by gently curving roads.",
        "type": [types.NORMAL],
        "baseStats": [78, 70, 61, 50, 61, 100],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/264.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/264.png",
        "abilities": {
            "53": 0.45,
            "82": 0.45,
            "95": 0.1,
        },
        "moveIds": ["m175", "m187", "m245", "m38"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST,
    },
    "265": {
        "name": "Wurmple",
        "emoji": "<:265:1126681038341546054>",
        "description": "Wurmple is targeted by Swellow as prey. This Pokémon will try to resist by pointing the spikes on its rear at the attacking predator. It will weaken the foe by leaking poison from the spikes.",
        "type": [types.BUG],
        "baseStats": [45, 45, 35, 20, 30, 20],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/265.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/265.png",
        "evolution": [
            {
                "level": 7,
                "id": "266"
            },
            {
                "level": 7,
                "id": "268"
            }
        ],
        "abilities": {
            "19": 0.8,
            "50": 0.2,
        },
        "moveIds": ["m33", "m40", "m81", "m450"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST,
    },
    "266": {
        "name": "Silcoon",
        "emoji": "<:266:1126681040061202547>",
        "description": "Silcoon was thought to endure hunger and not consume anything before its evolution. However, it is now thought that this Pokémon slakes its thirst by drinking rainwater that collects on its silk.",
        "type": [types.BUG],
        "baseStats": [50, 35, 55, 25, 25, 15],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/266.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/266.png",
        "evolution": [{
            "level": 10,
            "id": "267"
        }],
        "abilities": {
            "61": 1,
        },
        "moveIds": ["m33", "m81", "m106", "m450"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST,
    },
    "267": {
        "name": "Beautifly",
        "emoji": "<:267:1126681113612517486>",
        "description": "Beautifly's favorite food is the sweet pollen of flowers. If you want to see this Pokémon, just leave a potted flower by an open window. Beautifly is sure to come looking for pollen.",
        "type": [types.BUG, types.FLYING],
        "baseStats": [60, 70, 50, 100, 50, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/267.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/267.png",
        "abilities": {
            "68": 0.8,
            "79": 0.2,
        },
        "moveIds": ["m16", "m355", "m483", "m405"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST,
    },
    "268": {
        "name": "Cascoon",
        "emoji": "<:268:1126681115609022525>",
        "description": "Cascoon makes its protective cocoon by wrapping its body entirely with a fine silk from its mouth. Once the silk goes around its body, it hardens. This Pokémon prepares for its evolution inside the cocoon.",
        "type": [types.BUG],
        "baseStats": [50, 35, 55, 25, 25, 15],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/268.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/268.png",
        "evolution": [{
            "level": 10,
            "id": "269"
        }],
        "abilities": {
            "61": 1,
        },
        "moveIds": ["m40", "m81", "m106", "m450"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST,
    },
    "269": {
        "name": "Dustox",
        "emoji": "<:269:1126681117920075836>",
        "description": "Dustox is instinctively drawn to light. Swarms of this Pokémon are attracted by the bright lights of cities, where they wreak havoc by stripping the leaves off roadside trees for food.",
        "type": [types.BUG, types.POISON],
        "baseStats": [60, 50, 70, 50, 90, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/269.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/269.png",
        "abilities": {
            "19": 0.8,
            "14": 0.2,
        },
        "moveIds": ["m77", "m355", "m483", "m405"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST,
    },
    "270": {
        "name": "Lotad",
        "emoji": "<:270:1126681120143065099>",
        "description": "Lotad live in ponds and lakes, where they float on the surface. It grows weak if its broad leaf dies. On rare occasions, this Pokémon travels on land in search of clean water.",
        "type": [types.WATER, types.GRASS],
        "baseStats": [40, 30, 30, 40, 50, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/270.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/270.png",
        "evolution": [{
            "level": 14,
            "id": "271"
        }],
        "abilities": {
            "33": 0.45,
            "44": 0.45,
            "20": 0.1,
        },
        "moveIds": ["m55", "m58", "m71", "m352"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "271": {
        "name": "Lombre",
        "emoji": "<:271:1126681121229381753>",
        "description": "Lombre is nocturnal - it will get active after dusk. It is also a mischief maker. When this Pokémon spots anglers, it tugs on their fishing lines from beneath the surface and enjoys their consternation.",
        "type": [types.WATER, types.GRASS],
        "baseStats": [60, 50, 50, 60, 70, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/271.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/271.png",
        "evolution": [{
            "level": 28,
            "id": "272"
        }],
        "abilities": {
            "33": 0.45,
            "44": 0.45,
            "20": 0.1,
        },
        "moveIds": ["m55", "m58", "m352", "m412"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "272": {
        "name": "Ludicolo",
        "emoji": "<:272:1126681122680610847>",
        "description": "Upon hearing an upbeat and cheerful rhythm, the cells in Ludicolo's body become very energetic and active. Even in battle, this Pokémon will exhibit an amazing amount of power.",
        "type": [types.WATER, types.GRASS],
        "baseStats": [80, 70, 70, 90, 100, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/272.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/272.png",
        "abilities": {
            "33": 0.45,
            "44": 0.45,
            "20": 0.1,
        },
        "moveIds": ["m55", "m58", "m412", "m56"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "273": {
        "name": "Seedot",
        "emoji": "<:273:1126681124345761803>",
        "description": "Seedot attaches itself to a tree branch using the top of its head. It sucks moisture from the tree while hanging off the branch. The more water it drinks, the glossier this Pokémon's body becomes.",
        "type": [types.GRASS],
        "baseStats": [40, 40, 50, 30, 30, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/273.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/273.png",
        "evolution": [{
            "level": 14,
            "id": "274"
        }],
        "abilities": {
            "34": 0.45,
            "48": 0.45,
            "124": 0.1,
        },
        "moveIds": ["m98", "m205", "m202", "m282"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "274": {
        "name": "Nuzleaf",
        "emoji": "<:274:1126681125713092609>",
        "description": "Nuzleaf live in densely overgrown forests. They occasionally venture out of the forest to startle people. This Pokémon dislikes having its long nose pinched.",
        "type": [types.GRASS, types.DARK],
        "baseStats": [70, 70, 40, 60, 40, 60],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/274.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/274.png",
        "evolution": [{
            "level": 28,
            "id": "275"
        }],
        "abilities": {
            "34": 0.45,
            "48": 0.45,
            "124": 0.1,
        },
        "moveIds": ["m98", "m202", "m282", "m348"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "275": {
        "name": "Shiftry",
        "emoji": "<:275:1126681183279919114>",
        "description": "Shiftry is a mysterious Pokémon that is said to live atop towering trees dating back over a thousand years. It creates terrific windstorms with the fans it holds.",
        "type": [types.GRASS, types.DARK],
        "baseStats": [90, 100, 60, 90, 60, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/275.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/275.png",
        "abilities": {
            "34": 0.45,
            "48": 0.45,
            "124": 0.1,
        },
        "moveIds": ["m98", "m282", "m348", "m437"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "276": {
        "name": "Taillow",
        "emoji": "<:276:1126681184798249100>",
        "description": "Taillow courageously stands its ground against foes, however strong they may be. This gutsy Pokémon will remain defiant even after a loss. On the other hand, it cries loudly if it becomes hungry.",
        "type": [types.NORMAL, types.FLYING],
        "baseStats": [40, 55, 30, 30, 30, 85],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/276.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/276.png",
        "evolution": [{
            "level": 22,
            "id": "277"
        }],
        "abilities": {
            "62": 0.8,
            "113": 0.2,
        },
        "moveIds": ["m64", "m98", "m369", "m403"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "277": {
        "name": "Swellow",
        "emoji": "<:277:1126681186312388730>",
        "description": "Swellow flies high above our heads, making graceful arcs in the sky. This Pokémon dives at a steep angle as soon as it spots its prey. The hapless prey is tightly grasped by Swellow's clawed feet, preventing escape.",
        "type": [types.NORMAL, types.FLYING],
        "baseStats": [60, 85, 60, 75, 50, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/277.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/277.png",
        "abilities": {
            "62": 0.8,
            "113": 0.2,
        },
        "moveIds": ["m64", "m369", "m403", "m586"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "278": {
        "name": "Wingull",
        "emoji": "<:278:1126681187994320986>",
        "description": "Wingull has the habit of carrying prey and valuables in its beak and hiding them in all sorts of locations. This Pokémon rides the winds and flies as if it were skating across the sky.",
        "type": [types.WATER, types.FLYING],
        "baseStats": [40, 30, 30, 55, 30, 85],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/278.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/278.png",
        "evolution": [{
            "level": 25,
            "id": "279"
        }],
        "abilities": {
            "51": 0.45,
            "93": 0.45,
            "44": 0.1,
        },
        "moveIds": ["m55", "m355", "m403", "m503"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "279": {
        "name": "Pelipper",
        "emoji": "<:279:1126681189823041659>",
        "description": "Pelipper is a flying transporter that carries small Pokémon and eggs inside its massive bill. This Pokémon builds its nest on steep cliffs facing the sea.",
        "type": [types.WATER, types.FLYING],
        "baseStats": [60, 50, 100, 85, 70, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/279.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/279.png",
        "abilities": {
            "51": 0.45,
            "2": 0.45,
            "44": 0.1,
        },
        "moveIds": ["m55", "m355", "m503", "m542"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "280": {
        "name": "Ralts",
        "emoji": "<:280:1126681191332978778>",
        "description": "Ralts senses the emotions of people using the horns on its head. This Pokémon rarely appears before people. But when it does, it draws closer if it senses that the person has a positive disposition.",
        "type": [types.PSYCHIC, types.FAIRY],
        "baseStats": [28, 25, 25, 45, 35, 40],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/280.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/280.png",
        "evolution": [{
            "level": 20,
            "id": "281"
        }],
        "abilities": {
            "28": 0.45,
            "36": 0.45,
            "140": 0.1
        },
        "moveIds": ["m93", "m100", "m574", "m94"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "281": {
        "name": "Kirlia",
        "emoji": "<:281:1126681193606299770>",
        "description": "Kirlia uses the horns on its head to amplify its psychokinetic power. When the Pokémon uses its power, the air around it becomes distorted, creating mirages of nonexistent scenery.",
        "type": [types.PSYCHIC, types.FAIRY],
        "baseStats": [38, 35, 35, 65, 55, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/281.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/281.png",
        "evolution": [{
            "level": 30,
            "id": "282"
        }],
        "abilities": {
            "28": 0.45,
            "36": 0.45,
            "140": 0.1
        },
        "moveIds": ["m93", "m574", "m94", "m605"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "282": {
        "name": "Gardevoir",
        "emoji": "<:282:1126681195460186193>",
        "description": "Gardevoir has the ability to read the future. If it senses impending danger to its Trainer, this Pokémon is said to unleash its psychokinetic energy at full power.",
        "type": [types.PSYCHIC, types.FAIRY],
        "baseStats": [68, 65, 65, 125, 115, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/282.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/282.png",
        "abilities": {
            "28": 0.45,
            "36": 0.45,
            "140": 0.1
        },
        "moveIds": ["m574", "m94", "m605", "m433"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "285": {
        "name": "Shroomish",
        "emoji": "<:285:1126681261646299286>",
        "description": "Shroomish live in damp soil in the dark depths of forests. They are often found keeping still under fallen leaves. This Pokémon feeds on compost that is made up of fallen, rotted leaves.",
        "type": [types.GRASS],
        "baseStats": [60, 40, 60, 40, 60, 35],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/285.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/285.png",
        "evolution": [{
            "level": 23,
            "id": "286"
        }],
        "abilities": {
            "27": 0.45,
            "90": 0.45,
            "95": 0.1
        },
        "moveIds": ["m33", "m71", "m147", "m331"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "286": {
        "name": "Breloom",
        "emoji": "<:286:1126681263076548699>",
        "description": "Breloom closes in on its foe with light and sprightly footwork, then throws punches with its stretchy arms. This Pokémon's fighting technique puts boxers to shame.",
        "type": [types.GRASS, types.FIGHTING],
        "baseStats": [60, 130, 80, 60, 60, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/286.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/286.png",
        "abilities": {
            "27": 0.45,
            "90": 0.45,
            "101": 0.1
        },
        "moveIds": ["m183", "m147", "m331", "m223"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "287": {
        "name": "Slakoth",
        "emoji": "<:287:1126681264741695518>",
        "description": "Slakoth's heart beats just once a minute. Whatever happens, it is content to loaf around motionless. It is rare to see this Pokémon in motion.",
        "type": [types.NORMAL],
        "baseStats": [60, 60, 60, 35, 35, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/287.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/287.png",
        "evolution": [{
            "level": 18,
            "id": "288"
        }],
        "abilities": {
            "54": 1
        },
        "moveIds": ["m10", "m189", "m34", "m68"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.SLOW,
    },
    "288": {
        "name": "Vigoroth",
        "emoji": "<:288:1126681265924485221>",
        "description": "Vigoroth is always itching and agitated to go on a wild rampage. It simply can't tolerate sitting still for even a minute. This Pokémon's stress level rises if it can't be moving constantly.",
        "type": [types.NORMAL],
        "baseStats": [80, 80, 80, 55, 55, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/288.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/288.png",
        "evolution": [{
            "level": 36,
            "id": "289"
        }],
        "abilities": {
            "72": 1
        },
        "moveIds": ["m10", "m34", "m36", "m68"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.SLOW,
    },
    "289": {
        "name": "Slaking",
        "emoji": "<:289:1126681267061133382>",
        "description": "Slaking spends all day lying down and lolling about. It eats grass growing within its reach. If it eats all the grass it can reach, this Pokémon reluctantly moves to another spot.",
        "type": [types.NORMAL],
        "baseStats": [150, 160, 100, 95, 65, 100],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/289.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/289.png",
        "abilities": {
            "54": 1,
        },
        "moveIds": ["m10", "m68", "m359", "m416"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW,
    },
    "289-1": {
        "name": "Slaking D. Garp",
        "emoji": "<:garp:1136890665003925554>",
        "description": "An old Pokemon hero; this Slaking empowers its fists with pure willpower to launch devastating attacks that can level cities.",
        "type": [types.NORMAL],
        "baseStats": [125, 150, 100, 85, 65, 75],
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/garp-resized.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/garp-shiny-resized.png",
        "abilities": {
            "54-1": 1,
        },
        "moveIds": ["m88", "m68", "m359", "m416-1"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW,
        "noGacha": true
    },
    "290": {
        "name": "Nincada",
        "emoji": "<:290:1126681268172623903>",
        "description": "Nincada lives underground for many years in complete darkness. This Pokémon absorbs nutrients from the roots of trees. It stays motionless as it waits for evolution.",
        "type": [types.BUG, types.GROUND],
        "baseStats": [31, 45, 90, 30, 30, 40],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/290.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/290.png",
        "evolution": [
            {
                "level": 20,
                "id": "291"
            },
            {
                "level": 20,
                "id": "292",
            }
        ],
        "abilities": {
            "14": 0.8,
            "50": 0.2,
        },
        "moveIds": ["m404"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "291": {
        "name": "Ninjask",
        "emoji": "<:291:1126681319443808369>",
        "description": "Ninjask moves around at such a high speed that it cannot be seen, even while its crying can be clearly heard. For that reason, this Pokémon was long believed to be invisible.",
        "type": [types.BUG, types.FLYING],
        "baseStats": [61, 90, 45, 50, 50, 160],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/291.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/291.png",
        "abilities": {
            "3": 0.8,
            "151": 0.2,
        },
        "moveIds": ["m10", "m97", "m226", "m404"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "292": {
        "name": "Shedinja",
        "emoji": "<:292:1126681322354643014>",
        "description": "Shedinja's hard body doesn't move - not even a twitch. In fact, its body appears to be merely a hollow shell. It is believed that this Pokémon will steal the spirit of anyone peering into its hollow body from its back.",
        "type": [types.BUG, types.GHOST],
        "baseStats": [1, 90, 45, 30, 30, 40],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/292.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/292.png",
        "abilities": {
            "25": 1,
        },
        "moveIds": ["m425", "m14", "m203", "m404"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "296": {
        "name": "Makuhita",
        "emoji": "<:296:1126681372732432384>",
        "description": "Makuhita is tenacious - it will keep getting up and attacking its foe however many times it is knocked down. Every time it gets back up, this Pokémon stores more energy in its body for evolving.",
        "type": [types.FIGHTING],
        "baseStats": [72, 60, 30, 20, 30, 25],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/296.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/296.png",
        "evolution": [
            {
                "level": 24,
                "id": "297"
            }
        ],
        "abilities": {
            "47": 0.45,
            "62": 0.45,
            "125": 0.1,
        },
        "moveIds": ["m418", "m238", "m469", "m484"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "297": {
        "name": "Hariyama",
        "emoji": "<:297:1126681374313685003>",
        "description": "Hariyama practices its straight-arm slaps in any number of locations. One hit of this Pokémon's powerful, openhanded, straight-arm punches could snap a telephone pole in two.",
        "type": [types.FIGHTING],
        "baseStats": [144, 120, 60, 40, 60, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/297.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/297.png",
        "abilities": {
            "47": 0.45,
            "62": 0.45,
            "125": 0.1,
        },
        "moveIds": ["m418", "m469", "m484", "m370"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "302": {
        "name": "Sableye",
        "emoji": "<:302:1132496476791115806>",
        "description": "Sableye lead quiet lives deep inside caverns. They are feared, however, because these Pokémon are thought to steal the spirits of people when their eyes burn with a sinister glow in the darkness.",
        "type": [types.DARK, types.GHOST],
        "baseStats": [50, 75, 75, 65, 65, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/302.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/302.png",
        "abilities": {
            "51": 0.45,
            "100": 0.45,
            "158": 0.1,
        },
        "moveIds": ["m425", "m105", "m203", "m212"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "302-1": {
        "name": "Billionaire Sableye",
        "emoji": "<:billionairesableye:1130698671474888815>",
        "description": "A Sableye that has amassed a fortune through its business ventures. It is said to be the richest Pokémon in the world.",
        "type": [types.NORMAL, types.GHOST],
        "baseStats": [70, 100, 130, 90, 130, 60],
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/billionaire-sableye-resized.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/billionaire-sableye-shiny-resized.png",
        "abilities": {
            "20010": 1,
        },
        "moveIds": ["m6", "m105", "m203", "m20008"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.MEDIUMSLOW,
        "noGacha": true
    },
    "303": {
        "name": "Mawile",
        "emoji": "<:303:1132496477894226000>",
        "description": "Mawile's huge jaws are actually steel horns that have been transformed. Its docile-looking face serves to lull its foe into letting down its guard. When the foe least expects it, Mawile chomps it with its gaping jaws.",
        "type": [types.STEEL, types.FAIRY],
        "baseStats": [50, 85, 85, 55, 55, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/303.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/303.png",
        "abilities": {
            "52": 0.45,
            "22": 0.45,
            "125": 0.1,
        },
        "moveIds": ["m246", "m242", "m583", "m416"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "304": {
        "name": "Aron",
        "emoji": "<:304:1132496478955376730>",
        "description": "This Pokémon has a body of steel. To make its body, Aron feeds on iron ore that it digs from mountains. Occasionally, it causes major trouble by eating bridges and rails.",
        "type": [types.STEEL, types.ROCK],
        "baseStats": [50, 70, 100, 40, 40, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/304.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/304.png",
        "evolution":[{
            "level": 32,
            "id": "305",
        }],
        "abilities": {
            "5": 0.45,
            "69": 0.45,
            "134": 0.1,
        },
        "moveIds": ["m33", "m106", "m334", "m444"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "305": {
        "name": "Lairon",
        "emoji": "<:305:1132496480003952720>",
        "description": "Lairon tempers its steel body by drinking highly nutritious mineral springwater until it is bloated. This Pokémon makes its nest close to springs of delicious water.",
        "type": [types.STEEL, types.ROCK],
        "baseStats": [60, 90, 140, 50, 50, 40],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/305.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/305.png",
        "evolution":[{
            "level": 42,
            "id": "306",
        }],
        "abilities": {
            "5": 0.45,
            "69": 0.45,
            "134": 0.1,
        },
        "moveIds": ["m33", "m334", "m444", "m484"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "306": {
        "name": "Aggron",
        "emoji": "<:306:1132496481480351754>",
        "description": "Aggron claims an entire mountain as its own territory. It mercilessly beats up anything that violates its environment. This Pokémon vigilantly patrols its territory at all times.",
        "type": [types.STEEL, types.ROCK],
        "baseStats": [70, 110, 180, 60, 60, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/306.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/306.png",
        "abilities": {
            "5": 0.45,
            "69": 0.45,
            "134": 0.1,
        },
        "moveIds": ["m33", "m334", "m444", "m231"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "309": {
        "name": "Electrike",
        "emoji": "<:309:1132496527521230870>",
        "description": "Electrike stores electricity in its long body hair. This Pokémon stimulates its leg muscles with electric charges. These jolts of power give its legs explosive acceleration performance.",
        "type": [types.ELECTRIC],
        "baseStats": [40, 45, 40, 65, 40, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/309.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/309.png",
        "evolution":[{
            "level": 26,
            "id": "310",
        }],
        "abilities": {
            "9": 0.45,
            "31": 0.45,
            "58": 0.1,
        },
        "moveIds": ["m98", "m46", "m85", "m86"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "310": {
        "name": "Manectric",
        "emoji": "<:310:1132496529706467499>",
        "description": "Manectric is constantly discharging electricity from its mane. The sparks sometimes ignite forest fires. When it enters a battle, this Pokémon creates thunderclouds.",
        "type": [types.ELECTRIC],
        "baseStats": [70, 75, 60, 105, 60, 105],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/310.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/310.png",
        "abilities": {
            "9": 0.45,
            "31": 0.45,
            "58": 0.1,
        },
        "moveIds": ["m98", "m46", "m86", "m87"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "318": {
        "name": "Carvanha",
        "emoji": "<:318:1132496585511682168>",
        "description": "Carvanha’s strongly developed jaws and its sharply pointed fangs pack the destructive power to rip out boat hulls. Many boats have been attacked and sunk by this Pokémon.",
        "type": [types.WATER, types.DARK],
        "baseStats": [45, 90, 20, 65, 20, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/318.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/318.png",
        "evolution":[{
            "level": 30,
            "id": "319",
        }],
        "abilities": {
            "24": 0.8,
            "3": 0.2,
        },
        "moveIds": ["m43", "m453", "m127", "m242"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "319": {
        "name": "Sharpedo",
        "emoji": "<:319:1132496586635739177>",
        "description": "Nicknamed “the bully of the sea,” Sharpedo is widely feared. Its cruel fangs grow back immediately if they snap off. Just one of these Pokémon can thoroughly tear apart a supertanker.",
        "type": [types.WATER, types.DARK],
        "baseStats": [70, 120, 40, 95, 40, 95],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/319.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/319.png",
        "abilities": {
            "24": 0.8,
            "3": 0.2,
        },
        "moveIds": ["m453", "m127", "m242", "m89"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "319-1": {
        "name": "Arlong",
        "emoji": "<:arlong:1136891755908833320>",
        "description": "If it's a 1v1 in water, ALWAYS bet on Arlong!",
        "type": [types.WATER, types.DARK],
        "baseStats": [70, 130, 80, 115, 60, 85],
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/arlong-resized.png",
        "shinySprite": "https://i.ytimg.com/vi/sJdQll3I-S4/maxresdefault.jpg",
        "abilities": {
            "20012": 1,
        },
        "moveIds": ["m453", "m127", "m242", "m20013"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "320": {
        "name": "Wailmer",
        "emoji": "<:320:1132496587910828123>",
        "description": "Wailmer’s nostrils are located above its eyes. This playful Pokémon loves to startle people by forcefully snorting out seawater it stores inside its body out of its nostrils.",
        "type": [types.WATER],
        "baseStats": [130, 70, 35, 70, 35, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/320.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/320.png",
        "evolution":[{
            "level": 40,
            "id": "321",
        }],
        "abilities": {
            "41": 0.45,
            "12": 0.45,
            "46": 0.1,
        },
        "moveIds": ["m55", "m150", "m340", "m352"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "321": {
        "name": "Wailord",
        "emoji": "<:321:1132496589563383858>",
        "description": "Wailord is the largest of all identified Pokémon up to now. This giant Pokémon swims languorously in the vast open sea, eating massive amounts of food at once with its enormous mouth.",
        "type": [types.WATER],
        "baseStats": [170, 90, 45, 90, 45, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/321.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/321.png",
        "abilities": {
            "41": 0.45,
            "12": 0.45,
            "46": 0.1,
        },
        "moveIds": ["m55", "m352", "m568", "m392"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "324": {
        "name": "Torkoal",
        "emoji": "<:324:1132496594567188584>",
        "description": "Torkoal digs through mountains in search of coal. If it finds some, it fills hollow spaces on its shell with the coal and burns it. If it is attacked, this Pokémon spouts thick black smoke to beat a retreat.",
        "type": [types.FIRE],
        "baseStats": [70, 85, 140, 85, 70, 20],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/324.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/324.png",
        "abilities": {
            "73": 0.45,
            "70": 0.45,
            "75": 0.1,
        },
        "moveIds": ["m110", "m182", "m229", "m284"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST,
    },
    "328": {
        "name": "Trapinch",
        "emoji": "<:328:1132496654193397770>",
        "description": "Trapinch’s nest is a sloped, bowl-like pit dug in sand. This Pokémon patiently waits for prey to tumble down the pit. Its giant jaws have enough strength to crush even boulders.",
        "type": [types.GROUND],
        "baseStats": [45, 100, 45, 45, 45, 10],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/328.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/328.png",
        "evolution":[{
            "level": 35,
            "id": "329",
        }],
        "abilities": {
            "52": 0.45,
            "71": 0.45,
            "125": 0.1,
        },
        "moveIds": ["m116", "m189", "m450", "m523"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "329": {
        "name": "Vibrava",
        "emoji": "<:329:1132496655694975067>",
        "description": "Vibrava’s wings have not yet completed the process of growing. Rather than flying long distances, they are more useful for generating ultrasonic waves by vibrating.",
        "type": [types.GROUND, types.DRAGON],
        "baseStats": [50, 70, 50, 50, 50, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/329.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/329.png",
        "evolution":[{
            "level": 45,
            "id": "330",
        }],
        "abilities": {
            "26": 1
        },
        "moveIds": ["m116", "m407", "m450", "m523"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "330": {
        "name": "Flygon",
        "emoji": "<:330:1132496657683054693>",
        "description": "Flygon is nicknamed “the elemental spirit of the desert.” Because its flapping wings whip up a cloud of sand, this Pokémon is always enveloped in a sandstorm while flying.",
        "type": [types.GROUND, types.DRAGON],
        "baseStats": [80, 100, 80, 80, 80, 100],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/330.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/330.png",
        "abilities": {
            "26": 1
        },
        "moveIds": ["m116", "m369", "m407", "m89"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "333": {
        "name": "Swablu",
        "emoji": "<:333:1132496705162588302>",
        "description": "Swablu loves to make things clean. If it spots something dirty, it will wipe and polish it with its cottony wings. If its wings become dirty, this Pokémon finds a stream and showers itself.",
        "type": [types.NORMAL, types.FLYING],
        "baseStats": [45, 40, 60, 40, 75, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/333.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/333.png",
        "evolution":[{
            "level": 35,
            "id": "334",
        }],
        "abilities": {
            "30": 0.8,
            "13": 0.2,
        },
        "moveIds": ["m574", "m36", "m406", "m432"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "334": {
        "name": "Altaria",
        "emoji": "<:334:1132496708140535858>",
        "description": "Altaria dances and wheels through the sky among billowing, cotton-like clouds. By singing melodies in its crystal-clear voice, this Pokémon makes its listeners experience dreamy wonderment.",
        "type": [types.DRAGON, types.FLYING],
        "baseStats": [75, 70, 90, 70, 105, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/334.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/334.png",
        "abilities": {
            "30": 0.8,
            "13": 0.2,
        },
        "moveIds": ["m574", "m406", "m432", "m195"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "343": {
        "name": "Baltoy",
        "emoji": "<:343:1132496780639088710>",
        "description": "Baltoy moves while spinning around on its one foot. Primitive wall paintings depicting this Pokémon living among people were discovered in some ancient ruins.",
        "type": [types.GROUND, types.PSYCHIC],
        "baseStats": [40, 40, 55, 70, 55, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/343.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/343.png",
        "evolution":[{
            "level": 36,
            "id": "344",
        }],
        "abilities": {
            "26": 1
        },
        "moveIds": ["m93", "m106", "m229", "m446"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "344": {
        "name": "Claydol",
        "emoji": "<:344:1132496781960286308>",
        "description": "Claydol are said to be dolls of mud made by primitive humans and brought to life by exposure to a mysterious ray. This Pokémon moves about while levitating.",
        "type": [types.GROUND, types.PSYCHIC],
        "baseStats": [60, 70, 105, 70, 120, 75],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/344.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/344.png",
        "abilities": {
            "26": 1
        },
        "moveIds": ["m93", "m229", "m446", "m153"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "345": {
        "name": "Lileep",
        "emoji": "<:345:1132496783939997797>",
        "description": "Lileep became extinct approximately a hundred million years ago. This ancient Pokémon attaches itself to a rock on the seafloor and catches approaching prey using tentacles shaped like flower petals.",
        "type": [types.ROCK, types.GRASS],
        "baseStats": [66, 41, 77, 61, 87, 87],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/345.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/345.png",
        "evolution":[{
            "level": 40,
            "id": "346",
        }],
        "abilities": {
            "21": 0.8,
            "114": 0.2,
        },
        "moveIds": ["m246", "m105", "m202", "m317"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "346": {
        "name": "Cradily",
        "emoji": "<:346:1132496785286365345>",
        "description": "Cradily roams around the ocean floor in search of food. This Pokémon freely extends its tree trunk-like neck and captures unwary prey using its eight tentacles.",
        "type": [types.ROCK, types.GRASS],
        "baseStats": [86, 81, 97, 81, 107, 81],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/346.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/346.png",
        "abilities": {
            "21": 0.8,
            "114": 0.2,
        },
        "moveIds": ["m246", "m105", "m202", "m157"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "347": {
        "name": "Anorith",
        "emoji": "<:347:1132496786007801997>",
        "description": "Anorith was regenerated from a prehistoric fossil. This primitive Pokémon once lived in warm seas. It grips its prey firmly between its two large claws.",
        "type": [types.ROCK, types.BUG],
        "baseStats": [45, 95, 50, 40, 50, 75],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/347.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/347.png",
        "evolution":[{
            "level": 40,
            "id": "348",
        }],
        "abilities": {
            "4": 0.8,
            "33": 0.2,
        },
        "moveIds": ["m453", "m229", "m444", "m450"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "348": {
        "name": "Armaldo",
        "emoji": "<:348:1132496788432109599>",
        "description": "Armaldo's tough armor makes all attacks bounce off. This Pokémon's two enormous claws can be freely extended or contracted. They have the power to punch right through a steel slab.",
        "type": [types.ROCK, types.BUG],
        "baseStats": [75, 125, 100, 70, 70, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/348.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/348.png",
        "abilities": {
            "4": 0.8,
            "33": 0.2,
        },
        "moveIds": ["m453", "m229", "m444", "m404"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "349": {
        "name": "Feebas",
        "emoji": "<:349:1132496790181126254>",
        "description": "Feebas's fins are ragged and tattered from the start of its life. Because of its shoddy appearance, this Pokémon is largely ignored. It is capable of living in both the sea and in rivers.",
        "type": [types.WATER],
        "baseStats": [20, 15, 20, 10, 55, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/349.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/349.png",
        "evolution":[{
            "level": 40,
            "id": "350",
        }],
        "abilities": {
            "33": 0.45,
            "12": 0.45,
            "91": 0.1,
        },
        "moveIds": ["m33", "m150", "m175", "m57"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.SLOW,
    },
    "350": {
        "name": "Milotic",
        "emoji": "<:350:1132496791556857946>",
        "description": "Milotic is said to be the most beautiful of all the Pokémon. It has the power to becalm such emotions as anger and hostility to quell bitter feuding.",
        "type": [types.WATER],
        "baseStats": [95, 60, 79, 100, 125, 81],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/350.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/350.png",
        "abilities": {
            "63": 0.45,
            "172": 0.45,
            "56": 0.1,
        },
        "moveIds": ["m55", "m105", "m243", "m56"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW,
    },
    "355": {
        "name": "Duskull",
        "emoji": "<:355:1132496884175491164>",
        "description": "Duskull can pass through any wall no matter how thick it may be. Once this Pokémon chooses a target, it will doggedly pursue the intended victim until the break of dawn.",
        "type": [types.GHOST],
        "baseStats": [20, 40, 90, 25, 90, 25],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/355.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/355.png",
        "evolution":[{
            "level": 40,
            "id": "356",
        }],
        "abilities": {
            "26": 0.8,
            "119": 0.2,
        },
        "moveIds": ["m43", "m425", "m194", "m247"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "356": {
        "name": "Dusclops",
        "emoji": "<:356:1132496885215674440>",
        "description": "Dusclops's body is completely hollow - there is nothing at all inside. It is said that its body is like a black hole. This Pokémon will absorb anything into its body, but nothing will ever come back out.",
        "type": [types.GHOST],
        "baseStats": [40, 70, 130, 60, 130, 25],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/356.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/356.png",
        "abilities": {
            "46": 0.8,
            "119": 0.2,
        },
        "moveIds": ["m425", "m194", "m325", "m262"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "363": {
        "name": "Spheal",
        "emoji": "<:363:1132496966589358100>",
        "description": "Spheal is much faster rolling than walking to get around. When groups of this Pokémon eat, they all clap at once to show their pleasure. Because of this, their mealtimes are noisy.",
        "type": [types.ICE, types.WATER],
        "baseStats": [70, 40, 50, 55, 50, 25],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/363.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/363.png",
        "evolution":[{
            "level": 32,
            "id": "364",
        }],
        "abilities": {
            "47": 0.45,
            "115": 0.45,
            "12": 0.1,
        },
        "moveIds": ["m55", "m205", "m58", "m258"],
        "battleEligible": true,
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "364": {
        "name": "Sealeo",
        "emoji": "<:364:1132496968258695248>",
        "description": "Sealeo has the habit of always juggling on the tip of its nose anything it sees for the first time. This Pokémon occasionally entertains itself by balancing and rolling a Spheal on its nose.",
        "type": [types.ICE, types.WATER],
        "baseStats": [90, 60, 70, 75, 70, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/364.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/364.png",
        "evolution":[{
            "level": 44,
            "id": "365",
        }],
        "abilities": {
            "47": 0.45,
            "115": 0.45,
            "12": 0.1,
        },
        "moveIds": ["m55", "m57", "m58", "m258"],
        "battleEligible": true,
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "365": {
        "name": "Walrein",
        "emoji": "<:365:1132496969655390249>",
        "description": "Walrein's two massively developed tusks can totally shatter blocks of ice weighing ten tons with one blow. This Pokémon's thick coat of blubber insulates it from subzero temperatures.",
        "type": [types.ICE, types.WATER],
        "baseStats": [110, 80, 90, 95, 90, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/365.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/365.png",
        "abilities": {
            "47": 0.45,
            "115": 0.45,
            "12": 0.1,
        },
        "moveIds": ["m55", "m57", "m258", "m59"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "371": {
        "name": "Bagon",
        "emoji": "<:371:1132497162991845548>",
        "description": "Bagon harbors a never-ending dream of one day soaring high among the clouds. As if trying to dispel its frustration over its inability to fly, this Pokémon slams its hard head against huge rocks and shatters them into pebbles.",
        "type": [types.DRAGON],
        "baseStats": [45, 75, 60, 40, 30, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/371.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/371.png",
        "evolution":[{
            "level": 30,
            "id": "372",
        }],
        "abilities": {
            "69": 0.8,
            "125": 0.2,
        },
        "moveIds": ["m43", "m52", "m242", "m407"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW,
    },
    "372": {
        "name": "Shelgon",
        "emoji": "<:372:1132497164455641158>",
        "description": "Inside Shelgon's armor-like shell, cells are in the midst of transformation to create an entirely new body. This Pokémon's shell is extremely heavy, making its movements sluggish.",
        "type": [types.DRAGON],
        "baseStats": [65, 95, 100, 60, 50, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/372.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/372.png",
        "evolution":[{
            "level": 50,
            "id": "373",
        }],
        "abilities": {
            "69": 0.8,
            "142": 0.2,
        },
        "moveIds": ["m43", "m242", "m349", "m407"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW,
    },
    "373": {
        "name": "Salamence",
        "emoji": "<:373:1132497165521010728>",
        "description": "Salamence came about as a result of a strong, long-held dream of growing wings. It is said that this powerful desire triggered a sudden mutation in this Pokémon's cells, causing it to sprout its magnificent wings.",
        "type": [types.DRAGON, types.FLYING],
        "baseStats": [95, 135, 80, 110, 80, 100],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/373.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/373.png",
        "abilities": {
            "22": 0.8,
            "153": 0.2,
        },
        "moveIds": ["m43", "m349", "m814", "m200"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW,
    },
    "374": {
        "name": "Beldum",
        "emoji": "<:374:1132497167546863617>",
        "description": "Instead of blood, a powerful magnetic force courses throughout Beldum's body. This Pokémon communicates with others by sending controlled pulses of magnetism.",
        "type": [types.STEEL, types.PSYCHIC],
        "baseStats": [40, 55, 80, 35, 60, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/374.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/374.png",
        "evolution":[{
            "level": 20,
            "id": "375",
        }],
        "abilities": {
            "29": 0.8,
            "135": 0.2,
        },
        "moveIds": ["m33"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW,
    },
    "375": {
        "name": "Metang",
        "emoji": "<:375:1132497317581291650>",
        "description": "When two Beldum fuse together, Metang is formed. The brains of the Beldum are joined by a magnetic nervous system. By linking its brains magnetically, this Pokémon generates strong psychokinetic power.",
        "type": [types.STEEL, types.PSYCHIC],
        "baseStats": [60, 75, 100, 55, 80, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/375.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/375.png",
        "evolution":[{
            "level": 45,
            "id": "376",
        }],
        "abilities": {
            "29": 0.8,
            "135": 0.2,
        },
        "moveIds": ["m93", "m418", "m309", "m359"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW,
    },
    "376": {
        "name": "Metagross",
        "emoji": "<:376:1132497319359684708>",
        "description": "Metagross has four brains in total. Combined, the four brains can breeze through difficult calculations faster than a supercomputer. This Pokémon can float in the air by tucking in its four legs.",
        "type": [types.STEEL, types.PSYCHIC],
        "baseStats": [80, 135, 130, 95, 90, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/376.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/376.png",
        "abilities": {
            "29": 0.8,
            "135": 0.2,
        },
        "moveIds": ["m418", "m309", "m359", "m428"],
        "battleEligible": true,
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW,
    },
    "377": {
        "name": "Regirock",
        "emoji": "<:377:1132497320550879272>",
        "description": "Regirock was sealed away by people long ago. If this Pokémon's body is damaged in battle, it is said to seek out suitable rocks on its own to repair itself.",
        "type": [types.ROCK],
        "baseStats": [80, 100, 200, 50, 100, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/377.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/377.png",
        "abilities": {
            "29": 0.8,
            "5": 0.2,
        },
        "moveIds": ["m199", "m182", "m409", "m157"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW,
    },
    "378": {
        "name": "Regice",
        "emoji": "<:378:1132497321653981255>",
        "description": "Regice cloaks itself with frigid air of negative 328 degrees Fahrenheit. Things will freeze solid just by going near this Pokémon. Its icy body is so cold, it will not melt even if it is immersed in magma.",
        "type": [types.ICE],
        "baseStats": [80, 50, 100, 100, 200, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/378.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/378.png",
        "abilities": {
            "29": 0.8,
            "115": 0.2,
        },
        "moveIds": ["m199", "m85", "m182", "m59"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW,
    },
    "379": {
        "name": "Registeel",
        "emoji": "<:379:1132497322765467778>",
        "description": "Registeel has a body that is harder than any kind of metal. Its body is apparently hollow. No one has any idea what this Pokémon eats.",
        "type": [types.STEEL],
        "baseStats": [80, 75, 150, 75, 150, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/379.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/379.png",
        "abilities": {
            "29": 0.8,
            "135": 0.2,
        },
        "moveIds": ["m199", "m182", "m484", "m192"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW,
    },
    "380": {
        "name": "Latias",
        "emoji": "<:380:1132497324363481108>",
        "description": "Latias is highly intelligent and capable of understanding human speech. It is covered with a glass-like down. The Pokémon enfolds its body with its down and refracts light to alter its appearance.",
        "type": [types.DRAGON, types.PSYCHIC],
        "baseStats": [80, 80, 90, 110, 130, 110],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/380.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/380.png",
        "abilities": {
            "26": 1,
        },
        "moveIds": ["m270", "m113", "m406", "m296"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW,
    },
    "381": {
        "name": "Latios",
        "emoji": "<:381:1132497325491765328>",
        "description": "Latios has the ability to make others see an image of what it has seen or imagines in its head. This Pokémon is intelligent and understands human speech.",
        "type": [types.DRAGON, types.PSYCHIC],
        "baseStats": [80, 90, 80, 130, 110, 110],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/381.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/381.png",
        "abilities": {
            "26": 1,
        },
        "moveIds": ["m93", "m85", "m406", "m295"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW,
    },
    "382": {
        "name": "Kyogre",
        "emoji": "<:382:1132497326691332166>",
        "description": "Kyogre has the power to create massive rain clouds that cover the entire sky and bring about torrential downpours. This Pokémon saved people who were suffering from droughts.",
        "type": [types.WATER],
        "baseStats": [100, 100, 90, 150, 140, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/382.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/382.png",
        "abilities": {
            "2": 1,
        },
        "moveIds": ["m246", "m58", "m182", "m618"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW,
    },
    "383": {
        "name": "Groudon",
        "emoji": "<:383:1132497390079852674>",
        "description": "Groudon has the power to scatter rain clouds and make water evaporate with light and heat. It came as a savior to people who had been suffering from terrible floods.",
        "type": [types.GROUND],
        "baseStats": [100, 150, 140, 100, 90, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/383.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/383.png",
        "abilities": {
            "70": 1,
        },
        "moveIds": ["m479", "m444", "m446", "m619"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW,
    },
    "384": {
        "name": "Rayquaza",
        "emoji": "<:384:1132497391535272016>",
        "description": "Rayquaza is said to have lived for hundreds of millions of years. Legends remain of how it put to rest the clash between Kyogre and Groudon.",
        "type": [types.DRAGON, types.FLYING],
        "baseStats": [105, 150, 90, 150, 90, 95],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/384.png",
        "abilities": {
            "76": 1,
        },
        "moveIds": ["m239", "m245", "m406", "m620"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW,
    },
    "384-1": {
        "name": "Raykaido",
        "emoji": "<:kaido:1136890666442555403>",
        "description": "A legendary creature that has been seen in the skies of a faraway region. It is said to be the protector of the skies.",
        "type": [types.DRAGON],
        "baseStats": [125, 90, 150, 110, 130, 75],
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/kaido-resized.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/kaido-shiny-resized.png",
        "abilities": {
            "144": 1,
        },
        "moveIds": ["m239", "m208-1", "m85", "m620-1"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW,
        "noGacha": true,
    },
    "392-1": {
        "name": "Rubber Infernape",
        "emoji": "<:luffy:1136890668342595654>",
        "description": "An Infernape who ate a special poffin, granting its body the properties of rubber.",
        "type": [types.NORMAL, types.FIGHTING],
        "baseStats": [86, 154, 70, 104, 70, 116],
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/luffy-resized.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/luffy-shiny-resized.png",
        "abilities": {
            "20011": 1,
        },
        "moveIds": ["m183-1", "m7-1", "m370-1", "m20010"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW,
        "noGacha": true,
    },
    "392-2": {
        "name": "Sun God Infernape",
        "emoji": "<:luffy:1136890668342595654>",
        "description": "The Infernape that has awakened its poffin powers. Destined to liberate the world, it brings joy and freedom wherever it goes.",
        "type": [types.FAIRY, types.FIGHTING],
        "baseStats": [86, 154, 75, 154, 75, 136],
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/luffy-resized.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/luffy-shiny-resized.png",
        "abilities": {
            "20009": 1,
        },
        "moveIds": ["m20011", "m182-1", "m417-1", "m20012"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW,
        "unobtainable": true,
    },
    "828-1": {
        "name": "Scammer Thievul",
        "emoji": "<:scammerthievul:1130698673794338968>",
        "description": "A devious thief whos lies have fooled countless trainers. It preys on the unaware and naive.",
        "type": [types.DARK],
        "baseStats": [80, 80, 60, 130, 100, 130],
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/scammer-thievul-resized.png",
        "shinySprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/scammer-thievul-shiny-resized.png",
        "abilities": {
            "198": 1,
        },
        "moveIds": ["m98", "m168", "m399", "m20007"],
        "battleEligible": true,
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.MEDIUMSLOW,
        "noGacha": true
    },
    "20091": {
        "name": "Temple Guardian Cloyster",
        "emoji": "<:91:1100288966881718342>",
        "description": "Faithful guardian of the ancient Mind Temple. It's said to be untouchable through centuries of perfecting its mind.",
        "type": [types.WATER, types.ICE],
        "baseStats": [150, 115, 180, 90, 75, 90],
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
        "baseStats": [350, 40, 45, 90, 90, 85],
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
        "baseStats": [160, 85, 90, 110, 160, 95],
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
        "baseStats": [125, 155, 85, 100, 95, 140],
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
        "baseStats": [125, 90, 90, 160, 90, 145],
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
    "20384": {
        "name": "Palmer's Rayquaza",
        "emoji": "<:384:1132497391535272016>",
        "description": "Palmer's trusted sidekick, whose dominance in battle won Palmer the title of Battle Tower Tycoon.",
        "type": [types.DRAGON, types.FLYING],
        "baseStats": [125, 150, 90, 100, 90, 145],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png",
        "shinySprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/384.png",
        "abilities": {
            "76": 1,
        },
        "moveIds": ["m89", "m200", "m221", "m416", "m620"],
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
        statMultiplier: [
            1.15, 1.1, 1.15, 1.1, 1.15, 1.1
        ]
    },
    [rarities.RARE]: {
        pokemon: [],
        color: 0x0000ff,
        money: 50,
        statMultiplier: [
            1.15, 1.1, 1.15, 1.1, 1.15, 1.1
        ]
    },
    [rarities.EPIC]: {
        pokemon: [],
        color: 0xff00ff,
        money: 75,
        statMultiplier: [
            1.075, 1.05, 1.075, 1.05, 1.075, 1.05
        ]
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

const generations = [152, 252]

const getGeneration = (id) => {
    const baseNumber = parseInt(id.split("-")[0]);
    for (let i = 0; i < generations.length; i++) {
        if (baseNumber < generations[i]) {
            return i + 1;
        }
    }
    return generations.length + 1;
}

const MAX_TOTAL_EVS = 510;
const MAX_SINGLE_EVS = 252;

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
    statConfig,
    getGeneration,
}
