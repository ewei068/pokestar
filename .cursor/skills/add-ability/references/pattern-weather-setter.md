# Weather Setter Pattern

Sets weather at the start of battle.

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BATTLE_BEGIN,
      callback: () => {
        battle.setWeather(weatherConditions.RAIN, target);
        battle.addToLog(`${target.name}'s ability caused it to rain!`);
      },
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

