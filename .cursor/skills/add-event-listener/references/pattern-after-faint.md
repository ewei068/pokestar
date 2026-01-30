# After Faint Trigger Pattern

Triggers an effect when a Pokemon on the same team faints.

```javascript
listenerId: this.registerListenerFunction({
  battle,
  target,
  eventName: battleEventEnum.AFTER_FAINT,
  callback: ({ target: faintedTarget }) => {
    const allies = target.getPartyPokemon();
    for (const ally of allies) {
      if (ally && !ally.isFainted) {
        ally.applyEffect("atkUp", 3, target, {});
      }
    }
  },
  conditionCallback: getIsTargetSameTeamCallback(target),
}),
```

