# Passive Stat Boost Pattern

Passively modifies a stat while the item is held.

```javascript
itemAdd({ battle, target }) {
  target.addStatMult("atk", 0.5);
  return {};
},
itemRemove({ battle, target }) {
  target.addStatMult("atk", -0.5);
}
```

