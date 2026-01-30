# Damage Modification Pattern

Modifies incoming or outgoing damage.

```javascript
listenerId: this.registerListenerFunction({
  battle,
  target,
  eventName: battleEventEnum.BEFORE_DAMAGE,
  callback: (args) => {
    return { damage: Math.floor(args.damage * 0.75) };
  },
  conditionCallback: getIsTargetPokemonCallback(target),
}),
```

