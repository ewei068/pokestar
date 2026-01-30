# After Move Trigger Pattern

Triggers an effect after a move is executed.

```javascript
listenerId: this.registerListenerFunction({
  battle,
  target,
  eventName: battleEventEnum.AFTER_MOVE,
  callback: ({ moveId }) => {
    const move = getMove(moveId);
    if (move?.tier === moveTiers.ULTIMATE) {
      target.boostCombatReadiness(target, 20);
    }
  },
  conditionCallback: getIsSourcePokemonCallback(target),
}),
```

