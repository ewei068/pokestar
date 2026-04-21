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
- `moveIds` — the four (or fewer) moves. For each move, note whether it's already implemented in `moveIdEnum`.
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

If the entry is missing, add it inside `pokemonIdEnum` in numerical ID order next to similar Pokemon (alt forms next to their base species):

```javascript
LUCARIO: "448",
```

**Every other file references the Pokemon through `pokemonIdEnum.XXX`, so this must exist before editing the config.**

## Step 1: Validate inputs and dispatch subagents

Once you know the config type and have the required inputs, **dispatch subagents in parallel** to do the work. One message, multiple `Task` tool calls:

1. **Emoji agent** — dispatch with the `find-pokemon-emoji` skill to look up the Pokemon's emoji string (canonical `<:id:snowflake>`, form `<:idform:snowflake>`, or fakemon name-based). Give the agent the Pokemon's numeric ID, display name, and (for alt forms) the form suffix. Have the subagent return the emoji string so the main config agent can paste it directly into the `emoji` field — or, once Step 2 has produced the config entry, point the subagent at that entry and let it paste the emoji in place itself. Either approach is fine; whichever is simpler for the current task.

2. **One agent per unimplemented move** — dispatch with the `add-move` skill to implement and test each missing move. The `add-move` skill is responsible for adding the corresponding entry to `moveIdEnum`, so you don't need to do that here. Tell the agent to also refer to the `test-move` skill if the move has complex logic. Wait for these before proceeding to Step 2.

3. **One agent per ability flagged for implementation** — dispatch with the `add-ability` skill. Abilities referenced **without** an implementation directive can just be listed (for fakes) or skipped (for canonical, see below).

   **Important for canonical Pokemon:** even if an ability needs implementing, do NOT add it to the Pokemon's `abilities` config field if that ability already appears in the Pokemon's entry in `data/pokemonData.json` — `buildCanonicalEntry` will auto-merge it. Implement the ability, but leave the config alone.

4. **Main config agent** (or handle inline) — add the Pokemon entry to `pokemonConfig.js` using the templates below, including move refs, ability refs, and all other fields. Paste the emoji string returned by the emoji agent into the `emoji` field (or leave a brief placeholder if the emoji agent will fill it in directly after Step 2).

If the task is small (e.g. all moves/abilities already exist), skip subagents and do the config edit inline — but still run the `find-pokemon-emoji` skill yourself to fill in the `emoji` field.

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
- **`abilities`**: **omit** unless you need to override the auto-populated abilities from `pokemonData.json`. Never add abilities to the config that already appear in the Pokemon's `pokemonData.json` entry — they're merged automatically. Alt forms (e.g. `DEOXYS_ATTACK`) typically need an explicit `abilities` override.
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
| `abilities`              | optional override            | required          | `{ [abilityIdEnum.X]: weight }`; never list abilities already in `pokemonData.json` |
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
- **Re-listing canonical abilities in the config** — abilities that already appear in the Pokemon's `pokemonData.json` entry are auto-merged; listing them again is redundant and should be removed. Only override to add something custom (e.g. alt forms).
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
