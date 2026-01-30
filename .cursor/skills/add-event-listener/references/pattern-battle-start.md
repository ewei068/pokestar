# Battle Start Trigger Pattern

Triggers an effect at the start of battle.

```javascript
listenerId: this.registerListenerFunction({
  battle,
  target,
  eventName: battleEventEnum.BATTLE_BEGIN,
  callback: () => {
    battle.addToLog(`${target.name}'s ability activated!`);
    battle.setWeather(weatherConditions.RAIN, target);
  },
}),
```

