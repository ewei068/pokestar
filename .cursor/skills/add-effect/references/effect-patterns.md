# Common Effect Patterns

## Stat Modification Effect

```javascript
effectAdd({ battle, target }) {
  battle.addToLog(`${target.name}'s Attack rose!`);
  target.addStatMult("atk", 0.5);
},
effectRemove({ battle, target }) {
  battle.addToLog(`${target.name}'s Attack boost wore off!`);
  target.addStatMult("atk", -0.5);
}
```

## Shield Effect

```javascript
effectAdd({ battle, target, initialArgs }) {
  const { shield } = initialArgs;
  battle.addToLog(`${target.name} is shielded for ${shield} damage!`);
  return { shield };
},
effectRemove({ battle, target }) {
  battle.addToLog(`${target.name}'s shield was removed!`);
}
```

## Effect with Event Listener

```javascript
effectAdd({ battle, target }) {
  battle.addToLog(`${target.name} is immune to debuffs!`);
  return {
    listenerId: battle.registerListenerFunction({
      eventName: battleEventEnum.BEFORE_EFFECT_ADD,
      callback: (eventArgs) => {
        const effect = getEffect(eventArgs.effectId);
        if (effect.type === effectTypes.DEBUFF) {
          eventArgs.canAdd = false;
        }
      },
      conditionCallback: getIsTargetPokemonCallback(target),
    }),
  };
},
effectRemove({ battle, target, properties }) {
  battle.addToLog(`${target.name} is no longer immune to debuffs!`);
  battle.unregisterListener(properties.listenerId);
}
```

## Damage Over Time (DoT)

```javascript
effectAdd({ battle, target, source, initialArgs }) {
  const { damage } = initialArgs;
  battle.addToLog(`${target.name} is taking damage over time!`);
  return {
    listenerId: battle.registerListenerFunction({
      eventName: battleEventEnum.TURN_END,
      callback: () => {
        if (!target.isFainted) {
          source.dealDamage(damage, target, { type: "effect" });
        }
      },
    }),
  };
},
effectRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

## Regeneration Effect

```javascript
effectAdd({ battle, target, initialArgs }) {
  const { healAmount } = initialArgs;
  return {
    listenerId: battle.registerListenerFunction({
      eventName: battleEventEnum.TURN_END,
      callback: () => {
        if (!target.isFainted) {
          target.giveHeal(healAmount, target, {});
        }
      },
    }),
  };
},
effectRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

## Damage Reduction Effect

```javascript
effectAdd({ battle, target }) {
  return {
    listenerId: battle.registerListenerFunction({
      eventName: battleEventEnum.BEFORE_DAMAGE,
      callback: (args) => {
        return { damage: Math.floor(args.damage * 0.5) };
      },
      conditionCallback: getIsTargetPokemonCallback(target),
    }),
  };
},
effectRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

## Move Lock Effect (Encore)

```javascript
effectAdd({ battle, target, initialArgs }) {
  const { moveId } = initialArgs;
  for (const id of target.getMoveIds()) {
    if (id !== moveId) {
      target.disableMove(id, target);
    }
  }
  return { disabledMoves: target.getMoveIds().filter(id => id !== moveId) };
},
effectRemove({ battle, target, properties }) {
  for (const moveId of properties.disabledMoves) {
    target.enableMove(moveId, target);
  }
}
```
