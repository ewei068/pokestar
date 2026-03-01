# Spying on Method Calls Test Pattern

Use `jest.spyOn` to verify how many times a method is called or with what arguments.

```javascript
const takeDamageSpy = jest.spyOn(target, "takeDamage");
battle.performAction({
  action: "useMove",
  moveId: moveIdEnum.MOVE_NAME,
  targetPokemonId: target.id,
});
expect(takeDamageSpy).toHaveBeenCalledTimes(3);
```
