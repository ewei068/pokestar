# Pokestar Design Doc
## Introduction
This document describes the design for a Discord bot that supports multiple Pokemon functionalities. This includes catching, training, and battling with Pokemon. The bot will be designed to run on the Discord platform and will be built using the Discord.js library.

## Scope
The scope of this project is limited to building a basic Discord bot with the following features:

* Allow users to catch Pokemon via a gacha system
* Provide users with items via time-gated rewards and a shop
* Visually display user data such as items and owned Pokemon
* Allow users to upgrade their Pokemon via training, including levels, EVs/IVs, abilities, held items, nature, and moveset
* Conduct battles between trainers or NPCs

## Requirements
The bot should be able to perform the following functions:

* Respond to a few basic commands such as !help, !info, and !ping
* Support Pokemon commands
* Persist the state of the user's Pokemon data across servers
* Handle errors gracefully and provide informative error messages to users 

## Architecture
The bot will be built using the Discord.js library, which is a powerful and widely-used library for building Discord bots. The bot will be hosted on a GCP server using a Node.js runtime environment. The data will be stored on a [TBD] database.

The following components will be used to build the bot:

* Discord.js library
* Node.js runtime environment
* Database


## Design
The bot will be designed to handle incoming events from the Discord server, such as when a user sends a message with a command. The bot will respond to these events by executing the appropriate code.

The following design patterns and best practices will be used to ensure the bot is scalable, maintainable, and easy to modify:

* Command pattern: The bot will use a command pattern to handle incoming commands from users. Each command will be represented by a separate JavaScript file that can be easily modified or extended.
* Error handling: The bot will use a robust error handling system to catch and handle errors. Errors will be logged to the console and informative error messages will be sent to users.
* User Interface:
The bot will not have a graphical user interface, as it will be a chatbot that interacts with users through text commands. Users will interact with the bot by sending messages in a designated channel on the Discord server.

## Security
Rate limiting users and/or servers: TBD.

## Detailed Implementation

### General Implementation
* Command prefix: The `ps!` prefix will be used to signal a bot command. This prefix is designed to be unique to ensure compatability with other possible bots on the server. Development stages will have different prefixes.
* Command config: A config file will be kept that enumerates each command and its appropriate information.
* Command handler: When the bot is started up, the command config is parsed to map each command in the stage and all its aliases to a its execution function. Upon recieving a command, the command handler will validate that the correct prefix is used. Then, the command will be looked up in the command map. If the command exists, the arguments will be parsed and validated. If no errors, the appropriate function will be executed.
* Stages: There will be three stages: alpha, beta, and prod. The alpha stage is for local development, while the beta and prod stages will be hosted on separate GCP instances.
* Environment variables: A few environment variable will be kept to assist with staging.
	* DISCORD_TOKEN: Secret token of the bot for the stage.
	* STAGE: Name of the stage, either `ALPHA`, `BETA`, or `PROD`.
	* DB_URL: URL for the database at the stage.

**Help**

* Aliases: `help`, `h`
* Args:
	* OPTIONAL `command`
* Functionality: Parses through the command config, listing out all command categories, the commands, descriptions, and arguments. If `command` is provided, will only list out the detailed information for the specified command.

### Pokemon

* User Pokemon: Each unique Pokemon in the game will have an entry in a locally-stored configuration file. A user's Pokemon will be stored in the database with unqiue values such as level and IVs. Together, the configuration and unqiue Pokemon values will compute its stats and information.
* Rarity: Pokemon will come in different rarities that modify their draw chances. These rarities will be based on a fully evolved Pokemon's base stat total and general effectiveness.
	* Common: Bad/unpopular Pokemon.
	* Rare: Mediocre/average Pokemon.
	* Epic: Generally competetive, non-legendary Pokemon.
	* Legendary: Legendary Pokemon, as categorized by Bulbapedia.
	* Mythic: Mythical Pokemon, as categorized by Bulbapedia. (May not be rollable -- have yet to decide).
* Banner: Banners modify the rates that a Pokemon shows up once a particular rarity is rolled. There will be up to three active rotating banners at a time.
	* General banner: all rates equal.
	* New Pokemon: Rate up for newly released Pokemon.
	* Select: Manually selected rate-up banner. 

**Gacha**

* Aliases: `gacha`, `g`, `roll`, `draw`
* Args:
	* `bannerId`
	* `ball`
* Functionality: Attempts to use the specified `ball` to roll on the provided `bannerId`. Errors out if `bannerId` or `ball` doesn't exist, or if user doesn't have enough balls. If successful, a Pokemon will be drawn from the banner. This Pokemon will be level 1, 0 EVs, random IVs, random ability, random nature, base moveset. The Pokemon will also have a randomly generated UUID.

**List**

* Aliases: `list`, `listpokemon`
* Args:
	* OPTIONAL `page`
	* OPTIONAL `filter`
	* OPTIONAL `sort`
	* OPTIONAL `sortOrder`
* Functionality: Lists out up to 25 Pokemon owned by this player. This list will only show Pokemon ID, name, level, and type. Use `page`, `filter`, and `sort` to display a different subset of Pokemon. Filter will filter for name subset, while sort will sort based of TBD columns.

**Inspect**

* Aliases: `inspect`, `i`
* Args:
	* `id`
* Functionality: Uses the user ID and provided Pokemon `id` to look up the Pokemon. If it exists, displays all the information about the Pokemon.

**Train**

**Evolve**

### Trainer

* Money: How much money a user has
* Backpack
	* Pokeballs: Used to draw the gacha at various rates (Common/Rare/Epic/Legendary).
		* Pokeball: 70/20/9/1
		* Greatball: 30/50/17/3
		* Ultraball: 0/50/45/5
		* Masterball: 0/0/90/10
	* Held items: TBD
	* Evolution items: TBD

**Daily Rewards**

* Aliases: `daily`, `dailyrewards`
* Args: none
* Functionality: Draws the daily rewards for the player, if the player hasn't drawn the daily rewards yet. The balls are displayed to the player and stored in their backpack. For now, the daily rewards are 3 random Pokeballs with probability:
	* Pokeball: 70%
	* Greatball: 25%
	* Ultraball: 4%
	* Masterball: 1%

**Backpack**

* Aliases: `backpack`, `pack`, `b`
* Args: none
* Functionality: Lists all the items in the user's backpack by category and their quantity.

## Data

### General

**Command config:**

* Category: Category of commands.
	* Description: Description of commands in this category.
	* Folder: Folder where commands in this category are located.
	* Commands: List of commands under this category
		* Name: The name of the command.
		* Aliases: All aliases of a command. Aliases can be used in place of a command name.
		* Args: Arguments of a command, to be listed after the command name.
			* Type: Type of argument.
			* Optional: Whether or not the argument is optional.
			* Variable: If an argument is variable, it may contain multiple words and must be at the end of the command.
		* Execute: JS file where this command's execute functionality is located.
		* Description: Description of the command to be listed under help.
		* Stages: Which stages to enable this command under.

### Pokemon

**Pokemon config:**

* ID: Pokemon's unique ID.
* Name: Pokemon's display name.
* Rarity: Rarity of Pokemon, determines growth rate.
* Type: The type(s) of the Pokemon.
* Stats: List of base stats for the Pokemon.
* Sprite: Link or path to Sprite.
* Abilities: Abilities the Pokemon can have.
* Moves: Moves the Pokemon can learn.
* Evolution
	* Level: Evolution level
	* Item: Evolution item

**User Pokemon:**

* ID: Unique ID of Pokemon for user.
* Level: Pokemon's level, capped at 100.
* Exp: Current Pokemon exp.
* EVs: List of EVs for Pokemon.
* IVs: List of IVs for Pokemon.
* Nature: Pokemon's nature, modifying stats.
* Ability: Pokemon's ability.
* Item: Pokemon's held item.
* Moves: Pokemon's currently learned moves.
* Equipped Moves: Pokemon's currently equipped moves.

**Nature**

* ID: Unique ID for the nature.
* Name: Name of the nature.
* Up: Stat the nature boosts.
* Down: Stat the nature reduces.

## Starting Roadmap

* General functionality
* Basic trainer: daily rewards, balls, backpack
* Basic pokemon: draw, list, inspect
* Basic training: train, evolve
* Basic battling: placement, teams, moves (no abilities/held items)