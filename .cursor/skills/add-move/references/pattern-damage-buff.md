# Damage + Buff/Debuff Pattern

Deals damage and applies an effect (buff or debuff) with a probability.

```javascript
execute() {
  this.genericDealAllDamage();
  this.genericApplyAllEffects({
    effectId: "flinched",
    duration: 1,
    probability: 0.3,
  });
}
```

