# Common Ability Patterns

## Offensive Abilities

### Damage Boost on Move Tag

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BEFORE_DAMAGE,
      callback: (args) => {
        if (getMoveIdHasTag(args.moveId, "punch")) {
          return { damage: Math.floor(args.damage * 1.2) };
        }
      },
      conditionCallback: getIsSourcePokemonCallback(target),
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

### Secondary Effect on Hit

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
      callback: ({ target: damagedTarget, source }) => {
        if (Math.random() < 0.1) {
          damagedTarget.applyEffect("flinched", 1, source, {});
        }
      },
      conditionCallback: getIsSourcePokemonCallback(target),
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

## Defensive Abilities

### Damage Reduction

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BEFORE_DAMAGE,
      callback: (args) => {
        return { damage: Math.floor(args.damage * 0.75) };
      },
      conditionCallback: composeConditionCallbacks(
        getIsTargetPokemonCallback(target),
        getIsInstanceOfType("move"),
      ),
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

### Type Immunity with Heal

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BEFORE_DAMAGE,
      callback: (args) => {
        const move = getMove(args.moveId);
        if (move?.type === pokemonTypes.WATER) {
          battle.addToLog(`${target.name} absorbed the Water move!`);
          target.giveHeal(Math.floor(target.maxHp * 0.25), target, {});
          return { damage: 0 };
        }
      },
      conditionCallback: getIsTargetPokemonCallback(target),
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

### Contact Punishment

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
      callback: ({ source }) => {
        if (source && source !== target && Math.random() < 0.3) {
          source.applyStatus(statusConditions.PARALYSIS, target);
        }
      },
      conditionCallback: composeConditionCallbacks(
        getIsTargetPokemonCallback(target),
        getIsInstanceOfType("move"),
      ),
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

## Support Abilities

### Battle Start Buff

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BATTLE_BEGIN,
      callback: () => {
        const allies = target.getPartyPokemon();
        for (const ally of allies) {
          if (ally && !ally.isFainted) {
            ally.applyEffect("atkUp", 3, target, {});
          }
        }
      },
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

### Weather Setter

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BATTLE_BEGIN,
      callback: () => {
        battle.setWeather(weatherConditions.RAIN, target);
        battle.addToLog(`${target.name}'s ability caused it to rain!`);
      },
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

## Passive Abilities

### Stat Boost

```javascript
abilityAdd({ battle, target }) {
  target.addStatMult("spe", 0.5);
  return {};
},
abilityRemove({ battle, target }) {
  target.addStatMult("spe", -0.5);
}
```

### Turn-Based Effect

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.TURN_END,
      callback: () => {
        if (!target.isFainted) {
          target.boostCombatReadiness(target, 10);
        }
      },
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

## Status Prevention

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BEFORE_STATUS_APPLY,
      callback: (args) => {
        if (args.statusId === statusConditions.PARALYSIS) {
          args.canApply = false;
          battle.addToLog(`${target.name}'s ability prevents paralysis!`);
        }
      },
      conditionCallback: getIsTargetPokemonCallback(target),
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```
