# Trigger on Damage Taken Pattern

Triggers an effect when the holder takes damage (e.g., healing berry at low HP).

```javascript
itemAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
      callback: ({ heldItemInstance }) => {
        if (target.hp < target.maxHp * 0.25) {
          target.useHeldItem();
        }
      },
      conditionCallback: getIsTargetPokemonCallback(target),
    }),
  };
},
itemRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
},
itemUse({ battle, target }) {
  battle.addToLog(`${target.name}'s item activated!`);
  target.giveHeal(Math.floor(target.maxHp * 0.25), target, {});
}
```

