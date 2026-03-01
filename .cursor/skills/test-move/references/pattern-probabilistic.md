# Probabilistic Status/Effect Test Pattern

Use the `describeStatusProbability` and `describeEffectProbability` test generators to auto-generate tests for probabilistic triggers.

```javascript
describeStatusProbability({
  statusId: statusConditions.BURN,
  probability: 0.5,
  setup: (rngValue) => {
    battle.rng = jest.fn().mockReturnValue(rngValue);
    source.acc = HIGH_ACCURACY;
    const target = useMoveOnValidTarget(battle, source, moveIdEnum.MOVE_NAME);
    return { target };
  },
});

describeEffectProbability({
  effectId: "confused",
  probability: 0.25,
  setup: (rngValue) => {
    battle.rng = jest.fn().mockReturnValue(rngValue);
    source.acc = HIGH_ACCURACY;
    const target = useMoveOnValidTarget(battle, source, moveIdEnum.MOVE_NAME);
    return { target };
  },
});
```
