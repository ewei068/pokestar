# Conditional Damage Boost Pattern

Modifies damage based on a condition (e.g., target's HP).

```javascript
execute() {
  this.genericDealAllDamage({
    calculateDamageFunction: (args) => {
      const baseDamage = this.source.calculateMoveDamage(args);
      // Deal 1.5x damage if target is not at full HP
      if (args.target.hp < args.target.maxHp) {
        return Math.floor(baseDamage * 1.5);
      }
      return baseDamage;
    },
  });
}
```

