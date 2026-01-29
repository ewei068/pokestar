# Stat Modification Effect Pattern

Modifies a stat while the effect is active.

```javascript
effectAdd({ battle, target }) {
  battle.addToLog(`${target.name}'s Attack rose!`);
  target.addStatMult("atk", 0.5);
},
effectRemove({ battle, target }) {
  battle.addToLog(`${target.name}'s Attack boost wore off!`);
  target.addStatMult("atk", -0.5);
}
```

