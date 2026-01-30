# Before Move Trigger Pattern

Triggers an effect before a move is executed.

```javascript
listenerId: this.registerListenerFunction({
  battle,
  target,
  eventName: battleEventEnum.BEFORE_MOVE,
  callback: ({ moveId, source }) => {
    const move = getMove(moveId);
    if (move?.type === pokemonTypes.FIRE) {
      source.applyEffect("atkUp", 1, source, {});
    }
  },
  conditionCallback: getIsSourcePokemonCallback(target),
}),
```

