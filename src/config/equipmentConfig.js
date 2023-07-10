const { backpackItems } = require('./backpackConfig');
const { stats, statConfig } = require('./pokemonConfig');

const modifiers = {
    BASE_HP: "baseHp",
    BASE_ATK: "baseAtk",
    BASE_DEF: "baseDef",
    BASE_SPA: "baseSpA",
    BASE_SPD: "baseSpD",
    BASE_SPE: "baseSpe",
    PERCENT_HP: "percentHp",
    PERCENT_ATK: "percentAtk",
    PERCENT_DEF: "percentDef",
    PERCENT_SPA: "percentSpA",
    PERCENT_SPD: "percentSpD",
    PERCENT_SPE: "percentSpe",
    FLAT_HP: "flatHp",
    FLAT_ATK: "flatAtk",
    FLAT_DEF: "flatDef",
    FLAT_SPA: "flatSpA",
    FLAT_SPD: "flatSpD",
    FLAT_SPE: "flatSpe",
}

const modifierTypes = {
    BASE: "base",
    FLAT: "flat",
    PERCENT: "percent",
}

const modifierConfig = {
    [modifiers.BASE_HP]: {
        "name": "Base HP",
        "description": "Base HP",
        "type": modifierTypes.BASE,
        "stat": stats.HP,
        "min": 1,
        "max": 2,
    },
    [modifiers.BASE_ATK]: {
        "name": "Base Atk",
        "description": "Base Attack",
        "type": modifierTypes.BASE,
        "stat": stats.ATTACK,
        "min": 1.5,
        "max": 2.5,
    },
    [modifiers.BASE_DEF]: {
        "name": "Base Def",
        "description": "Base Defense",
        "type": modifierTypes.BASE,
        "stat": stats.DEFENSE,
        "min": 1.5,
        "max": 2.5,
    },
    [modifiers.BASE_SPA]: {
        "name": "Base SpA",
        "description": "Base Special Attack",
        "type": modifierTypes.BASE,
        "stat": stats.SPATK,
        "min": 1.5,
        "max": 2.5,
    },
    [modifiers.BASE_SPD]: {
        "name": "Base SpD",
        "description": "Base Special Defense",
        "type": modifierTypes.BASE,
        "stat": stats.SPDEF,
        "min": 1.5,
        "max": 2.5,
    },
    [modifiers.BASE_SPE]: {
        "name": "Base Spe",
        "description": "Base Speed",
        "type": modifierTypes.BASE,
        "stat": stats.SPEED,
        "min": 1.5,
        "max": 2.5,
    },
    [modifiers.PERCENT_HP]: {
        "name": "% HP",
        "description": "Percent HP",
        "type": modifierTypes.PERCENT,
        "stat": stats.HP,
        "min": 2,
        "max": 4,
    },
    [modifiers.PERCENT_ATK]: {
        "name": "% Atk",
        "description": "Percent Attack",
        "type": modifierTypes.PERCENT,
        "stat": stats.ATTACK,
        "min": 3,
        "max": 5,
    },
    [modifiers.PERCENT_DEF]: {
        "name": "% Def",
        "description": "Percent Defense",
        "type": modifierTypes.PERCENT,
        "stat": stats.DEFENSE,
        "min": 3,
        "max": 5,
    },
    [modifiers.PERCENT_SPA]: {
        "name": "% SpA",
        "description": "Percent Special Attack",
        "type": modifierTypes.PERCENT,
        "stat": stats.SPATK,
        "min": 3,
        "max": 5,
    },
    [modifiers.PERCENT_SPD]: {
        "name": "% SpD",
        "description": "Percent Special Defense",
        "type": modifierTypes.PERCENT,
        "stat": stats.SPDEF,
        "min": 3,
        "max": 5,
    },
    [modifiers.PERCENT_SPE]: {
        "name": "% Spe",
        "description": "Percent Speed",
        "type": modifierTypes.PERCENT,
        "stat": stats.SPEED,
        "min": 3,
        "max": 5,
    }, 
    [modifiers.FLAT_HP]: {
        "name": "Flat HP",
        "description": "Flat HP",
        "type": modifierTypes.FLAT,
        "stat": stats.HP,
        "min": 7,
        "max": 12,
    },
    [modifiers.FLAT_ATK]: {
        "name": "Flat Atk",
        "description": "Flat Attack",
        "type": modifierTypes.FLAT,
        "stat": stats.ATTACK,
        "min": 6,
        "max": 10,
    },
    [modifiers.FLAT_DEF]: {
        "name": "Flat Def",
        "description": "Flat Defense",
        "type": modifierTypes.FLAT,
        "stat": stats.DEFENSE,
        "min": 6,
        "max": 10,
    },
    [modifiers.FLAT_SPA]: {
        "name": "Flat SpA",
        "description": "Flat Special Attack",
        "type": modifierTypes.FLAT,
        "stat": stats.SPATK,
        "min": 6,
        "max": 10,
    },
    [modifiers.FLAT_SPD]: {
        "name": "Flat SpD",
        "description": "Flat Special Defense",
        "type": modifierTypes.FLAT,
        "stat": stats.SPDEF,
        "min": 6,
        "max": 10,
    },
    [modifiers.FLAT_SPE]: {
        "name": "Flat Spe",
        "description": "Flat Speed",
        "type": modifierTypes.FLAT,
        "stat": stats.SPEED,
        "min": 6,
        "max": 10,
    },
}

const modifierSlots = {
    PRIMARY: "primary",
    SECONDARY: "secondary",
    SUBSTAT1: "substat1",
    SUBSTAT2: "substat2",
    SUBSTAT3: "substat3",
}

const modifierSlotConfig = {
    [modifierSlots.PRIMARY]: {
        "name": "Primary",
        "description": "Primary Modifier",
        "abbreviation": "PRI",
        "level": true,
    },
    [modifierSlots.SECONDARY]: {
        "name": "Secondary",
        "description": "Secondary Modifier",
        "abbreviation": "SEC",
        "level": true,
    },
    [modifierSlots.SUBSTAT1]: {
        "name": "Substat 1",
        "description": "Substat 1",
        "abbreviation": "Sub",
        "level": false,
    },
    [modifierSlots.SUBSTAT2]: {
        "name": "Substat 2",
        "description": "Substat 2",
        "abbreviation": "Sub",
        "level": false,
    },
    [modifierSlots.SUBSTAT3]: {
        "name": "Substat 3",
        "description": "Substat 3",
        "abbreviation": "Sub",
        "level": false,
    },
}

const equipmentTypes = {
    POWER_WEIGHT: "powerWeight",
    POWER_BRACER: "powerBracer",
    POWER_BELT: "powerBelt",
    POWER_LENS: "powerLens",
    POWER_BAND: "powerBand",
    POWER_ANKLET: "powerAnklet",
}

const SUBSTAT_MODIFIERS = [
    modifiers.FLAT_HP,
    modifiers.FLAT_ATK,
    modifiers.FLAT_DEF,
    modifiers.FLAT_SPA,
    modifiers.FLAT_SPD,
    modifiers.FLAT_SPE,
    modifiers.PERCENT_HP,
    modifiers.PERCENT_ATK,
    modifiers.PERCENT_DEF,
    modifiers.PERCENT_SPA,
    modifiers.PERCENT_SPD,
]

const equipmentConfig = {
    [equipmentTypes.POWER_WEIGHT]: {
        "name": "Power Weight",
        "description": "Increases HP",
        "emoji": "<:powerweight:1112557998234148874>",
        "sprite": "https://archives.bulbagarden.net/media/upload/8/80/Dream_Power_Weight_Sprite.png",
        "material": backpackItems.EMOTION_SHARD,
        "slots": {
            [modifierSlots.PRIMARY]: {
                "modifiers": [modifiers.BASE_HP],
            },
            [modifierSlots.SECONDARY]: {
                "modifiers": [
                    modifiers.PERCENT_HP,
                    modifiers.FLAT_SPE,
                    modifiers.FLAT_HP,
                    modifiers.FLAT_DEF,
                    modifiers.FLAT_SPD,
                ],
            },
            [modifierSlots.SUBSTAT1]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
            [modifierSlots.SUBSTAT2]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
            [modifierSlots.SUBSTAT3]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
        },
    },
    [equipmentTypes.POWER_BRACER]: {
        "name": "Power Bracer",
        "description": "Increases Attack",
        "emoji": "<:powerbracer:1112557995629490237>",
        "sprite": "https://archives.bulbagarden.net/media/upload/1/18/Dream_Power_Bracer_Sprite.png",
        "material": backpackItems.WILLPOWER_SHARD,
        "slots": {
            [modifierSlots.PRIMARY]: {
                "modifiers": [modifiers.BASE_ATK],
            },
            [modifierSlots.SECONDARY]: {
                "modifiers": [
                    modifiers.PERCENT_ATK,
                    modifiers.PERCENT_SPA,
                    modifiers.FLAT_ATK,
                    modifiers.FLAT_SPA,
                ],
            },
            [modifierSlots.SUBSTAT1]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
            [modifierSlots.SUBSTAT2]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
            [modifierSlots.SUBSTAT3]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
        },
    },
    [equipmentTypes.POWER_BELT]: {
        "name": "Power Belt",
        "description": "Increases Defense",
        "emoji": "<:powerbelt:1112557994576711761>",
        "sprite": "https://archives.bulbagarden.net/media/upload/9/9a/Dream_Power_Belt_Sprite.png",
        "material": backpackItems.KNOWLEDGE_SHARD,
        "slots": {
            [modifierSlots.PRIMARY]: {
                "modifiers": [modifiers.BASE_DEF],
            },
            [modifierSlots.SECONDARY]: {
                "modifiers": [
                    modifiers.PERCENT_DEF,
                    modifiers.PERCENT_SPD,
                    modifiers.FLAT_DEF,
                    modifiers.FLAT_SPD,
                ],
            },
            [modifierSlots.SUBSTAT1]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
            [modifierSlots.SUBSTAT2]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
            [modifierSlots.SUBSTAT3]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
        },
    },
    [equipmentTypes.POWER_LENS]: {
        "name": "Power Lens",
        "description": "Increases Special Attack",
        "emoji": "<:powerlens:1112557996585783356>",
        "sprite": "https://archives.bulbagarden.net/media/upload/a/ac/Dream_Power_Lens_Sprite.png",
        "material": backpackItems.WILLPOWER_SHARD,
        "slots": {
            [modifierSlots.PRIMARY]: {
                "modifiers": [modifiers.BASE_SPA],
            },
            [modifierSlots.SECONDARY]: {
                "modifiers": [
                    modifiers.PERCENT_ATK,
                    modifiers.PERCENT_SPA,
                    modifiers.FLAT_ATK,
                    modifiers.FLAT_SPA,
                ],
            },
            [modifierSlots.SUBSTAT1]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
            [modifierSlots.SUBSTAT2]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
            [modifierSlots.SUBSTAT3]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
        },
    },
    [equipmentTypes.POWER_BAND]: {
        "name": "Power Band",
        "description": "Increases Special Defense",
        "emoji": "<:powerband:1112557992987066409>",
        "sprite": "https://archives.bulbagarden.net/media/upload/9/99/Dream_Power_Band_Sprite.png",
        "material": backpackItems.KNOWLEDGE_SHARD,
        "slots": {
            [modifierSlots.PRIMARY]: {
                "modifiers": [modifiers.BASE_SPD],
            },
            [modifierSlots.SECONDARY]: {
                "modifiers": [
                    modifiers.PERCENT_DEF,
                    modifiers.PERCENT_SPD,
                    modifiers.FLAT_DEF,
                    modifiers.FLAT_SPD,
                ],
            },
            [modifierSlots.SUBSTAT1]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
            [modifierSlots.SUBSTAT2]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
            [modifierSlots.SUBSTAT3]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
        },
    },
    [equipmentTypes.POWER_ANKLET]: {
        "name": "Power Anklet",
        "description": "Increases Speed",
        "emoji": "<:poweranklet:1112557991510675456>",
        "sprite": "https://archives.bulbagarden.net/media/upload/1/1c/Dream_Power_Anklet_Sprite.png",
        "material": backpackItems.EMOTION_SHARD,
        "slots": {
            [modifierSlots.PRIMARY]: {
                "modifiers": [modifiers.BASE_SPE],
            },
            [modifierSlots.SECONDARY]: {
                "modifiers": [
                    modifiers.PERCENT_HP,
                    modifiers.FLAT_SPE,
                    modifiers.FLAT_HP,
                    modifiers.FLAT_ATK,
                    modifiers.FLAT_SPA,
                ],
            },
            [modifierSlots.SUBSTAT1]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
            [modifierSlots.SUBSTAT2]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
            [modifierSlots.SUBSTAT3]: {
                "modifiers": SUBSTAT_MODIFIERS,
            },
        },
    },
};

const MAX_EQUIPMENT_LEVEL = 10;
const STAT_REROLL_COST = 5;
const levelUpCost = (level) => level + 1;
const SWAP_COST = 50;
const POKEDOLLAR_MULTIPLIER = 200;

let equipmentInfoString = "**Equipment Info**\n\n";
equipmentInfoString += "**Stat Modifiers**\n"
equipmentInfoString += "Equipment is used to boost the stats of your Pokemon. Each piece of equipment has 5 stat slots: primary, secondary, and 3 substats. **Primary and secondary stats scale with the equipment level, while substats don't.**\n\n";
equipmentInfoString += "Equipment stats also come with a quality, that changes the value of the stat modifier. Modifiers and stats can be changed with stat rerolls. \n\n";
equipmentInfoString += "Each equipment stat modifies your Pokemon's stat in different ways. **There are three types of modifiers: Base, Percent, and Flat.** They work in the following ways:\n"
equipmentInfoString += "* Base: Adds a flat amount to the original base Pokemon stat, which scales with level and nature.\n";
equipmentInfoString += "* Percent: After the original stat is calculated with the traditional Pokemon stat calculation formula, increase that stat by the given percentage.\n";
equipmentInfoString += "* Flat: Adds a flat amount to the final stat, after all other modifiers have been applied.\n\n";
equipmentInfoString += "**Equipment Types**\n";
equipmentInfoString += "Each Pokemon equips 1 of each equipment type, which determines what stats the equipment may have. There are 6 different types of equipment, each with their own primary stat that increases the base stat. **Each type of equipment also has different possible secondary stats**, shown below:";
for (const equipmentData of Object.values(equipmentConfig)) {
    const modifiers = equipmentData.slots[modifierSlots.SECONDARY].modifiers;
    const modifierNames = modifiers.map(modifier => modifierConfig[modifier].name);
    equipmentInfoString += `\n* ${equipmentData.name}: ${modifierNames.join(", ")}`;
}
equipmentInfoString += "\nAll substats have the same possible modifiers. The modifiers are all flat and percent modifiers, minus percent speed.\n\n";

let equipmentInfoString2 = "**Equipment Info (cont.)**\n\n";
equipmentInfoString2 += "**Upgrading and Tuning**\n";
equipmentInfoString2 += "There are two ways to modify a piece of equipment: **level upgrades and rerolling.** All modifications cost Pokedollars and Shards. Shards can be obtained from the `/dungeon`.\n\n";
equipmentInfoString2 += "Level upgrades increase the level of the equipment, which increases the primary and secondary stats. The cost of upgrading increases with the level of the equipment. Equipment can be leveled to level 10.\n\n";
equipmentInfoString2 += "Rerolling changes the modifiers of a given stat slot. Rerolling chooses a random (possibly duplicate) modifier as well as randomly rolls the quality of the stat.";

module.exports = {
    equipmentTypes,
    modifierConfig,
    modifierSlots,
    modifiers,
    modifierSlotConfig,
    modifierTypes,
    equipmentConfig,
    MAX_EQUIPMENT_LEVEL,
    STAT_REROLL_COST: STAT_REROLL_COST,
    SWAP_COST,
    levelUpCost,
    POKEDOLLAR_MULTIPLIER,
    equipmentInfoString,
    equipmentInfoString2,
};

