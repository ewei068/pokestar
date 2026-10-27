# Pokestar src/

This directory contains Pokestar's Node backend: the Discord bot, battle engine,
durable battle service and authenticated HTTP API. It uses discord.js, MongoDB
and JavaScript typed with JSDoc/checkJs. The static React/TypeScript client lives
in `web/`; its development setup is in [web/README.md](../web/README.md).

Project Structure (not all directories included):

- `src/`

  - `battle/`

    - `data/` - Pokemon, moves, abilities, and items data
    - `engine/` - Battle simulation logic
    - `persistence/` - Durable battle records, stores and replay
    - `service/` - Shared commands and participant-safe battle views

  - `web/` - HTTP authentication, sessions, catalog and battle routes

  - `commands/` - Entrypoint for all user-triggered Discord commands
  - `handlers/` - Handlers for user-triggered commands and component interactions

  - `config/` - Configurations for various parts of the Bot
  - `services/` - Re-usable code that handles most of the Bot's business logic and interact with the database
  - `utils/` - Helper functions and utilities

  - `deact/` - React-inspired framework to construct UI for the Bot to send
  - `elements/` - Frontend "components" using the `deact` framework
  - `embeds/` - Discord Embeds with visual information and text that are to be sent to the user
  - `hooks/` - Hooks to be used by `deact` elements
  - `modals/` - Modals which are shown to the user and to be used by `deact` elements

  - `components/` - DEPRECATED components for users to interact with
  - `events/` - DEPRECATED handling of the deprecated `components/` interactions

**Command Flow**

1. `commands/` files define Discord slash and message commands, registered in @commandConfig.js
2. Handlers in `handlers/` route commands and component interactions
3. Commands call `services/` for business logic; services and persistence adapters own storage access
4. Results are sent as `embeds/` or as Deact `elements/`

Discord limits that shape this code: component custom IDs max out at 100 characters (hence state IDs instead of payloads), messages hold at most 10 embeds and 5 component rows, and interactions must be acknowledged within 3 seconds.

**Battle Overview**

The `src/battle/` directory holds the data and engine that runs Battles in Pokestar. The `data/` directory stores the data of all moves, effects, abilities, and held items. The `engine/` directory handles the Battle simulation logic and has classes used for Battle simulation. There is also the @battleEnums.js file which stores the enums for moves, effects, abilities, and held items.

`src/config/battleConfig.js` retains legacy moves, abilities and effects. Implement
new battle data in `src/battle/data/`; edit legacy definitions only when the task
requires it.

**State**

`src/services/state.js` keeps temporary Discord interaction and Deact UI state.
Component IDs refer to that state; its TTL refreshes on access. This is UI
context, not the authority for a durable battle.

Durable battles have stored identities and generated starting parties. Discord
and HTTP actions use the shared `BattleService`, with participant checks,
revision-checked writes and ordered events. Read
[the web-battler entry point](../docs/efforts/web-battler.md) for the service,
storage, continuation and completion contracts. Result rendering does not own
rewards. Legacy battle paths still exist behind the rollout flags.

**Deact Overview**

The `src/deact/` directory holds Deact, a React-inspired framework for Discord
messages and interactions, with elements, hooks and a predictable lifecycle.
It records UI state through `src/services/state.js`. Read the repository's
`deact` skill for composition and callback conventions. Browser React components
follow [web/AGENTS.md](../web/AGENTS.md).

The `src/elements` directory holds the custom elements used by the bot that are created with Deact. Not all of the bot's UI and interactions are supported here. There are some elements that are provided through `src/services` which are interacted with `src/components` and `src/events`. These are considered legacy UI and this form of making UI is deprecated.

**Configurations and Enums**

Much of the rules and the data of the bot is housed in the `src/config/` and `src/enums/` directory. Important configurations to note are:

- @pokemonConfig.js: Configuration for Pokemon and related game data; edit it when the task requires a configuration change
- @commandConfig.js: The confiugration for all commands and subcommands of the bot
- @databaseConfig.js: The database setup of the bot. This defines all the Bot's collections and views.

**Services**

The `src/services/` directory handles most of the Bot's business logic and also is primarily responsible for interfacing with the Bot's MongoDB database. The important services to note are:

- @pokemon.js: The service that primarly interacts with the "userPokemon" collection. This file handles the business logic for a user's Pokemon such as reading/listing Pokemon data, training Pokemon, and upgrading equipment.
- @trainer.js: The service that primarily interacts with the "users" collection. This file handles the business logic for a trainer such as reading the Trainer data, managing the backpack and money, and adding experience.

**Database**

Pokestar uses MongoDB as its database. The @mongoHandler.js is used to interface with the database. There is also a `QueryBuilder` pattern which is farily incomplete; try to use the `QueryBuilder` when possible but it's OK to use other functions in @mongoHandler.js, even if they're deprecated, if `QueryBuilder` can't support a query.

The main important collections are:

- "users" AKA `collectionNames.USERS`: Holds the data for each trainer (Discord User).
- "userPokemon" AKA `collectionNames.USER_POKEMON`: Holds the data for all Pokemon as well as the user ID who owns the Pokemon.

You can refer to @types.js for the fields a Trainer or Pokemon may have.
