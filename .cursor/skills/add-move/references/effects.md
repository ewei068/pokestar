# Common Effects

Effects are temporary buffs/debuffs applied to Pokemon during battle.

## Stat Buffs

| Effect ID | Description            |
| --------- | ---------------------- |
| `atkUp`   | Raises Attack          |
| `defUp`   | Raises Defense         |
| `spaUp`   | Raises Special Attack  |
| `spdUp`   | Raises Special Defense |
| `speUp`   | Raises Speed           |
| `evaUp`   | Raises Evasion         |

## Greater Stat Buffs

| Effect ID      | Description                    |
| -------------- | ------------------------------ |
| `greaterAtkUp` | Sharply raises Attack          |
| `greaterDefUp` | Sharply raises Defense         |
| `greaterSpaUp` | Sharply raises Special Attack  |
| `greaterSpdUp` | Sharply raises Special Defense |
| `greaterSpeUp` | Sharply raises Speed           |

## Stat Debuffs

| Effect ID | Description            |
| --------- | ---------------------- |
| `atkDown` | Lowers Attack          |
| `defDown` | Lowers Defense         |
| `spaDown` | Lowers Special Attack  |
| `spdDown` | Lowers Special Defense |
| `speDown` | Lowers Speed           |

## Greater Stat Debuffs

| Effect ID        | Description                    |
| ---------------- | ------------------------------ |
| `greaterAtkDown` | Sharply lowers Attack          |
| `greaterDefDown` | Sharply lowers Defense         |
| `greaterSpaDown` | Sharply lowers Special Attack  |
| `greaterSpdDown` | Sharply lowers Special Defense |
| `greaterSpeDown` | Sharply lowers Speed           |

## Special Effects

| Effect ID      | Description                                                 |
| -------------- | ----------------------------------------------------------- |
| `shield`       | Absorbs damage (requires `initialArgs: { shield: amount }`) |
| `flinched`     | Cannot act this turn                                        |
| `confused`     | May hurt itself                                             |
| `restricted`   | Cannot gain boosted combat readiness                        |
| `regeneration` | Heals over time (requires `initialArgs: { healAmount }`)    |
| `dot`          | Damage over time (requires `initialArgs: { damage }`)       |
| `recharge`     | Must recharge, cannot act                                   |
| `perishSong`   | Faints when effect expires                                  |

## Status Conditions

Status conditions are different from effects - use `statusConditions` enum:

| Status ID   | Description                            |
| ----------- | -------------------------------------- |
| `BURN`      | Deals damage over time, reduces Attack |
| `PARALYSIS` | May be unable to move, reduces Speed   |
| `FROZEN`    | Cannot move until thawed               |
| `SLEEP`     | Cannot move until awakened             |
| `POISON`    | Deals damage over time                 |

## Usage Examples

```javascript
// Apply a buff
this.genericApplyAllEffects({
  effectId: "atkUp",
  duration: 3,
});

// Apply a debuff with probability
this.genericApplyAllEffects({
  effectId: "speDown",
  duration: 2,
  probability: 0.5,
});

// Apply shield with initial args
this.genericApplySingleEffect({
  target: this.source,
  effectId: "shield",
  duration: 3,
  initialArgs: { shield: Math.floor(this.source.maxHp * 0.15) },
});

// Apply status condition
this.genericApplyAllStatus({
  statusId: statusConditions.BURN,
  probability: 0.3,
});
```
