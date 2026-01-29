# Status Prevention Pattern

Prevents specific status conditions from being applied.

```javascript
listenerId: this.registerListenerFunction({
  battle,
  target,
  eventName: battleEventEnum.BEFORE_STATUS_APPLY,
  callback: (args) => {
    if (args.statusId === statusConditions.PARALYSIS) {
      args.canApply = false;
      battle.addToLog(`${target.name}'s ability prevents paralysis!`);
    }
  },
  conditionCallback: getIsTargetPokemonCallback(target),
}),
```

