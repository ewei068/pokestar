# Adding Effects to Pokestar

## Quick Reference

**Files to modify:**

1. `src/enums/battleEnums.js` - Add `effectIdEnum.YOUR_EFFECT` entry (ONLY if not exists)
2. `src/battle/data/effects.js` - Add the effect implementation

**DO NOT** modify other effects or `battleConfig.js` unless explicitly asked.

## Effect Structure

```javascript
[effectIdEnum.EFFECT_NAME]: new Effect({
  id: effectIdEnum.EFFECT_NAME,
  name: "Effect Name",
  description: "Description of the effect",
  type: effectTypes.BUFF,        // BUFF, DEBUFF, or NEUTRAL
  dispellable: true,             // Can it be removed by dispell effects?
  effectAdd({ battle, target, source, initialArgs }) {
    // Called when effect is applied
    // initialArgs contains arguments passed when applying the effect
    return {
      // Properties to store for later use in effectRemove
    };
  },
  effectRemove({ battle, target, source, properties, initialArgs }) {
    // Called when effect expires or is removed
    // properties contains what effectAdd returned
    // Clean up any listeners or state here
  },
  tags: [],                      // Optional: ["hazard", "test"]
}),
```

## Properties Pattern

The most important pattern is the properties pattern - return state from `effectAdd` that you'll need in `effectRemove`:

```javascript
effectAdd({ battle, target, source, initialArgs }) {
  return {
    listenerId: battle.registerListenerFunction({...}),
    originalValue: target.getStat("atk"),
    counter: 0,
  };
},
effectRemove({ battle, target, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

## Event Listener Registration

Use `battle.registerListenerFunction` for effects (effects don't have a class-level helper):

```javascript
effectAdd({ battle, target }) {
  return {
    listenerId: battle.registerListenerFunction({
      eventName: battleEventEnum.BEFORE_DAMAGE,
      callback: (args) => {
        // Modify damage or perform logic
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

## Effect Types

| Type                  | Description                                                    |
| --------------------- | -------------------------------------------------------------- |
| `effectTypes.BUFF`    | Positive effect, can be dispelled by debuff-removing abilities |
| `effectTypes.DEBUFF`  | Negative effect, can be dispelled by buff-removing abilities   |
| `effectTypes.NEUTRAL` | Neither buff nor debuff, special handling                      |

## Using initialArgs

Effects can receive arguments when applied. Access them in both add and remove:

```javascript
effectAdd({ battle, target, initialArgs }) {
  const { shield } = initialArgs;
  battle.addToLog(`${target.name} is shielded for ${shield} damage!`);
  return { shieldAmount: shield };
},
effectRemove({ battle, target, initialArgs }) {
  const { shield } = initialArgs;
  // initialArgs persists through the effect's lifetime
}
```

## Common Gotchas

1. **Always Clean Up Listeners**: Failing to unregister listeners causes memory leaks and incorrect behavior.

2. **Event Argument Modification**: Return modified values from callbacks to change event behavior:

   ```javascript
   callback: (args) => {
     return { damage: Math.floor(args.damage * 0.5) };
   };
   ```

3. **State Management**: Properties can be mutated during runtime - be careful with shared references.

4. **Dispellable Flag**: Set `dispellable: false` for effects that should persist through dispell abilities.

## References

- `references/effect-types.md` - List of effect types and common effect IDs
- `references/effect-patterns.md` - Common effect implementation patterns
- `add-event-listener` skill - Common event types and condition callbacks
