# Contact Punishment Pattern

Punishes attackers when they hit the ability holder (e.g., chance to paralyze on contact).

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
      callback: ({ source }) => {
        if (source && source !== target && Math.random() < 0.3) {
          source.applyStatus(statusConditions.PARALYSIS, target);
        }
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

