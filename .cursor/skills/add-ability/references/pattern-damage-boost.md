# Damage Boost on Move Tag Pattern

Boosts damage when the source Pokemon uses a move with a specific tag.

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BEFORE_DAMAGE,
      callback: (args) => {
        if (getMoveIdHasTag(args.moveId, "punch")) {
          return { damage: Math.floor(args.damage * 1.2) };
        }
      },
      conditionCallback: getIsSourcePokemonCallback(target),
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

