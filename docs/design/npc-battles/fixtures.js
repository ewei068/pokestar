// Shared NPC catalog; player progress and party are illustrative. Regenerate after catalog edits.
const npcFixtures = [
  {
    "id": "volo",
    "name": "Volo",
    "displayName": "[Event] Pokemon Wielder Volo",
    "sprite": "https://static.wikia.nocookie.net/intelligence-scaling-purgatory/images/f/fa/VoloSickoModeNew.webp/revision/latest/scale-to-width/360?cb=20241028171248",
    "catchphrase": "Why? Why you?! Why do you have the blessing of Arceus?!",
    "difficulties": [
      {
        "id": "hard",
        "name": "Hard",
        "minLevel": 67,
        "maxLevel": 74,
        "count": 6,
        "ace": {
          "id": "445-1",
          "name": "Cynthia's Garchomp",
          "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/refs/heads/main/media/images/sprites/cynthia-garchomp-resized.gif"
        },
        "pool": [
          {
            "id": "442",
            "name": "Spiritomb",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/442.png"
          },
          {
            "id": "407",
            "name": "Roserade",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/407.png"
          },
          {
            "id": "468",
            "name": "Togekiss",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/468.png"
          },
          {
            "id": "59",
            "name": "Arcanine",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/59.png"
          },
          {
            "id": "448",
            "name": "Lucario",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png"
          },
          {
            "id": "445-1",
            "name": "Cynthia's Garchomp",
            "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/refs/heads/main/media/images/sprites/cynthia-garchomp-resized.gif"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 2,
          "expMultiplier": 2,
          "pokemonExpMultiplier": 0.21
        },
        "dailyRewards": {
          "backpack": {
            "0": {
              "0": 2
            }
          }
        },
        "dailyRewardLabels": [
          "2 Pokeballs"
        ],
        "rewardItems": [
          {
            "id": "0",
            "count": 2,
            "name": "Pokeball",
            "icon": "poke-ball.png"
          }
        ]
      },
      {
        "id": "veryHard",
        "name": "Very Hard",
        "minLevel": 120,
        "maxLevel": 139,
        "count": 6,
        "ace": {
          "id": "487-1",
          "name": "Volo's Giratina",
          "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/refs/heads/main/media/images/sprites/volo-giratina-resized.gif"
        },
        "pool": [
          {
            "id": "442",
            "name": "Spiritomb",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/442.png"
          },
          {
            "id": "407",
            "name": "Roserade",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/407.png"
          },
          {
            "id": "468",
            "name": "Togekiss",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/468.png"
          },
          {
            "id": "59",
            "name": "Arcanine",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/59.png"
          },
          {
            "id": "448",
            "name": "Lucario",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png"
          },
          {
            "id": "445-1",
            "name": "Cynthia's Garchomp",
            "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/refs/heads/main/media/images/sprites/cynthia-garchomp-resized.gif"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 3.5,
          "expMultiplier": 3.5,
          "pokemonExpMultiplier": 0.25
        },
        "dailyRewards": {
          "backpack": {
            "0": {
              "0": 3
            }
          }
        },
        "dailyRewardLabels": [
          "3 Pokeballs"
        ],
        "rewardItems": [
          {
            "id": "0",
            "count": 3,
            "name": "Pokeball",
            "icon": "poke-ball.png"
          }
        ]
      }
    ]
  },
  {
    "id": "bugCatcher",
    "name": "Bug Catcher",
    "displayName": "Bug Catcher",
    "sprite": "https://archives.bulbagarden.net/media/upload/0/0b/Spr_DP_Bug_Catcher.png",
    "catchphrase": "I caught a bunch of bugs! Let's battle with them!",
    "difficulties": [
      {
        "id": "veryEasy",
        "name": "Very Easy",
        "minLevel": 3,
        "maxLevel": 4,
        "count": 4,
        "ace": {
          "id": "14",
          "name": "Kakuna",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png"
        },
        "pool": [
          {
            "id": "10",
            "name": "Caterpie",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png"
          },
          {
            "id": "13",
            "name": "Weedle",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/13.png"
          },
          {
            "id": "165",
            "name": "Ledyba",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/165.png"
          },
          {
            "id": "167",
            "name": "Spinarak",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/167.png"
          },
          {
            "id": "265",
            "name": "Wurmple",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/265.png"
          },
          {
            "id": "401",
            "name": "Kricketot",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/401.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 0.5,
          "expMultiplier": 0.5,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "easy",
        "name": "Easy",
        "minLevel": 12,
        "maxLevel": 16,
        "count": 5,
        "ace": {
          "id": "14",
          "name": "Kakuna",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png"
        },
        "pool": [
          {
            "id": "10",
            "name": "Caterpie",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png"
          },
          {
            "id": "11",
            "name": "Metapod",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/11.png"
          },
          {
            "id": "13",
            "name": "Weedle",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/13.png"
          },
          {
            "id": "14",
            "name": "Kakuna",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png"
          },
          {
            "id": "165",
            "name": "Ledyba",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/165.png"
          },
          {
            "id": "167",
            "name": "Spinarak",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/167.png"
          },
          {
            "id": "265",
            "name": "Wurmple",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/265.png"
          },
          {
            "id": "266",
            "name": "Silcoon",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/266.png"
          },
          {
            "id": "268",
            "name": "Cascoon",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/268.png"
          },
          {
            "id": "401",
            "name": "Kricketot",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/401.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1,
          "expMultiplier": 1,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "medium",
        "name": "Medium",
        "minLevel": 24,
        "maxLevel": 29,
        "count": 5,
        "ace": {
          "id": "15",
          "name": "Beedrill",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/15.png"
        },
        "pool": [
          {
            "id": "11",
            "name": "Metapod",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/11.png"
          },
          {
            "id": "12",
            "name": "Butterfree",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png"
          },
          {
            "id": "14",
            "name": "Kakuna",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/14.png"
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
            "id": "402",
            "name": "Kricketune",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/402.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1.5,
          "expMultiplier": 1.5,
          "pokemonExpMultiplier": 0.185
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "hard",
        "name": "Hard",
        "minLevel": 42,
        "maxLevel": 51,
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
        "multipliers": {
          "moneyMultiplier": 2,
          "expMultiplier": 2,
          "pokemonExpMultiplier": 0.21
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      }
    ]
  },
  {
    "id": "youngster",
    "name": "Youngster",
    "displayName": "Youngster",
    "sprite": "https://archives.bulbagarden.net/media/upload/c/cd/Spr_B2W2_Youngster.png",
    "catchphrase": "I like shorts! They're comfy and easy to wear!",
    "difficulties": [
      {
        "id": "veryEasy",
        "name": "Very Easy",
        "minLevel": 3,
        "maxLevel": 5,
        "count": 4,
        "ace": {
          "id": "16",
          "name": "Pidgey",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png"
        },
        "pool": [
          {
            "id": "16",
            "name": "Pidgey",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png"
          },
          {
            "id": "19",
            "name": "Rattata",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png"
          },
          {
            "id": "74",
            "name": "Geodude",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png"
          },
          {
            "id": "102",
            "name": "Exeggcute",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/102.png"
          },
          {
            "id": "163",
            "name": "Hoothoot",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/163.png"
          },
          {
            "id": "399",
            "name": "Bidoof",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/399.png"
          },
          {
            "id": "396",
            "name": "Starly",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/396.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 0.5,
          "expMultiplier": 0.5,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "easy",
        "name": "Easy",
        "minLevel": 15,
        "maxLevel": 18,
        "count": 5,
        "ace": {
          "id": "16",
          "name": "Pidgey",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png"
        },
        "pool": [
          {
            "id": "4",
            "name": "Charmander",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
          },
          {
            "id": "16",
            "name": "Pidgey",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/16.png"
          },
          {
            "id": "19",
            "name": "Rattata",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/19.png"
          },
          {
            "id": "74",
            "name": "Geodude",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png"
          },
          {
            "id": "102",
            "name": "Exeggcute",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/102.png"
          },
          {
            "id": "133",
            "name": "Eevee",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png"
          },
          {
            "id": "164",
            "name": "Noctowl",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/164.png"
          },
          {
            "id": "304",
            "name": "Aron",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/304.png"
          },
          {
            "id": "399",
            "name": "Bidoof",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/399.png"
          },
          {
            "id": "396",
            "name": "Starly",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/396.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1,
          "expMultiplier": 1,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "medium",
        "name": "Medium",
        "minLevel": 27,
        "maxLevel": 33,
        "count": 5,
        "ace": {
          "id": "17",
          "name": "Pidgeotto",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png"
        },
        "pool": [
          {
            "id": "5",
            "name": "Charmeleon",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png"
          },
          {
            "id": "17",
            "name": "Pidgeotto",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png"
          },
          {
            "id": "20",
            "name": "Raticate",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/20.png"
          },
          {
            "id": "75",
            "name": "Graveler",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/75.png"
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
            "id": "305",
            "name": "Lairon",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/305.png"
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
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1.5,
          "expMultiplier": 1.5,
          "pokemonExpMultiplier": 0.185
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "hard",
        "name": "Hard",
        "minLevel": 46,
        "maxLevel": 57,
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
        "multipliers": {
          "moneyMultiplier": 2,
          "expMultiplier": 2,
          "pokemonExpMultiplier": 0.21
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      }
    ]
  },
  {
    "id": "lass",
    "name": "Lass",
    "displayName": "Lass",
    "sprite": "https://archives.bulbagarden.net/media/upload/f/f9/Spr_B2W2_Lass.png",
    "catchphrase": "I'm cute, but deadly!",
    "difficulties": [
      {
        "id": "veryEasy",
        "name": "Very Easy",
        "minLevel": 4,
        "maxLevel": 7,
        "count": 4,
        "ace": {
          "id": "39",
          "name": "Jigglypuff",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png"
        },
        "pool": [
          {
            "id": "1",
            "name": "Bulbasaur",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
          },
          {
            "id": "10",
            "name": "Caterpie",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/10.png"
          },
          {
            "id": "35",
            "name": "Clefairy",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png"
          },
          {
            "id": "39",
            "name": "Jigglypuff",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png"
          },
          {
            "id": "270",
            "name": "Lotad",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/270.png"
          },
          {
            "id": "406",
            "name": "Budew",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/406.png"
          },
          {
            "id": "427",
            "name": "Buneary",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/427.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 0.5,
          "expMultiplier": 0.5,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "easy",
        "name": "Easy",
        "minLevel": 16,
        "maxLevel": 20,
        "count": 5,
        "ace": {
          "id": "39",
          "name": "Jigglypuff",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png"
        },
        "pool": [
          {
            "id": "1",
            "name": "Bulbasaur",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
          },
          {
            "id": "11",
            "name": "Metapod",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/11.png"
          },
          {
            "id": "35",
            "name": "Clefairy",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/35.png"
          },
          {
            "id": "39",
            "name": "Jigglypuff",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/39.png"
          },
          {
            "id": "133",
            "name": "Eevee",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png"
          },
          {
            "id": "270",
            "name": "Lotad",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/270.png"
          },
          {
            "id": "406",
            "name": "Budew",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/406.png"
          },
          {
            "id": "427",
            "name": "Buneary",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/427.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1,
          "expMultiplier": 1,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "medium",
        "name": "Medium",
        "minLevel": 29,
        "maxLevel": 36,
        "count": 5,
        "ace": {
          "id": "40",
          "name": "Wigglytuff",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/40.png"
        },
        "pool": [
          {
            "id": "2",
            "name": "Ivysaur",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"
          },
          {
            "id": "12",
            "name": "Butterfree",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/12.png"
          },
          {
            "id": "25",
            "name": "Pikachu",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
          },
          {
            "id": "36",
            "name": "Clefable",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/36.png"
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
            "id": "196",
            "name": "Espeon",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/196.png"
          },
          {
            "id": "271",
            "name": "Lombre",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/271.png"
          },
          {
            "id": "315",
            "name": "Roselia",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/315.png"
          },
          {
            "id": "428",
            "name": "Lopunny",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/428.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1.5,
          "expMultiplier": 1.5,
          "pokemonExpMultiplier": 0.185
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "hard",
        "name": "Hard",
        "minLevel": 49,
        "maxLevel": 59,
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
        "multipliers": {
          "moneyMultiplier": 2,
          "expMultiplier": 2,
          "pokemonExpMultiplier": 0.21
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      }
    ]
  },
  {
    "id": "fisherman",
    "name": "Fisherman",
    "displayName": "Fisherman",
    "sprite": "https://archives.bulbagarden.net/media/upload/c/c2/Spr_DP_Fisherman.png",
    "catchphrase": "I'm a natural born fisherman!",
    "difficulties": [
      {
        "id": "veryEasy",
        "name": "Very Easy",
        "minLevel": 7,
        "maxLevel": 10,
        "count": 4,
        "ace": {
          "id": "7",
          "name": "Squirtle",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"
        },
        "pool": [
          {
            "id": "120",
            "name": "Staryu",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/120.png"
          },
          {
            "id": "129",
            "name": "Magikarp",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png"
          },
          {
            "id": "183",
            "name": "Marill",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/183.png"
          },
          {
            "id": "320",
            "name": "Wailmer",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/320.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 0.5,
          "expMultiplier": 0.5,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "easy",
        "name": "Easy",
        "minLevel": 21,
        "maxLevel": 26,
        "count": 5,
        "ace": {
          "id": "7",
          "name": "Squirtle",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"
        },
        "pool": [
          {
            "id": "7",
            "name": "Squirtle",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"
          },
          {
            "id": "120",
            "name": "Staryu",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/120.png"
          },
          {
            "id": "129",
            "name": "Magikarp",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/129.png"
          },
          {
            "id": "183",
            "name": "Marill",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/183.png"
          },
          {
            "id": "278",
            "name": "Wingull",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/278.png"
          },
          {
            "id": "320",
            "name": "Wailmer",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/320.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1,
          "expMultiplier": 1,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "medium",
        "name": "Medium",
        "minLevel": 34,
        "maxLevel": 41,
        "count": 5,
        "ace": {
          "id": "130",
          "name": "Gyarados",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png"
        },
        "pool": [
          {
            "id": "8",
            "name": "Wartortle",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png"
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
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1.5,
          "expMultiplier": 1.5,
          "pokemonExpMultiplier": 0.185
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "hard",
        "name": "Hard",
        "minLevel": 54,
        "maxLevel": 62,
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
        "multipliers": {
          "moneyMultiplier": 2,
          "expMultiplier": 2,
          "pokemonExpMultiplier": 0.21
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      }
    ]
  },
  {
    "id": "hiker",
    "name": "Hiker",
    "displayName": "Hiker",
    "sprite": "https://archives.bulbagarden.net/media/upload/b/bc/Spr_BW_Hiker.png",
    "catchphrase": "I'm a Hiker, and I'm more than a match for you!",
    "difficulties": [
      {
        "id": "veryEasy",
        "name": "Very Easy",
        "minLevel": 7,
        "maxLevel": 9,
        "count": 4,
        "ace": {
          "id": "74",
          "name": "Geodude",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png"
        },
        "pool": [
          {
            "id": "50",
            "name": "Diglett",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/50.png"
          },
          {
            "id": "66",
            "name": "Machop",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png"
          },
          {
            "id": "74",
            "name": "Geodude",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png"
          },
          {
            "id": "95",
            "name": "Onix",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png"
          },
          {
            "id": "111",
            "name": "Rhyhorn",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/111.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 0.5,
          "expMultiplier": 0.5,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "easy",
        "name": "Easy",
        "minLevel": 17,
        "maxLevel": 21,
        "count": 5,
        "ace": {
          "id": "74",
          "name": "Geodude",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png"
        },
        "pool": [
          {
            "id": "50",
            "name": "Diglett",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/50.png"
          },
          {
            "id": "66",
            "name": "Machop",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png"
          },
          {
            "id": "74",
            "name": "Geodude",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/74.png"
          },
          {
            "id": "95",
            "name": "Onix",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png"
          },
          {
            "id": "111",
            "name": "Rhyhorn",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/111.png"
          },
          {
            "id": "343",
            "name": "Baltoy",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/343.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1,
          "expMultiplier": 1,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "medium",
        "name": "Medium",
        "minLevel": 30,
        "maxLevel": 36,
        "count": 5,
        "ace": {
          "id": "75",
          "name": "Graveler",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/75.png"
        },
        "pool": [
          {
            "id": "51",
            "name": "Dugtrio",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/51.png"
          },
          {
            "id": "67",
            "name": "Machoke",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/67.png"
          },
          {
            "id": "75",
            "name": "Graveler",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/75.png"
          },
          {
            "id": "95",
            "name": "Onix",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/95.png"
          },
          {
            "id": "112",
            "name": "Rhydon",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/112.png"
          },
          {
            "id": "344",
            "name": "Claydol",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/344.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1.5,
          "expMultiplier": 1.5,
          "pokemonExpMultiplier": 0.185
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "hard",
        "name": "Hard",
        "minLevel": 50,
        "maxLevel": 59,
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
        "multipliers": {
          "moneyMultiplier": 2,
          "expMultiplier": 2,
          "pokemonExpMultiplier": 0.21
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      }
    ]
  },
  {
    "id": "aromaLady",
    "name": "Aroma Lady",
    "displayName": "Aroma Lady",
    "sprite": "https://archives.bulbagarden.net/media/upload/6/6f/Spr_DP_Aroma_Lady.png",
    "catchphrase": "I'm a bit of a handful!",
    "difficulties": [
      {
        "id": "veryEasy",
        "name": "Very Easy",
        "minLevel": 8,
        "maxLevel": 10,
        "count": 4,
        "ace": {
          "id": "152",
          "name": "Chikorita",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/152.png"
        },
        "pool": [
          {
            "id": "43",
            "name": "Oddish",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/43.png"
          },
          {
            "id": "187",
            "name": "Hoppip",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/187.png"
          },
          {
            "id": "191",
            "name": "Sunkern",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/191.png"
          },
          {
            "id": "285",
            "name": "Shroomish",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/285.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 0.5,
          "expMultiplier": 0.5,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "easy",
        "name": "Easy",
        "minLevel": 18,
        "maxLevel": 22,
        "count": 5,
        "ace": {
          "id": "44",
          "name": "Gloom",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/44.png"
        },
        "pool": [
          {
            "id": "43",
            "name": "Oddish",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/43.png"
          },
          {
            "id": "152",
            "name": "Chikorita",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/152.png"
          },
          {
            "id": "187",
            "name": "Hoppip",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/187.png"
          },
          {
            "id": "192",
            "name": "Sunflora",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/192.png"
          },
          {
            "id": "285",
            "name": "Shroomish",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/285.png"
          },
          {
            "id": "315",
            "name": "Roselia",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/315.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1,
          "expMultiplier": 1,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "medium",
        "name": "Medium",
        "minLevel": 33,
        "maxLevel": 40,
        "count": 5,
        "ace": {
          "id": "44",
          "name": "Gloom",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/44.png"
        },
        "pool": [
          {
            "id": "44",
            "name": "Gloom",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/44.png"
          },
          {
            "id": "153",
            "name": "Bayleef",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/153.png"
          },
          {
            "id": "188",
            "name": "Skiploom",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/188.png"
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
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1.5,
          "expMultiplier": 1.5,
          "pokemonExpMultiplier": 0.185
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "hard",
        "name": "Hard",
        "minLevel": 53,
        "maxLevel": 62,
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
        "multipliers": {
          "moneyMultiplier": 2,
          "expMultiplier": 2,
          "pokemonExpMultiplier": 0.21
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      }
    ]
  },
  {
    "id": "blackBelt",
    "name": "Black Belt",
    "displayName": "Black Belt",
    "sprite": "https://archives.bulbagarden.net/media/upload/e/eb/Spr_DP_Black_Belt.png",
    "catchphrase": "I'm a Black Belt! I'm the strongest of all Fighting-type trainers!",
    "difficulties": [
      {
        "id": "veryEasy",
        "name": "Very Easy",
        "minLevel": 8,
        "maxLevel": 10,
        "count": 4,
        "ace": {
          "id": "66",
          "name": "Machop",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png"
        },
        "pool": [
          {
            "id": "66",
            "name": "Machop",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png"
          },
          {
            "id": "236",
            "name": "Tyrogue",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/236.png"
          },
          {
            "id": "255",
            "name": "Torchic",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/255.png"
          },
          {
            "id": "296",
            "name": "Makuhita",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/296.png"
          },
          {
            "id": "453",
            "name": "Croagunk",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/453.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 0.5,
          "expMultiplier": 0.5,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "easy",
        "name": "Easy",
        "minLevel": 18,
        "maxLevel": 22,
        "count": 5,
        "ace": {
          "id": "66",
          "name": "Machop",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png"
        },
        "pool": [
          {
            "id": "66",
            "name": "Machop",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/66.png"
          },
          {
            "id": "236",
            "name": "Tyrogue",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/236.png"
          },
          {
            "id": "255",
            "name": "Torchic",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/255.png"
          },
          {
            "id": "296",
            "name": "Makuhita",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/296.png"
          },
          {
            "id": "453",
            "name": "Croagunk",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/453.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1,
          "expMultiplier": 1,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "medium",
        "name": "Medium",
        "minLevel": 33,
        "maxLevel": 40,
        "count": 5,
        "ace": {
          "id": "67",
          "name": "Machoke",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/67.png"
        },
        "pool": [
          {
            "id": "67",
            "name": "Machoke",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/67.png"
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
            "id": "237",
            "name": "Hitmontop",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/237.png"
          },
          {
            "id": "256",
            "name": "Combusken",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/256.png"
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
        "multipliers": {
          "moneyMultiplier": 1.5,
          "expMultiplier": 1.5,
          "pokemonExpMultiplier": 0.185
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "hard",
        "name": "Hard",
        "minLevel": 53,
        "maxLevel": 62,
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
        "multipliers": {
          "moneyMultiplier": 2,
          "expMultiplier": 2,
          "pokemonExpMultiplier": 0.21
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      }
    ]
  },
  {
    "id": "dragonTamer",
    "name": "Dragon Tamer",
    "displayName": "Dragon Tamer",
    "sprite": "https://archives.bulbagarden.net/media/upload/7/70/Spr_DP_Dragon_Tamer.png",
    "catchphrase": "Dragons are totally my thing!",
    "difficulties": [
      {
        "id": "easy",
        "name": "Easy",
        "minLevel": 20,
        "maxLevel": 24,
        "count": 4,
        "ace": {
          "id": "147",
          "name": "Dratini",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/147.png"
        },
        "pool": [
          {
            "id": "5",
            "name": "Charmeleon",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/5.png"
          },
          {
            "id": "147",
            "name": "Dratini",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/147.png"
          },
          {
            "id": "328",
            "name": "Trapinch",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/328.png"
          },
          {
            "id": "333",
            "name": "Swablu",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/333.png"
          },
          {
            "id": "443",
            "name": "Gible",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/443.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1,
          "expMultiplier": 1,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "medium",
        "name": "Medium",
        "minLevel": 32,
        "maxLevel": 38,
        "count": 5,
        "ace": {
          "id": "148",
          "name": "Dragonair",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/148.png"
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
            "id": "148",
            "name": "Dragonair",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/148.png"
          },
          {
            "id": "329",
            "name": "Vibrava",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/329.png"
          },
          {
            "id": "333",
            "name": "Swablu",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/333.png"
          },
          {
            "id": "371",
            "name": "Bagon",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/371.png"
          },
          {
            "id": "443",
            "name": "Gible",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/443.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1.5,
          "expMultiplier": 1.5,
          "pokemonExpMultiplier": 0.185
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "hard",
        "name": "Hard",
        "minLevel": 52,
        "maxLevel": 59,
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
            "id": "372",
            "name": "Shelgon",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/372.png"
          },
          {
            "id": "444",
            "name": "Gabite",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/444.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 2,
          "expMultiplier": 2,
          "pokemonExpMultiplier": 0.21
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "veryHard",
        "name": "Very Hard",
        "minLevel": 70,
        "maxLevel": 78,
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
        "multipliers": {
          "moneyMultiplier": 3.5,
          "expMultiplier": 3.5,
          "pokemonExpMultiplier": 0.25
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      }
    ]
  },
  {
    "id": "aceTrainer",
    "name": "Ace Trainer",
    "displayName": "Ace Trainer",
    "sprite": "https://archives.bulbagarden.net/media/upload/c/c9/Spr_BW_Ace_Trainer_F.png",
    "catchphrase": "I'm an Ace Trainer, got it?",
    "difficulties": [
      {
        "id": "medium",
        "name": "Medium",
        "minLevel": 33,
        "maxLevel": 38,
        "count": 5,
        "ace": {
          "id": "25",
          "name": "Pikachu",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
        },
        "pool": [
          {
            "id": "4",
            "name": "Charmander",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
          },
          {
            "id": "117",
            "name": "Seadra",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/117.png"
          },
          {
            "id": "324",
            "name": "Torkoal",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/324.png"
          },
          {
            "id": "137",
            "name": "Porygon",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/137.png"
          },
          {
            "id": "285",
            "name": "Shroomish",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/285.png"
          },
          {
            "id": "427",
            "name": "Buneary",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/427.png"
          },
          {
            "id": "198",
            "name": "Murkrow",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/198.png"
          },
          {
            "id": "408",
            "name": "Cranidos",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/408.png"
          },
          {
            "id": "418",
            "name": "Buizel",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/418.png"
          },
          {
            "id": "303",
            "name": "Mawile",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/303.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1.5,
          "expMultiplier": 1.5,
          "pokemonExpMultiplier": 0.185
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "hard",
        "name": "Hard",
        "minLevel": 53,
        "maxLevel": 60,
        "count": 6,
        "ace": {
          "id": "149",
          "name": "Dragonite",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png"
        },
        "pool": [
          {
            "id": "3",
            "name": "Venusaur",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"
          },
          {
            "id": "153",
            "name": "Bayleef",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/153.png"
          },
          {
            "id": "395",
            "name": "Empoleon",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/395.png"
          },
          {
            "id": "182",
            "name": "Bellossom",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/182.png"
          },
          {
            "id": "344",
            "name": "Claydol",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/344.png"
          },
          {
            "id": "468",
            "name": "Togekiss",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/468.png"
          },
          {
            "id": "242",
            "name": "Blissey",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/242.png"
          },
          {
            "id": "448",
            "name": "Lucario",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png"
          },
          {
            "id": "463",
            "name": "Lickilicky",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/463.png"
          },
          {
            "id": "365",
            "name": "Walrein",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/365.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 2,
          "expMultiplier": 2,
          "pokemonExpMultiplier": 0.21
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      },
      {
        "id": "veryHard",
        "name": "Very Hard",
        "minLevel": 75,
        "maxLevel": 83,
        "count": 6,
        "ace": {
          "id": "149",
          "name": "Dragonite",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/149.png"
        },
        "pool": [
          {
            "id": "3",
            "name": "Venusaur",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"
          },
          {
            "id": "153",
            "name": "Bayleef",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/153.png"
          },
          {
            "id": "395",
            "name": "Empoleon",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/395.png"
          },
          {
            "id": "182",
            "name": "Bellossom",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/182.png"
          },
          {
            "id": "344",
            "name": "Claydol",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/344.png"
          },
          {
            "id": "468",
            "name": "Togekiss",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/468.png"
          },
          {
            "id": "242",
            "name": "Blissey",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/242.png"
          },
          {
            "id": "448",
            "name": "Lucario",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png"
          },
          {
            "id": "463",
            "name": "Lickilicky",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/463.png"
          },
          {
            "id": "365",
            "name": "Walrein",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/365.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 3.5,
          "expMultiplier": 3.5,
          "pokemonExpMultiplier": 0.25
        },
        "dailyRewards": null,
        "dailyRewardLabels": [],
        "rewardItems": []
      }
    ]
  },
  {
    "id": "blue",
    "name": "Blue",
    "displayName": "Blue",
    "sprite": "https://archives.bulbagarden.net/media/upload/f/f4/Spr_B2W2_Blue.png",
    "catchphrase": "Smell ya later!",
    "difficulties": [
      {
        "id": "easy",
        "name": "Easy",
        "minLevel": 15,
        "maxLevel": 18,
        "count": 4,
        "ace": {
          "id": "8",
          "name": "Wartortle",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/8.png"
        },
        "pool": [
          {
            "id": "17",
            "name": "Pidgeotto",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/17.png"
          },
          {
            "id": "20",
            "name": "Raticate",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/20.png"
          },
          {
            "id": "63",
            "name": "Abra",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/63.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1,
          "expMultiplier": 1,
          "pokemonExpMultiplier": 0.175
        },
        "dailyRewards": {
          "backpack": {
            "0": {
              "0": 1
            }
          }
        },
        "dailyRewardLabels": [
          "1 Pokeball"
        ],
        "rewardItems": [
          {
            "id": "0",
            "count": 1,
            "name": "Pokeball",
            "icon": "poke-ball.png"
          }
        ]
      },
      {
        "id": "medium",
        "name": "Medium",
        "minLevel": 35,
        "maxLevel": 39,
        "count": 5,
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
            "id": "58",
            "name": "Growlithe",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/58.png"
          },
          {
            "id": "65",
            "name": "Alakazam",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/65.png"
          },
          {
            "id": "102",
            "name": "Exeggcute",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/102.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1.5,
          "expMultiplier": 1.5,
          "pokemonExpMultiplier": 0.185
        },
        "dailyRewards": {
          "backpack": {
            "0": {
              "0": 1
            }
          }
        },
        "dailyRewardLabels": [
          "1 Pokeball"
        ],
        "rewardItems": [
          {
            "id": "0",
            "count": 1,
            "name": "Pokeball",
            "icon": "poke-ball.png"
          }
        ]
      },
      {
        "id": "hard",
        "name": "Hard",
        "minLevel": 59,
        "maxLevel": 64,
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
        "multipliers": {
          "moneyMultiplier": 2,
          "expMultiplier": 2,
          "pokemonExpMultiplier": 0.21
        },
        "dailyRewards": {
          "backpack": {
            "0": {
              "0": 1
            }
          }
        },
        "dailyRewardLabels": [
          "1 Pokeball"
        ],
        "rewardItems": [
          {
            "id": "0",
            "count": 1,
            "name": "Pokeball",
            "icon": "poke-ball.png"
          }
        ]
      }
    ]
  },
  {
    "id": "red",
    "name": "Red",
    "displayName": "Red",
    "sprite": "https://www.serebii.net/heartgoldsoulsilver/gym/red.png",
    "catchphrase": "...!",
    "difficulties": [
      {
        "id": "veryHard",
        "name": "Very Hard",
        "minLevel": 80,
        "maxLevel": 87,
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
        "multipliers": {
          "moneyMultiplier": 3.5,
          "expMultiplier": 3.5,
          "pokemonExpMultiplier": 0.25
        },
        "dailyRewards": {
          "backpack": {
            "0": {
              "0": 2
            }
          }
        },
        "dailyRewardLabels": [
          "2 Pokeballs"
        ],
        "rewardItems": [
          {
            "id": "0",
            "count": 2,
            "name": "Pokeball",
            "icon": "poke-ball.png"
          }
        ]
      }
    ]
  },
  {
    "id": "gold",
    "name": "Gold",
    "displayName": "Gold",
    "sprite": "https://archives.bulbagarden.net/media/upload/a/a5/Spr_HGSS_Ethan.png",
    "catchphrase": "Nobody reads these, right?",
    "difficulties": [
      {
        "id": "medium",
        "name": "Medium",
        "minLevel": 40,
        "maxLevel": 45,
        "count": 5,
        "ace": {
          "id": "157-1",
          "name": "Gold's Typhlosion",
          "sprite": "https://archives.bulbagarden.net/media/upload/b/b9/Spr_2g_157.png"
        },
        "pool": [
          {
            "id": "180",
            "name": "Flaaffy",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/180.png"
          },
          {
            "id": "184",
            "name": "Azumarill",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/184.png"
          },
          {
            "id": "231",
            "name": "Phanpy",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/231.png"
          },
          {
            "id": "247",
            "name": "Pupitar",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/247.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 1.5,
          "expMultiplier": 1.5,
          "pokemonExpMultiplier": 0.185
        },
        "dailyRewards": {
          "backpack": {
            "0": {
              "0": 1
            }
          }
        },
        "dailyRewardLabels": [
          "1 Pokeball"
        ],
        "rewardItems": [
          {
            "id": "0",
            "count": 1,
            "name": "Pokeball",
            "icon": "poke-ball.png"
          }
        ]
      },
      {
        "id": "veryHard",
        "name": "Very Hard",
        "minLevel": 85,
        "maxLevel": 99,
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
        "multipliers": {
          "moneyMultiplier": 3.5,
          "expMultiplier": 3.5,
          "pokemonExpMultiplier": 0.25
        },
        "dailyRewards": {
          "backpack": {
            "0": {
              "0": 2
            }
          }
        },
        "dailyRewardLabels": [
          "2 Pokeballs"
        ],
        "rewardItems": [
          {
            "id": "0",
            "count": 2,
            "name": "Pokeball",
            "icon": "poke-ball.png"
          }
        ]
      }
    ]
  },
  {
    "id": "steven",
    "name": "Champion Steven",
    "displayName": "Champion Steven",
    "sprite": "https://archives.bulbagarden.net/media/upload/a/ad/Spr_RS_Steven.png",
    "catchphrase": "I'm the Champion! Do you know what that means?",
    "difficulties": [
      {
        "id": "hard",
        "name": "Hard",
        "minLevel": 55,
        "maxLevel": 60,
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
        "multipliers": {
          "moneyMultiplier": 2,
          "expMultiplier": 2,
          "pokemonExpMultiplier": 0.21
        },
        "dailyRewards": {
          "backpack": {
            "0": {
              "0": 1
            }
          }
        },
        "dailyRewardLabels": [
          "1 Pokeball"
        ],
        "rewardItems": [
          {
            "id": "0",
            "count": 1,
            "name": "Pokeball",
            "icon": "poke-ball.png"
          }
        ]
      },
      {
        "id": "veryHard",
        "name": "Very Hard",
        "minLevel": 92,
        "maxLevel": 99,
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
        "multipliers": {
          "moneyMultiplier": 3.5,
          "expMultiplier": 3.5,
          "pokemonExpMultiplier": 0.25
        },
        "dailyRewards": {
          "backpack": {
            "0": {
              "0": 2
            }
          }
        },
        "dailyRewardLabels": [
          "2 Pokeballs"
        ],
        "rewardItems": [
          {
            "id": "0",
            "count": 2,
            "name": "Pokeball",
            "icon": "poke-ball.png"
          }
        ]
      }
    ]
  },
  {
    "id": "cynthia",
    "name": "Cynthia",
    "displayName": "Cynthia",
    "sprite": "https://archives.bulbagarden.net/media/upload/d/d2/Spr_Pt_Cynthia.png",
    "catchphrase": "As the Pokémon League Champion, I accept your challenge!",
    "difficulties": [
      {
        "id": "hard",
        "name": "Hard",
        "minLevel": 55,
        "maxLevel": 60,
        "count": 6,
        "ace": {
          "id": "445-1",
          "name": "Cynthia's Garchomp",
          "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/refs/heads/main/media/images/sprites/cynthia-garchomp-resized.gif"
        },
        "pool": [
          {
            "id": "442",
            "name": "Spiritomb",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/442.png"
          },
          {
            "id": "407",
            "name": "Roserade",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/407.png"
          },
          {
            "id": "423",
            "name": "Gastrodon",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/423.png"
          },
          {
            "id": "468",
            "name": "Togekiss",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/468.png"
          },
          {
            "id": "448",
            "name": "Lucario",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png"
          },
          {
            "id": "350",
            "name": "Milotic",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/350.png"
          },
          {
            "id": "471",
            "name": "Glaceon",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/471.png"
          },
          {
            "id": "474",
            "name": "Porygon-Z",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/474.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 2,
          "expMultiplier": 2,
          "pokemonExpMultiplier": 0.21
        },
        "dailyRewards": {
          "backpack": {
            "0": {
              "0": 2
            }
          }
        },
        "dailyRewardLabels": [
          "2 Pokeballs"
        ],
        "rewardItems": [
          {
            "id": "0",
            "count": 2,
            "name": "Pokeball",
            "icon": "poke-ball.png"
          }
        ]
      },
      {
        "id": "veryHard",
        "name": "Very Hard",
        "minLevel": 92,
        "maxLevel": 99,
        "count": 6,
        "ace": {
          "id": "445-1",
          "name": "Cynthia's Garchomp",
          "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/refs/heads/main/media/images/sprites/cynthia-garchomp-resized.gif"
        },
        "pool": [
          {
            "id": "442",
            "name": "Spiritomb",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/442.png"
          },
          {
            "id": "407",
            "name": "Roserade",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/407.png"
          },
          {
            "id": "468",
            "name": "Togekiss",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/468.png"
          },
          {
            "id": "448",
            "name": "Lucario",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png"
          },
          {
            "id": "350",
            "name": "Milotic",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/350.png"
          },
          {
            "id": "487",
            "name": "Giratina-Altered",
            "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/487.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 3.5,
          "expMultiplier": 3.5,
          "pokemonExpMultiplier": 0.25
        },
        "dailyRewards": {
          "backpack": {
            "0": {
              "0": 4
            }
          }
        },
        "dailyRewardLabels": [
          "4 Pokeballs"
        ],
        "rewardItems": [
          {
            "id": "0",
            "count": 4,
            "name": "Pokeball",
            "icon": "poke-ball.png"
          }
        ]
      }
    ]
  },
  {
    "id": "palmer",
    "name": "Tower Tycoon Palmer",
    "displayName": "Tower Tycoon Palmer",
    "sprite": "https://archives.bulbagarden.net/media/upload/f/f4/Spr_DP_Palmer.png",
    "catchphrase": "Show me the skill you've acquired as a Trainer!",
    "difficulties": [
      {
        "id": "veryHard",
        "name": "Very Hard",
        "minLevel": 100,
        "maxLevel": 119,
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
        "multipliers": {
          "moneyMultiplier": 3.5,
          "expMultiplier": 3.5,
          "pokemonExpMultiplier": 0.25
        },
        "dailyRewards": {
          "backpack": {
            "1": {
              "7": 1
            }
          }
        },
        "dailyRewardLabels": [
          "1 Mint"
        ],
        "rewardItems": [
          {
            "id": "7",
            "count": 1,
            "name": "Mint",
            "icon": "mint.png"
          }
        ]
      }
    ]
  },
  {
    "id": "professorWillow",
    "name": "Professor Willow",
    "displayName": "Professor Willow",
    "sprite": "https://archives.bulbagarden.net/media/upload/thumb/5/53/GO_Professor_Willow_2022.png/52px-GO_Professor_Willow_2022.png",
    "catchphrase": "I'm Willow, the Pokémon Professor. If you're strong enough to defeat me, I'll allow you to participate in a Raid.",
    "difficulties": [
      {
        "id": "veryHard",
        "name": "Very Hard",
        "minLevel": 130,
        "maxLevel": 149,
        "count": 6,
        "ace": {
          "id": "20809",
          "name": "Willow's Melmetal",
          "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/809.png"
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
            "id": "150-1",
            "name": "Armored Mewtwo",
            "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/armored-mewtwo.png"
          },
          {
            "id": "249-1",
            "name": "Shadow Lugia",
            "sprite": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/sprites/shadow-lugia.png"
          }
        ],
        "multipliers": {
          "moneyMultiplier": 3.5,
          "expMultiplier": 3.5,
          "pokemonExpMultiplier": 0.25
        },
        "dailyRewards": {
          "backpack": {
            "2": {
              "8": 1
            }
          }
        },
        "dailyRewardLabels": [
          "1 Raid Pass"
        ],
        "rewardItems": [
          {
            "id": "8",
            "count": 1,
            "name": "Raid Pass",
            "icon": "raid-pass.png"
          }
        ]
      }
    ]
  }
];
