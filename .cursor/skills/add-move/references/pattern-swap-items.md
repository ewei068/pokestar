# Swap Held Items Pattern

Swaps held items between the user and target.

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

