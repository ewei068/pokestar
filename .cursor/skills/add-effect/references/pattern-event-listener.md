# Effect with Event Listener Pattern

Registers an event listener that lasts for the duration of the effect.

```javascript
effectAdd({ battle, target }) {
  battle.addToLog(`${target.name} is immune to debuffs!`);
  return {
    listenerId: battle.registerListenerFunction({
      eventName: battleEventEnum.BEFORE_EFFECT_ADD,
      callback: (eventArgs) => {
        const effect = getEffect(eventArgs.effectId);
        if (effect.type === effectTypes.DEBUFF) {
          eventArgs.canAdd = false;
        }
      },
      conditionCallback: getIsTargetPokemonCallback(target),
    }),
  };
},
effectRemove({ battle, target, properties }) {
  battle.addToLog(`${target.name} is no longer immune to debuffs!`);
  battle.unregisterListener(properties.listenerId);
}
```

