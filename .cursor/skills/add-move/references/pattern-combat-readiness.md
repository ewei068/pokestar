# Combat Readiness Manipulation Pattern

Reduces enemy combat readiness and applies speed debuffs.

```javascript
execute() {
  // Reduce enemy CR to 0
  this.genericChangeAllCombatReadiness({
    amount: 100,
    action: "reduce",
  });
  // Apply speed debuff
  this.genericApplyAllEffects({
    effectId: "greaterSpeDown",
    duration: 1,
  });
}
```

