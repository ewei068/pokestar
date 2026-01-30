# Stat Boost Pattern

Passively modifies a stat while the ability is active.

```javascript
abilityAdd({ battle, target }) {
  target.addStatMult("spe", 0.5);
  return {};
},
abilityRemove({ battle, target }) {
  target.addStatMult("spe", -0.5);
}
```

