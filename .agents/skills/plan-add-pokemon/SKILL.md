---
name: plan-add-pokemon
description: Create an implementation plan before adding one or more Pokemon via the `add-pokemon` skill. Builds Pokemon, moves, and abilities tables with all required inputs, flags unimplemented moves/abilities, and produces step-by-step implementation instructions. Use when the user asks to plan adding a Pokemon, plan a Pokemon batch, or invokes this skill before `add-pokemon`.
---

# Planning Pokemon Additions

Creates a structured plan for adding one or more Pokemon to `src/config/pokemonConfig.js`. The plan feeds directly into the `add-pokemon` skill (and transitively `add-move` / `add-ability`) during implementation.

## Required input

The bare minimum is a **descriptor of a Pokemon or set of Pokemon** — a name, list of names, theme ("a fire-type starter line"), or rough concept ("Ash's Greninja"). Everything else can be inferred.

Optional inputs the user may provide upfront (use them verbatim if given, otherwise infer):

- Specific moves per Pokemon
- Specific abilities per Pokemon
- Rarity, growth rate, evolution structure
- Form-specific data (`baseSpeciesId`, outside-combat swap)
- Fakemon stats / types / sprite

**If no descriptor is provided, STOP and ask for one.** Do not begin planning without at least a Pokemon-level concept.

## Workflow

1. Read the `add-pokemon` skill to confirm the current required-input list (canonical vs fake vs alt form). The Pokemon table columns must match those requirements.
2. For each Pokemon in the descriptor, decide canonical vs fake using the check in `add-pokemon` (lookup in `data/pokemonData.json` via `node -e ...`). Heuristic backup: dash IDs (`25-1`) or IDs ≥ 20000 are fake; 10000-range numeric IDs are canonical alt forms.
3. Switch to plan mode (`SwitchMode` → `plan`) before producing the plan output.
4. Build the three tables (Pokemon → Moves → Abilities) in order. While filling the Pokemon table, append rows to the moves/abilities tables as you discover unimplemented entries.
5. Append the implementation instructions section at the end.
6. **Persist the plan to disk.** Write the full plan (all three tables + implementation instructions, exactly as emitted in chat) to `.cursor/plans/add-pokemon-<slug>.md`, where `<slug>` is a short kebab-case identifier derived from the descriptor (e.g. `lucario`, `ashs-greninja`, `gen3-fire-starters`). This file is the canonical source of truth for `Done` checkbox state across implementation steps and sessions — every time a row is checked off during implementation, update both the chat message and this file. Report the file path back to the user. If the file already exists for this slug, append a numeric suffix (`-2`, `-3`) rather than overwriting.

## Plan output structure

The plan must contain, in this order:

### 1. Pokemon table

One row per Pokemon. Columns are derived from the `add-pokemon` skill's "Required inputs" section. Use these columns at minimum (add more if the user supplied extra data):

| Pokemon | ID | Type | Canonical/Fake/Form | Moves | Abilities | Rarity | Growth Rate | Evolution | Notes | Done |

Per-column guidance:

- **Pokemon** — display name + intended `pokemonIdEnum` key (e.g. `Lucario (LUCARIO)`).
- **ID** —
  - Canonical Pokemon: canonical Pokedex ID (`"448"`).
  - Canonical alt forms: usually 10000-range (`"10004"` Wormadam-Sandy). Confirm presence in `pokemonData.json`.
  - Fakemon variants of a real species: `"{baseId}-{n}"` (e.g. Ash's Pikachu = `"25-1"`).
  - Fully original / unobtainable fakemon: ≥ `"20000"`.
- **Type** — for canonical, leave blank (auto from data). For fakemon and forms with overrides, list `[type1, type2]`.
- **Canonical/Fake/Form** — one of `canonical`, `fake`, `form`. Forms must include `baseSpeciesId` in Notes.
- **Moves** — 4 (or fewer) flavorful moves the Pokemon could have learned in any generation through any mechanism. Prefer signature moves and moves the species is iconic for. Tier mix:
  - Fully evolved: 1 basic, 2 power, 1 ultimate.
  - Middle evolution: 1 basic, 3 power.
  - First stage: 1–2 basic, 2–3 power.
  - Keep movesets similar across an evolution line; only diverge for special cases (Magikarp→Gyarados, Eeveelutions, etc.).
  - For each move, mark whether it's already implemented in `moves.js` / `battleConfig.js`. Unimplemented moves → add a row to the **Moves table** (deduped).
- **Abilities** —
  - Canonical: usually leave blank; abilities auto-populate from `pokemonData.json`. Only specify when overriding (typically alt forms).
  - Fakemon: required, generally 1 ability.
  - Each Pokemon must end up with **at least one implemented ability**. If none of its existing abilities are implemented, suggest one and add it to the **Abilities table**.
- **Rarity** — `COMMON / RARE / EPIC / LEGENDARY / MYTHICAL`. Infer from power level if not given.
- **Growth Rate** — match the rest of the evolution line if applicable; otherwise pick by power level (`FAST` weak, `MEDIUMSLOW` strong starters, `SLOW` pseudos/legendaries, etc.).
- **Evolution** — level + target enum (omit if target is unimplemented).
- **Notes** — alt form `baseSpeciesId`, outside-combat form swap, fakemon stats/sprite, anything else atypical.
- **Done** — empty checkbox `[ ]`. Checked `[x]` once that Pokemon is fully implemented and verified.

### 2. Moves table

One row per **unimplemented** move discovered while filling the Pokemon table. Already-implemented moves do **not** go here. Dedupe across Pokemon.

| Move | Tier | Additional Effects | Generic Description | Done |

- **Move** — display name (the `add-move` skill maps to `moveIdEnum`).
- **Tier** — `basic`, `power`, or `ultimate`.
- **Additional Effects** — secondary effects like "60% chance to burn", "raises user Atk +1", "flinch on hit". May be empty.
- **Generic Description** — any fields the user specified or that you think the move _must_ have: power, accuracy, cooldown, damage type, target pattern, charge mechanics, etc. You do NOT need to specify every field — `add-move` infers the rest.
- **Done** — `[ ]` initially; `[x]` after implementation.

### 3. Abilities table

One row per ability flagged for implementation (either user-requested or the chosen "at least one implemented ability" for each Pokemon that lacks one). Already-implemented abilities do **not** go here. Dedupe.

| Ability | Description | Done |

- **Ability** — display name (the `add-ability` skill maps to `abilityIdEnum`).
- **Description** — what the ability does, in enough detail for `add-ability` to implement (trigger event, effect, magnitude, duration).
- **Done** — `[ ]` initially; `[x]` after implementation.

### 4. Implementation instructions

Append this section verbatim (adjust only if the user explicitly overrode the iteration policy):

> **Implementation order:** Iterate over the Pokemon table top-to-bottom, implementing one Pokemon at a time. **Before starting Pokemon #1, switch back to agent mode (`SwitchMode` → `agent`)** — implementation requires write access. For each Pokemon:
>
> 1. Refer to the `add-pokemon` skill and follow it to completion (which will dispatch `add-move` / `add-ability` subagents for any rows still unchecked in the Moves / Abilities tables).
> 2. After each implemented move or ability, check off its row in **both** the in-chat plan and the persisted `.cursor/plans/add-pokemon-<slug>.md` file.
> 3. Verify the Pokemon (the `add-pokemon` skill ends with verification via `verify-pokemon`).
> 4. Check off the Pokemon's row in both places.
> 5. **STOP and await further user instructions before starting the next Pokemon**, unless the user has explicitly said to implement multiple without pausing.
>
> Do not re-implement rows that are already checked off. If resuming work in a later session, re-read the persisted plan file to recover progress.

## Pre-population checks

Before deciding a move or ability is "unimplemented", verify against the codebase. **Name check first**, enum check second — many entries (especially anything in `battleConfig.js`) are keyed by legacy string IDs like `m6`, `"m6-1"`, or `"2"` and never appear as `moveIdEnum.X` / `abilityIdEnum.X`. Some are also entirely custom and have no enum at all.

**Primary: search by display name** across the three definition files:

```bash
rg -n 'name:\s*"Move Name"' src/battle/data/moves.js src/config/battleConfig.js
rg -n 'name:\s*"Ability Name"' src/battle/data/abilities.js src/config/battleConfig.js
```

Any hit → treat as implemented.

**Secondary: enum check** (useful when the user gave you the enum key, or to disambiguate name collisions like signature moves with form variants):

```bash
rg -n 'moveIdEnum\.MOVE_NAME\b' src/battle/data/moves.js
rg -n 'abilityIdEnum\.ABILITY_NAME\b' src/battle/data/abilities.js
```

**If neither check finds it but you suspect a near-miss** (renamed move, alternate spelling, form-specific variant), do a loose substring search before giving up:

```bash
rg -n -i "fire.*punch" src/battle/data/moves.js src/config/battleConfig.js
```

If found, treat as implemented and annotate the Pokemon row's Moves / Abilities cell with "(implemented)" — including the file it lives in if it matters (e.g. `Fire Punch (implemented, battleConfig.js)`). Only add a row to the Moves / Abilities table when **all** of the above checks come up empty.

## Pitfalls

- **Adding implemented moves/abilities to the tables.** Always check `moves.js`, `abilities.js`, and `battleConfig.js` first.
- **Forgetting the "at least one implemented ability" rule.** Each Pokemon row's Abilities cell must reference at least one ability that is either already implemented or appears in the Abilities table.
- **Mismatched growth rates within an evolution line.** Match the line.
- **Listing canonical abilities that auto-populate from `pokemonData.json`.** For canonical Pokemon, leave the Abilities cell blank unless overriding.
- **Listing evolutions whose target is unimplemented.** Omit those evolution arrows in the plan.
- **Skipping plan mode.** Always switch to plan mode before emitting the plan; never start implementing inside this skill.

## References

- `add-pokemon` skill — source of truth for required inputs per Pokemon type and the implementation procedure.
- `add-move` skill — required-input contract for the Moves table.
- `add-ability` skill — required-input contract for the Abilities table.
- `find-pokemon-emoji` skill — invoked by `add-pokemon` during implementation; no plan-time action needed.
- `src/config/pokemonConfig.js`, `src/battle/data/moves.js`, `src/battle/data/abilities.js`, `src/config/battleConfig.js` — check for existing implementations.
