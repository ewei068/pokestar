# Shield Effect Pattern

Applies a damage-absorbing shield to the target.

```javascript
effectAdd({ battle, target, initialArgs }) {
  const { shield } = initialArgs;
  battle.addToLog(`${target.name} is shielded for ${shield} damage!`);
  return { shield };
},
effectRemove({ battle, target }) {
  battle.addToLog(`${target.name}'s shield was removed!`);
}
```

