# Damage Reflection Pattern

Reflects a portion of damage taken back to the attacker.

```javascript
itemAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
      callback: ({ damage, source }) => {
        if (source && source !== target) {
          const reflectDamage = Math.floor(damage * 0.16);
          target.dealDamage(reflectDamage, source, { type: "heldItem" });
        }
      },
      conditionCallback: composeConditionCallbacks(
        getIsTargetPokemonCallback(target),
        getIsInstanceOfType("move"),
      ),
    }),
  };
},
itemRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

