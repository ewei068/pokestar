# Type-Based Immunity Pattern

Grants immunity to a specific type and applies a beneficial effect when hit.

```javascript
listenerId: this.registerListenerFunction({
  battle,
  target,
  eventName: battleEventEnum.BEFORE_DAMAGE,
  callback: (args) => {
    const move = getMove(args.moveId);
    if (move?.type === pokemonTypes.WATER) {
      battle.addToLog(`${target.name} absorbed the Water move!`);
      target.giveHeal(Math.floor(target.maxHp * 0.25), target, {});
      return { damage: 0 };
    }
  },
  conditionCallback: getIsTargetPokemonCallback(target),
}),
```

