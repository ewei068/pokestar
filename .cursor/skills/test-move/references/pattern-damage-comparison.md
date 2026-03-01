# Damage Comparison (Clone) Test Pattern

Clone the battle to compare damage under different conditions on the same setup.

```javascript
it("should deal more damage under condition X", () => {
  const target = getValidTargetForMove(battle, source, moveIdEnum.MOVE_NAME);
  target.hp = VERY_HIGH_HP;
  target.maxHp = VERY_HIGH_HP;
  battle.performAction({
    action: "useMove",
    moveId: moveIdEnum.MOVE_NAME,
    targetPokemonId: target.id,
  });
  const normalDamage = VERY_HIGH_HP - target.hp;

  battle.initialParams.id = battle.id;
  const clone = battle.cloneAndReset();
  clone.start();
  // ... setup condition on clone, use move, compare damage
});
```
