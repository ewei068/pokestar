# Status Prevention Pattern

Prevents a specific status condition from being applied.

```javascript
abilityAdd({ battle, target }) {
  return {
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
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

