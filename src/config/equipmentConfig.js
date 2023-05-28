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
        "min": 3,
        "max": 4,
    },
    [modifiers.BASE_ATK]: {
        "name": "Base Atk",
        "description": "Base Attack",
        "type": modifierTypes.BASE,
        "stat": stats.ATTACK,
        "min": 2,
        "max": 3,
    },
    [modifiers.BASE_DEF]: {
        "name": "Base Def",
        "description": "Base Defense",
        "type": modifierTypes.BASE,
        "stat": stats.DEFENSE,
        "min": 2,
        "max": 3,
    },
    [modifiers.BASE_SPA]: {
        "name": "Base SpA",
        "description": "Base Special Attack",
        "type": modifierTypes.BASE,
        "stat": stats.SPATK,
        "min": 2,
        "max": 3,
    },
    [modifiers.BASE_SPD]: {
        "name": "Base SpD",
        "description": "Base Special Defense",
        "type": modifierTypes.BASE,
        "stat": stats.SPDEF,
        "min": 2,
        "max": 3,
    },
    [modifiers.BASE_SPE]: {
        "name": "Base Spe",
        "description": "Base Speed",
        "type": modifierTypes.BASE,
        "stat": stats.SPEED,
        "min": 4,
        "max": 7,
    },
    [modifiers.PERCENT_HP]: {
        "name": "% HP",
        "description": "Percent HP",
        "type": modifierTypes.PERCENT,
        "stat": stats.HP,
        "min": 5,
        "max": 8,
    },
    [modifiers.PERCENT_ATK]: {
        "name": "% Atk",
        "description": "Percent Attack",
        "type": modifierTypes.PERCENT,
        "stat": stats.ATTACK,
        "min": 4,
        "max": 7,
    },
    [modifiers.PERCENT_DEF]: {
        "name": "% Def",
        "description": "Percent Defense",
        "type": modifierTypes.PERCENT,
        "stat": stats.DEFENSE,
        "min": 4,
        "max": 7,
    },
    [modifiers.PERCENT_SPA]: {
        "name": "% SpA",
        "description": "Percent Special Attack",
        "type": modifierTypes.PERCENT,
        "stat": stats.SPATK,
        "min": 4,
        "max": 7,
    },
    [modifiers.PERCENT_SPD]: {
        "name": "% SpD",
        "description": "Percent Special Defense",
        "type": modifierTypes.PERCENT,
        "stat": stats.SPDEF,
        "min": 4,
        "max": 7,
    },
    [modifiers.PERCENT_SPE]: {
        "name": "% Spe",
        "description": "Percent Speed",
        "type": modifierTypes.PERCENT,
        "stat": stats.SPEED,
        "min": 4,
        "max": 7,
    }, 
    [modifiers.FLAT_HP]: {
        "name": "Flat HP",
        "description": "Flat HP",
        "type": modifierTypes.FLAT,
        "stat": stats.HP,
        "min": 12,
        "max": 17,
    },
    [modifiers.FLAT_ATK]: {
        "name": "Flat Atk",
        "description": "Flat Attack",
        "type": modifierTypes.FLAT,
        "stat": stats.ATTACK,
        "min": 10,
        "max": 15,
    },
    [modifiers.FLAT_DEF]: {
        "name": "Flat Def",
        "description": "Flat Defense",
        "type": modifierTypes.FLAT,
        "stat": stats.DEFENSE,
        "min": 10,
        "max": 15,
    },
    [modifiers.FLAT_SPA]: {
        "name": "Flat SpA",
        "description": "Flat Special Attack",
        "type": modifierTypes.FLAT,
        "stat": stats.SPATK,
        "min": 10,
        "max": 15,
    },
    [modifiers.FLAT_SPD]: {
        "name": "Flat SpD",
        "description": "Flat Special Defense",
        "type": modifierTypes.FLAT,
        "stat": stats.SPDEF,
        "min": 10,
        "max": 15,
    },
    [modifiers.FLAT_SPE]: {
        "name": "Flat Spe",
        "description": "Flat Speed",
        "type": modifierTypes.FLAT,
        "stat": stats.SPEED,
        "min": 10,
        "max": 15,
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
    modifiers.PERCENT_SPE,
]

const equipmentConfig = {
    [equipmentTypes.POWER_WEIGHT]: {
        "name": "Power Weight",
        "description": "Increases HP",
        "emoji": "⚖️",
        "sprite": "https://archives.bulbagarden.net/media/upload/8/80/Dream_Power_Weight_Sprite.png",
        "slots": {
            [modifierSlots.PRIMARY]: {
                "modifiers": [modifiers.BASE_HP],
            },
            [modifierSlots.SECONDARY]: {
                "modifiers": [
                    modifiers.PERCENT_HP,
                    modifiers.FLAT_SPE,
                    modifiers.FLAT_HP,
                    modifiers.FLAT_ATK,
                    modifiers.FLAT_DEF,
                    modifiers.FLAT_SPA,
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
        "emoji": "💪",
        "sprite": "https://archives.bulbagarden.net/media/upload/1/18/Dream_Power_Bracer_Sprite.png",
        "slots": {
            [modifierSlots.PRIMARY]: {
                "modifiers": [modifiers.BASE_ATK],
            },
            [modifierSlots.SECONDARY]: {
                "modifiers": [
                    modifiers.PERCENT_ATK,
                    modifiers.PERCENT_SPA,
                    modifiers.FLAT_HP,
                    modifiers.FLAT_ATK,
                    modifiers.FLAT_DEF,
                    modifiers.FLAT_SPA,
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
    [equipmentTypes.POWER_BELT]: {
        "name": "Power Belt",
        "description": "Increases Defense",
        "emoji": "🥋",
        "sprite": "https://archives.bulbagarden.net/media/upload/9/9a/Dream_Power_Belt_Sprite.png",
        "slots": {
            [modifierSlots.PRIMARY]: {
                "modifiers": [modifiers.BASE_DEF],
            },
            [modifierSlots.SECONDARY]: {
                "modifiers": [
                    modifiers.PERCENT_DEF,
                    modifiers.PERCENT_SPD,
                    modifiers.FLAT_HP,
                    modifiers.FLAT_ATK,
                    modifiers.FLAT_DEF,
                    modifiers.FLAT_SPA,
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
        "emoji": "🔎",
        "sprite": "https://archives.bulbagarden.net/media/upload/a/ac/Dream_Power_Lens_Sprite.png",
        "slots": {
            [modifierSlots.PRIMARY]: {
                "modifiers": [modifiers.BASE_SPA],
            },
            [modifierSlots.SECONDARY]: {
                "modifiers": [
                    modifiers.PERCENT_ATK,
                    modifiers.PERCENT_SPA,
                    modifiers.FLAT_HP,
                    modifiers.FLAT_ATK,
                    modifiers.FLAT_DEF,
                    modifiers.FLAT_SPA,
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
    [equipmentTypes.POWER_BAND]: {
        "name": "Power Band",
        "description": "Increases Special Defense",
        "emoji": "🎸",
        "sprite": "https://archives.bulbagarden.net/media/upload/9/99/Dream_Power_Band_Sprite.png",
        "slots": {
            [modifierSlots.PRIMARY]: {
                "modifiers": [modifiers.BASE_SPD],
            },
            [modifierSlots.SECONDARY]: {
                "modifiers": [
                    modifiers.PERCENT_DEF,
                    modifiers.PERCENT_SPD,
                    modifiers.FLAT_HP,
                    modifiers.FLAT_ATK,
                    modifiers.FLAT_DEF,
                    modifiers.FLAT_SPA,
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
        "emoji": "👣",
        "sprite": "https://archives.bulbagarden.net/media/upload/1/1c/Dream_Power_Anklet_Sprite.png",
        "slots": {
            [modifierSlots.PRIMARY]: {
                "modifiers": [modifiers.BASE_SPE],
            },
            [modifierSlots.SECONDARY]: {
                "modifiers": [
                    modifiers.PERCENT_HP,
                    modifiers.PERCENT_SPE,
                    modifiers.FLAT_HP,
                    modifiers.FLAT_ATK,
                    modifiers.FLAT_DEF,
                    modifiers.FLAT_SPA,
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
};

module.exports = {
    equipmentTypes,
    modifierConfig,
    modifierSlots,
    modifiers,
    modifierSlotConfig,
    modifierTypes,
    equipmentConfig
};

