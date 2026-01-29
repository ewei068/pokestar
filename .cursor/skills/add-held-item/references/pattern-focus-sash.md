# Focus Sash Pattern (One-Time Survival)

Allows the holder to survive a fatal hit once if at full HP.

```javascript
itemAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BEFORE_DAMAGE,
      callback: ({ damage, heldItemInstance }) => {
        if (target.hp === target.maxHp && damage >= target.hp) {
          battle.addToLog(`${target.name} held on with Focus Sash!`);
          target.useHeldItem();
          return { damage: target.hp - 1 };
        }
      },
      conditionCallback: getIsTargetPokemonCallback(target),
    }),
  };
},
itemRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

