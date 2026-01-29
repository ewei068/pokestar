# Prevent Effect Application Pattern

Prevents specific effects from being applied to the target.

```javascript
listenerId: battle.registerListenerFunction({
  eventName: battleEventEnum.BEFORE_EFFECT_ADD,
  callback: (args) => {
    const effect = getEffect(args.effectId);
    if (effect.type === effectTypes.DEBUFF) {
      args.canAdd = false;
    }
  },
  conditionCallback: getIsTargetPokemonCallback(target),
}),
```

