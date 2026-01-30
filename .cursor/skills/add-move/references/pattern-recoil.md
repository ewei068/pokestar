# Recoil Damage Pattern

Deals damage but causes recoil damage to the user based on damage dealt.

```javascript
execute() {
  const { totalDamageDealt } = this.genericDealAllDamage();
  this.source.dealDamage(Math.floor(totalDamageDealt * 0.33), this.source, {
    type: "recoil",
  });
}
```

