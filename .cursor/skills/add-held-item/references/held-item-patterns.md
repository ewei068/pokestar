# Common Held Item Patterns

## Passive Stat Boost

```javascript
itemAdd({ battle, target }) {
  target.addStatMult("atk", 0.5);
  return {};
},
itemRemove({ battle, target }) {
  target.addStatMult("atk", -0.5);
}
```

## Trigger on Damage Taken

```javascript
itemAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
      callback: ({ heldItemInstance }) => {
        if (target.hp < target.maxHp * 0.25) {
          target.useHeldItem();
        }
      },
      conditionCallback: getIsTargetPokemonCallback(target),
    }),
  };
},
itemRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
},
itemUse({ battle, target }) {
  battle.addToLog(`${target.name}'s item activated!`);
  target.giveHeal(Math.floor(target.maxHp * 0.25), target, {});
}
```

## Choice Item Pattern

Use the built-in helper for choice items:

```javascript
itemAdd(args) {
  return this.applyChoiceItemWithBuff(args, (target) => {
    target.addStatMult("atk", 0.5);
  });
},
itemRemove(args) {
  this.removeChoiceItemWithBuff(args, (target) => {
    target.addStatMult("atk", -0.5);
  });
}
```

## Focus Sash Pattern (One-Time Survival)

```javascript
itemAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BEFORE_DAMAGE,
      callback: ({ damage, heldItemInstance }) => {
        if (target.hp === target.maxHp && damage >= target.hp) {
          battle.addToLog(`${target.name} held on with Focus Sash!`);
          target.useHeldItem();
          return { damage: target.hp - 1 };
        }
      },
      conditionCallback: getIsTargetPokemonCallback(target),
    }),
  };
},
itemRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

## Damage Reflection

```javascript
itemAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
      callback: ({ damage, source }) => {
        if (source && source !== target) {
          const reflectDamage = Math.floor(damage * 0.16);
          target.dealDamage(reflectDamage, source, { type: "heldItem" });
        }
      },
      conditionCallback: composeConditionCallbacks(
        getIsTargetPokemonCallback(target),
        getIsInstanceOfType("move"),
      ),
    }),
  };
},
itemRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

## Leftovers Pattern (Turn-Based Healing)

```javascript
itemAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.TURN_END,
      callback: () => {
        if (!target.isFainted) {
          target.giveHeal(Math.floor(target.maxHp * 0.0625), target, {});
        }
      },
    }),
  };
},
itemRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

## Life Orb Pattern (Damage Boost with Recoil)

```javascript
itemAdd({ battle, target }) {
  return {
    damageListenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BEFORE_DAMAGE,
      callback: (args) => {
        return { damage: Math.floor(args.damage * 1.3) };
      },
      conditionCallback: composeConditionCallbacks(
        getIsSourcePokemonCallback(target),
        getIsInstanceOfType("move"),
      ),
    }),
    recoilListenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.AFTER_MOVE,
      callback: () => {
        target.dealDamage(Math.floor(target.maxHp * 0.1), target, { type: "heldItem" });
      },
      conditionCallback: getIsSourcePokemonCallback(target),
    }),
  };
},
itemRemove({ battle, properties }) {
  battle.unregisterListener(properties.damageListenerId);
  battle.unregisterListener(properties.recoilListenerId);
}
```

## Status Cure Berry

```javascript
itemAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.AFTER_STATUS_APPLY,
      callback: () => {
        target.useHeldItem();
      },
      conditionCallback: getIsTargetPokemonCallback(target),
    }),
  };
},
itemRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
},
itemUse({ battle, target }) {
  battle.addToLog(`${target.name}'s berry cured its status!`);
  target.removeStatus();
},
tags: ["berry", "usable"],
```

