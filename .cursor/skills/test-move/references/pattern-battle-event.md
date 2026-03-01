# Battle Event Listener Test Pattern

Register a listener to verify that specific battle events are emitted during a move.

```javascript
const callback = jest.fn(({ target }) => {
  expect(target).toBe(expectedTarget);
});
battle.registerListenerFunction({
  eventName: battleEventEnum.AFTER_CR_GAINED,
  callback,
});
useMoveOnValidTarget(battle, source, moveIdEnum.MOVE_NAME);
expect(callback).toHaveBeenCalled();
```
