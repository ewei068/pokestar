# Charge/Two-Turn Move Test Pattern

Test both turns: first turn applies the charge effect without dealing damage, second turn deals damage and removes the charge effect.

```javascript
it("should apply charge effect and not deal damage on the first turn", () => {
  const target = getValidTargetForMove(battle, source, moveIdEnum.MOVE_NAME);
  battle.performAction({
    action: "useMove",
    moveId: moveIdEnum.MOVE_NAME,
    targetPokemonId: target.id,
  });

  expect(source).toHaveEffect("chargeEffectId");
  expect(target).not.toBeDamaged();
  expect(source.moveIds[moveIdEnum.MOVE_NAME].cooldown).toBe(0);
});

it("should deal damage and remove charge effect on the second turn", () => {
  const target = getValidTargetForMove(battle, source, moveIdEnum.MOVE_NAME);
  battle.performAction({
    action: "useMove",
    moveId: moveIdEnum.MOVE_NAME,
    targetPokemonId: target.id,
  });

  source.combatReadiness = 100;
  battle.nextTurn();
  battle.performAction({
    action: "useMove",
    moveId: moveIdEnum.MOVE_NAME,
    targetPokemonId: target.id,
  });

  expect(source).not.toHaveEffect("chargeEffectId");
  expect(target).toBeDamaged();
});
```
