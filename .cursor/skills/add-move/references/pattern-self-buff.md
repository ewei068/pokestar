# Self-Buff Move Pattern

Applies buffs to the user and/or boosts combat readiness.

```javascript
execute() {
  this.genericApplyAllEffects({ effectId: "atkUp", duration: 3 });
  this.genericChangeAllCombatReadiness({ amount: 50, action: "boost" });
}
```

