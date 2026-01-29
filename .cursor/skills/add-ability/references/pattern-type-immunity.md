# Type Immunity with Heal Pattern

Grants immunity to a specific type and heals the Pokemon when hit by that type.

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BEFORE_DAMAGE,
      callback: (args) => {
        const move = getMove(args.moveId);
        if (move?.type === pokemonTypes.WATER) {
          battle.addToLog(`${target.name} absorbed the Water move!`);
          target.giveHeal(Math.floor(target.maxHp * 0.25), target, {});
          return { damage: 0 };
        }
      },
      conditionCallback: getIsTargetPokemonCallback(target),
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

