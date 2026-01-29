# Multi-Hit Move Pattern

Hits the target multiple times in succession.

```javascript
execute() {
  const { source, primaryTarget, extraOptions = {} } = this;
  const { currentHit = 1 } = extraOptions;

  this.genericDealAllDamage();

  if (currentHit < 3) {
    source.executeMoveAgainstTarget({
      moveId: this.id,
      primaryTarget,
      extraOptions: { currentHit: currentHit + 1 },
    });
  }
}
```

