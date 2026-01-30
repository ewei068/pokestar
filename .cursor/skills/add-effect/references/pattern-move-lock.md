# Move Lock Effect Pattern (Encore)

Locks the target into using a specific move by disabling all other moves.

```javascript
effectAdd({ battle, target, initialArgs }) {
  const { moveId } = initialArgs;
  for (const id of target.getMoveIds()) {
    if (id !== moveId) {
      target.disableMove(id, target);
    }
  }
  return { disabledMoves: target.getMoveIds().filter(id => id !== moveId) };
},
effectRemove({ battle, target, properties }) {
  for (const moveId of properties.disabledMoves) {
    target.enableMove(moveId, target);
  }
}
```

