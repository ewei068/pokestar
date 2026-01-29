# Status Cure Berry Pattern

Automatically cures status conditions when applied to the holder.

```javascript
itemAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.AFTER_STATUS_APPLY,
      callback: () => {
        target.useHeldItem();
      },
      conditionCallback: getIsTargetPokemonCallback(target),
    }),
  };
},
itemRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
},
itemUse({ battle, target }) {
  battle.addToLog(`${target.name}'s berry cured its status!`);
  target.removeStatus();
},
tags: ["berry", "usable"],
```

