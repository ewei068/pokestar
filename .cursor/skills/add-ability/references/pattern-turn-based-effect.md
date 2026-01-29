# Turn-Based Effect Pattern

Triggers an effect at the end of each turn.

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.TURN_END,
      callback: () => {
        if (!target.isFainted) {
          target.boostCombatReadiness(target, 10);
        }
      },
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

