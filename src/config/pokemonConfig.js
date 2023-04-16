const types = {
    NORMAL: { name: "Normal", color: "#A8A878", id: 0,},
    FIGHTING: { name: "Fighting", color: "#C03028", id: 1,},
    FLYING: { name: "Flying", color: "#A890F0", id: 2,},
    POISON: { name: "Poison", color: "#A040A0", id: 3,},
    GROUND: { name: "Ground", color: "#E0C068", id: 4,},
    ROCK: { name: "Rock", color: "#B8A038", id: 5,},
    BUG: { name: "Bug", color: "#A8B820", id: 6,},
    GHOST: { name: "Ghost", color: "#705898", id: 7,},
    STEEL: { name: "Steel", color: "#B8B8D0", id: 8,},
    FIRE: { name: "Fire", color: "#F08030", id: 9,},
    WATER: { name: "Water", color: "#6890F0", id: 10,},
    GRASS: { name: "Grass", color: "#78C850", id: 11,},
    ELECTRIC: { name: "Electric", color: "#F8D030", id: 12,},
    PSYCHIC: { name: "Psychic", color: "#F85888", id: 13,},
    ICE: { name: "Ice", color: "#98D8D8", id: 14,},
    DRAGON: { name: "Dragon", color: "#7038F8", id: 15,},
    DARK: { name: "Dark", color: "#705848", id: 16,},
    FAIRY: { name: "Fairy", color: "#EE99AC", id: 17,},
    UNKNOWN: { name: "Unknown", color: "#68A090", id: 18,},
    SHADOW: { name: "Shadow", color: "#705848", id: 19,},
}

const natureConfig = {
    "0": { "name": "Hardy", "description": "No stat changes", "stats": [0, 0, 0, 0, 0, 0],},
    "1": { "name": "Lonely", "description": "Attack +1, Defense -1", "stats": [0, 1, -1, 0, 0, 0],},
    "2": { "name": "Brave", "description": "Attack +1, Speed -1", "stats": [0, 1, 0, 0, 0, -1],},
    "3": { "name": "Adamant", "description": "Attack +1, Sp. Atk -1", "stats": [0, 1, 0, -1, 0, 0],},
    "4": { "name": "Naughty", "description": "Attack +1, Sp. Def -1", "stats": [0, 1, 0, 0, -1, 0],},
    "5": { "name": "Bold", "description": "Defense +1, Attack -1", "stats": [0, -1, 1, 0, 0, 0],},
    "6": { "name": "Docile", "description": "No stat changes", "stats": [0, 0, 0, 0, 0, 0],},
    "7": { "name": "Relaxed", "description": "Defense +1, Speed -1", "stats": [0, 0, 1, 0, 0, -1],},
    "8": { "name": "Impish", "description": "Defense +1, Sp. Atk -1", "stats": [0, 0, 1, -1, 0, 0],},
    "9": { "name": "Lax", "description": "Defense +1, Sp. Def -1", "stats": [0, 0, 1, 0, -1, 0],},
    "10": { "name": "Timid", "description": "Speed +1, Attack -1", "stats": [0, -1, 0, 0, 0, 1],},
    "11": { "name": "Hasty", "description": "Speed +1, Defense -1", "stats": [0, 0, -1, 0, 0, 1],},
    "12": { "name": "Serious", "description": "No stat changes", "stats": [0, 0, 0, 0, 0, 0],},
    "13": { "name": "Jolly", "description": "Speed +1, Sp. Atk -1", "stats": [0, 0, 0, -1, 0, 1],},
    "14": { "name": "Naive", "description": "Speed +1, Sp. Def -1", "stats": [0, 0, 0, 0, -1, 1],},
    "15": { "name": "Modest", "description": "Sp. Atk +1, Attack -1", "stats": [0, -1, 0, 1, 0, 0],},
    "16": { "name": "Mild", "description": "Sp. Atk +1, Defense -1", "stats": [0, 0, -1, 1, 0, 0],},
    "17": { "name": "Quiet", "description": "Sp. Atk +1, Speed -1", "stats": [0, 0, 0, 1, 0, -1],},
    "18": { "name": "Bashful", "description": "No stat changes", "stats": [0, 0, 0, 0, 0, 0],},
    "19": { "name": "Rash", "description": "Sp. Atk +1, Sp. Def -1", "stats": [0, 0, 0, 1, -1, 0],},
    "20": { "name": "Calm", "description": "Sp. Def +1, Attack -1", "stats": [0, -1, 0, 0, 1, 0],},
    "21": { "name": "Gentle", "description": "Sp. Def +1, Defense -1", "stats": [0, 0, -1, 0, 1, 0],},
    "22": { "name": "Sassy", "description": "Sp. Def +1, Speed -1", "stats": [0, 0, 0, 0, 1, -1],},
    "23": { "name": "Careful", "description": "Sp. Def +1, Sp. Atk -1", "stats": [0, 0, 0, -1, 1, 0],},
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
        "emoji": "1️⃣",
        "description": "A strange seed was planted on its back at birth. The plant sprouts and grows with this Pokémon.",
        "type": [types.GRASS, types.POISON],
        "baseStats": [45, 49, 49, 65, 65, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
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
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "2": {
        "name": "Ivysaur",
        "emoji": "2️⃣",
        "description": "When the bulb on its back grows large, it appears to lose the ability to stand on its hind legs.",
        "type": [types.GRASS, types.POISON],
        "baseStats": [60, 62, 63, 80, 80, 60],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png",
        "evolution": [{
            "level": 32,
            "id": "3",
        }],
        "abilities": {
            "65": 0.8,
            "34": 0.2
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "3": {
        "name": "Venusaur",
        "emoji": "3️⃣",
        "description": "The plant blooms when it is absorbing solar energy. It stays on the move to seek sunlight.",
        "type": [types.GRASS, types.POISON],
        "baseStats": [80, 82, 83, 100, 100, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png",
        "abilities": {
            "65": 0.8,
            "34": 0.2
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "4": {
        "name": "Charmander",
        "emoji": "4️⃣",
        "description": "Obviously prefers hot places. When it rains, steam is said to spout from the tip of its tail.",
        "type": [types.FIRE],
        "baseStats": [39, 52, 43, 60, 50, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png",
        "evolution":[ {
            "level": 16,
            "id": "5",
        }],
        "abilities": {
            "66": 0.8,
            "94": 0.2
        },
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "5": {
        "name": "Charmeleon",
        "emoji": "5️⃣",
        "description": "When it swings its burning tail, it elevates the temperature to unbearably high levels.",
        "type": [types.FIRE],
        "baseStats": [58, 64, 58, 80, 65, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png",
        "evolution": [{
            "level": 36,
            "id": "6",
        }],
        "abilities": {
            "66": 0.8,
            "94": 0.2
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "6": {
        "name": "Charizard",
        "emoji": "6️⃣",
        "description": "Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally.",
        "type": [types.FIRE, types.FLYING],
        "baseStats": [78, 84, 78, 109, 85, 100],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
        "abilities": {
            "66": 0.8,
            "94": 0.2
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "7": {
        "name": "Squirtle",
        "emoji": "7️⃣",
        "description": "After birth, its back swells and hardens into a shell. Powerfully sprays foam from its mouth.",
        "type": [types.WATER],
        "baseStats": [44, 48, 65, 50, 64, 43],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png",
        "evolution": [{
            "level": 16,
            "id": "8",
        }],
        "abilities": {
            "67": 0.8,
            "44": 0.2
        },
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "8": {
        "name": "Wartortle",
        "emoji": "8️⃣",
        "description": "Often hides in water to stalk unwary prey. For swimming fast, it moves its ears to maintain balance.",
        "type": [types.WATER],
        "baseStats": [59, 63, 80, 65, 80, 58],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png",
        "evolution": {
            "level": 36,
            "id": "9",
        },
        "abilities": {
            "67": 0.8,
            "44": 0.2
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "9": {
        "name": "Blastoise",
        "emoji": "9️⃣",
        "description": "A brutal POKéMON with pressurized water jets on its shell. They are used for high speed tackles.",
        "type": [types.WATER],
        "baseStats": [79, 83, 100, 85, 105, 78],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png",
        "abilities": {
            "67": 0.8,
            "44": 0.2
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW,
    },
    "10": {
        "name": "Caterpie",
        "emoji": "🐛",
        "description": "Its short feet are tipped with suction pads that enable it to tirelessly climb slopes and walls.",
        "type": [types.BUG],
        "baseStats": [45, 30, 35, 20, 20, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png",
        "evolution": [{
            "level": 7,
            "id": "11",
        }],
        "abilities": {
            "19": 0.8,
            "50": 0.2
        },
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST,
    },
    "11": {
        "name": "Metapod",
        "emoji": "🐛",
        "description": "This POKéMON is vulnerable to attack while its shell is soft, exposing its weak and tender body.",
        "type": [types.BUG],
        "baseStats": [50, 20, 55, 25, 25, 30],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/11.png",
        "evolution": [{
            "level": 10,
            "id": "12",
        }],
        "abilities": {
            "61": 1
        },
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST,
    },
    "12": {
        "name": "Butterfree",
        "emoji": "🦋",
        "description": "In battle, it flaps its wings at high speed to release highly toxic dust into the air.",
        "type": [types.BUG, types.FLYING],
        "baseStats": [60, 45, 50, 90, 80, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png",
        "abilities": {
            "14": 0.8,
            "110": 0.2
        },
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST,
    },
    "13": {
        "name": "Weedle",
        "emoji": "🐛",
        "description": "Often found in forests, eating leaves. It has a sharp venomous stinger on its head.",
        "type": [types.BUG, types.POISON],
        "baseStats": [40, 35, 30, 20, 20, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/13.png",
        "evolution": [{
            "level": 7,
            "id": "14",
        }],
        "abilities": {
            "19": 0.8,
            "50": 0.2
        },
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST,
    },
    "14": {
        "name": "Kakuna",
        "emoji": "🐛",
        "description": "Almost incapable of moving, this POKéMON can only harden its shell to protect itself from predators.",
        "type": [types.BUG, types.POISON],
        "baseStats": [45, 25, 50, 25, 25, 35],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png",
        "evolution": [{
            "level": 10,
            "id": "15",
        }],
        "abilities": {
            "61": 1
        },
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST,
    },
    "15": {
        "name": "Beedrill",
        "emoji": "🐝",
        "description": "Flies at high speed and attacks using its large venomous stingers on its forelegs and tail.",
        "type": [types.BUG, types.POISON],
        "baseStats": [65, 90, 40, 45, 80, 75],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png",
        "abilities": {
            "68": 0.8,
            "97": 0.2
        },
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST,
    },
    "16" : {
        "name": "Pidgey",
        "emoji": "🐦",
        "description": "Very docile. If attacked, it will often kick up sand to protect itself rather than fight back.",
        "type": [types.NORMAL, types.FLYING],
        "baseStats": [40, 45, 40, 35, 35, 56],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png",
        "evolution": [{
            "level": 18,
            "id": "17",
        }],
        "abilities": {
            "51": 0.45,
            "77": 0.45,
            "145": 0.1
        },
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST
    },
    "17" : {
        "name": "Pidgeotto",
        "emoji": "🐦",
        "description": "This POKéMON is full of vitality. It constantly flies around its large territory in search of prey.",
        "type": [types.NORMAL, types.FLYING],
        "baseStats": [63, 60, 55, 50, 50, 71],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png",
        "evolution": [{
            "level": 36,
            "id": "18",
        }],
        "abilities": {
            "51": 0.45,
            "77": 0.45,
            "145": 0.1
        },
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "18" : {
        "name": "Pidgeot",
        "emoji": "🐦",
        "description": "When hunting, it skims the surface of water at high speed to pick off unwary prey such as MAGIKARP.",
        "type": [types.NORMAL, types.FLYING],
        "baseStats": [83, 80, 75, 70, 70, 101],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png",
        "abilities": {
            "51": 0.45,
            "77": 0.45,
            "145": 0.1
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "19" : {
        "name": "Rattata",
        "emoji": "🐀",
        "description": "Bites anything when it attacks. Small and very quick, it is a common sight in many places.",
        "type": [types.NORMAL],
        "baseStats": [30, 56, 35, 25, 35, 72],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png",
        "evolution": [{
            "level": 20,
            "id": "20",
        }],
        "abilities": {
            "50": 0.45,
            "62": 0.45,
            "55": 0.1
        },
        "rarity": rarities.COMMON,
        "growthRate": growthRates.FAST
    },
    "20" : {
        "name": "Raticate",
        "emoji": "🐀",
        "description": "It uses its whis­kers to maintain its balance. It apparently slows down if they are cut off.",
        "type": [types.NORMAL],
        "baseStats": [55, 81, 60, 50, 70, 97],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/20.png",
        "abilities": {
            "50": 0.45,
            "62": 0.45,
            "55": 0.1
        },
        "rarity": rarities.RARE,
        "growthRate": growthRates.FAST
    },
    "25" : {
        "name": "Pikachu",
        "emoji": "⚡",
        "description": "When several of these POKéMON gather, their electricity could build and cause lightning storms.",
        "type": [types.ELECTRIC],
        "baseStats": [35, 55, 40, 50, 50, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png",
        "evolution": [{
            "level": 16,
            "id": "26",
        }],
        "abilities": {
            "9": 0.8,
            "31": 0.2
        },
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "26" : {
        "name": "Raichu",
        "emoji": "⚡",
        "description": "Its long tail serves as a ground to protect itself from its own high-voltage power.",
        "type": [types.ELECTRIC],
        "baseStats": [60, 90, 55, 90, 80, 110],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png",
        "abilities": {
            "9": 0.8,
            "31": 0.2
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "35": {
        "name": "Clefairy",
        "emoji": "🧚",
        "description": "Its magical and cute appeal has many admirers. It is rare and found only in certain areas.",
        "type": [types.FAIRY],
        "baseStats": [70, 45, 48, 60, 65, 35],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png",
        "evolution": [{
            "level": 26,
            "id": "36",
        }],
        "abilities": {
            "56": 0.45,
            "98": 0.45,
            "132": 0.1
        },
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "36": {
        "name": "Clefable",
        "emoji": "🧚",
        "description": "A timid fairy POKéMON that is rarely seen. It will run and hide the moment it senses people.",
        "type": [types.FAIRY],
        "baseStats": [95, 70, 73, 95, 90, 60],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/36.png",
        "abilities": {
            "56": 0.45,
            "98": 0.45,
            "109": 0.1
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "39" : {
        "name": "Jigglypuff",
        "emoji": "🎤",
        "description": "When its huge eyes light up, it sings a mysteriously soothing melody that lulls its enemies to sleep.",
        "type": [types.NORMAL, types.FAIRY],
        "baseStats": [115, 45, 20, 45, 25, 20],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png",
        "evolution": [{
            "level": 26,
            "id": "40",
        }],
        "abilities": {
            "56": 0.45,
            "172": 0.45,
            "132": 0.1
        },
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "40" : {
        "name": "Wigglytuff",
        "emoji": "🎤",
        "description": "The body is soft and rubbery. When angered, it will suck in air and inflate itself to an enormous size.",
        "type": [types.NORMAL, types.FAIRY],
        "baseStats": [140, 70, 45, 85, 50, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png",
        "abilities": {
            "56": 0.45,
            "172": 0.45,
            "119": 0.1
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "41" : {
        "name": "Zubat",
        "emoji": "🦇",
        "description": "Forms colonies in perpetually dark places. Uses ultrasonic waves to identify and approach targets.",
        "type": [types.POISON, types.FLYING],
        "baseStats": [40, 45, 35, 30, 40, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/41.png",
        "evolution": [{
            "level": 22,
            "id": "42",
        }],
        "abilities": {
            "39": 0.8,
            "16": 0.2
        },
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST
    },
    "42" : {
        "name": "Golbat",
        "emoji": "🦇",
        "description": "Once it strikes, it will not stop draining energy from the victim even if it gets too heavy to fly.",
        "type": [types.POISON, types.FLYING],
        "baseStats": [75, 80, 70, 65, 75, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/42.png",
        "abilities": {
            "39": 0.8,
            "16": 0.2
        },
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "63": {
        "name": "Abra",
        "emoji": "🧠",
        "description": "Using its ability to read minds, it will identify impending danger and TELEPORT to safety.",
        "type": [types.PSYCHIC],
        "baseStats": [25, 20, 15, 105, 55, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/63.png",
        "evolution": [{
            "level": 16,
            "id": "64",
        }],
        "abilities": {
            "28": 0.45,
            "39": 0.45,
            "98": 0.1
        },
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "64": {
        "name": "Kadabra",
        "emoji": "🥄",
        "description": "It emits special alpha waves from its body that induce headaches just by being close by.",
        "type": [types.PSYCHIC],
        "baseStats": [40, 35, 30, 120, 70, 105],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/64.png",
        "evolution": [{
            "level": 36,
            "id": "65",
        }],
        "abilities": {
            "28": 0.45,
            "39": 0.45,
            "98": 0.1
        },
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "65": {
        "name": "Alakazam",
        "emoji": "🥄",
        "description": "Its brain can outperform a supercomputer. Its intelligence quotient is said to be 5,000.",
        "type": [types.PSYCHIC],
        "baseStats": [55, 50, 45, 135, 95, 120],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png",
        "abilities": {
            "28": 0.45,
            "39": 0.45,
            "98": 0.1
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "66": {
        "name": "Machop",
        "emoji": "💪",
        "description": "Loves to build its muscles. It trains in all styles of martial arts to become even stronger.",
        "type": [types.FIGHTING],
        "baseStats": [70, 80, 50, 35, 35, 35],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png",
        "evolution": [{
            "level": 28,
            "id": "67",
        }],
        "abilities": {
            "62": 0.45,
            "99": 0.45,
            "80": 0.1
        },
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST
    },
    "67": {
        "name": "Machoke",
        "emoji": "💪",
        "description": "Its muscular body is so powerful, it must wear a power save belt to be able to regulate its motions.",
        "type": [types.FIGHTING],
        "baseStats": [80, 100, 70, 50, 60, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/67.png",
        "evolution": [{
            "level": 42,
            "id": "68",
        }],
        "abilities": {
            "62": 0.45,
            "99": 0.45,
            "80": 0.1
        },
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "68": {
        "name": "Machamp",
        "emoji": "💪",
        "description": "Using its heavy muscles, it throws powerful punches that can send the victim clear over the horizon.",
        "type": [types.FIGHTING],
        "baseStats": [90, 130, 80, 65, 85, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png",
        "abilities": {
            "62": 0.45,
            "99": 0.45,
            "80": 0.1
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "74": {
        "name": "Geodude",
        "emoji": "🪨",
        "description": "Found in fields and mountains. Mistaking them for boulders, people often step or trip on them.",
        "type": [types.ROCK, types.GROUND],
        "baseStats": [40, 80, 100, 30, 30, 20],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png",
        "evolution": [{
            "level": 25,
            "id": "75",
        }],
        "abilities": {
            "69": 0.45,
            "5": 0.45,
            "8": 0.1
        },
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMFAST
    },
    "75": {
        "name": "Graveler",
        "emoji": "🪨",
        "description": "Rolls down slopes to move. It rolls over any obstacle without slowing or changing its direction.",
        "type": [types.ROCK, types.GROUND],
        "baseStats": [55, 95, 115, 45, 45, 35],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/75.png",
        "evolution": [{
            "level": 40,
            "id": "76",
        }],
        "abilities": {
            "69": 0.45,
            "5": 0.45,
            "8": 0.1
        },
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMFAST
    },
    "76": {
        "name": "Golem",
        "emoji": "🪨",
        "description": "Its boulder-like body is extremely hard. It can easily withstand dynamite blasts without damage.",
        "type": [types.ROCK, types.GROUND],
        "baseStats": [80, 120, 130, 55, 65, 45],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png",
        "abilities": {
            "69": 0.45,
            "5": 0.45,
            "8": 0.1
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMFAST
    },
    "92": {
        "name": "Gastly",
        "emoji": "👻",
        "description": "Almost invisible, this gaseous POKéMON cloaks the target and puts it to sleep without notice.",
        "type": [types.GHOST, types.POISON],
        "baseStats": [30, 35, 30, 100, 35, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/92.png",
        "evolution": [{
            "level": 25,
            "id": "93",
        }],
        "abilities": {
            "26": 1
        },
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "93": {
        "name": "Haunter",
        "emoji": "👻",
        "description": "Because of its ability to slip through block walls, it is said to be from another dimension.",
        "type": [types.GHOST, types.POISON],
        "baseStats": [45, 50, 45, 115, 55, 95],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/93.png",
        "evolution": [{
            "level": 40,
            "id": "94",
        }],
        "abilities": {
            "26": 1
        },
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "94": {
        "name": "Gengar",
        "emoji": "👻",
        "description": "Under a full moon, this POKéMON likes to mimic the shadows of people and laugh at their fright.",
        "type": [types.GHOST, types.POISON],
        "baseStats": [60, 65, 60, 130, 75, 110],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png",
        "abilities": {
            "130": 1
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "129": {
        "name": "Magikarp",
        "emoji": "🐟",
        "description": "In the distant past, it was somewhat stronger than the horribly weak descendants that exist today.",
        "type": [types.WATER],
        "baseStats": [20, 10, 55, 15, 20, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png",
        "evolution": [{
            "level": 20,
            "id": "130",
        }],
        "abilities": {
            "33": 0.8,
            "155": 0.2
        },
        "rarity": rarities.COMMON,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "130": {
        "name": "Gyarados",
        "emoji": "🐉",
        "description": "Rarely seen in the wild. Huge and vicious, it is capable of destroying entire cities in a rage.",
        "type": [types.WATER, types.FLYING],
        "baseStats": [95, 125, 79, 60, 100, 81],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png",
        "abilities": {
            "22": 0.8,
            "153": 0.2
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "133": {
        "name": "Eevee",
        "emoji": "🐶",
        "description": "Its genetic code is irregular. It may mutate if it is exposed to radiation from element STONES.",
        "type": [types.NORMAL],
        "baseStats": [55, 55, 50, 45, 65, 55],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png",
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
        "rarity": rarities.RARE,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "134": {
        "name": "Vaporeon",
        "emoji": "🧜‍♀️",
        "description": "Lives close to water. Its long tail is ridged with a fin which is often mistaken for a mermaid's.",
        "type": [types.WATER],
        "baseStats": [130, 65, 60, 110, 95, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/134.png",
        "abilities": {
            "11": 0.8,
            "93": 0.2
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "135": {
        "name": "Jolteon",
        "emoji": "⚡",
        "description": "It accumulates negative ions in the atmosphere to blast out 10000-volt lightning bolts.",
        "type": [types.ELECTRIC],
        "baseStats": [65, 65, 60, 110, 95, 130],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/135.png",
        "abilities": {
            "10": 0.8,
            "95": 0.2
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "136": {
        "name": "Flareon",
        "emoji": "🔥",
        "description": "When storing thermal energy in its body, its temperature could soar to over 1600 degrees.",
        "type": [types.FIRE],
        "baseStats": [65, 130, 60, 95, 110, 65],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/136.png",
        "abilities": {
            "18": 0.8,
            "62": 0.2
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.MEDIUMSLOW
    },
    "144" : {
        "name": "Articuno",
        "emoji": "🦅",
        "description": "A legendary bird POKéMON that is said to appear to doomed people who are lost in icy mountains.",
        "type": [types.ICE, types.FLYING],
        "baseStats": [90, 85, 100, 95, 125, 85],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png",
        "abilities": {
            "46": 0.8,
            "81": 0.2
        },
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW
    },
    "145" : {
        "name": "Zapdos",
        "emoji": "🦅",
        "description": "A legendary bird POKéMON that is said to appear from clouds while dropping enormous lightning bolts.",
        "type": [types.ELECTRIC, types.FLYING],
        "baseStats": [90, 90, 85, 125, 90, 100],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png",
        "abilities": {
            "46": 0.8,
            "9": 0.2
        },
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW
    },
    "146" : {
        "name": "Moltres",
        "emoji": "🦅",
        "description": "Known as the legendary bird of fire. Every flap of its wings creates a dazzling flash of flames.",
        "type": [types.FIRE, types.FLYING],
        "baseStats": [90, 100, 90, 125, 85, 90],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/146.png",
        "abilities": {
            "46": 0.8,
            "49": 0.2
        },
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW
    },
    "147": {
        "name": "Dratini", 
        "emoji": "🐉",
        "description": "Long considered a mythical POKéMON until recently when a small colony was found living underwater.",
        "type": [types.DRAGON],
        "baseStats": [41, 64, 45, 50, 50, 50],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/147.png",
        "evolution": [{
            "level": 30,
            "id": "148",
        }],
        "abilities": {
            "61": 0.8,
            "63": 0.2
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW
    },
    "148": {
        "name": "Dragonair",
        "emoji": "🐉",
        "description": "A mystical POKéMON that exudes a gentle aura. Has the ability to change climate conditions.",
        "type": [types.DRAGON],
        "baseStats": [61, 84, 65, 70, 70, 70],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/148.png",
        "evolution": [{
            "level": 55,
            "id": "149",
        }],
        "abilities": {
            "61": 0.8,
            "63": 0.2
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW
    },
    "149": {
        "name": "Dragonite",
        "emoji": "🐉",
        "description": "An extremely rarely seen marine POKéMON. Its intelligence is said to match that of humans.",
        "type": [types.DRAGON, types.FLYING],
        "baseStats": [91, 134, 95, 100, 100, 80],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png",
        "abilities": {
            "39": 0.8,
            "138": 0.2
        },
        "rarity": rarities.EPIC,
        "growthRate": growthRates.SLOW
    },
    "150" : {
        "name": "Mewtwo",
        "emoji": "🐱",
        "description": "It was created by a scientist after years of horrific gene splicing and DNA engineering experiments.",
        "type": [types.PSYCHIC],
        "baseStats": [106, 110, 90, 154, 90, 130],
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png",
        "abilities": {
            "46": 0.8,
            "127": 0.2
        },
        "rarity": rarities.LEGENDARY,
        "growthRate": growthRates.SLOW
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
        color: 0xff0000,
        money: 200,
    },
    [rarities.MYTHICAL]: {
        pokemon: [],
        color: 0xffff00,
        money: 1000,
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
    growthRates,
    natureConfig,
    MAX_TOTAL_EVS,
    MAX_SINGLE_EVS,
    stats,
    statConfig
}
