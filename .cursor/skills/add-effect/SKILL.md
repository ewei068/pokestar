---
name: add-effect
description: Add battle effects (buffs, debuffs, shields) to the battle system. Use when creating temporary status modifiers.
---

# Adding Effects

## Steps

1. Add `effectIdEnum.YOUR_EFFECT` to `src/enums/battleEnums.js` if it isn't there yet.
2. Check whether the effect already exists. Most effects still live in the legacy `effectConfig` in `src/config/battleConfig.js`; moves apply those by string ID (`"atkUp"`, `"leechSeed"`), so a missing enum entry doesn't mean a missing effect.
3. Find the closest existing effect in the examples table below and read its implementation.
4. Add the new entry to `effectsToRegister` in `src/battle/data/effects.js`, following the listener rules in the "Event Listeners" section of `src/battle/README.md`. Effects register listeners with `battle.registerListenerFunction` directly, because they have no class-level helper.
5. Run `npm test -- src/battle/data/__tests__/effects.test.js`. The suite applies and removes every registered effect, so it catches crashes but not wrong behavior.
6. Write at least one behavior test unless the effect only modifies a stat (see the `write-tests` skill).

Leave other effects and `battleConfig.js` unchanged.

## Shape

```javascript
[effectIdEnum.EFFECT_NAME]: new Effect({
  id: effectIdEnum.EFFECT_NAME,
  name: "Effect Name",
  description: "What the effect does",
  type: effectTypes.BUFF, // BUFF, DEBUFF, or NEUTRAL
  dispellable: true,
  effectAdd({ battle, target, source, initialArgs }) {
    return {
      listenerId: battle.registerListenerFunction({
        eventName: battleEventEnum.BEFORE_DAMAGE_TAKEN,
        callback: ({ damage }) => ({ damage: Math.floor(damage * 0.5) }),
        conditionCallback: getIsTargetPokemonCallback(target),
      }),
    };
  },
  effectRemove({ battle, properties }) {
    battle.unregisterListener(properties.listenerId);
  },
}),
```

`initialArgs` comes from whoever applied the effect (for example `{ shield: 100 }`) and stays available in both `effectAdd` and `effectRemove`. `dispellable: false` keeps the effect through dispel moves and abilities.

## Examples

| Pattern                               | Copy from                                      |
| ------------------------------------- | ---------------------------------------------- |
| Stat modification                     | `ATK_UP` in `effects.js`                       |
| Damage-absorbing shield               | `SHIELD` in `effects.js`                       |
| Block other effects from applying     | `DEBUFF_IMMUNITY` in `effects.js`              |
| Lock the target into one move         | `ENCORE` in `effects.js`                       |
| Delayed damage when the effect ends   | `DOOM_DESIRE` in `effects.js`                  |
| Damage over time with drain           | `leechSeed` in `battleConfig.js` (legacy)      |
| Turn-end regeneration                 | `regeneration` in `battleConfig.js` (legacy)   |
| Damage reduction for allies           | `wideGuard` in `battleConfig.js` (legacy)      |
