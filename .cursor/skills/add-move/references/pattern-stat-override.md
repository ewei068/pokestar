# Use Different Stat for Damage Pattern

Uses an alternative stat for damage calculation (e.g., Body Press uses Defense).

```javascript
execute() {
  // Body Press uses Defense instead of Attack
  this.genericDealAllDamage({
    attackOverride: this.source.getStat("def"),
  });
}
```

