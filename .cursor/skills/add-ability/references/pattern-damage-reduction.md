# Damage Reduction Pattern

Reduces incoming damage when the target Pokemon is hit by a move.

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BEFORE_DAMAGE,
      callback: (args) => {
        return { damage: Math.floor(args.damage * 0.75) };
      },
      conditionCallback: composeConditionCallbacks(
        getIsTargetPokemonCallback(target),
        getIsInstanceOfType("move"),
      ),
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

