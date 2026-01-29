---
name: add-event-listener
description: Register and manage battle event listeners. Use when abilities, effects, or items need to respond to battle events.
---

# Adding Event Listeners in Pokestar Battle System

Event listeners are the core mechanism for abilities, effects, and held items to respond to battle events.

## Registration Pattern

All battle components use `registerListenerFunction` to subscribe to events:

```javascript
const listenerId = battle.registerListenerFunction({
  eventName: battleEventEnum.BEFORE_DAMAGE,
  callback: (args) => {
    // Your logic here
  },
  conditionCallback: getIsTargetPokemonCallback(target),
});
```

**Always store the listenerId and unregister in the remove function:**

```javascript
abilityAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({...}),
  };
},
abilityRemove({ battle, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

## Class-Level vs Battle-Level Registration

### Class-Level (Recommended for Abilities/Held Items)

Abilities and Held Items have `this.registerListenerFunction` which:

- Automatically checks if the component is still active
- Provides the component instance in callback args

```javascript
// In an Ability
this.registerListenerFunction({
  battle,
  target,
  eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
  callback: ({ abilityInstance }) => {
    // abilityInstance.data contains stored properties
  },
  conditionCallback: getIsSourcePokemonCallback(target),
});
```

### Battle-Level (For Effects)

Effects use `battle.registerListenerFunction` directly:

```javascript
// In an Effect
battle.registerListenerFunction({
  eventName: battleEventEnum.BEFORE_DAMAGE,
  callback: (args) => {
    // Effect logic
  },
  conditionCallback: getIsTargetPokemonCallback(target),
});
```

## Common Battle Events

| Event                 | Description                     | Key Args                             |
| --------------------- | ------------------------------- | ------------------------------------ |
| `BATTLE_BEGIN`        | Start of battle                 | `battle`                             |
| `TURN_BEGIN`          | Start of each turn              | `battle`                             |
| `TURN_END`            | End of each turn                | `battle`                             |
| `BEFORE_MOVE`         | Before a move executes          | `source`, `moveId`, `targets`        |
| `AFTER_MOVE`          | After a move executes           | `source`, `moveId`, `targets`        |
| `BEFORE_DAMAGE`       | Before damage is dealt          | `damage`, `target`, `source`, `type` |
| `AFTER_DAMAGE_DEALT`  | After damage is dealt           | `damage`, `target`, `source`, `type` |
| `BEFORE_EFFECT_ADD`   | Before an effect is applied     | `effectId`, `target`, `canAdd`       |
| `AFTER_EFFECT_ADD`    | After an effect is applied      | `effectId`, `target`                 |
| `BEFORE_STATUS_APPLY` | Before status condition applied | `statusId`, `target`, `canApply`     |
| `AFTER_SKIP_TURN`     | After skipping a turn           | `source`                             |
| `AFTER_FAINT`         | After a Pokemon faints          | `target`, `source`                   |

If an event isn't strongly typed, search for where it is emitted in `BattlePokemon.js` or `Battle.js` and add its type to `battleEnums.js`.

## Condition Callbacks

Import from `../engine/eventConditions`:

````

### Common Condition Callbacks

| Callback                                 | Description                                  |
| ---------------------------------------- | -------------------------------------------- |
| `getIsTargetPokemonCallback(pokemon)`    | Only triggers when pokemon is the target     |
| `getIsSourcePokemonCallback(pokemon)`    | Only triggers when pokemon is the source     |
| `getIsActivePokemonCallback(pokemon)`    | Only triggers when pokemon is the active one |
| `getIsInstanceOfType("move")`            | Only triggers for move-related damage        |
| `getIsTargetSameTeamCallback(pokemon)`   | Target is on same team                       |
| `getIsTargetOpponentCallback(pokemon)`   | Target is on opposing team                   |
| `getIsSourceSameTeamCallback(pokemon)`   | Source is on same team                       |
| `getIsNotSourcePokemonCallback(pokemon)` | Source is NOT this pokemon                   |
| `getIsWeatherCondition(weatherId)`       | Current weather matches                      |

### Composing Multiple Conditions

```javascript
conditionCallback: composeConditionCallbacks(
  getIsTargetPokemonCallback(target),
  getIsInstanceOfType("move"),
),
````

## Modifying Event Arguments

Return an object from the callback to modify event behavior:

```javascript
// Reduce damage by 50%
callback: (args) => {
  return { damage: Math.floor(args.damage * 0.5) };
};
```

```javascript
// Prevent an effect from being applied
callback: (args) => {
  args.canAdd = false;
};
```

```javascript
// Prevent status from being applied
callback: (args) => {
  args.canApply = false;
};
```

## Common Gotchas

1. **Always Unregister**: Store listenerId and call `battle.unregisterListener(listenerId)` in the remove function to prevent memory leaks.

2. **Source vs Target**: Use the correct condition callback:
   - `getIsSourcePokemonCallback` - when this Pokemon is dealing damage/using moves
   - `getIsTargetPokemonCallback` - when this Pokemon is receiving damage/effects

3. **Return vs Mutate**: For damage modification, return the new value. For boolean flags like `canAdd`, mutate the args directly.

4. **Instance Check**: Class-level `registerListenerFunction` automatically checks if the component is still active before firing the callback.

## References

- `references/pattern-*.md` - Common event listener implementation patterns
