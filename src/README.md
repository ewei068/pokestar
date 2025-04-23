# Pokestar src/

Pokestar is a Discord Bot that allows users to catch, train, and battle with Pokemon. Pokestar is run using Discord.js on the node runtime, and uses MongoDB for storage. It uses JSDoc for optional typing with a Typescript type engine.

Project Structure (not all directories included):

- `src/`

  - `battle/`

    - `data/` - Pokemon, moves, abilities, and items data
    - `engine/` - Battle simulation logic

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

**Battle Overview**

The `src/battle/` directory holds the data and engine that runs Battles in Pokestar. The `data/` directory stores the data of all moves, effects, abilities, and held items. The `engine/` directory handles the Battle simulation logic and has classes used for Battle simulation. There is also the @battleEnums.js file which stores the enums for moves, effects, abilities, and held items.

Note there is also the legacy deprecated @battleConfig.js which contains various moves, abilities, and effects. DO NOT modify @battleConfig.js unless explicitly asked to in a prompt, but this can be referenced to write new code.

**State**

To keep track of state between a user's interactions, the bot uses the @state.js service. This service is a simple key-value store; new interactions simply create new state and pass around a state ID within the ID of a Discord component. State is also removed after its TTL expires, but its TTL refreshes when accessed.

**Deact Overview**

The `src/deact/` directory holds the Deact module, a React-inspired framework to construct UI and handle interactions which the bot sends as messages to users. Deact seeks to provide some syntactic similarity to React such as re-useable and composable "elements" with props \(the term "Component" isn't used because components refer to Discord's interactable Components such as Buttons\), "hooks" for reusable logic, and a predictable lifecycle. It records the state of its interactions with the @state.js service. Deact does not yet support child elements.

The `src/elements` directory holds the custom elements used by the bot that are created with Deact. Not all of the bot's UI and interactions are supported here. There are some elements that are provided through `src/services` which are interacted with `src/components` and `src/events`. These are considered legacy UI and this form of making UI is deprecated.

**Configurations and Enums**

Much of the rules and the data of the bot is housed in the `src/config/` and `src/enums/` directory. Important configurations to note are:

- @pokemonConfig.js: The confiugration for all Pokemon and Pokemon-related information in the bot. Avoid editing this file unless directly prompted to
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
