# Pokestar Battle System

The Pokestar Battle System is a turn-based battle simulator designed to recreate Pokemon-style battles in a Discord bot environment. This document provides an overview of how the battle system works, its components, and how to extend it.

## Table of Contents

- [Overview](#overview)
- [Directory Structure](#directory-structure)
- [Core Components](#core-components)
- [Battle Flow](#battle-flow)
- [Extending the Battle System](#extending-the-battle-system)
  - [Adding Moves](#adding-moves)
  - [Adding Abilities](#adding-abilities)
  - [Adding Effects](#adding-effects)
  - [Adding Held Items](#adding-held-items)

## Overview

Pokestar has a unique Battle System which seeks to bring a fresh twist to Pokemon-style battles. The Pokemon Battle System has the following unique traits:

- All 6 Pokemon on a Trainer's team are on the battlefield at the same time
- Pokemon may be placed in different positions affecting who gets targetted by which moves
- Moves have special targetting restrictions and Areas of Effect
- Turn order is determined by a Combat Readiness system, where faster Pokemon gain Combat Readiness more quickly
- Moves have 3 tiers (Basic, Power, and Ultimate). There is a restriction to the tiers of moves that Pokemon may know
- Moves have cooldowns, with powerful moves being able to be used less-frequently
- Many moves, abilities, and items may have different effects from the base games

The Pokestar Battle System is a combat simulator that handles all aspects of Pokemon-style battles. The system manages:

- Turn-based combat with initiative based on Combat Readiness (CR)
- Pokemon stats, moves, abilities, and held items
- Status conditions and effects
- Type effectiveness and damage calculations
- Weather effects
- NPC opponents and PvP battles

The battle engine is designed to be extensible, allowing for the addition of new moves, abilities, effects, and items.

## Directory Structure

The battle system is organized into two main directories:

- `data/`: Contains definitions for moves, abilities, effects, and held items
- `engine/`: Contains the battle simulation logic and core classes

Key files include:

- `engine/Battle.js`: The main battle controller class
- `engine/BattlePokemon.js`: Handles Pokemon entities in battle
- `engine/events.js`: Event system for battle interactions
- `data/moves.js`: Move definitions and behaviors
- `data/abilities.js`: Ability definitions and effects
- `data/effects.js`: Status and field effects
- `data/heldItems.js`: Held item behaviors

## Core Components

### Battle Class

The `Battle` class is the central controller for the battle system. It:

- Manages teams and parties
- Controls turn order with Combat Readiness (CR)
- Handles weather effects
- Emits events during battle phases
- Tracks battle state (turns, logs, etc.)
- Determines valid targets for moves
- Processes end-of-battle rewards

### BattlePokemon Class

The `BattlePokemon` class represents Pokemon in battle. It:

- Manages stats, types, abilities, and held items
- Executes moves and calculates damage
- Applies and removes status conditions
- Handles stat changes and buffs/debuffs
- Processes Combat Readiness for turn order
- Tracks cooldowns for moves

### Event System

The battle system uses an event-based architecture allowing components to react to battle events:

- Components can register event listeners
- Events are emitted during battle phases
- Listeners can modify event data or react to changes
- Events include damage, moves, turns, and state changes

### Event Listeners

Event listeners trigger effects upon events firing, and can mutate their arguments by returning new values. For example, in `heldItems.js`, the Heavy Duty Boots item prevents damage from hazards by returning modified damage values:

```javascript
callback: ({ damageInfo }) => {
  const effectId = damageInfo?.id;
  if (getEffectIdHasTag(effectId, "hazard")) {
    return {
      damage: 0,
      maxDamage: 0,
    };
  }
},
```

Event listeners also define condition callbacks such that they will only run if certain conditions are met:

```javascript
conditionCallback: composeConditionCallbacks(
  getIsInstanceOfType("effect"),
  getIsTargetPokemonCallback(target)
),
```

## Battle Flow

1. **Battle Creation**: Teams and Pokemon are added to the battle
2. **Battle Start**: Initial abilities and items are applied
3. **Turn Cycle**:
   - Combat Readiness increases for all Pokemon
   - When a Pokemon reaches max CR (100), it takes a turn
   - The active Pokemon selects and executes a move
   - Effects, statuses, and cooldowns are updated
4. **Battle End**: When all Pokemon on one side faint, the battle ends

## Extending the Battle System

### Adding Moves

Moves have a few key features such as type, power, accuracy, cooldown, targetting, and move tier. New moves are added in `data/moves.js` by extending the `movesToRegister` object. The execute function of a move is the effect the move has when executed, such as damaging enemies or applying effects. The effect arguments include the battle, source, primary target, all targets, missed targets, and some additional information. It is preferred to roll these arguments as `args` into the generic damage, status, and effect applying methods in the `Move` class in case the argument requirements for these methods change in the future.

```javascript
[moveIdEnum.NEW_MOVE]: new Move({
  id: moveIdEnum.NEW_MOVE,
  name: "New Move",
  type: pokemonTypes.NORMAL,
  power: 80,
  accuracy: 100,
  cooldown: 3,
  targetType: targetTypes.OPPONENT,
  targetPosition: targetPositions.ANY,
  targetPattern: targetPatterns.SINGLE,
  tier: moveTiers.SPECIAL,
  damageType: damageTypes.PHYSICAL,
  description: "Description and flavor text of the move",
  execute(args) {
    // Implementation of move behavior
    this.genericDealAllDamage(args);

    // Add secondary effects if needed
    this.genericApplyAllStatus({
      ...args,
      statusId: statusConditions.FROZEN,
      probability: 0.5,
    });
  },
}),
```

For the move to be recognized, also add it to the `moveIdEnum` in `../enums/battleEnums.js`.

### Adding Abilities

The key features of an ability are its `abilityAdd` and `abilityRemove` functions. Important to note that the return value of the `abilityAdd` function is passed in as `properties` to the `abilityRemove` funciton and may be modified during the ability's lifespan. When registering event listeners, be sure to use the `registerListenerFunction` method. New abilities are added in `data/abilities.js` by extending the `abilitiesToRegister` object:

```javascript
[abilityIdEnum.NEW_ABILITY]: new Ability({
  id: abilityIdEnum.NEW_ABILITY,
  name: "New Ability",
  description: "Description of the ability",
  abilityAdd({ battle, target }) {
    return {
      listenerId: this.registerListenerFunction({
        battle,
        target,
        eventName: battleEventEnum.AFTER_DAMAGE_DEALT,
        callback: (args) => {
          // Implementation of ability behavior
        },
        conditionCallback: getIsSourcePokemonCallback(target),
      }),
    };
  },
  abilityRemove({ battle, properties }) {
    battle.unregisterListener(properties.listenerId);
  },
}),
```

For the ability to be recognized, also add it to the `abilityIdEnum` in `../enums/battleEnums.js`.

### Adding Effects

Effects in Pokestar have a limited duration, may be buffs, debuffs, or neutral, and may also be dispellable. The `effectAdd` and `effectRemove` functions define what happens when effect is added or expired. Similar to abilities, the return value of `effectAdd` is passed in as `properties` to `effectRemove` and may reflect the state of the effect. Effects may also have `initialArgs` that change how an effect is applied. New effects are added in `data/effects.js` by extending the `effectsToRegister` object:

```javascript
[effectIdEnum.NEW_EFFECT]: new Effect({
  id: effectIdEnum.NEW_EFFECT,
  name: "New Effect",
  description: "Description of the effect",
  type: effectTypes.BUFF, // or DEBUFF
  dispellable: true,
  effectAdd({ battle, target, initialArgs }) {
    battle.addToLog(`${target.name} is affected by New Effect!`);
    // Implementation of effect application
    return {}; // Return properties to store with the effect
  },
  effectRemove({ battle, target, properties, initialArgs }) {
    battle.addToLog(`${target.name}'s New Effect wore off!`);
    // Implementation of effect removal
  },
}),
```

For the effect to be recognized, also add it to the `effectIdEnum` in `../enums/battleEnums.js`.

### Adding Held Items

Held Ttems work similar to Abilities and Effects with a `properties` valye that is returned by the addition function and passed into the removal function. However, Held Items have a unique optional `itemUse` that must be implemented if the item has the `usable` tag. The `itemUse` function determines what happens if an item is consumed. New held items are added in `data/heldItems.js` by extending the `heldItemsToRegister` object:

```javascript
[heldItemIdEnum.NEW_ITEM]: new HeldItem({
  id: heldItemIdEnum.NEW_ITEM,
  itemAdd({ battle, target }) {
    return {
      listenerId: this.registerListenerFunction({
        battle,
        target,
        eventName: battleEventEnum.BEFORE_DAMAGE_TAKEN,
        callback: (args) => {
          // Implementation of held item behavior
        },
        conditionCallback: getIsTargetPokemonCallback(target),
      }),
    };
  },
  itemRemove({ battle, properties }) {
    battle.unregisterListener(properties.listenerId);
  },
  itemUse({ battle, target }) {
    // Implementation of item use behavior (for usable items)
  },
  tags: ["berry"], // Optional tags for item categorization
}),
```

For the held item to be recognized:

1. Add it to the `heldItemIdEnum` in `../enums/battleEnums.js`
2. Add its display info to `../config/backpackConfig.js`
