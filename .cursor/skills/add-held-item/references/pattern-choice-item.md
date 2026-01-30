# Choice Item Pattern

Use the built-in helper for choice items that boost a stat but lock the holder into one move.

```javascript
itemAdd(args) {
  return this.applyChoiceItemWithBuff(args, (target) => {
    target.addStatMult("atk", 0.5);
  });
},
itemRemove(args) {
  this.removeChoiceItemWithBuff(args, (target) => {
    target.addStatMult("atk", -0.5);
  });
}
```

