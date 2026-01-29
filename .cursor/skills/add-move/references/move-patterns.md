# Common Move Implementation Patterns

Code patterns for implementing different types of moves.

## Basic Damage Move

```javascript
execute() {
  this.genericDealAllDamage();
}
```

## Damage + Status Effect

```javascript
execute() {
  this.genericDealAllDamage();
  this.genericApplyAllStatus({
    statusId: statusConditions.BURN,
    probability: 0.3,
  });
}
```

## Damage + Buff/Debuff

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

## Self-Buff Move

```javascript
execute() {
  this.genericApplyAllEffects({ effectId: "atkUp", duration: 3 });
  this.genericChangeAllCombatReadiness({ amount: 50, action: "boost" });
}
```

## Healing Move

```javascript
execute() {
  this.genericHealAllTargets({ healPercent: 25 });
}
```

## Recoil Damage

```javascript
execute() {
  const { totalDamageDealt } = this.genericDealAllDamage();
  this.source.dealDamage(Math.floor(totalDamageDealt * 0.33), this.source, {
    type: "recoil",
  });
}
```

## Conditional Damage Boost

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

## Use Different Stat for Damage

```javascript
execute() {
  // Body Press uses Defense instead of Attack
  this.genericDealAllDamage({
    attackOverride: this.source.getStat("def"),
  });
}
```

## Multi-Hit Move

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

## Charge Move (Two-Turn)

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

## Combat Readiness Manipulation

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

## Swap Held Items

```javascript
execute() {
  const { battle, source, primaryTarget } = this;
  const sourceHeldItemId = source.heldItem?.heldItemId;
  const targetHeldItemId = primaryTarget.heldItem?.heldItemId;

  source.removeHeldItem();
  primaryTarget.removeHeldItem();
  source.setHeldItem(targetHeldItemId);
  primaryTarget.setHeldItem(sourceHeldItemId);
  source.applyHeldItem();
  primaryTarget.applyHeldItem();

  battle.addToLog(`${source.name} switched items with ${primaryTarget.name}!`);
}
```

## Buff Allies Based on Type

```javascript
execute() {
  const { source } = this;
  const allies = source.getPartyPokemon().filter(p =>
    p && !p.isFainted && p.hasType(pokemonTypes.FIRE)
  );

  for (const ally of allies) {
    ally.applyEffect("atkUp", 3, source, {});
  }
}
```

## Deal True Damage (Ignores Defense)

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
