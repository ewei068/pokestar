# Charge Move (Two-Turn) Pattern

Move that charges on the first turn and executes on the second.

```javascript
// In Move definition:
tags: ["charge"],
chargeMoveEffectId: effectIdEnum.SOME_CHARGE_EFFECT,
silenceIf(battle, pokemon) {
  return pokemon.effectIds.someChargeEffect === undefined;
},
execute() {
  const { source } = this;
  if (source.effectIds.someChargeEffect === undefined) {
    // First turn: charge up
    source.applyEffect("someChargeEffect", 1, source, {});
    source.moveIds[this.id].cooldown = 0;
  } else {
    // Second turn: execute
    source.removeEffect("someChargeEffect");
    this.genericDealAllDamage();
  }
}
```

