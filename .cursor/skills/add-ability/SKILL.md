---
name: add-ability
description: Add Pokemon abilities to the battle system. Use when implementing passive abilities that trigger on events.
---

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

Refer to `references/pattern-*` for common ability implementations.

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
