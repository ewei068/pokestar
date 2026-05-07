---
name: add-pokemon
description: Add a Pokemon (real or fake) to src/config/pokemonConfig.js with its moves, abilities, rarity, and evolution data. Use when the user asks to add, register, implement, or create a new Pokemon, Pokemon form, or fake/custom Pokemon in the battle system.
---

# Adding a Pokemon to Pokestar

Adds a new Pokemon to `src/config/pokemonConfig.js` — either to `canonicalPokemonConfig` (real Pokemon / real forms) or `fakePokemonConfig` (original or custom Pokemon).

## Required inputs

Before doing anything, collect these from the user. **If any required input is missing, STOP and ask.**

**All Pokemon:**

- Pokemon `name` (for the enum key) and intended `pokemonIdEnum` identifier (e.g. `LUCARIO`, `ASHS_PIKACHU`)
- Numeric/string **ID** (e.g. `"448"`, `"25-2"`, `"20024"`)
- `moveIds` — the four (or fewer) moves. For each move, note whether it's already implemented in `moves.js` or `battleConfig.js`. If a move is unimplemented and a description of how to implement the move isn't provided, stop and ask for it.
- `rarity` (`COMMON` | `RARE` | `EPIC` | `LEGENDARY` | `MYTHICAL`) — infer from power level if not given
- Any abilities to add, and whether each needs **implementation** or just a config reference
- Do not introduce `baseSpeciesId`, `formSpeciesIds`, or `tags` unless the user explicitly indicates the Pokemon needs them.

**Fake Pokemon additionally require:**

- Display name, type(s), base stats (optional — can invent), and **at least one ability** (stop and ask if not provided)

**Alt forms only** — collect `baseSpeciesId` and whether the form can be swapped **outside** combat (the latter determines whether to add `formSpeciesIds` on the base).

## Decide: canonical or fake

Run this check to decide which config the Pokemon belongs in:

```bash
node -e "const d=require('./data/pokemonData.json'); console.log(!!d['<ID>'])"
```

- **`true`** → `canonicalPokemonConfig` (real Pokemon or real form; name/type/stats/sprite come from `pokemonData.json` automatically)
- **`false`** → `fakePokemonConfig` (must provide name, type, stats, sprite, description, etc.)

Heuristic backup: IDs containing a `-` (e.g. `"9-1"`) or ≥ `"20000"` are almost always fake. Real alt forms use IDs like `"10004"` (Wormadam-Sandy) — no dash, but present in `pokemonData.json`.

## Step 0: Ensure `pokemonIdEnum` entry exists

Check `src/enums/pokemonEnums.js` for the desired enum entry. **Canonical Pokemon are usually already in the enum** because it's auto-populated from a PokeAPI scrape script — most of the time you can skip this step for canonical entries. Fake Pokemon and brand-new alt forms typically need to be added by hand.

If the entry is missing, add it inside `pokemonIdEnum` in numerical ID order next to similar Pokemon (alt forms next to their base species). Pick the pattern that matches what you're adding:

```javascript
LUCARIO: "448",                // canonical (real Pokedex ID)
WORMADAM_SANDY: "10004",       // canonical alt form (10000-range, no dash; place adjacent to WORMADAM_PLANT)
ASHS_PIKACHU: "25-1",          // fakemon variant of a real species (dashed ID; place after PIKACHU)
EXAMPLE_FAKEMON: "20024",      // fully original fakemon (>= 20000)
```

**Every other file references the Pokemon through `pokemonIdEnum.XXX`, so this must exist before editing the config.**

## Step 1: Validate inputs and dispatch subagents

Once you know the config type and have the required inputs, dispatch subagents to do the work. **Read the subagent dispatch model below carefully** — parallel agents writing to the same file race each other and silently lose edits.

### Subagent dispatch model

The shared files (`src/enums/battleEnums.js`, `src/battle/data/moves.js`, `src/battle/data/abilities.js`, `src/battle/data/effects.js`, `src/battle/data/heldItems.js`) all have N subagents trying to insert at the same closing-brace boundary. Direct parallel writes will collide via `StrReplace` anchor races.

The fix: subagents implement and test in **isolated git worktrees** (via `subagent_type: "best-of-n-runner"`), but instead of having the main agent merge the worktrees, each subagent **returns a structured payload of insertions** that the main agent applies serially.

#### Emoji subagent

Dispatch with `find-pokemon-emoji`. The subagent **must return the emoji string** in its final response (`<:id:snowflake>` / `<:idform:snowflake>` / `<:name:snowflake>`). The main agent pastes the string into the `emoji` field during Step 2. Do not have the subagent edit `pokemonConfig.js` directly.

#### Move / ability subagents — return-payload contract

Dispatch with `add-move` (one per unimplemented move) or `add-ability` (one per flagged ability), using `subagent_type: "best-of-n-runner"`. Each subagent implements + tests inside its own worktree, then **returns a structured payload** in its final response. The payload has this shape:

```
enum_entries: {
  <enumName>: ["KEY: \"value\",", ...],   // e.g. moveIdEnum, abilityIdEnum, effectIdEnum
  ...
}
blocks: {
  "<file path>": ["<full block as a code string>", ...],
  // e.g. "src/battle/data/moves.js": ["[moveIdEnum.FIRE_PUNCH]: new Move({...})"]
  // Each block is ready to drop into the corresponding "...ToRegisterRaw" / "...ToRegister" object before its closing brace.
}
test_outcome: "pass" | { status: "fail", summary: "..." }
requires_coordination?: ["<description of any cross-cutting change the subagent could not make on its own>"]
```

The payload supports **multiple files** because a move/ability may legitimately need additive changes in more than one place — e.g. a new move that also introduces a new effect adds to `moveIdEnum`, `effectIdEnum`, `moves.js`, AND `effects.js`. List each insert under its appropriate key.

#### `requires_coordination` — when the subagent must NOT implement

The subagent **must not** make mutative changes to the battle engine (`src/battle/engine/*`) or to existing methods on `BattlePokemon`, `Battle`, `MoveInstance`, etc. It also must not modify `battleConfig.js` or other files outside the additive-registry set. If the subagent decides its move/ability requires such a change:

1. It does NOT implement the engine change.
2. It returns its move/ability payload as best it can (possibly with a stub or `test_outcome: "fail"`).
3. It populates `requires_coordination` with a description of what's needed (file, function, what behavior to add/change).

The main agent then chooses one of:

- Implement the cross-cutting change first as a coordinated single-author edit, then re-dispatch the subagent with the engine change in place.
- Re-scope the move/ability to use existing primitives.
- Escalate to the user.

This guard exists because engine changes affect every move/ability; they should never be made in parallel by autonomous per-move subagents.

#### Main agent integration

After all subagents return, the main agent serially:

1. **Dedupes** payloads — if two subagents added the same effect / enum entry / block, drop the duplicates. Detect this by exact-match on the enum key or block body.
2. **Resolves `requires_coordination`** — handle every flagged item before applying any payloads (see options above).
3. **Applies enum entries** — for each `(enumName, entries)` pair, insert into the corresponding enum in `battleEnums.js` (or other enum file) before its closing `});`.
4. **Applies blocks** — for each `(filePath, blocks)` pair, insert each block before the closing `}` of the corresponding registry object (e.g. `movesToRegisterRaw`, `abilitiesToRegister`, `effectsToRegister`, `heldItemsToRegister`).
5. **Runs the focused test suites** once for each touched data file:
   - `npm test -- src/battle/data/__tests__/moves.test.js` if moves changed
   - `npm test -- src/battle/data/__tests__/abilities.test.js` if abilities changed
   - `npm test -- src/battle/data/__tests__/effects.test.js` if effects changed
   - `npm test -- src/battle/data/__tests__/heldItems.test.js` if held items changed
6. **Discards subagent worktrees.**

Abilities referenced **without** an implementation directive can just be listed (for fakes) or skipped (for canonical — see Step 2). No subagent dispatch needed.

### Inline shortcut

If the task is small (e.g. all moves/abilities already exist, or only one of each is missing), skip subagents and do the work inline — implement + test in the main agent. Still call the `find-pokemon-emoji` skill yourself for the `emoji` field.

### Main agent finishes the config

After moves, abilities, and emoji are resolved, the main agent adds the Pokemon entry to `pokemonConfig.js` using the templates in Step 2.

## Step 2: Write the config entry

Insert the entry in numerical-ID order inside the correct config object. For alt forms, place adjacent to the base species.

### Canonical Pokemon template

```javascript
[pokemonIdEnum.LUCARIO]: {
  emoji: "<:448:1234567890>", // from find-pokemon-emoji
  evolution: [
    { level: 40, id: pokemonIdEnum.MEGA_LUCARIO }, // ONLY if target is implemented
  ],
  moveIds: [
    moveIdEnum.AURA_SPHERE,
    moveIdEnum.CLOSE_COMBAT,
    moveIdEnum.METAL_SOUND,
    moveIdEnum.EXTREME_SPEED,
  ],
  battleEligible: true,
  rarity: rarities.EPIC,
  growthRate: growthRates.MEDIUMSLOW,
},
```

Canonical-only rules:

- **`evolution`**: use the canonical evolution level if level-based; invent a reasonable level otherwise. **Omit if the evolution target isn't implemented.** If the new Pokemon evolves **from** an already-implemented Pokemon, go add it to that Pokemon's `evolution` array too.
- **`abilities`**: how `buildCanonicalEntry` actually works — when this field is **omitted**, the cached abilities from `pokemonData.json` are auto-populated via `buildAbilityMap`. When this field is **present**, it **completely replaces** the auto-populated map (it's a shallow override, not a merge). So:
  - To use the canonical ability set as-is → omit `abilities`. (This is the default and what you want for most canonical Pokemon.)
  - To use a totally different ability set (e.g. alt forms like `DEOXYS_ATTACK`) → list every desired ability explicitly; the cached set is wiped.
  - To **add** a custom-implemented ability while keeping the canonical ones → you must list **all** desired abilities (cached + new) in `abilities`. There is no merge path.
  - For canonical Pokemon whose existing `pokemonData.json` abilities are sufficient, do not re-list them — let auto-populate handle it.
- **`baseSpeciesId`, `formSpeciesIds`, `noGacha`, `tags`**: omit entirely unless explicitly required (alt forms, user-requested flags). Do not add them proactively.

### Canonical alt form template

Alt forms are the **only** case where `baseSpeciesId` and `noGacha` should appear. Both are required here.

```javascript
[pokemonIdEnum.WORMADAM_SANDY]: {
  emoji: "<:10004:1234567890>", // from find-pokemon-emoji (forms server)
  baseSpeciesId: pokemonIdEnum.WORMADAM_PLANT,
  moveIds: [/* ... */],
  abilities: { [abilityIdEnum.OVERCOAT]: 1 }, // typical for forms
  battleEligible: true,
  rarity: rarities.RARE,
  growthRate: growthRates.FAST, // match base species
  noGacha: true,
},
```

If the form can transform **outside** combat, ALSO add its id to the base species' `formSpeciesIds` array (see `ROTOM` for an example) — this is the only situation where `formSpeciesIds` should appear. If it only transforms in-combat (like Cherrim), do NOT add it to `formSpeciesIds`.

### Fake Pokemon template

```javascript
[pokemonIdEnum.ASHS_PIKACHU]: {
  name: "Ash's Pikachu",
  emoji: "<:ashpikachu:1234567890>", // from find-pokemon-emoji (extra server)
  description: "A short flavor description.",
  type: [types.ELECTRIC],                      // 1–2 types
  baseStats: [85, 120, 70, 115, 80, 130],      // [HP, Atk, Def, SpA, SpD, Spe]
  sprite: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/MissingNo.svg/250px-MissingNo.svg.png",
  shinySprite: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/MissingNo.svg/250px-MissingNo.svg.png",
  abilities: {
    [abilityIdEnum.STATIC]: 1,
  },
  moveIds: [/* ... */],
  battleEligible: true,
  rarity: rarities.LEGENDARY,
  growthRate: growthRates.MEDIUMSLOW,
},
```

Fake-only rules:

- `name`, `description`, `type`, `baseStats`, `sprite`, `shinySprite`, `abilities` are **required** (config fails type check otherwise).
- `sprite` and `shinySprite` use the MissingNo placeholder URL above until real art is supplied.
- `noGacha`, `unobtainable`, `tags`, `baseSpeciesId` — omit unless the user explicitly asks for them.

## Field reference

| Field                    | Canonical                    | Fake              | Notes                                                                               |
| ------------------------ | ---------------------------- | ----------------- | ----------------------------------------------------------------------------------- |
| `name`                   | auto                         | required          | Display name                                                                        |
| `emoji`                  | required                     | required          | Resolve via `find-pokemon-emoji` skill                                              |
| `description`            | auto                         | required          |                                                                                     |
| `type`                   | auto                         | required          | `[types.X]` or `[types.X, types.Y]`                                                 |
| `baseStats`              | auto                         | required          | `[HP, Atk, Def, SpA, SpD, Spe]`                                                     |
| `sprite` / `shinySprite` | auto                         | required          | Use MissingNo placeholder for fakes                                                 |
| `moveIds`                | required                     | required          | Array of `moveIdEnum.*` refs                                                        |
| `abilities`              | optional override            | required          | `{ [abilityIdEnum.X]: weight }`. For canonical: omit to auto-populate from `pokemonData.json`; specifying this field **replaces** the auto-populated map (no merge — see Step 2 canonical rules) |
| `battleEligible`         | always `true`                | always `true`     |                                                                                     |
| `rarity`                 | required                     | required          | `rarities.COMMON/RARE/EPIC/LEGENDARY/MYTHICAL`                                      |
| `growthRate`             | required                     | required          | Match evolution line; see below                                                     |
| `evolution`              | when applicable              | rare              | Omit if target unimplemented                                                        |
| `baseSpeciesId`          | alt forms only               | only if requested | Omit unless explicitly needed                                                       |
| `formSpeciesIds`         | base of outside-combat forms | only if requested | Omit unless explicitly needed; see Rotom                                            |
| `noGacha`                | alt forms only               | only if requested | Omit unless explicitly needed                                                       |
| `unobtainable`           | if requested                 | if requested      | Omit by default                                                                     |
| `tags`                   | only if requested            | only if requested | Omit by default                                                                     |

### Growth rate guide

Growth rate is shared across an evolution line. If the new Pokemon is related (evolves from/into, or is a form of) an already-implemented Pokemon, **match that Pokemon's `growthRate`**. Otherwise choose by power level:

- `FAST` — weak/common lines (e.g. bugs like Caterpie)
- `MEDIUMFAST` — average lines
- `MEDIUMSLOW` — strong starters and most 3-stage lines
- `SLOW` — pseudo-legendaries and legendaries
- `ERRATIC` / `FLUCTUATING` — rare, usually match canonical games

## Step 3: Verify

After the config entry is in place:

1. Run the full test suite:

   ```bash
   npm test
   ```

   Fix any type errors or failures before proceeding.

2. Use the `verify-pokemon` skill to playtest the Pokemon's moves and ability in Discord via Playwright.

3. If errors surface during verification (moves crashing, abilities not firing, wrong stats, etc.), fix the underlying move / ability / config, re-run `npm test`, and re-verify until clean.

## Pitfalls

- **Missing `pokemonIdEnum` entry** — config edits using an undefined enum value produce silent bugs. Canonical Pokemon usually already have entries from the PokeAPI scrape, but always check.
- **Misunderstanding `abilities` override semantics** — the override is a shallow replacement, not a merge. Specifying `abilities: { [abilityIdEnum.NEW]: 1 }` on a canonical Pokemon **wipes out** the abilities auto-populated from `pokemonData.json`. To keep the canonical set, omit the field entirely; to add a single custom ability while keeping canonical ones, you must list all of them explicitly.
- **Adding optional fields proactively** — do not include `baseSpeciesId`, `formSpeciesIds`, `noGacha`, `tags`, or `unobtainable` unless the user explicitly requests them or the Pokemon is an alt form that requires them.
- **Adding an unimplemented Pokemon to another Pokemon's `evolution`** — evolution targets must exist in the config; if they don't, omit the evolution arrow (and revisit once they're added).
- **Mismatched growth rates within an evolution line** — always match related species.
- **Missing `formSpeciesIds` on base for outside-combat forms** — users won't be able to switch forms if this is skipped.

## References

- `src/config/pokemonConfig.js` — canonical + fake configs, plus `buildCanonicalEntry` which explains what canonical auto-populates
- `src/config/types.js` — `CanonicalPokemonConfigData` / `PokemonConfigData` typedefs (source of truth for required fields)
- `src/enums/pokemonEnums.js` — the ID enum
- `data/pokemonData.json` — cached Bulbapedia data; existence in this file = canonical
- Sibling skills: `find-pokemon-emoji`, `add-move`, `test-move`, `add-ability`, `verify-pokemon`
