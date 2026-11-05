// Generated from dungeonConfig and battleTowerConfig. Player progress is illustrative.
const playModeFixtures = {
  "dungeons": [
    {
      "id": "mindTemple",
      "name": "Mind Temple",
      "displayName": "Mind Temple",
      "emoji": "🏛️",
      "sprite": "https://archives.bulbagarden.net/media/upload/thumb/1/17/LA_Temple_of_Sinnoh.png/500px-LA_Temple_of_Sinnoh.png",
      "description": "An ancient sanctuary of knowledge and wisdom. Defeat its guardians to earn Knowledge Shards.",
      "subtitle": {
        "icon": "knowledge-shard.png",
        "text": "Knowledge Shards"
      },
      "bosses": [
        {
          "id": "20091",
          "name": "Temple Guardian Cloyster",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/91.png"
        },
        {
          "id": "20144",
          "name": "Temple Guardian Articuno",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png"
        }
      ],
      "difficulties": [
        {
          "id": "medium",
          "name": "Medium",
          "minLevel": 55,
          "maxLevel": 70,
          "species": [
            {
              "id": "20091",
              "name": "Temple Guardian Cloyster",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/91.png",
              "boss": true
            },
            {
              "id": "20144",
              "name": "Temple Guardian Articuno",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png",
              "boss": true
            },
            {
              "id": "213",
              "name": "Shuckle",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/213.png",
              "boss": false
            },
            {
              "id": "377",
              "name": "Regirock",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/377.png",
              "boss": false
            },
            {
              "id": "197",
              "name": "Umbreon",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/197.png",
              "boss": false
            },
            {
              "id": "378",
              "name": "Regice",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/378.png",
              "boss": false
            },
            {
              "id": "208",
              "name": "Steelix",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/208.png",
              "boss": false
            },
            {
              "id": "379",
              "name": "Registeel",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/379.png",
              "boss": false
            }
          ],
          "rewards": [
            {
              "kind": "item",
              "id": "4",
              "count": 6,
              "name": "Knowledge Shard",
              "icon": "knowledge-shard.png"
            }
          ],
          "completionNote": null
        },
        {
          "id": "hard",
          "name": "Hard",
          "minLevel": 85,
          "maxLevel": 100,
          "species": [
            {
              "id": "20091",
              "name": "Temple Guardian Cloyster",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/91.png",
              "boss": true
            },
            {
              "id": "20144",
              "name": "Temple Guardian Articuno",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png",
              "boss": true
            },
            {
              "id": "213",
              "name": "Shuckle",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/213.png",
              "boss": false
            },
            {
              "id": "377",
              "name": "Regirock",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/377.png",
              "boss": false
            },
            {
              "id": "197",
              "name": "Umbreon",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/197.png",
              "boss": false
            },
            {
              "id": "378",
              "name": "Regice",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/378.png",
              "boss": false
            },
            {
              "id": "208",
              "name": "Steelix",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/208.png",
              "boss": false
            },
            {
              "id": "379",
              "name": "Registeel",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/379.png",
              "boss": false
            }
          ],
          "rewards": [
            {
              "kind": "item",
              "id": "4",
              "count": 12,
              "name": "Knowledge Shard",
              "icon": "knowledge-shard.png"
            }
          ],
          "completionNote": null
        },
        {
          "id": "veryHard",
          "name": "Very Hard",
          "minLevel": 115,
          "maxLevel": 130,
          "species": [
            {
              "id": "20091",
              "name": "Temple Guardian Cloyster",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/91.png",
              "boss": true
            },
            {
              "id": "20144",
              "name": "Temple Guardian Articuno",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png",
              "boss": true
            },
            {
              "id": "213",
              "name": "Shuckle",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/213.png",
              "boss": false
            },
            {
              "id": "377",
              "name": "Regirock",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/377.png",
              "boss": false
            },
            {
              "id": "197",
              "name": "Umbreon",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/197.png",
              "boss": false
            },
            {
              "id": "378",
              "name": "Regice",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/378.png",
              "boss": false
            },
            {
              "id": "208",
              "name": "Steelix",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/208.png",
              "boss": false
            },
            {
              "id": "379",
              "name": "Registeel",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/379.png",
              "boss": false
            }
          ],
          "rewards": [
            {
              "kind": "item",
              "id": "4",
              "count": 24,
              "name": "Knowledge Shard",
              "icon": "knowledge-shard.png"
            }
          ],
          "completionNote": null
        }
      ]
    },
    {
      "id": "soulCave",
      "name": "Soul Cave",
      "displayName": "Soul Cave",
      "emoji": "⛰",
      "sprite": "https://archives.bulbagarden.net/media/upload/0/06/Echo_Cave_RTDX.png",
      "description": "An ancient cavern containing the primordial energy that birthed the souls of all Pokemon. Defeat its dwellers to earn Emotion Shards.",
      "subtitle": {
        "icon": "emotion-shard.png",
        "text": "Emotion Shards"
      },
      "bosses": [
        {
          "id": "20101",
          "name": "Cave Dweller Electrode",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/101.png"
        },
        {
          "id": "20113",
          "name": "Cave Dweller Chansey",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/113.png"
        }
      ],
      "difficulties": [
        {
          "id": "medium",
          "name": "Medium",
          "minLevel": 55,
          "maxLevel": 70,
          "species": [
            {
              "id": "20113",
              "name": "Cave Dweller Chansey",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/113.png",
              "boss": true
            },
            {
              "id": "20101",
              "name": "Cave Dweller Electrode",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/101.png",
              "boss": true
            },
            {
              "id": "131",
              "name": "Lapras",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png",
              "boss": false
            },
            {
              "id": "426",
              "name": "Drifblim",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/426.png",
              "boss": false
            },
            {
              "id": "51",
              "name": "Dugtrio",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/51.png",
              "boss": false
            },
            {
              "id": "461",
              "name": "Weavile",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/461.png",
              "boss": false
            },
            {
              "id": "40",
              "name": "Wigglytuff",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png",
              "boss": false
            },
            {
              "id": "291",
              "name": "Ninjask",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/291.png",
              "boss": false
            },
            {
              "id": "142",
              "name": "Aerodactyl",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/142.png",
              "boss": false
            },
            {
              "id": "143",
              "name": "Snorlax",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png",
              "boss": false
            },
            {
              "id": "202",
              "name": "Wobbuffet",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/202.png",
              "boss": false
            },
            {
              "id": "169",
              "name": "Crobat",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/169.png",
              "boss": false
            }
          ],
          "rewards": [
            {
              "kind": "item",
              "id": "5",
              "count": 6,
              "name": "Emotion Shard",
              "icon": "emotion-shard.png"
            }
          ],
          "completionNote": null
        },
        {
          "id": "hard",
          "name": "Hard",
          "minLevel": 85,
          "maxLevel": 100,
          "species": [
            {
              "id": "20113",
              "name": "Cave Dweller Chansey",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/113.png",
              "boss": true
            },
            {
              "id": "20101",
              "name": "Cave Dweller Electrode",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/101.png",
              "boss": true
            },
            {
              "id": "131",
              "name": "Lapras",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png",
              "boss": false
            },
            {
              "id": "426",
              "name": "Drifblim",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/426.png",
              "boss": false
            },
            {
              "id": "51",
              "name": "Dugtrio",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/51.png",
              "boss": false
            },
            {
              "id": "461",
              "name": "Weavile",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/461.png",
              "boss": false
            },
            {
              "id": "40",
              "name": "Wigglytuff",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png",
              "boss": false
            },
            {
              "id": "291",
              "name": "Ninjask",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/291.png",
              "boss": false
            },
            {
              "id": "142",
              "name": "Aerodactyl",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/142.png",
              "boss": false
            },
            {
              "id": "143",
              "name": "Snorlax",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png",
              "boss": false
            },
            {
              "id": "202",
              "name": "Wobbuffet",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/202.png",
              "boss": false
            },
            {
              "id": "169",
              "name": "Crobat",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/169.png",
              "boss": false
            }
          ],
          "rewards": [
            {
              "kind": "item",
              "id": "5",
              "count": 12,
              "name": "Emotion Shard",
              "icon": "emotion-shard.png"
            }
          ],
          "completionNote": null
        },
        {
          "id": "veryHard",
          "name": "Very Hard",
          "minLevel": 110,
          "maxLevel": 130,
          "species": [
            {
              "id": "20113",
              "name": "Cave Dweller Chansey",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/113.png",
              "boss": true
            },
            {
              "id": "20101",
              "name": "Cave Dweller Electrode",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/101.png",
              "boss": true
            },
            {
              "id": "131",
              "name": "Lapras",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png",
              "boss": false
            },
            {
              "id": "426",
              "name": "Drifblim",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/426.png",
              "boss": false
            },
            {
              "id": "51",
              "name": "Dugtrio",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/51.png",
              "boss": false
            },
            {
              "id": "461",
              "name": "Weavile",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/461.png",
              "boss": false
            },
            {
              "id": "40",
              "name": "Wigglytuff",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png",
              "boss": false
            },
            {
              "id": "291",
              "name": "Ninjask",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/291.png",
              "boss": false
            },
            {
              "id": "142",
              "name": "Aerodactyl",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/142.png",
              "boss": false
            },
            {
              "id": "143",
              "name": "Snorlax",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png",
              "boss": false
            },
            {
              "id": "202",
              "name": "Wobbuffet",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/202.png",
              "boss": false
            },
            {
              "id": "169",
              "name": "Crobat",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/169.png",
              "boss": false
            }
          ],
          "rewards": [
            {
              "kind": "item",
              "id": "5",
              "count": 24,
              "name": "Emotion Shard",
              "icon": "emotion-shard.png"
            }
          ],
          "completionNote": null
        }
      ]
    },
    {
      "id": "spiritAltar",
      "name": "Spirit Altar",
      "displayName": "Spirit Altar",
      "emoji": "⛩️",
      "sprite": "https://static.wikia.nocookie.net/victoryroad/images/a/ab/Altar_of_the_Moone_TCG.png/revision/latest?cb=20190329010127",
      "description": "An ancient shrine dedicated to the sacred spirits of Pokemon. Defeat its worshippers to earn Willpower Shards.",
      "subtitle": {
        "icon": "willpower-shard.png",
        "text": "Willpower Shards"
      },
      "bosses": [
        {
          "id": "20149",
          "name": "Spirit Priest Dragonite",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png"
        },
        {
          "id": "20150",
          "name": "Spirit Priest Mewtwo",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png"
        }
      ],
      "difficulties": [
        {
          "id": "medium",
          "name": "Medium",
          "minLevel": 55,
          "maxLevel": 70,
          "species": [
            {
              "id": "20149",
              "name": "Spirit Priest Dragonite",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png",
              "boss": true
            },
            {
              "id": "20150",
              "name": "Spirit Priest Mewtwo",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png",
              "boss": true
            },
            {
              "id": "99",
              "name": "Kingler",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/99.png",
              "boss": false
            },
            {
              "id": "409",
              "name": "Rampardos",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/409.png",
              "boss": false
            },
            {
              "id": "136",
              "name": "Flareon",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/136.png",
              "boss": false
            },
            {
              "id": "94",
              "name": "Gengar",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png",
              "boss": false
            },
            {
              "id": "462",
              "name": "Magnezone",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/462.png",
              "boss": false
            },
            {
              "id": "65",
              "name": "Alakazam",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png",
              "boss": false
            },
            {
              "id": "471",
              "name": "Glaceon",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/471.png",
              "boss": false
            },
            {
              "id": "248",
              "name": "Tyranitar",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/248.png",
              "boss": false
            }
          ],
          "rewards": [
            {
              "kind": "item",
              "id": "6",
              "count": 6,
              "name": "Willpower Shard",
              "icon": "willpower-shard.png"
            }
          ],
          "completionNote": null
        },
        {
          "id": "hard",
          "name": "Hard",
          "minLevel": 70,
          "maxLevel": 100,
          "species": [
            {
              "id": "20149",
              "name": "Spirit Priest Dragonite",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png",
              "boss": true
            },
            {
              "id": "20150",
              "name": "Spirit Priest Mewtwo",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png",
              "boss": true
            },
            {
              "id": "99",
              "name": "Kingler",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/99.png",
              "boss": false
            },
            {
              "id": "409",
              "name": "Rampardos",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/409.png",
              "boss": false
            },
            {
              "id": "136",
              "name": "Flareon",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/136.png",
              "boss": false
            },
            {
              "id": "94",
              "name": "Gengar",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png",
              "boss": false
            },
            {
              "id": "462",
              "name": "Magnezone",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/462.png",
              "boss": false
            },
            {
              "id": "65",
              "name": "Alakazam",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png",
              "boss": false
            },
            {
              "id": "471",
              "name": "Glaceon",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/471.png",
              "boss": false
            },
            {
              "id": "248",
              "name": "Tyranitar",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/248.png",
              "boss": false
            }
          ],
          "rewards": [
            {
              "kind": "item",
              "id": "6",
              "count": 12,
              "name": "Willpower Shard",
              "icon": "willpower-shard.png"
            }
          ],
          "completionNote": null
        },
        {
          "id": "veryHard",
          "name": "Very Hard",
          "minLevel": 115,
          "maxLevel": 130,
          "species": [
            {
              "id": "20149",
              "name": "Spirit Priest Dragonite",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png",
              "boss": true
            },
            {
              "id": "20150",
              "name": "Spirit Priest Mewtwo",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png",
              "boss": true
            },
            {
              "id": "99",
              "name": "Kingler",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/99.png",
              "boss": false
            },
            {
              "id": "409",
              "name": "Rampardos",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/409.png",
              "boss": false
            },
            {
              "id": "136",
              "name": "Flareon",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/136.png",
              "boss": false
            },
            {
              "id": "94",
              "name": "Gengar",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png",
              "boss": false
            },
            {
              "id": "462",
              "name": "Magnezone",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/462.png",
              "boss": false
            },
            {
              "id": "65",
              "name": "Alakazam",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png",
              "boss": false
            },
            {
              "id": "471",
              "name": "Glaceon",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/471.png",
              "boss": false
            },
            {
              "id": "248",
              "name": "Tyranitar",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/248.png",
              "boss": false
            }
          ],
          "rewards": [
            {
              "kind": "item",
              "id": "6",
              "count": 24,
              "name": "Willpower Shard",
              "icon": "willpower-shard.png"
            }
          ],
          "completionNote": null
        }
      ]
    },
    {
      "id": "newIsland",
      "name": "New Island",
      "displayName": "New Island",
      "emoji": "🏝️",
      "sprite": "https://e0.pxfuel.com/wallpapers/343/331/desktop-wallpaper-pokemon-the-movie-mewtwo-strikes-back-anime-board-pokemon-the-first-movie-mewtwo-strikes-back.jpg",
      "description": "The secret Team Rocket hideout and the birthplace of Mewtwo. Defeat Giovanni, Armored Mewtwo, and his clones to receive the Mythical Mew!",
      "subtitle": {
        "icon": "mew.png",
        "text": "Catch Mew!"
      },
      "bosses": [
        {
          "id": "25-1",
          "name": "Ash's Pikachu",
          "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/ash-pikachu-small.gif"
        },
        {
          "id": "52-1",
          "name": "Rocket Meowth",
          "sprite": "https://archives.bulbagarden.net/media/upload/4/4d/Spr_1b_052.png"
        },
        {
          "id": "150-1",
          "name": "Armored Mewtwo",
          "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/armored-mewtwo.png"
        }
      ],
      "difficulties": [
        {
          "id": "hard",
          "name": "Hard",
          "minLevel": 90,
          "maxLevel": 110,
          "species": [
            {
              "id": "25-1",
              "name": "Ash's Pikachu",
              "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/ash-pikachu-small.gif",
              "boss": true
            },
            {
              "id": "52-1",
              "name": "Rocket Meowth",
              "sprite": "https://archives.bulbagarden.net/media/upload/4/4d/Spr_1b_052.png",
              "boss": true
            },
            {
              "id": "150-1",
              "name": "Armored Mewtwo",
              "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/armored-mewtwo.png",
              "boss": true
            },
            {
              "id": "31",
              "name": "Nidoqueen",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/31.png",
              "boss": false
            },
            {
              "id": "34",
              "name": "Nidoking",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/34.png",
              "boss": false
            },
            {
              "id": "51",
              "name": "Dugtrio",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/51.png",
              "boss": false
            },
            {
              "id": "112",
              "name": "Rhydon",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/112.png",
              "boss": false
            },
            {
              "id": "53",
              "name": "Persian",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/53.png",
              "boss": false
            },
            {
              "id": "3",
              "name": "Venusaur",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png",
              "boss": false
            },
            {
              "id": "6",
              "name": "Charizard",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png",
              "boss": false
            },
            {
              "id": "9",
              "name": "Blastoise",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png",
              "boss": false
            }
          ],
          "rewards": [
            {
              "kind": "item",
              "id": "4",
              "count": 3,
              "name": "Knowledge Shard",
              "icon": "knowledge-shard.png"
            },
            {
              "kind": "item",
              "id": "5",
              "count": 3,
              "name": "Emotion Shard",
              "icon": "emotion-shard.png"
            },
            {
              "kind": "item",
              "id": "6",
              "count": 3,
              "name": "Willpower Shard",
              "icon": "willpower-shard.png"
            }
          ],
          "completionNote": "Congratulations! If this is your first time defeating New Island, use `/mew` to obtain your Mew!"
        }
      ]
    },
    {
      "id": "mountCoronet",
      "name": "Mount Coronet",
      "displayName": "[Event] Mount Coronet",
      "emoji": "🏔️",
      "sprite": "https://pbs.twimg.com/media/GPezGJhW4AArdKo.png",
      "description": "Cyrus and Team Galatic have awoken the Pokemon of Myth! Defend Sinnoh against their threat... and somone else?",
      "subtitle": {
        "icon": "star-piece.png",
        "text": "Event: All Shards"
      },
      "bosses": [
        {
          "id": "10245",
          "name": "Dialga-Origin",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10245.png"
        },
        {
          "id": "10246",
          "name": "Palkia-Origin",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10246.png"
        },
        {
          "id": "10007",
          "name": "Giratina-Origin",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10007.png"
        },
        {
          "id": "493",
          "name": "Arceus",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493.png"
        }
      ],
      "difficulties": [
        {
          "id": "hard",
          "name": "Hard",
          "minLevel": 100,
          "maxLevel": 150,
          "species": [
            {
              "id": "10007",
              "name": "Giratina-Origin",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10007.png",
              "boss": true
            },
            {
              "id": "10245",
              "name": "Dialga-Origin",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10245.png",
              "boss": true
            },
            {
              "id": "10246",
              "name": "Palkia-Origin",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10246.png",
              "boss": true
            },
            {
              "id": "493",
              "name": "Arceus",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493.png",
              "boss": true
            },
            {
              "id": "430",
              "name": "Honchkrow",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/430.png",
              "boss": false
            },
            {
              "id": "169",
              "name": "Crobat",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/169.png",
              "boss": false
            },
            {
              "id": "461",
              "name": "Weavile",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/461.png",
              "boss": false
            },
            {
              "id": "482",
              "name": "Azelf",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/482.png",
              "boss": false
            },
            {
              "id": "480",
              "name": "Uxie",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/480.png",
              "boss": false
            },
            {
              "id": "481",
              "name": "Mesprit",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/481.png",
              "boss": false
            },
            {
              "id": "201",
              "name": "Unown",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/201.png",
              "boss": false
            }
          ],
          "rewards": [
            {
              "kind": "item",
              "id": "4",
              "count": 9,
              "name": "Knowledge Shard",
              "icon": "knowledge-shard.png"
            },
            {
              "kind": "item",
              "id": "5",
              "count": 9,
              "name": "Emotion Shard",
              "icon": "emotion-shard.png"
            },
            {
              "kind": "item",
              "id": "6",
              "count": 9,
              "name": "Willpower Shard",
              "icon": "willpower-shard.png"
            }
          ],
          "completionNote": null
        },
        {
          "id": "veryHard",
          "name": "Very Hard",
          "minLevel": 120,
          "maxLevel": 200,
          "species": [
            {
              "id": "10007",
              "name": "Giratina-Origin",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10007.png",
              "boss": true
            },
            {
              "id": "10245",
              "name": "Dialga-Origin",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10245.png",
              "boss": true
            },
            {
              "id": "10246",
              "name": "Palkia-Origin",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10246.png",
              "boss": true
            },
            {
              "id": "493",
              "name": "Arceus",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/493.png",
              "boss": true
            },
            {
              "id": "430",
              "name": "Honchkrow",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/430.png",
              "boss": false
            },
            {
              "id": "169",
              "name": "Crobat",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/169.png",
              "boss": false
            },
            {
              "id": "461",
              "name": "Weavile",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/461.png",
              "boss": false
            },
            {
              "id": "482",
              "name": "Azelf",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/482.png",
              "boss": false
            },
            {
              "id": "480",
              "name": "Uxie",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/480.png",
              "boss": false
            },
            {
              "id": "481",
              "name": "Mesprit",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/481.png",
              "boss": false
            },
            {
              "id": "201",
              "name": "Unown",
              "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/201.png",
              "boss": false
            }
          ],
          "rewards": [
            {
              "kind": "item",
              "id": "4",
              "count": 13,
              "name": "Knowledge Shard",
              "icon": "knowledge-shard.png"
            },
            {
              "kind": "item",
              "id": "5",
              "count": 13,
              "name": "Emotion Shard",
              "icon": "emotion-shard.png"
            },
            {
              "kind": "item",
              "id": "6",
              "count": 13,
              "name": "Willpower Shard",
              "icon": "willpower-shard.png"
            }
          ],
          "completionNote": null
        }
      ]
    }
  ],
  "floors": [
    {
      "stage": 1,
      "npcId": "bugCatcher",
      "name": "Bug Catcher",
      "sprite": "https://archives.bulbagarden.net/media/upload/0/0b/Spr_DP_Bug_Catcher.png",
      "emoji": "<:bugcatcher:1117871382399815812>",
      "catchphrase": "I caught a bunch of bugs! Let's battle with them!",
      "difficultyId": "hard",
      "difficultyName": "Hard",
      "captionMin": 40,
      "captionMax": 50,
      "fightMin": 42,
      "fightMax": 52,
      "count": 6,
      "ace": {
        "id": "15",
        "name": "Beedrill",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png"
      },
      "pool": [
        {
          "id": "12",
          "name": "Butterfree",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png"
        },
        {
          "id": "15",
          "name": "Beedrill",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png"
        },
        {
          "id": "123",
          "name": "Scyther",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/123.png"
        },
        {
          "id": "127",
          "name": "Pinsir",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/127.png"
        },
        {
          "id": "166",
          "name": "Ledian",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/166.png"
        },
        {
          "id": "168",
          "name": "Ariados",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/168.png"
        },
        {
          "id": "212",
          "name": "Scizor",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/212.png"
        },
        {
          "id": "267",
          "name": "Beautifly",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/267.png"
        },
        {
          "id": "269",
          "name": "Dustox",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/269.png"
        },
        {
          "id": "292",
          "name": "Shedinja",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/292.png"
        },
        {
          "id": "402",
          "name": "Kricketune",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/402.png"
        },
        {
          "id": "413",
          "name": "Wormadam-Plant",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/413.png"
        },
        {
          "id": "10004",
          "name": "Wormadam-Sandy",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10004.png"
        },
        {
          "id": "10005",
          "name": "Wormadam-Trash",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10005.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 250,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "0",
          "count": 5,
          "name": "Pokeball",
          "icon": "poke-ball.png"
        }
      ]
    },
    {
      "stage": 2,
      "npcId": "fisherman",
      "name": "Fisherman",
      "sprite": "https://archives.bulbagarden.net/media/upload/c/c2/Spr_DP_Fisherman.png",
      "emoji": "<:fisherman:1117871385264533604>",
      "catchphrase": "I'm a natural born fisherman!",
      "difficultyId": "hard",
      "difficultyName": "Hard",
      "captionMin": 48,
      "captionMax": 58,
      "fightMin": 54,
      "fightMax": 63,
      "count": 6,
      "ace": {
        "id": "130",
        "name": "Gyarados",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png"
      },
      "pool": [
        {
          "id": "9",
          "name": "Blastoise",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png"
        },
        {
          "id": "121",
          "name": "Starmie",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/121.png"
        },
        {
          "id": "130",
          "name": "Gyarados",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png"
        },
        {
          "id": "131",
          "name": "Lapras",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png"
        },
        {
          "id": "134",
          "name": "Vaporeon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/134.png"
        },
        {
          "id": "184",
          "name": "Azumarill",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/184.png"
        },
        {
          "id": "279",
          "name": "Pelipper",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/279.png"
        },
        {
          "id": "321",
          "name": "Wailord",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/321.png"
        },
        {
          "id": "350",
          "name": "Milotic",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/350.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 250,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "4",
          "count": 20,
          "name": "Knowledge Shard",
          "icon": "knowledge-shard.png"
        }
      ]
    },
    {
      "stage": 3,
      "npcId": "lass",
      "name": "Lass",
      "sprite": "https://archives.bulbagarden.net/media/upload/f/f9/Spr_B2W2_Lass.png",
      "emoji": "<:lass:1117871390087991458>",
      "catchphrase": "I'm cute, but deadly!",
      "difficultyId": "hard",
      "difficultyName": "Hard",
      "captionMin": 56,
      "captionMax": 66,
      "fightMin": 49,
      "fightMax": 60,
      "count": 6,
      "ace": {
        "id": "282",
        "name": "Gardevoir",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/282.png"
      },
      "pool": [
        {
          "id": "3",
          "name": "Venusaur",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"
        },
        {
          "id": "12",
          "name": "Butterfree",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png"
        },
        {
          "id": "26",
          "name": "Raichu",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/26.png"
        },
        {
          "id": "40",
          "name": "Wigglytuff",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png"
        },
        {
          "id": "136",
          "name": "Flareon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/136.png"
        },
        {
          "id": "143",
          "name": "Snorlax",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png"
        },
        {
          "id": "196",
          "name": "Espeon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/196.png"
        },
        {
          "id": "272",
          "name": "Ludicolo",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/272.png"
        },
        {
          "id": "407",
          "name": "Roserade",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/407.png"
        },
        {
          "id": "428",
          "name": "Lopunny",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/428.png"
        },
        {
          "id": "471",
          "name": "Glaceon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/471.png"
        },
        {
          "id": "470",
          "name": "Leafeon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/470.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 250,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "5",
          "count": 20,
          "name": "Emotion Shard",
          "icon": "emotion-shard.png"
        }
      ]
    },
    {
      "stage": 4,
      "npcId": "fisherman",
      "name": "Fisherman",
      "sprite": "https://archives.bulbagarden.net/media/upload/c/c2/Spr_DP_Fisherman.png",
      "emoji": "<:fisherman:1117871385264533604>",
      "catchphrase": "I'm a natural born fisherman!",
      "difficultyId": "hard",
      "difficultyName": "Hard",
      "captionMin": 64,
      "captionMax": 74,
      "fightMin": 54,
      "fightMax": 63,
      "count": 6,
      "ace": {
        "id": "130",
        "name": "Gyarados",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png"
      },
      "pool": [
        {
          "id": "9",
          "name": "Blastoise",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png"
        },
        {
          "id": "121",
          "name": "Starmie",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/121.png"
        },
        {
          "id": "130",
          "name": "Gyarados",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png"
        },
        {
          "id": "131",
          "name": "Lapras",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png"
        },
        {
          "id": "134",
          "name": "Vaporeon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/134.png"
        },
        {
          "id": "184",
          "name": "Azumarill",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/184.png"
        },
        {
          "id": "279",
          "name": "Pelipper",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/279.png"
        },
        {
          "id": "321",
          "name": "Wailord",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/321.png"
        },
        {
          "id": "350",
          "name": "Milotic",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/350.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 250,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "6",
          "count": 20,
          "name": "Willpower Shard",
          "icon": "willpower-shard.png"
        }
      ]
    },
    {
      "stage": 5,
      "npcId": "palmer",
      "name": "Tower Tycoon Palmer",
      "sprite": "https://archives.bulbagarden.net/media/upload/f/f4/Spr_DP_Palmer.png",
      "emoji": "<:palmer:1119396349604020294>",
      "catchphrase": "Show me the skill you've acquired as a Trainer!",
      "difficultyId": "veryHard",
      "difficultyName": "Very Hard",
      "captionMin": 74,
      "captionMax": 84,
      "fightMin": 100,
      "fightMax": 120,
      "count": 6,
      "ace": {
        "id": "20384",
        "name": "Palmer's Rayquaza",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png"
      },
      "pool": [
        {
          "id": "144",
          "name": "Articuno",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png"
        },
        {
          "id": "145",
          "name": "Zapdos",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png"
        },
        {
          "id": "146",
          "name": "Moltres",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/146.png"
        },
        {
          "id": "150",
          "name": "Mewtwo",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png"
        },
        {
          "id": "249",
          "name": "Lugia",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png"
        },
        {
          "id": "250",
          "name": "Ho-Oh",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/250.png"
        },
        {
          "id": "382",
          "name": "Kyogre",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/382.png"
        },
        {
          "id": "383",
          "name": "Groudon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/383.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 1000,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "3",
          "count": 1,
          "name": "Masterball",
          "icon": null
        },
        {
          "kind": "item",
          "id": "4",
          "count": 50,
          "name": "Knowledge Shard",
          "icon": "knowledge-shard.png"
        },
        {
          "kind": "item",
          "id": "5",
          "count": 50,
          "name": "Emotion Shard",
          "icon": "emotion-shard.png"
        },
        {
          "kind": "item",
          "id": "6",
          "count": 50,
          "name": "Willpower Shard",
          "icon": "willpower-shard.png"
        },
        {
          "kind": "item",
          "id": "7",
          "count": 1,
          "name": "Mint",
          "icon": "mint.png"
        }
      ]
    },
    {
      "stage": 6,
      "npcId": "bugCatcher",
      "name": "Bug Catcher",
      "sprite": "https://archives.bulbagarden.net/media/upload/0/0b/Spr_DP_Bug_Catcher.png",
      "emoji": "<:bugcatcher:1117871382399815812>",
      "catchphrase": "I caught a bunch of bugs! Let's battle with them!",
      "difficultyId": "hard",
      "difficultyName": "Hard",
      "captionMin": 82,
      "captionMax": 92,
      "fightMin": 42,
      "fightMax": 52,
      "count": 6,
      "ace": {
        "id": "15",
        "name": "Beedrill",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png"
      },
      "pool": [
        {
          "id": "12",
          "name": "Butterfree",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png"
        },
        {
          "id": "15",
          "name": "Beedrill",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png"
        },
        {
          "id": "123",
          "name": "Scyther",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/123.png"
        },
        {
          "id": "127",
          "name": "Pinsir",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/127.png"
        },
        {
          "id": "166",
          "name": "Ledian",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/166.png"
        },
        {
          "id": "168",
          "name": "Ariados",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/168.png"
        },
        {
          "id": "212",
          "name": "Scizor",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/212.png"
        },
        {
          "id": "267",
          "name": "Beautifly",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/267.png"
        },
        {
          "id": "269",
          "name": "Dustox",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/269.png"
        },
        {
          "id": "292",
          "name": "Shedinja",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/292.png"
        },
        {
          "id": "402",
          "name": "Kricketune",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/402.png"
        },
        {
          "id": "413",
          "name": "Wormadam-Plant",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/413.png"
        },
        {
          "id": "10004",
          "name": "Wormadam-Sandy",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10004.png"
        },
        {
          "id": "10005",
          "name": "Wormadam-Trash",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10005.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 500,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "0",
          "count": 10,
          "name": "Pokeball",
          "icon": "poke-ball.png"
        }
      ]
    },
    {
      "stage": 7,
      "npcId": "youngster",
      "name": "Youngster",
      "sprite": "https://archives.bulbagarden.net/media/upload/c/cd/Spr_B2W2_Youngster.png",
      "emoji": "<:youngster:1117871511844421662>",
      "catchphrase": "I like shorts! They're comfy and easy to wear!",
      "difficultyId": "hard",
      "difficultyName": "Hard",
      "captionMin": 90,
      "captionMax": 100,
      "fightMin": 46,
      "fightMax": 58,
      "count": 6,
      "ace": {
        "id": "306",
        "name": "Aggron",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/306.png"
      },
      "pool": [
        {
          "id": "6",
          "name": "Charizard",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"
        },
        {
          "id": "18",
          "name": "Pidgeot",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png"
        },
        {
          "id": "20",
          "name": "Raticate",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/20.png"
        },
        {
          "id": "76",
          "name": "Golem",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png"
        },
        {
          "id": "103",
          "name": "Exeggutor",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/103.png"
        },
        {
          "id": "135",
          "name": "Jolteon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/135.png"
        },
        {
          "id": "197",
          "name": "Umbreon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/197.png"
        },
        {
          "id": "306",
          "name": "Aggron",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/306.png"
        },
        {
          "id": "400",
          "name": "Bibarel",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/400.png"
        },
        {
          "id": "398",
          "name": "Staraptor",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/398.png"
        },
        {
          "id": "405",
          "name": "Luxray",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/405.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 500,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "4",
          "count": 25,
          "name": "Knowledge Shard",
          "icon": "knowledge-shard.png"
        }
      ]
    },
    {
      "stage": 8,
      "npcId": "hiker",
      "name": "Hiker",
      "sprite": "https://archives.bulbagarden.net/media/upload/b/bc/Spr_BW_Hiker.png",
      "emoji": "<:hiker:1117871386535407827>",
      "catchphrase": "I'm a Hiker, and I'm more than a match for you!",
      "difficultyId": "hard",
      "difficultyName": "Hard",
      "captionMin": 98,
      "captionMax": 108,
      "fightMin": 50,
      "fightMax": 60,
      "count": 6,
      "ace": {
        "id": "248",
        "name": "Tyranitar",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/248.png"
      },
      "pool": [
        {
          "id": "51",
          "name": "Dugtrio",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/51.png"
        },
        {
          "id": "68",
          "name": "Machamp",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png"
        },
        {
          "id": "76",
          "name": "Golem",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png"
        },
        {
          "id": "112",
          "name": "Rhydon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/112.png"
        },
        {
          "id": "142",
          "name": "Aerodactyl",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/142.png"
        },
        {
          "id": "208",
          "name": "Steelix",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/208.png"
        },
        {
          "id": "344",
          "name": "Claydol",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/344.png"
        },
        {
          "id": "409",
          "name": "Rampardos",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/409.png"
        },
        {
          "id": "411",
          "name": "Bastiodon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/411.png"
        },
        {
          "id": "462",
          "name": "Magnezone",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/462.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 500,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "5",
          "count": 25,
          "name": "Emotion Shard",
          "icon": "emotion-shard.png"
        }
      ]
    },
    {
      "stage": 9,
      "npcId": "aromaLady",
      "name": "Aroma Lady",
      "sprite": "https://archives.bulbagarden.net/media/upload/6/6f/Spr_DP_Aroma_Lady.png",
      "emoji": "<:aromalady:1125493188942102538>",
      "catchphrase": "I'm a bit of a handful!",
      "difficultyId": "hard",
      "difficultyName": "Hard",
      "captionMin": 106,
      "captionMax": 116,
      "fightMin": 53,
      "fightMax": 63,
      "count": 6,
      "ace": {
        "id": "182",
        "name": "Bellossom",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/182.png"
      },
      "pool": [
        {
          "id": "3",
          "name": "Venusaur",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"
        },
        {
          "id": "45",
          "name": "Vileplume",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/45.png"
        },
        {
          "id": "154",
          "name": "Meganium",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/154.png"
        },
        {
          "id": "189",
          "name": "Jumpluff",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/189.png"
        },
        {
          "id": "192",
          "name": "Sunflora",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/192.png"
        },
        {
          "id": "286",
          "name": "Breloom",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/286.png"
        },
        {
          "id": "407",
          "name": "Roserade",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/407.png"
        },
        {
          "id": "416",
          "name": "Vespiquen",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/416.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 500,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "6",
          "count": 25,
          "name": "Willpower Shard",
          "icon": "willpower-shard.png"
        }
      ]
    },
    {
      "stage": 10,
      "npcId": "palmer",
      "name": "Tower Tycoon Palmer",
      "sprite": "https://archives.bulbagarden.net/media/upload/f/f4/Spr_DP_Palmer.png",
      "emoji": "<:palmer:1119396349604020294>",
      "catchphrase": "Show me the skill you've acquired as a Trainer!",
      "difficultyId": "veryHard",
      "difficultyName": "Very Hard",
      "captionMin": 114,
      "captionMax": 124,
      "fightMin": 100,
      "fightMax": 120,
      "count": 6,
      "ace": {
        "id": "20384",
        "name": "Palmer's Rayquaza",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png"
      },
      "pool": [
        {
          "id": "144",
          "name": "Articuno",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png"
        },
        {
          "id": "145",
          "name": "Zapdos",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png"
        },
        {
          "id": "146",
          "name": "Moltres",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/146.png"
        },
        {
          "id": "150",
          "name": "Mewtwo",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png"
        },
        {
          "id": "249",
          "name": "Lugia",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png"
        },
        {
          "id": "250",
          "name": "Ho-Oh",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/250.png"
        },
        {
          "id": "382",
          "name": "Kyogre",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/382.png"
        },
        {
          "id": "383",
          "name": "Groudon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/383.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 2500,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "3",
          "count": 1,
          "name": "Masterball",
          "icon": null
        },
        {
          "kind": "item",
          "id": "4",
          "count": 75,
          "name": "Knowledge Shard",
          "icon": "knowledge-shard.png"
        },
        {
          "kind": "item",
          "id": "5",
          "count": 75,
          "name": "Emotion Shard",
          "icon": "emotion-shard.png"
        },
        {
          "kind": "item",
          "id": "6",
          "count": 75,
          "name": "Willpower Shard",
          "icon": "willpower-shard.png"
        },
        {
          "kind": "item",
          "id": "7",
          "count": 2,
          "name": "Mint",
          "icon": "mint.png"
        }
      ]
    },
    {
      "stage": 11,
      "npcId": "hiker",
      "name": "Hiker",
      "sprite": "https://archives.bulbagarden.net/media/upload/b/bc/Spr_BW_Hiker.png",
      "emoji": "<:hiker:1117871386535407827>",
      "catchphrase": "I'm a Hiker, and I'm more than a match for you!",
      "difficultyId": "hard",
      "difficultyName": "Hard",
      "captionMin": 122,
      "captionMax": 132,
      "fightMin": 50,
      "fightMax": 60,
      "count": 6,
      "ace": {
        "id": "248",
        "name": "Tyranitar",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/248.png"
      },
      "pool": [
        {
          "id": "51",
          "name": "Dugtrio",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/51.png"
        },
        {
          "id": "68",
          "name": "Machamp",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png"
        },
        {
          "id": "76",
          "name": "Golem",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/76.png"
        },
        {
          "id": "112",
          "name": "Rhydon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/112.png"
        },
        {
          "id": "142",
          "name": "Aerodactyl",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/142.png"
        },
        {
          "id": "208",
          "name": "Steelix",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/208.png"
        },
        {
          "id": "344",
          "name": "Claydol",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/344.png"
        },
        {
          "id": "409",
          "name": "Rampardos",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/409.png"
        },
        {
          "id": "411",
          "name": "Bastiodon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/411.png"
        },
        {
          "id": "462",
          "name": "Magnezone",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/462.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 750,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "0",
          "count": 10,
          "name": "Pokeball",
          "icon": "poke-ball.png"
        }
      ]
    },
    {
      "stage": 12,
      "npcId": "aromaLady",
      "name": "Aroma Lady",
      "sprite": "https://archives.bulbagarden.net/media/upload/6/6f/Spr_DP_Aroma_Lady.png",
      "emoji": "<:aromalady:1125493188942102538>",
      "catchphrase": "I'm a bit of a handful!",
      "difficultyId": "hard",
      "difficultyName": "Hard",
      "captionMin": 130,
      "captionMax": 140,
      "fightMin": 53,
      "fightMax": 63,
      "count": 6,
      "ace": {
        "id": "182",
        "name": "Bellossom",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/182.png"
      },
      "pool": [
        {
          "id": "3",
          "name": "Venusaur",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"
        },
        {
          "id": "45",
          "name": "Vileplume",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/45.png"
        },
        {
          "id": "154",
          "name": "Meganium",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/154.png"
        },
        {
          "id": "189",
          "name": "Jumpluff",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/189.png"
        },
        {
          "id": "192",
          "name": "Sunflora",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/192.png"
        },
        {
          "id": "286",
          "name": "Breloom",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/286.png"
        },
        {
          "id": "407",
          "name": "Roserade",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/407.png"
        },
        {
          "id": "416",
          "name": "Vespiquen",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/416.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 750,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "4",
          "count": 30,
          "name": "Knowledge Shard",
          "icon": "knowledge-shard.png"
        }
      ]
    },
    {
      "stage": 13,
      "npcId": "blackBelt",
      "name": "Black Belt",
      "sprite": "https://archives.bulbagarden.net/media/upload/e/eb/Spr_DP_Black_Belt.png",
      "emoji": "<:blackbelt:1135329725133365350>",
      "catchphrase": "I'm a Black Belt! I'm the strongest of all Fighting-type trainers!",
      "difficultyId": "hard",
      "difficultyName": "Hard",
      "captionMin": 138,
      "captionMax": 148,
      "fightMin": 53,
      "fightMax": 63,
      "count": 6,
      "ace": {
        "id": "68",
        "name": "Machamp",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png"
      },
      "pool": [
        {
          "id": "62",
          "name": "Poliwrath",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/62.png"
        },
        {
          "id": "68",
          "name": "Machamp",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/68.png"
        },
        {
          "id": "106",
          "name": "Hitmonlee",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/106.png"
        },
        {
          "id": "107",
          "name": "Hitmonchan",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/107.png"
        },
        {
          "id": "214",
          "name": "Heracross",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/214.png"
        },
        {
          "id": "237",
          "name": "Hitmontop",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/237.png"
        },
        {
          "id": "257",
          "name": "Blaziken",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/257.png"
        },
        {
          "id": "286",
          "name": "Breloom",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/286.png"
        },
        {
          "id": "297",
          "name": "Hariyama",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/297.png"
        },
        {
          "id": "454",
          "name": "Toxicroak",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/454.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 750,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "5",
          "count": 30,
          "name": "Emotion Shard",
          "icon": "emotion-shard.png"
        }
      ]
    },
    {
      "stage": 14,
      "npcId": "dragonTamer",
      "name": "Dragon Tamer",
      "sprite": "https://archives.bulbagarden.net/media/upload/7/70/Spr_DP_Dragon_Tamer.png",
      "emoji": "<:dragontamer:1117871383599382650>",
      "catchphrase": "Dragons are totally my thing!",
      "difficultyId": "veryHard",
      "difficultyName": "Very Hard",
      "captionMin": 146,
      "captionMax": 156,
      "fightMin": 70,
      "fightMax": 79,
      "count": 6,
      "ace": {
        "id": "149",
        "name": "Dragonite",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png"
      },
      "pool": [
        {
          "id": "6",
          "name": "Charizard",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"
        },
        {
          "id": "130",
          "name": "Gyarados",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png"
        },
        {
          "id": "149",
          "name": "Dragonite",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png"
        },
        {
          "id": "330",
          "name": "Flygon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/330.png"
        },
        {
          "id": "334",
          "name": "Altaria",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/334.png"
        },
        {
          "id": "373",
          "name": "Salamence",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/373.png"
        },
        {
          "id": "445",
          "name": "Garchomp",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/445.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 750,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "6",
          "count": 30,
          "name": "Willpower Shard",
          "icon": "willpower-shard.png"
        }
      ]
    },
    {
      "stage": 15,
      "npcId": "palmer",
      "name": "Tower Tycoon Palmer",
      "sprite": "https://archives.bulbagarden.net/media/upload/f/f4/Spr_DP_Palmer.png",
      "emoji": "<:palmer:1119396349604020294>",
      "catchphrase": "Show me the skill you've acquired as a Trainer!",
      "difficultyId": "veryHard",
      "difficultyName": "Very Hard",
      "captionMin": 154,
      "captionMax": 164,
      "fightMin": 100,
      "fightMax": 120,
      "count": 6,
      "ace": {
        "id": "20384",
        "name": "Palmer's Rayquaza",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png"
      },
      "pool": [
        {
          "id": "144",
          "name": "Articuno",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png"
        },
        {
          "id": "145",
          "name": "Zapdos",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png"
        },
        {
          "id": "146",
          "name": "Moltres",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/146.png"
        },
        {
          "id": "150",
          "name": "Mewtwo",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png"
        },
        {
          "id": "249",
          "name": "Lugia",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png"
        },
        {
          "id": "250",
          "name": "Ho-Oh",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/250.png"
        },
        {
          "id": "382",
          "name": "Kyogre",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/382.png"
        },
        {
          "id": "383",
          "name": "Groudon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/383.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 5000,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "3",
          "count": 2,
          "name": "Masterball",
          "icon": null
        },
        {
          "kind": "item",
          "id": "4",
          "count": 100,
          "name": "Knowledge Shard",
          "icon": "knowledge-shard.png"
        },
        {
          "kind": "item",
          "id": "5",
          "count": 100,
          "name": "Emotion Shard",
          "icon": "emotion-shard.png"
        },
        {
          "kind": "item",
          "id": "6",
          "count": 100,
          "name": "Willpower Shard",
          "icon": "willpower-shard.png"
        },
        {
          "kind": "item",
          "id": "7",
          "count": 3,
          "name": "Mint",
          "icon": "mint.png"
        }
      ]
    },
    {
      "stage": 16,
      "npcId": "blue",
      "name": "Blue",
      "sprite": "https://archives.bulbagarden.net/media/upload/f/f4/Spr_B2W2_Blue.png",
      "emoji": "<:blue:1117871380172648600>",
      "catchphrase": "Smell ya later!",
      "difficultyId": "hard",
      "difficultyName": "Hard",
      "captionMin": 162,
      "captionMax": 172,
      "fightMin": 59,
      "fightMax": 65,
      "count": 6,
      "ace": {
        "id": "9-1",
        "name": "Gary's Blastoise",
        "sprite": "https://archives.bulbagarden.net/media/upload/2/2c/Spr_1b_009.png"
      },
      "pool": [
        {
          "id": "18",
          "name": "Pidgeot",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/18.png"
        },
        {
          "id": "59",
          "name": "Arcanine",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/59.png"
        },
        {
          "id": "65",
          "name": "Alakazam",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png"
        },
        {
          "id": "103",
          "name": "Exeggutor",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/103.png"
        },
        {
          "id": "112",
          "name": "Rhydon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/112.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 1000,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "0",
          "count": 15,
          "name": "Pokeball",
          "icon": "poke-ball.png"
        }
      ]
    },
    {
      "stage": 17,
      "npcId": "red",
      "name": "Red",
      "sprite": "https://www.serebii.net/heartgoldsoulsilver/gym/red.png",
      "emoji": "<:red:1117871509185249280>",
      "catchphrase": "...!",
      "difficultyId": "veryHard",
      "difficultyName": "Very Hard",
      "captionMin": 170,
      "captionMax": 180,
      "fightMin": 80,
      "fightMax": 88,
      "count": 6,
      "ace": {
        "id": "25-1",
        "name": "Ash's Pikachu",
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/ash-pikachu-small.gif"
      },
      "pool": [
        {
          "id": "3",
          "name": "Venusaur",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"
        },
        {
          "id": "6",
          "name": "Charizard",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"
        },
        {
          "id": "9",
          "name": "Blastoise",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/9.png"
        },
        {
          "id": "131",
          "name": "Lapras",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/131.png"
        },
        {
          "id": "143",
          "name": "Snorlax",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 1000,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "4",
          "count": 40,
          "name": "Knowledge Shard",
          "icon": "knowledge-shard.png"
        }
      ]
    },
    {
      "stage": 18,
      "npcId": "gold",
      "name": "Gold",
      "sprite": "https://archives.bulbagarden.net/media/upload/a/a5/Spr_HGSS_Ethan.png",
      "emoji": "<:gold:1125493190900854784>",
      "catchphrase": "Nobody reads these, right?",
      "difficultyId": "veryHard",
      "difficultyName": "Very Hard",
      "captionMin": 178,
      "captionMax": 188,
      "fightMin": 85,
      "fightMax": 100,
      "count": 6,
      "ace": {
        "id": "249-1",
        "name": "Shadow Lugia",
        "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/shadow-lugia.png"
      },
      "pool": [
        {
          "id": "157-1",
          "name": "Gold's Typhlosion",
          "sprite": "https://archives.bulbagarden.net/media/upload/b/b9/Spr_2g_157.png"
        },
        {
          "id": "181",
          "name": "Ampharos",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/181.png"
        },
        {
          "id": "184",
          "name": "Azumarill",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/184.png"
        },
        {
          "id": "232",
          "name": "Donphan",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/232.png"
        },
        {
          "id": "248-1",
          "name": "Dark Tyranitar",
          "sprite": "https://archives.bulbagarden.net/media/upload/b/bb/Spr_2g_248.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 1000,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "5",
          "count": 40,
          "name": "Emotion Shard",
          "icon": "emotion-shard.png"
        }
      ]
    },
    {
      "stage": 19,
      "npcId": "steven",
      "name": "Champion Steven",
      "sprite": "https://archives.bulbagarden.net/media/upload/a/ad/Spr_RS_Steven.png",
      "emoji": "<:steven:1135329417015595050>",
      "catchphrase": "I'm the Champion! Do you know what that means?",
      "difficultyId": "veryHard",
      "difficultyName": "Very Hard",
      "captionMin": 186,
      "captionMax": 196,
      "fightMin": 92,
      "fightMax": 100,
      "count": 6,
      "ace": {
        "id": "376",
        "name": "Metagross",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/376.png"
      },
      "pool": [
        {
          "id": "227",
          "name": "Skarmory",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/227.png"
        },
        {
          "id": "306",
          "name": "Aggron",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/306.png"
        },
        {
          "id": "344",
          "name": "Claydol",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/344.png"
        },
        {
          "id": "346",
          "name": "Cradily",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/346.png"
        },
        {
          "id": "348",
          "name": "Armaldo",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/348.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 1000,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "6",
          "count": 40,
          "name": "Willpower Shard",
          "icon": "willpower-shard.png"
        }
      ]
    },
    {
      "stage": 20,
      "npcId": "palmer",
      "name": "Tower Tycoon Palmer",
      "sprite": "https://archives.bulbagarden.net/media/upload/f/f4/Spr_DP_Palmer.png",
      "emoji": "<:palmer:1119396349604020294>",
      "catchphrase": "Show me the skill you've acquired as a Trainer!",
      "difficultyId": "veryHard",
      "difficultyName": "Very Hard",
      "captionMin": 194,
      "captionMax": 204,
      "fightMin": 100,
      "fightMax": 120,
      "count": 6,
      "ace": {
        "id": "20384",
        "name": "Palmer's Rayquaza",
        "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png"
      },
      "pool": [
        {
          "id": "144",
          "name": "Articuno",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/144.png"
        },
        {
          "id": "145",
          "name": "Zapdos",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/145.png"
        },
        {
          "id": "146",
          "name": "Moltres",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/146.png"
        },
        {
          "id": "150",
          "name": "Mewtwo",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png"
        },
        {
          "id": "249",
          "name": "Lugia",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png"
        },
        {
          "id": "250",
          "name": "Ho-Oh",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/250.png"
        },
        {
          "id": "382",
          "name": "Kyogre",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/382.png"
        },
        {
          "id": "383",
          "name": "Groudon",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/383.png"
        }
      ],
      "rewards": [
        {
          "kind": "money",
          "count": 10000,
          "name": "Money"
        },
        {
          "kind": "item",
          "id": "3",
          "count": 4,
          "name": "Masterball",
          "icon": null
        },
        {
          "kind": "item",
          "id": "4",
          "count": 200,
          "name": "Knowledge Shard",
          "icon": "knowledge-shard.png"
        },
        {
          "kind": "item",
          "id": "5",
          "count": 200,
          "name": "Emotion Shard",
          "icon": "emotion-shard.png"
        },
        {
          "kind": "item",
          "id": "6",
          "count": 200,
          "name": "Willpower Shard",
          "icon": "willpower-shard.png"
        },
        {
          "kind": "item",
          "id": "7",
          "count": 4,
          "name": "Mint",
          "icon": "mint.png"
        }
      ]
    }
  ]
};
