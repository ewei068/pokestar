# Trigger on Dealing Damage Pattern

Triggers an effect when the source Pokemon deals damage.

```javascript
listenerId: this.registerListenerFunction({
  battle,
  target,
  eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
  callback: ({ target: damagedTarget, source }) => {
    if (Math.random() < 0.1) {
      damagedTarget.applyEffect("flinched", 1, source, {});
    }
  },
  conditionCallback: getIsSourcePokemonCallback(target),
}),
```
