/** @typedef {Enum<pokemonIdEnum>} PokemonIdEnum */

const pokemonIdEnum = Object.freeze({
  BULBASAUR: "1",
  IVYSAUR: "2",
  VENUSAUR: "3",
  CHARMANDER: "4",
  CHARMELEON: "5",
  CHARIZARD: "6",
  SQUIRTLE: "7",
  WARTORTLE: "8",
  BLASTOISE: "9",
  CATERPIE: "10",
  METAPOD: "11",
  BUTTERFREE: "12",
  WEEDLE: "13",
  KAKUNA: "14",
  BEEDRILL: "15",
  PIDGEY: "16",
  PIDGEOTTO: "17",
  PIDGEOT: "18",
  RATTATA: "19",
  RATICATE: "20",
  EKANS: "23",
  ARBOK: "24",
  PIKACHU: "25",
  RAICHU: "26",
  NIDORAN_F: "29",
  NIDORINA: "30",
  NIDOQUEEN: "31",
  NIDORAN_M: "32",
  NIDORINO: "33",
  NIDOKING: "34",
  CLEFAIRY: "35",
  CLEFABLE: "36",
  VULPIX: "37",
  NINETALES: "38",
  JIGGLYPUFF: "39",
  WIGGLYTUFF: "40",
  ZUBAT: "41",
  GOLBAT: "42",
  ODDISH: "43",
  GLOOM: "44",
  VILEPLUME: "45",
  PARAS: "46",
  PARASECT: "47",
  VENONAT: "48",
  VENOMOTH: "49",
  DIGLETT: "50",
  DUGTRIO: "51",
  MEOWTH: "52",
  PERSIAN: "53",
  GROWLITHE: "58",
  ARCANINE: "59",
  POLIWAG: "60",
  POLIWHIRL: "61",
  POLIWRATH: "62",
  ABRA: "63",
  KADABRA: "64",
  ALAKAZAM: "65",
  MACHOP: "66",
  MACHOKE: "67",
  MACHAMP: "68",
  BELLSPROUT: "69",
  WEEPINBELL: "70",
  VICTREEBEL: "71",
  GEODUDE: "74",
  GRAVELER: "75",
  GOLEM: "76",
  SLOWPOKE: "79",
  SLOWBRO: "80",
  MAGNEMITE: "81",
  MAGNETON: "82",
  FARFETCHD: "83",
  GRIMER: "88",
  MUK: "89",
  SHELLDER: "90",
  CLOYSTER: "91",
  GASTLY: "92",
  HAUNTER: "93",
  GENGAR: "94",
  ONIX: "95",
  KRABBY: "98",
  KINGLER: "99",
  VOLTORB: "100",
  ELECTRODE: "101",
  EXEGGCUTE: "102",
  EXEGGUTOR: "103",
  HITMONLEE: "106",
  HITMONCHAN: "107",
  LICKITUNG: "108",
  KOFFING: "109",
  WEEZING: "110",
  RHYHORN: "111",
  RHYDON: "112",
  CHANSEY: "113",
  STARYU: "120",
  STARMIE: "121",
  MR_MIME: "122",
  SCYTHER: "123",
  JYNX: "124",
  ELECTABUZZ: "125",
  MAGMAR: "126",
  PINSIR: "127",
  MAGIKARP: "129",
  GYARADOS: "130",
  LAPRAS: "131",
  EEVEE: "133",
  VAPOREON: "134",
  JOLTEON: "135",
  FLAREON: "136",
  PORYGON: "137",
  OMANYTE: "138",
  OMASTAR: "139",
  AERODACTYL: "142",
  SNORLAX: "143",
  ARTICUNO: "144",
  ZAPDOS: "145",
  MOLTRES: "146",
  DRATINI: "147",
  DRAGONAIR: "148",
  DRAGONITE: "149",
  MEWTWO: "150",
  MEW: "151",
  CHIKORITA: "152",
  BAYLEEF: "153",
  MEGANIUM: "154",
  CYNDAQUIL: "155",
  QUILAVA: "156",
  TYPHLOSION: "157",
  TOTODILE: "158",
  CROCONAW: "159",
  FERALIGATR: "160",
  SENTRET: "161",
  FURRET: "162",
  HOOTHOOT: "163",
  NOCTOWL: "164",
  LEDYBA: "165",
  LEDIAN: "166",
  SPINARAK: "167",
  ARIADOS: "168",
  CROBAT: "169",
  TOGEPI: "175",
  TOGETIC: "176",
  MAREEP: "179",
  FLAAFFY: "180",
  AMPHAROS: "181",
  BELLOSSOM: "182",
  MARILL: "183",
  AZUMARILL: "184",
  POLITOED: "186",
  HOPPIP: "187",
  SKIPLOOM: "188",
  JUMPLUFF: "189",
  AIPOM: "190",
  SUNKERN: "191",
  SUNFLORA: "192",
  YANMA: "193",
  WOOPER: "194",
  QUAGSIRE: "195",
  ESPEON: "196",
  UMBREON: "197",
  MURKROW: "198",
  SLOWKING: "199",
  WOBBUFFET: "202",
  PINECO: "204",
  FORRETRESS: "205",
  GLIGAR: "207",
  STEELIX: "208",
  SCIZOR: "212",
  SHUCKLE: "213",
  HERACROSS: "214",
  SNEASEL: "215",
  SWINUB: "220",
  PILOSWINE: "221",
  SKARMORY: "227",
  HOUNDOUR: "228",
  HOUNDOOM: "229",
  PHANPY: "231",
  DONPHAN: "232",
  PORYGON2: "233",
  STANTLER: "234",
  TYROGUE: "236",
  HITMONTOP: "237",
  ELEKID: "239",
  MAGBY: "240",
  MILTANK: "241",
  BLISSEY: "242",
  RAIKOU: "243",
  ENTEI: "244",
  SUICUNE: "245",
  LARVITAR: "246",
  PUPITAR: "247",
  TYRANITAR: "248",
  LUGIA: "249",
  HO_OH: "250",
  CELEBI: "251",
  TREECKO: "252",
  GROVYLE: "253",
  SCEPTILE: "254",
  TORCHIC: "255",
  COMBUSKEN: "256",
  BLAZIKEN: "257",
  MUDKIP: "258",
  MARSHTOMP: "259",
  SWAMPERT: "260",
  POOCHYENA: "261",
  MIGHTYENA: "262",
  ZIGZAGOON: "263",
  LINOONE: "264",
  WURMPLE: "265",
  SILCOON: "266",
  BEAUTIFLY: "267",
  CASCOON: "268",
  DUSTOX: "269",
  LOTAD: "270",
  LOMBRE: "271",
  LUDICOLO: "272",
  SEEDOT: "273",
  NUZLEAF: "274",
  SHIFTRY: "275",
  TAILLOW: "276",
  SWELLOW: "277",
  WINGULL: "278",
  PELIPPER: "279",
  RALTS: "280",
  KIRLIA: "281",
  GARDEVOIR: "282",
  SHROOMISH: "285",
  BRELOOM: "286",
  SLAKOTH: "287",
  VIGOROTH: "288",
  SLAKING: "289",
  NINCADA: "290",
  NINJASK: "291",
  SHEDINJA: "292",
  MAKUHITA: "296",
  HARIYAMA: "297",
  SABLEYE: "302",
  MAWILE: "303",
  ARON: "304",
  LAIRON: "305",
  AGGRON: "306",
  ELECTRIKE: "309",
  MANECTRIC: "310",
  ROSELIA: "315",
  CARVANHA: "318",
  SHARPEDO: "319",
  AQUAS_SHARPEDO: "319-2",
  WAILMER: "320",
  WAILORD: "321",
  NUMEL: "322",
  CAMERUPT: "323",
  MAGMAS_CAMERUPT: "323-1",
  TORKOAL: "324",
  TRAPINCH: "328",
  VIBRAVA: "329",
  FLYGON: "330",
  SWABLU: "333",
  ALTARIA: "334",
  BALTOY: "343",
  CLAYDOL: "344",
  LILEEP: "345",
  CRADILY: "346",
  ANORITH: "347",
  ARMALDO: "348",
  FEEBAS: "349",
  MILOTIC: "350",
  DUSKULL: "355",
  DUSCLOPS: "356",
  SNORUNT: "361",
  GLALIE: "362",
  SPHEAL: "363",
  SEALEO: "364",
  WALREIN: "365",
  BAGON: "371",
  SHELGON: "372",
  SALAMENCE: "373",
  BELDUM: "374",
  METANG: "375",
  METAGROSS: "376",
  REGIROCK: "377",
  REGICE: "378",
  REGISTEEL: "379",
  LATIAS: "380",
  LATIOS: "381",
  KYOGRE: "382",
  GROUDON: "383",
  RAYQUAZA: "384",
  JIRACHI: "385",
  DEOXYS: "386",
  GARYS_BLASTOISE: "9-1",
  AAABAAAJSS: "18-1",
  JESSIES_ARBOK: "24-1",
  ASHS_PIKACHU: "25-1",
  AAAAAAAAAA: "34-1",
  AATTVVV: "49-1",
  ROCKET_MEOWTH: "52-1",
  JAMES_WEEZING: "110-1",
  SCORO: "123-1",
  AIIIIIIRRR: "131-1",
  FALSE_PROPHET: "136-1",
  LORD_HELIX: "139-1",
  SLEEPING_SNORLAX: "143-1",
  AA_J: "145-1",
  ARMORED_MEWTWO: "150-1",
  RED_HAIR_MEWTWO: "150-2",
  GOLDS_TYPHLOSION: "157-1",
  VINSMOKE_HITMONTOP: "237-1",
  DARK_TYRANITAR: "248-1",
  SHADOW_LUGIA: "249-1",
  SLAKING_D_GARP: "289-1",
  BILLIONAIRE_SABLEYE: "302-1",
  ARLONG: "319-1",
  RAYKAIDO: "384-1",
  RUBBER_INFERNAPE: "392-1",
  SUN_GOD_INFERNAPE: "392-2",
  LITTENYAN: "725-1",
  SCAMMER_THIEVUL: "828-1",
  RAID_BOSS_MEWTWO: "20150-1",
  RAID_BOSS_LUGIA: "20249-1",
  RAID_BOSS_KYOGRE: "20382-1",
  RAID_BOSS_GROUDON: "20383-1",
  DEOXYS_ATTACK: "10001",
  DEOXYS_DEFENSE: "10002",
  DEOXYS_SPEED: "10003",
  TEMPLE_GUARDIAN_CLOYSTER: "20091",
  CAVE_DWELLER_ELECTRODE: "20101",
  CAVE_DWELLER_CHANSEY: "20113",
  TEMPLE_GUARDIAN_ARTICUNO: "20144",
  SPIRIT_PRIEST_DRAGONITE: "20149",
  SPIRIT_PRIEST_MEWTWO: "20150",
  META_GROUDON: "20383",
  PALMERS_RAYQUAZA: "20384",
  WILLOWS_MELMETAL: "20809",
  ARCHIES_KYOGRE: "382-1",
  MAXIES_GROUDON: "383-1",
});

module.exports = { pokemonIdEnum };
