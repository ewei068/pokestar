# Deal True Damage (Ignores Defense) Pattern

Deals damage that bypasses defense calculations.

```javascript
execute() {
  const { source, primaryTarget, missedTargets } = this;

  if (!missedTargets.includes(primaryTarget)) {
    const trueDamage = Math.floor(primaryTarget.getStat("atk") * 0.75);
    source.dealDamage(trueDamage, primaryTarget, {
      type: "move",
      moveId: this.id,
      instance: this,
    });
  }
}
```

