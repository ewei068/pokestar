# Multiple Listeners Pattern

When you need multiple listeners, store each ID separately.

```javascript
return {
  damageListenerId: this.registerListenerFunction({
    battle,
    target,
    eventName: battleEventEnum.BEFORE_DAMAGE,
    callback: (args) => {
      /* ... */
    },
    conditionCallback: getIsSourcePokemonCallback(target),
  }),
  turnListenerId: this.registerListenerFunction({
    battle,
    target,
    eventName: battleEventEnum.TURN_END,
    callback: () => {
      /* ... */
    },
  }),
};

// In remove:
battle.unregisterListener(properties.damageListenerId);
battle.unregisterListener(properties.turnListenerId);
```

