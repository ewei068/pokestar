# Leftovers Pattern (Turn-Based Healing)

Heals the holder at the end of each turn.

```javascript
itemAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.TURN_END,
      callback: () => {
        if (!target.isFainted) {
          target.giveHeal(Math.floor(target.maxHp * 0.0625), target, {});
        }
      },
    }),
  };
},
itemRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

