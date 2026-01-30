# Damage + Status Effect Pattern

Deals damage and applies a status condition with a probability.

```javascript
execute() {
  this.genericDealAllDamage();
  this.genericApplyAllStatus({
    statusId: statusConditions.BURN,
    probability: 0.3,
  });
}
```

