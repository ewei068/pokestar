# Battle Start Buff Pattern

Applies buffs to allies at the start of battle.

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BATTLE_BEGIN,
      callback: () => {
        const allies = target.getPartyPokemon();
        for (const ally of allies) {
          if (ally && !ally.isFainted) {
            ally.applyEffect("atkUp", 3, target, {});
          }
        }
      },
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

