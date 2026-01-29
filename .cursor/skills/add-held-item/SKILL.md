# Adding Held Items to Pokestar

## Quick Reference

**Files to modify:**

1. `src/enums/battleEnums.js` - Add `heldItemIdEnum.YOUR_ITEM` entry (ONLY if not exists)
2. `src/config/backpackConfig.js` - Add item metadata (name, description) if not exists
3. `src/battle/data/heldItems.js` - Add the held item implementation

**DO NOT** modify other held items or `battleConfig.js` unless explicitly asked.

## Held Item Structure

```javascript
[heldItemIdEnum.ITEM_NAME]: new HeldItem({
  id: heldItemIdEnum.ITEM_NAME,
  itemAdd({ battle, target }) {
    // Called when item is applied to Pokemon
    return {
      // Properties to store for later use in itemRemove
      listenerId: this.registerListenerFunction({...}),
    };
  },
  itemRemove({ battle, target, properties }) {
    // Called when item is removed
    battle.unregisterListener(properties.listenerId);
  },
  itemUse({ battle, target }) {
    // Optional: Logic for when the item is consumed
    // Only required for items with the "usable" tag
  },
  tags: ["berry", "usable"],  // Optional tags for item categorization
}),
```

## Properties Pattern

Return state from `itemAdd` that you'll need in `itemRemove`:

```javascript
itemAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({...}),
    originalStat: target.getStat("atk"),
    triggered: false,
  };
},
itemRemove({ battle, target, properties }) {
  battle.unregisterListener(properties.listenerId);
}
```

## Event Listener Registration

Held items have a class-level `registerListenerFunction` method that automatically includes the held item instance:

```javascript
itemAdd({ battle, target }) {
  return {
    listenerId: this.registerListenerFunction({
      battle,
      target,
      eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
      callback: ({ damage, heldItemInstance }) => {
        // heldItemInstance.data contains the properties
        // Perform item logic
      },
      conditionCallback: getIsTargetPokemonCallback(target),
    }),
  };
},
```

## Item Tags

| Tag      | Description                                     |
| -------- | ----------------------------------------------- |
| `berry`  | Berry item, consumed after use                  |
| `usable` | Item can be consumed, requires `itemUse` method |

## Common Gotchas

1. **Always Clean Up Listeners**: Failing to unregister listeners causes memory leaks.

2. **Item Data**: Name and description come from `backpackHeldItemConfig[id]`, not the HeldItem constructor.

3. **Event Argument Modification**: Return modified values from callbacks:

   ```javascript
   callback: (args) => {
     return { damage: Math.floor(args.damage * 0.5) };
   };
   ```

4. **usable Tag**: Items with the `usable` tag MUST implement `itemUse`.

5. **heldItemInstance**: Access stored properties via `heldItemInstance.data` in callbacks.

## References

- `references/held-item-patterns.md` - Common held item implementation patterns
- `add-event-listener` skill - Common event types and condition callbacks
