---
name: verify-pokemon
description: Verify a Pokemon's configuration in pokemonConfig.js by testing its moves and abilities in Discord via Playwright CLI. Use when validating a Pokemon's battle behavior after configuration changes.
---

# Verify Pokemon Configuration via Playwright CLI

Verify a Pokemon's moves and abilities work correctly by giving yourself the Pokemon, entering a battle, and testing each move/ability in Discord.

## Prerequisites

- Read the `/verify-discord` skill first — it covers bot startup, opening Discord, entering commands, and interacting with UI components. This skill builds on that workflow.

## Planning

Before starting, read the Pokemon's config in `src/config/pokemonConfig.js` and determine what needs testing:

1. **Moves** — Look up the Pokemon's `moveIds`. Only do a "deeper" test of moves implemented specifically for this Pokemon. Previously-existing moves just need a basic smoke test (use once, confirm it works without error).

2. **Abilities** — Check the Pokemon's `abilities` field. If it doesn't have one, abilities come from `data/pokemonData.json` via `buildAbilityMap()`. To guarantee the ability you want to test, temporarily override the abilities field:

   ```javascript
   abilities: {
     [abilityIdEnum.ABILITY_NAME]: 1,
   },
   ```

   Revert this after testing.

3. **Probability overrides** — If a move or ability has a probabilistic secondary effect (e.g. Static's 50% paralysis chance), temporarily set the probability to `1` (or `0` to disable) in the source code so testing is deterministic. Find the implementation in:
   - `src/config/battleConfig.js` — legacy moves and abilities (look for `battle.rng()` comparisons or probability values)
   - `src/battle/data/moves.js` — new moves (look for `probability` fields in `genericApplyAllStatus` calls or similar)
   - `src/battle/data/abilities.js` — new abilities

   Revert these changes after testing.

4. **Ability trigger conditions** — Read the ability implementation to understand what triggers it. Plan which NPC to fight based on what conditions the ability needs.

## NPC Selection Strategy

Choose the NPC based on what you're testing:

| Test goal                                                         | NPC          | Difficulty | Why                                          |
| ----------------------------------------------------------------- | ------------ | ---------- | -------------------------------------------- |
| Moves deal damage / work correctly                                | `bugCatcher` | `veryEasy` | Weak enemies, easy to one-shot, fast battles |
| Enemy needs to attack you (e.g. trigger ability on taking damage) | `blackBelt`  | `hard`     | Fighting types use physical moves            |
| Enemy needs to use special moves on you                           | `red`        | `veryHard` | Strong special attackers                     |
| Pokemon needs to faint or take heavy damage                       | `red`        | `veryHard` | High-level enemies deal significant damage   |

You don't have to test everything in one battle. If you wipe out all enemies, just start a new `/pve` battle — no need to finish the current one first.

## Step-by-Step Workflow

### 1. Setup (one-time)

Start the bot and open Discord per the `/verify-discord` skill.

### 2. Give yourself the Pokemon

```
/give pokemonid: <species_id> level: 100
```

Level 100 is preferred so your Pokemon goes first (higher speed) and makes testing faster. Note the **instance ID** from the bot response (a hex string like `69dc58590c01b3edd2bc70df`), not the species ID.

Verify the ability shown in the response matches the one you want to test. If it doesn't, check that you set the abilities override correctly and restart the bot.

### 3. Set up your party

Clear the party and add your Pokemon:

```
/party remove option: ALL
/party add name_or_id: <instance_id>
```

If testing an ability or move that involves allies, repeat the give + party add steps for additional Pokemon.

### 4. Start a battle

```
/pve npcid: <npc> difficulty: <difficulty>
```

See the NPC Selection Strategy above. Not all NPCs support all difficulties — if you get "Difficulty doesn't exist", try a different one.

### 5. Navigate the battle UI

The battle UI uses an embed with buttons and select menus:

- **"Select a move"** — dropdown to pick a move
- **"Select a target"** — dropdown to pick a target (appears after selecting a move)
- **"Next Turn"** — button to advance through enemy turns (appears when it's not your turn)
- **"Teams" / "⚔️ Moves" / "🔄 Refresh"** — info/utility buttons

The test user has auto-confirm enabled, so selecting a target immediately executes the move — there is no "⚔️ Confirm" step.

#### Using a move

1. Click "Select a move" → snapshot `[role='listbox']` → click the desired move option
2. Click "Select a target" → snapshot `[role='listbox']` → click the desired target option (the move executes immediately)
3. Wait ~3 seconds, then snapshot the last message to read the battle log

#### Letting enemies attack

When it's an enemy's turn, a "Next Turn" button appears instead of move selection. Click it repeatedly to advance through enemy turns. The battle log text updates to show what each enemy did.

### 6. What to verify

#### Moves

For each move, verify:

- The move executes without error (no bot crash — check the bot terminal)
- The battle log shows the expected behavior (damage dealt, status applied, buff/debuff effects, etc.)
- Moves on cooldown show `[COOLDOWN N]` in the move list

#### Abilities

For abilities, verify:

- The ability is listed in the Pokemon's info when given
- The trigger condition activates the ability (e.g. for "on physical damage taken" abilities, let an enemy use a physical move on you)
- The battle log shows the ability name firing (e.g. "Pikachu's Static affects Hitmonlee!")
- The ability's effect is applied (paralysis, stat change, healing, etc.)

### 7. Cleanup

Revert any temporary config changes (ability overrides, probability overrides). Close the browser and stop the bot:

```bash
playwright-cli -s=main close
```

Kill the `node src/index.js` process.

## Tips

- Read the battle log in the message text area (the `generic` node under the bot's heading). It contains all move/ability/damage info for the current turn.
- If a `[role='listbox']` ref goes stale between snapshot and click, just re-snapshot and use the new ref.
- Snapshot `"[data-list-id='chat-messages'] li:last-of-type" --depth=5` to see the full current battle state including buttons.
- The battle embed shows HP percentages on the grid (e.g. `100%`, `60%`) and lists active effects.
- If the bot crashes during testing, check the terminal output for errors, fix the issue, restart the bot, and continue.
- Status moves (String Shot, Harden) don't deal damage — they won't trigger "on damage taken" abilities like Static.
- Physical vs special matters for some abilities: check `damageType` in `battleConfig.js` move definitions to know which moves are physical.
