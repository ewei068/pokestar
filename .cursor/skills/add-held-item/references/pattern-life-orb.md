# Life Orb Pattern (Damage Boost with Recoil)

Boosts damage dealt but causes recoil damage to the holder.

```javascript
itemAdd({ battle, target }) {
  return {
    damageListenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BEFORE_DAMAGE,
      callback: (args) => {
        return { damage: Math.floor(args.damage * 1.3) };
      },
      conditionCallback: composeConditionCallbacks(
        getIsSourcePokemonCallback(target),
        getIsInstanceOfType("move"),
      ),
    }),
    recoilListenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.AFTER_MOVE,
      callback: () => {
        target.dealDamage(Math.floor(target.maxHp * 0.1), target, { type: "heldItem" });
      },
      conditionCallback: getIsSourcePokemonCallback(target),
    }),
  };
},
itemRemove({ battle, properties }) {
  battle.unregisterListener(properties.damageListenerId);
  battle.unregisterListener(properties.recoilListenerId);
}
```

