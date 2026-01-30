# Turn-Based Trigger Pattern

Triggers an effect at the end of each turn.

```javascript
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
```

