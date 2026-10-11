---
name: add-move
description: Add new moves to the battle system. Use when implementing attack, status, or support moves for Pokemon.
---

# Adding Moves to Pokestar

## Quick Reference

**Files to modify:**

1. `src/enums/battleEnums.js` - Add `moveIdEnum.YOUR_MOVE` entry (ONLY if not exists)
2. `src/battle/data/moves.js` - Add the move implementation as a new entry in the `movesToRegisterRaw` object (NOT `sketchMoves` or the frozen `movesToRegister` re-export)

**DO NOT** modify other moves or `battleConfig.js` unless explicitly asked.

## Move Structure

The move name and tier should be provided as inputs to this skill. For all other fields, they are optional, and if unprovided, you can infer them yourself.

```javascript
[moveIdEnum.MOVE_NAME]: new Move({
  id: moveIdEnum.MOVE_NAME,
  name: "Move Name",
  type: pokemonTypes.TYPE,           // FIRE, WATER, GRASS, etc.
  power: 80,                         // Base damage (null for non-damaging)
  accuracy: 100,                     // Hit chance % (null = always hits)
  cooldown: 3,                       // Turns before reusable
  targetType: targetTypes.ENEMY,     // ENEMY, ALLY, ANY
  targetPosition: targetPositions.FRONT, // FRONT, BACK, ANY, SELF, NON_SELF
  targetPattern: targetPatterns.SINGLE,  // See references/target-patterns.md
  tier: moveTiers.POWER,             // BASIC, POWER, ULTIMATE
  damageType: damageTypes.PHYSICAL,  // PHYSICAL, SPECIAL, OTHER
  description: "Move description",
  execute() { /* implementation */ },
}),
```

## Execute Context

**NOTE:** The `execute` function binds `this` to the `MoveInstance.js` `MoveInstance` class, with properties such as:

**Example Properties:**

- `this.source` - User of the move
- `this.primaryTarget` - Main target selected
- `this.allTargets` - All affected targets (based on pattern)
- `this.missedTargets` - Targets that were missed
- `this.battle` - Battle instance
- `this.power`, `this.type`, `this.id` - Move properties

## Example Generic Methods

All generic methods are available in `MoveInstance.js`. These are some common examples:

```javascript
// Deal damage to all targets
this.genericDealAllDamage();
// Returns { damageInstances: {targetId: damage}, totalDamageDealt: number }

// Custom damage calculation
this.genericDealAllDamage({
  calculateDamageFunction: (args) =>
    this.source.calculateMoveDamage(args) * 1.5,
  offTargetDamageMultiplier: 0.5,
  backTargetDamageMultiplier: 0.7,
  attackOverride: this.source.getStat("def"),
});

// Apply status (BURN, PARALYSIS, FROZEN, SLEEP, POISON)
this.genericApplyAllStatus({
  statusId: statusConditions.BURN,
  probability: 0.3,
});

// Apply effect by ID: effectIdEnum entries, or legacy effectConfig keys in battleConfig.js
this.genericApplyAllEffects({
  effectId: "atkUp",
  duration: 3,
  probability: 0.5,
});

// Single target effect
this.genericApplySingleEffect({
  target: this.primaryTarget,
  effectId: "shield",
  duration: 3,
  initialArgs: { shield: 100 },
});

// Combat readiness
this.genericChangeAllCombatReadiness({ amount: 25, action: "boost" }); // or "reduce"

// Healing
this.genericHealAllTargets({ healPercent: 25 });
this.genericHealSingleTarget({ target, healAmount: 100 });
```

## Move Tags

Optional `tags` array for ability interactions:

- `"punch"` - Boosted by Iron Fist ability
- `"slice"` - Boosted by Sharpness ability
- `"charge"` - Two-turn move

## Dynamic Move Properties

Use `overrideFields` to change properties based on context:

```javascript
overrideFields: (options) => {
  if (options.source?.speciesId === pokemonIdEnum.SPECIAL_FORM) {
    return { power: 120, description: "Enhanced version" };
  }
},
```

## Useful BattlePokemon Methods

- `pokemon.getStat("atk")` - Get effective stat
- `pokemon.hasType(pokemonTypes.FIRE)` - Check type
- `pokemon.applyEffect(id, duration, source, initialArgs)`
- `pokemon.dispellEffect(effectId)` - Remove effect
- `pokemon.removeStatus()` - Clear status condition
- `pokemon.dealDamage(amount, target, info)` - Deal damage
- `pokemon.giveHeal(amount, target, info)` - Heal
- `pokemon.boostCombatReadiness(source, amount)`
- `pokemon.getPartyPokemon()` - Get ally array
- `pokemon.isFainted` - Check if fainted

## Examples in `moves.js`

| Pattern                                 | Copy from                    |
| --------------------------------------- | ---------------------------- |
| Plain damage                            | `VINE_WHIP`                  |
| Damage plus status chance               | `FIRE_PUNCH`                 |
| Damage plus debuff                      | `ICY_WIND`, `IRON_HEAD`      |
| Buff allies                             | `COACHING`, `DEFEND_ORDER`   |
| Different debuffs for primary vs others | `FEATHER_DANCE`              |
| Conditional damage multiplier           | `FACADE`                     |
| Damage scaled by allies' types          | `AQUA_IMPACT`                |
| Attack with a different stat            | `BODY_PRESS`                 |
| Recoil                                  | `WOOD_HAMMER`, `HEAD_SMASH`  |
| Multi-hit with escalating power         | `TRIPLE_AXEL`                |
| Charge (two-turn) move                  | `SOLAR_BLADE`                |
| Combat Readiness manipulation           | `QUASH`                      |
| Healing                                 | `HEAL_ORDER`                 |
| Swap held items                         | `TRICK`, `SWITCHEROO`        |
| Fixed damage that ignores defenses      | `METAL_BURST`                |
| Fields that change with species or form | `JUDGMENT`, `HIDDEN_POWER`   |

`references/target-patterns.md` shows each `targetPatterns` value as a grid.

## Validation

1. Run `npm test -- src/battle/data/__tests__/moves.test.js`. The suite executes every registered move, so it catches crashes but not wrong damage, targets, or side effects.
2. Write at least one behavior test unless `execute()` is a single generic call with no conditions. The `write-tests` skill defines that bar and the move-test helpers.
