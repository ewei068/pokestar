# Secondary Effect on Hit Pattern

Applies a secondary effect (like flinch) when the source Pokemon deals damage.

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
      callback: ({ target: damagedTarget, source }) => {
        if (Math.random() < 0.1) {
          damagedTarget.applyEffect("flinched", 1, source, {});
        }
      },
      conditionCallback: getIsSourcePokemonCallback(target),
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

