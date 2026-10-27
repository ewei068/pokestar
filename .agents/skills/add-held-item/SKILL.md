---
name: add-held-item
description: Add held items to the battle system. Use when creating items Pokemon can hold for passive or triggered effects.
---

# Adding Held Items

## Steps

1. Add `heldItemIdEnum.YOUR_ITEM` to `src/enums/battleEnums.js` if it isn't there yet.
2. Add the item's backpack entry (name, emoji, description, category, cost) to `src/config/backpackConfig.js` if missing, modeled on a similar item. The battle item reads its display data from there, not from the `HeldItem` constructor.
3. Find the closest existing item in the examples table below and read its implementation in `src/battle/data/heldItems.js`.
4. Add the new entry to `heldItemsToRegister`, following the listener rules in the "Event Listeners" section of `src/battle/README.md`.
5. Run `npm test -- src/battle/data/__tests__/heldItems.test.js`. The suite applies, removes, and (for `usable` items) uses every registered item, so it catches crashes but not wrong behavior.
6. Write at least one behavior test unless the item is a single generic listener (see the `write-tests` skill).

Leave other held items and `battleConfig.js` unchanged.

## Shape

```javascript
[heldItemIdEnum.ITEM_NAME]: new HeldItem({
  id: heldItemIdEnum.ITEM_NAME,
  itemAdd({ battle, target }) {
    return {
      listenerId: this.registerListenerFunction({
        battle,
        target,
        eventName: battleEventEnum.AFTER_DAMAGE_TAKEN,
        callback: ({ heldItemInstance }) => {
          // heldItemInstance.data is the object itemAdd returned
        },
        conditionCallback: getIsTargetPokemonCallback(target),
      }),
    };
  },
  itemRemove({ battle, properties }) {
    battle.unregisterListener(properties.listenerId);
  },
  itemUse({ battle, target }) {
    // required when tags include "usable"
  },
  tags: ["berry", "usable"],
}),
```

Items tagged `usable` are consumed and must implement `itemUse`; `berry` marks berries for abilities and moves that interact with them.

## Examples in `heldItems.js`

| Pattern                              | Copy from                      |
| ------------------------------------ | ------------------------------ |
| Consumable status cure               | `LUM_BERRY`                    |
| Consumable heal at low HP            | `SITRUS_BERRY`                 |
| Turn-end healing                     | `LEFTOVERS`                    |
| Damage boost with recoil             | `LIFE_ORB`                     |
| Survive a lethal hit once            | `FOCUS_SASH`                   |
| Lock move choice for a stat boost    | `CHOICE_BAND`, `CHOICE_SCARF`  |
| Passive stat boost                   | `EVIOLITE`                     |
| Reflect damage to attackers          | `ROCKY_HELMET`                 |
| Heal from damage dealt               | `SHELL_BELL`                   |
| Ignore damage from hazard effects    | `HEAVY_DUTY_BOOTS`             |
| Self-inflict a status at turn end    | `TOXIC_ORB`, `FLAME_ORB`       |
| Skip a charge turn                   | `POWER_HERB`                   |
