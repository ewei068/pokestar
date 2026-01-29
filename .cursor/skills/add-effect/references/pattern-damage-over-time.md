# Damage Over Time (DoT) Pattern

Deals damage to the target at the end of each turn.

```javascript
effectAdd({ battle, target, source, initialArgs }) {
  const { damage } = initialArgs;
  battle.addToLog(`${target.name} is taking damage over time!`);
  return {
    listenerId: battle.registerListenerFunction({
      eventName: battleEventEnum.TURN_END,
      callback: () => {
        if (!target.isFainted) {
          source.dealDamage(damage, target, { type: "effect" });
        }
      },
    }),
  };
},
effectRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

