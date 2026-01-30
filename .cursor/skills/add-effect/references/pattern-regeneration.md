# Regeneration Effect Pattern

Heals the target at the end of each turn.

```javascript
effectAdd({ battle, target, initialArgs }) {
  const { healAmount } = initialArgs;
  return {
    listenerId: battle.registerListenerFunction({
      eventName: battleEventEnum.TURN_END,
      callback: () => {
        if (!target.isFainted) {
          target.giveHeal(healAmount, target, {});
        }
      },
    }),
  };
},
effectRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

