# Pokestar

Discord bot for catching, training, and battling Pokémon. Node with discord.js v14, MongoDB, and plain JavaScript typed through JSDoc and checked by TypeScript (`checkJs`).

- Architecture, services, state, and database conventions: `src/README.md`
- Battle engine, data, and event listeners: `src/battle/README.md`
- Running and deploying the bot: `runbook.md`

## Commands

- `npm test`: all Jest suites. `npm test -- <path>` runs one file. The database is mocked in `src/__testing__/setup.js`, so tests need no MongoDB.
- `npm run typecheck`: TypeScript over the whole project.
- `npm run lint -- <files>`: ESLint on the given files.
- `node src/index.js`: runs the bot against the Discord app in `.env` (template: `.env.in`).

## Definition of done

- The test suites covering the area you touched pass. Run the full `npm test` after changing the battle engine or a shared service.
- Every file you created or changed is type-clean and lint-clean in the lines you wrote. The project carries a legacy baseline of type and lint errors (concentrated in `src/config/battleConfig.js` and `src/services/`), so filter the output to your files and leave pre-existing errors in code you didn't touch:

  ```bash
  npm run typecheck --silent | grep -E '^src/(battle/data/moves|services/foo)\.js'
  npm run lint -- src/battle/data/moves.js src/services/foo.js
  ```

- New functions carry JSDoc parameter and return types precise enough for TypeScript to check their callers, and pass the type checker without `@ts-ignore` or `any`. Shared typedefs live in `types.js` at the root and in per-directory `types.js` files.

## Boundaries

- `src/config/` and `src/enums/` hold game data and rules. Change them when the task is about that data: adding a Pokémon edits `pokemonConfig.js`, adding a move adds a `moveIdEnum` entry.
- `src/config/battleConfig.js` holds legacy battle definitions. Read it for reference; implement new moves, abilities, effects, and held items in `src/battle/data/`.
- Build new UI with Deact (`src/deact/`, `src/elements/`, `src/hooks/`, `src/modals/`). `src/components/` is the legacy UI path.
- The root `README.md` and `changelog.md` are player-facing; `design.md` is the original 2023 design doc and describes history, not current behavior.

## Conventions

- Write self-documenting code; reserve comments for genuinely complex logic.
- Keep the existing order of imports and exports.
- Keep the diff to what the task asks for.

## Project skills

Skills live in `.cursor/skills/<name>/SKILL.md`. Read the matching one before starting its task:

- `add-move`, `add-ability`, `add-effect`, `add-held-item`: implementing battle data.
- `write-tests`: Jest tests, battle test utilities, and custom matchers.
- `deact`: Deact elements, hooks, component callbacks, and modals.
- `create-command`: new Discord slash or message commands.
- `plan-add-pokemon`, then `add-pokemon`, then `verify-pokemon`: adding Pokémon end to end.
- `find-pokemon-emoji`: looking up a Pokémon's Discord emoji string.
- `verify-discord`: exercising bot commands in Discord through Playwright.

## Agent skills

### Issue tracker

GitHub Issues on `ewei068/pokestar`; issues created through agent workflows carry the `agent` label. See `docs/agents/issue-tracker.md`.

### Triage labels

The five default triage roles, each label string equal to its role name. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.
