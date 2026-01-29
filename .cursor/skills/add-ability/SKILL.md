# Adding Abilities to Pokestar

## Quick Reference

**Files to modify:**

1. `src/enums/battleEnums.js` - Add `abilityIdEnum.YOUR_ABILITY` entry (ONLY if not exists)
2. `src/battle/data/abilities.js` - Add the ability implementation

**DO NOT** modify other abilities or `battleConfig.js` unless explicitly asked.

## Ability Structure

```javascript
[abilityIdEnum.ABILITY_NAME]: new Ability({
  id: abilityIdEnum.ABILITY_NAME,
  name: "Ability Name",
  description: "Description of what the ability does",
  abilityAdd({ battle, target }) {
    // Called when ability is applied (battle start)
    return {
      // Properties to store for later use in abilityRemove
      listenerId: this.registerListenerFunction({...}),
    };
  },
  abilityRemove({ battle, target, properties }) {
    // Called when ability is removed
    battle.unregisterListener(properties.listenerId);
  },
}),
```

## Properties Pattern

Return state from `abilityAdd` that you'll need in `abilityRemove`:

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({...}),
    originalValue: target.getStat("atk"),
    triggered: false,
  };
},
abilityRemove({ battle, target, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

## Event Listener Registration

Abilities have a class-level `registerListenerFunction` method that automatically includes the ability instance:

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
      callback: ({ damage, abilityInstance }) => {
        // abilityInstance.data contains the properties
        // Perform ability logic
      },
      conditionCallback: getIsSourcePokemonCallback(target),
    }),
  };
},
```

## Common Patterns

### Trigger on Dealing Damage

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
      callback: ({ target: damagedTarget, source }) => {
        if (Math.random() < 0.1) {
          battle.addToLog(`${damagedTarget.name} is affected by ${source.name}'s Ability!`);
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

### Battle Start Trigger

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BATTLE_BEGIN,
      callback: () => {
        battle.addToLog(`${target.name}'s ability activated!`);
        // Apply buffs to allies, set weather, etc.
      },
    }),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

### Passive Stat Boost

```javascript
abilityAdd({ battle, target }) {
  target.addStatMult("atk", 0.5);
  return {};
},
abilityRemove({ battle, target }) {
  target.addStatMult("atk", -0.5);
}
```

### Damage Modification

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.BEFORE_DAMAGE,
      callback: (args) => {
        // Take 25% less damage from moves
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

### Type-Based Immunity

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
          battle.addToLog(`${target.name}'s ability absorbed the Water move!`);
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

### Contact Move Punishment

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

### Move Tag Boost

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

## Condition Callbacks

Use condition callbacks to filter when event listeners trigger:

```javascript
conditionCallback: composeConditionCallbacks(
  getIsTargetPokemonCallback(target),
  getIsInstanceOfType("move"),
),
```

## Common Gotchas

1. **Always Clean Up Listeners**: Failing to unregister listeners causes memory leaks.

2. **Event Argument Modification**: Return modified values from callbacks:

   ```javascript
   callback: (args) => {
     return { damage: Math.floor(args.damage * 0.5) };
   };
   ```

3. **abilityInstance**: Access stored properties via `abilityInstance.data` in callbacks.

4. **Source vs Target**: Use the right condition callback:
   - `getIsSourcePokemonCallback` - when this Pokemon is dealing damage/using moves
   - `getIsTargetPokemonCallback` - when this Pokemon is receiving damage/effects

## References

- `add-event-listener` skill - Common event types and condition callbacks
- `references/pattern-*` - Common ability implementation patterns
