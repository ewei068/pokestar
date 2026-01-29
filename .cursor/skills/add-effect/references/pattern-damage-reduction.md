# Damage Reduction Effect Pattern

Reduces incoming damage while the effect is active.

```javascript
effectAdd({ battle, target }) {
  return {
    listenerId: battle.registerListenerFunction({
      eventName: battleEventEnum.BEFORE_DAMAGE,
      callback: (args) => {
        return { damage: Math.floor(args.damage * 0.5) };
      },
      conditionCallback: getIsTargetPokemonCallback(target),
    }),
  };
},
effectRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

