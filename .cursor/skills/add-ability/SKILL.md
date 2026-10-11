---
name: add-ability
description: Add Pokemon abilities to the battle system. Use when implementing passive abilities that trigger on events.
---

# Adding Abilities

## Steps

1. Add `abilityIdEnum.YOUR_ABILITY` to `src/enums/battleEnums.js` if it isn't there yet.
2. Find the closest existing ability in the examples table below and read its implementation in `src/battle/data/abilities.js`.
3. Add the new entry to `abilitiesToRegister` in `src/battle/data/abilities.js`, following the listener rules in the "Event Listeners" section of `src/battle/README.md`.
4. Run `npm test -- src/battle/data/__tests__/abilities.test.js`. The suite applies and removes every registered ability, so it catches crashes but not wrong behavior.
5. Write at least one behavior test unless the ability is a single generic listener (see the `write-tests` skill).

Leave other abilities and `battleConfig.js` unchanged.

## Shape

```javascript
[abilityIdEnum.ABILITY_NAME]: new Ability({
  id: abilityIdEnum.ABILITY_NAME,
  name: "Ability Name",
  description: "What the ability does",
  abilityAdd({ battle, target }) {
    return {
      listenerId: this.registerListenerFunction({
        battle,
        target,
        eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
        callback: ({ abilityInstance }) => {
          // abilityInstance.data is the object abilityAdd returned
        },
        conditionCallback: getIsSourcePokemonCallback(target),
      }),
    };
  },
  abilityRemove({ battle, properties }) {
    battle.unregisterListener(properties.listenerId);
  },
}),
```

## Examples in `abilities.js`

| Pattern                                   | Copy from                     |
| ----------------------------------------- | ----------------------------- |
| Buff self at battle start                 | `DOWNLOAD`                    |
| Set weather at battle start               | `SNOW_WARNING`, `MAGMA_POWER` |
| Punish attackers on contact               | `ROUGH_SKIN`, `FLAME_BODY`    |
| Boost damage of tagged moves              | `IRON_FIST`, `SHARPNESS`      |
| Reduce incoming damage                    | `FRIEND_GUARD`                |
| Chance to apply an effect on hit          | `STENCH`                      |
| Stat boost when hit                       | `ANGER_POINT`                 |
| Block status conditions                   | `OVERCOAT`                    |
| Absorb a type and gain a buff             | `MOTOR_DRIVE`                 |
| Turn-end healing or damage                | `REGENERATOR`, `BAD_DREAMS`   |
| React to weather changes                  | `JET_SPEED`, `DRY_SKIN`       |
| Trigger on faint                          | `AFTERMATH`                   |
| Ignore damage and debuffs from allies     | `TELEPATHY`                   |
| Several listeners with shared state       | `ALPHA_CORE`                  |
