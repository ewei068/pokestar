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
The bot will be built using the Discord.js library, which is a powerful and widely-used library for building Discord bots. The bot will be hosted on a GCP server using a Node.js runtime environment. The data will be stored on a MongoDB database.

The following components will be used to build the bot:

* Discord.js library
* Node.js runtime environment
* MongoDB database

### Database

There are two options being considered for database

**Option 1: MongoDB (recommended)**

* Pros:
	* Easy to use
	* Easy to handle queries and data access
	* Flexible schema
	* New (want to learn)
* Cons:
	* May be slower
	* Harder to support complex operations and queries
	* (Possibly) more expensive

**Option 2: Postgres**

* Pros:
	* Already know how to use
	* Easily supports complex operations
	* Data is somewhat-relational
	* Flexible compared to other SQL
* Cons:
	* Hard to query
	* More difficult to make changes
	* Requires more planning

**Choice: Option 1 MongoDB**

I'm deciding to go with MongoDB for a few reasons. First, the ease-of-use and flexibility of MongoDB will be useful for this project as I don't know the full scope and data requirements as of yet. Some of the data takes on a document-like structure, such as Pokemon information and backpack information, which makes MongoDB convenient. Additionally, I'd like to learn something new for this project.


## Design
The bot will be designed to handle incoming events from the Discord server, such as when a user sends a message with a command. The bot will respond to these events by executing the appropriate code.

The following design patterns and best practices will be used to ensure the bot is scalable, maintainable, and easy to modify:

* Command pattern: The bot will use a command pattern to handle incoming commands from users. Each command will be represented by a separate JavaScript file that can be easily modified or extended.
* Error handling: The bot will use a robust error handling system to catch and handle errors. Errors will be logged to the console and informative error messages will be sent to users.
* User Interface:
The bot will not have a graphical user interface, as it will be a chatbot that interacts with users through text commands. Users will interact with the bot by sending messages in a designated channel on the Discord server.

The goal of this bot is to be a fresh, unique take on other Discord Bots, Pokemon Bots, and Pokemon games. To accomplish this, we will focus on the following unique game mechanics:

* Gacha: Pokemon and other items will be obtained by a gacha system. This will make obtaining items feel more exciting and rewarding. We will ensure fairness of the gacha with pity mechanics, selection mechanics, and fair rates.
* Progression: Players will be able to progress in multiple ways, such as Pokemon training, user level-ups, and purchasing from the shop.
* Interactivity: When applicable, bot responses will include buttons to allow for better responsive-ness and ease of interaction.
* Battles: There will be a focus on the battling system. Battles will be unique, 6v6 turn-based battles with each move and Pokemon individually tuned. There will be multiple battle modes, both PvP and PvE.
* Socialization: Due to the social nature of Discord, systems in the game will be tuned for socialization. This may include PvP battles, trading, and Co-op.

## Security
Rate limiting users and/or servers: TBD.

Suspending users: TBD.

## Detailed Implementation

### General Implementation
* Slash commands: the Bot will support both message prefixes and Slash commands.
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
* Functionality: Attempts to use the specified `ball` to roll on the provided `bannerId`. Errors out if `bannerId` or `ball` doesn't exist, or if user doesn't have enough balls. If successful, a Pokemon will be drawn from the banner. This Pokemon will be level 1, 0 EVs, random IVs, random ability, random nature, base moveset. The Pokemon will also have a randomly generated UUID. Right now, banner is not implemented.

**Banners**

List banners.

**List**

* Aliases: `list`, `listpokemon`
* Args:
	* OPTIONAL `page`
	* OPTIONAL `filterby`
	* OPTIONAL `filtervalue`
	* OPTIONAL `sortby`
	* OPTIONAL `descending`
* Functionality: Lists out up to 10 Pokemon owned by this player. This list will only show Pokemon ID, name, level, and type. Use provided arguments to display a different subset of Pokemon. Filter will filter a `filterby` with equality to `filtervalue`. Right now, planned filters include shiny, name, species, and rarity. `sortby` decides which field to sort on. Right now, fields include name, iv total, level, and combat power.

**Info**

* Aliases: `info`, `i`, `pokemoninfo`, `pi`
* Args:
	* `pokemonid`
* Functionality: Uses the user ID and provided Pokemon `pokemonid` to look up the Pokemon. If it exists, displays all the information about the Pokemon.

**Train**

* Aliases: `train`, `t`
* Args:
	* `pokemonid`
	* OPTIONAL `location`
* Functionality: Trains the Pokemon at `pokemonid` by granting it EXP, and leveling up if appropriate. If `location` is provided, will train it at a location (different locations give different EXP and EVs).

**Evolve**

* Aliases: `evolve`
* Args:
	* `pokemonid`
* Functionality: If the Pokemon at `pokemonid` can evolve, lists all elligible evolutions for that Pokemon. The user can then select that Pokemon and confirm its evolution. To evolve, the Pokemon's ID, abilities, moves, and stats are changed. If the name is the default species name, then the name is changed too.

**Release**

* Aliases: `release`
* Args:
	* `pokemonids`
* Functionality: Releases up to 10 Pokemon specified in `pokemonids`. First sends a confirmation message about the release. If confirmed, releases said Pokemon and grants the user Pokedollars equal to the combined worth of the released Pokemon.

### Trainer

* Level: Players can gain EXP via certain commands and component interactions, allowing them to level up. Higher levels allow users to train Pokemon faster and claim valuable level rewards.
* Money: How much money a user has. Money will be gained from the following planned methods:
	* Commands & interactions will give a small amount of money
	* Level rewards
	* Releasing Pokemon gives money based off rarity
	* Daily rewards?
* Backpack
	* Pokeballs: Used to draw the gacha at various rates (Common/Rare/Epic/Legendary).
		* Pokeball: 70/20/9/1
		* Greatball: 30/50/17/3
		* Ultraball: 0/50/45/5
		* Masterball: 0/0/90/10
	* Held items: TBD
	* Evolution items: TBD
* Locations: Currently locations can be purchased at the Pokemart and grant bonus EXP or EVs during training.

**Trainer Info**

* Aliases: `trainerinfo`, `trainer`, `ti`, `user`, `userinfo`
* Args: OPTIONAL `user` (discord handle) 
* Functionality: Displays the users info if no args. If `user` provided, displays info for the specified user (don't implement yet). 

**Daily Rewards**

* Aliases: `daily`, `d`
* Args: none
* Functionality: Draws the daily rewards for the player, if the player hasn't drawn the daily rewards yet. Gives 300 Pokedollars and 3 random Pokeballs. The balls are displayed to the player and stored in their backpack. For now, the daily rewards are 3 random Pokeballs with probability:
	* Pokeball: 70%
	* Greatball: 25%
	* Ultraball: 4%
	* Masterball: 1%

**Level Rewards**

* Aliases: `levelrewards`
* Args: none
* Functionality: Claims any unclaimed level rewards, including money, items, and Pokeballs. A list of claimed level rewards will be stored for the user in the database. Whenever level rewards change, a script will be ran to reset the level rewards, allowing users to re-claim them.

**Backpack**

* Aliases: `backpack`, `bp`
* Args: none
* Functionality: Lists all the items in the user's backpack by category and their quantity.

**Locations**

* Aliases: `locations`
* Args: none
* Functionality: Lists all trainer owned locations and their levels.

### Shop

**Shop**

* Aliases: `shop`, `s`, `pokemart`, `pm`
* Args: none
* Functionality: Displays the user's money and a selection menu of all the categories. Selecting a category will bring the user to the category. In a shop category, a player can scroll through the category, and select an Item to view more info.

**Buy**

* Aliases: `buy`, `b`
* Args:
	* `itemid`
	* OPTIONAL `quantity`
* Functionality: Attempts to buy an item from the shop. Quantity defaults to 1. First, checks last purchase date. If it's a new day, resets daily item purchase limits. Then, checks to see if user has enough money to purchase items at said quanity. If able to purchase, special logic to enact purchase is executed depending on the item. Finally, updates daily item purchase limit & last purchase date.

### Social

**Leaderboard**

* Aliases: `leaderboard`
* Args:
	* `category`
	* OPTIONAL `scope`
* Queries a joined view of users and user Pokemon to show the top ten users or Pokemon. The `category` argument provides the metric that is being measured. Current planned leaderboards include: user level, user num shinies, user net Pokemon worth, user total Pokemon combat power. The `scope` parameter allows users to specify server or overall rankings, defaulting to overall. If friends can be easily implemented, then that will be another option (doesn't seem likely right now).

### Battle

**Format:** Battles are planned to be a turn-based 1v1 (PvP or PvE) format where 6 Pokemon on each side face off *at the same time*. This is different to typical Pokemon battles where only one Pokemon faces off at a time, allowing Pokemon to be swapped in. Because of this format, the battles will be balanced around AoE attacks, support & synergy among Pokemon, and modified move usage. Once all Pokemon on one side are knocked out, a winner is decided.

**Turns:** A Pokemon's speed determines how fast their combat readiness fills up. Once at 100% combat readiness, a Pokemon may move. Note that this may allow for certain Pokemon to go multiple times in a row, or certain players to move many times before an opponent. Due to this, a consideration will be made for speed tuning to better even out speeds among Pokemon. Additionally, certain moves or abilities may manually boost the combat readiness meter.

**Moves:** At the beginning, each Pokemon will have a set move pool of 4 moves. 1 move will be a "basic" move, 2 being "powerful" moves, and 1 being an "ultimate" move. The basic move will have no cooldown, while the other moves will have long cooldowns. The long cooldowns are a balancing mechanism to allow these moves to be more powerful without harming the game state, while also forcing the player to strategically utilize a Pokemon's full moveset. Additionally, some moves will have special area of effect attack patterns, allowing for more move variety and strategy. Finally, moves may "miss". A miss is calculated by considering base move accuracy, type advantages, buffs & debuffs. If a move misses, it won't apply extra effects to the target, and will deal 0.7 times damage.

**Placement:** Each player will be able to arrange their 6 Pokemon on a 3x3 grid. Proper placement should be ensured to account for special attack or support move AoE patterns. Additionally, most moves will be forced to target the front row first, allowing for strategic placement of tanky vs support/DPS Pokemon in different rows.

**Abilities:** TBD

**UI:** The UI will consist of the following components:

* Battle log: the "content" of the message will contain a battle log for everything that happened in the previous turn, and will mention the user who's turn it is.
* Battle Layout: an embed with the layout of the current battle, displaying all involved parties, their Pokemon, HP, and positions.
* Battle Info: an embed with info on the current battle. Comes with multiple options such as user pokemon and move info.
* Info selection menu: Allow the users to select what information shows up in the battle info embed.
* Move selection menu: Allows users to select what move to use.
* Target selection menu: When a move is selected, the target selection menu appears, displaying valid targets of the move.

**Details:**

The state and management of a battle will be kept with a special `Battle` class:

`class Battle`

* `userIds`: list of IDs of involved parties
* `users`: mapping of user ID => user Object & if the user is an NPC
* `teams`: list of team Object. A team Object contains team information such as users
* `turn`: which Pokemon's turn it is
* `pokemon`: mapping of user ID => 3x3 grid of `Pokemon` objects (see below)
* `log`: log of the current battle messages to be displayed. Resets each turn.
* `eventHandler`: event handler for this battle. Various entities may register event listeners to the handler.
* `winner`: the winner of the battle, if there is one. Once the battle is won, no further actions will take place.
* `constructor()`: fills in all relevant fields, creates the event handler and Pokemon grid.
* `battleStart()`: begins the battle. Triggers any `onBattleStart` events.
* `nextTurn()`: ticks the next turn of the battle, to be used after `battleStart` or after a party's move. Executes the following functionality:
	* Turn end functionality: triggers any `onTurnEnd` events, then ticks down all buffs and debuffs for the Pokemon who's turn it is.  Also ticks up status effects.
	* Battle win: check if the battle has been won or tied. If so, ignore next steps and end game.
	* Next turn functionality: calculates who goes next by using current combat readiness and Pokemon speed. Then, calculate how many "ticks" it takes to get that Pokemon to 100% CR, and adds CR to all other Pokemon according to ticks and speed. Finally, set `turn` to the Pokemon with 100% CR.
	* Turn begin functionality: triggers any `onTurnBegin` events, then ticks down all cooldowns for the Pokemon who's turn it is.

`class BattleEventHandler`

* `battle`: reference to the Battle where this instance belongs
* `eventNames`: mapping of event names => event listener IDs
* `eventListeners`: mapping of event listener IDs => event listener
	* Listeners have the following fields:
		* `execute`: execution function, which should take in one argument `args`
		* `xargs`: extra arguments to insert into function
* `registerListener(eventName, eventListener) -> listenerId`:
	* Creates a new ID for the event listener
	* Registers the event listener ID in `eventNames`
	* Registers the event listener in `eventListeners`, adding `listenerId` to `xargs`
	* Returns the event listener ID
* `unregisterListener(eventName, listenerId)`: unregisters the event listener if it exists in the event name and specified ID
* `triggerEvent(eventName, args, listenerId=null)`:
	* For all listeners on event name, combine `args` and `xargs`, then trigger its execute function
	* If `listenerId` is provided, only trigger that listener

`class Pokemon`

* `battle`: reference to the Battle where this instance belongs
* `pokemonData`: Pokemon object that was stored in database
* `speciesData`: species data from config
* `userId`: user ID of owning trainer
* `stats`: (6 fields) of all stats
* `currentHp`: current HP of Pokemon, starts at max HP
* `effectIds`: mapping of effect (buff, debuff, neutral) => cooldown
* `moveIds`: mapping of moves => cooldown
* `statusId`: Pokemon's current status effect, if any, + how many turns its been active
* `combatReadiness`: combat readiness of Pokemon
* `position`: grid position of Pokemon
* `fainted`: if the Pokemon has fainted
* `useMove(move, target) -> err`:
	* Check to see if its this Pokemon's turn
	* Check to see if valid move & move off cooldown
	* Check to see if valid target
	* Clear battle log
	* Trigger `onMoveBegin` events
	* Triggers move execution function
	* Trigger `onMoveEnd` events
	* Trigger `battle.nextTurn()`
* `dealDamage(damage, target, type) -> damageDealt`:
	* Use `type` to trigger any necessary events
	* Trigger `beforeDealDamage` events
	* Triggers `target.takeDamage()`
	* Trigger `afterDealDamage` events
	* Use `type` to trigger any more necessary events
	* Return damage dealt
* `takeDamage(damage, source, type) -> damageTaken`:
	* Use `type` to trigger any necessary events
	* Trigger `beforeTakeDamage` events
	* Calculate HP loss
	* Trigger `faint` if necessary
	* Trigger `afterTakeDamage` events
	* Use `type` to trigger any more necessary events 
	* Return damage taken
* `giveHeal` and `takeHeal` will work the same way
* `faint()`:
	* Sets current HP to 0, and `fainted` to true
	* Triggers `onFaint` events

`isMiss(source, move, targets, eventHandler)`: Calculate whether or not the move misses, and triggers `onAccuracyCheck` events.

`calculateDamage(source, move, target, miss)`: Calculate and returns damage done based on given parameters.

Typical battle turn: 

* User chooses move => get list of valid targets
* User chooses a target
* `Pokemon.useMove()` is called on relevant targets
	* Targets get damaged
	* Effects get applied
	* nextTurn is called
	* Battle state is updated
* Build new log, embeds, components from battle state
* Send updated message


## Data

### MongoDB

The MongoDB will have two collections as of now. These are the Users and User Pokemon collections (as specified below). Queries will be handled by a MongoDB client helper, which is in charge of loading MongoDB client, specifying tables, and interacting with the client.

To manage schema migrations, a config will be created that details the tables and their index configurations. A file will be created that will create the tables and indices from the config if they don't already exist. This script will be run before every deployment.

Once the data schema gets more set-in-stone, JSON schema validation will be implemented.

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
			* Description: Description of argument.
			* Optional: Whether or not the argument is optional.
			* Variable: If an argument is variable, it may contain multiple words and must be at the end of the command.
		* Execute: JS file where this command's execute functionality is located.
		* Description: Description of the command to be listed under help.
		* Stages: Which stages to enable this command under.

### Pokemon

**Pokemon config:**

* SpeciesID: Pokemon's unique ID. 
* Name: Pokemon's display name.
* Rarity: Rarity of Pokemon.
* Type: The type(s) of the Pokemon.
* Stats: List of base stats for the Pokemon.
* Sprite: Link or path to Sprite.
* Abilities: Abilities the Pokemon can have, and the probability to get them.
* Moves: Moves the Pokemon can learn.
* Evolution
	* Level: Evolution level
	* Item: Evolution item
	* ID: ID of pokemon it evolves to
* Growth: EXP growth of pokemon.

**User Pokemon (in database):**

* ID (index): Unique ID of Pokemon for user.
* UserID (index): Unique ID of Pokemon's owner.
* SpeciesID: Pokemon's species.
* Name: User-given name to pokemon, defaults to Pokemon species.
* Level: Pokemon's level, capped at 100.
* Exp: Current Pokemon exp.
* EVs: List of EVs for Pokemon.
* IVs: List of IVs for Pokemon.
* NatureID: Pokemon's nature ID, modifying stats.
* AbilityID: Pokemon's ability ID.
* Item: Pokemon's held item.
* MoveIDs: Pokemon's currently learned move IDs.
* Equipped MoveIDs: Pokemon's currently equipped move IDs.

**Nature**

* ID: Unique ID for the nature.
* Name: Name of the nature.
* Up: Stat the nature boosts.
* Down: Stat the nature reduces.

### Trainer

**Users (in database):**

* UserID (index): User's Discord ID.
* User: JSON of user information.
* Level: User level.
* Exp: User's current Exp.
* Money: User's money.
* LastDaily: Time last daily reward claimed.
* Backpack:
	* {CATEGORY_ID}: ID of cateogry.
		* {ITEM_ID} => Quantity: Maps an item ID to quantity of owned item.
* claimedLevelRewards: Array of level rewards claimed.
* purchasedShopItemsToday: Map of itemId => quantity purchased; used to track daily purchase limits.
* lastShopPurchase: Date of last shop purchase, resets purchasedShopItemsToday on a new day.
* locations: Map of owned locations => level.

**Backpack Category Config**

* CategoryID: Category of items.
	* Name: Name of Category.
	* Description: Description of Category.
	* ItemIDs: List of item IDs belonging to this category

**Backpack Item Config**

* ItemID
	* Name: Name of item.
	* Category (?): Category of item.
	* Description: Description of item.
	* Image (?): Link to image of item. 

### Battle

**Move Config**

* Move ID
	* Name
	* Type
	* Special/Phys
	* Category
	* Power
	* TargetType
	* TargetPosition
	* TargetPattern
	* Cooldown
	* Description
	* Execute

**Effect Config**

* Effect ID
	* Name
	* Duration
	* Description
	* onEffectAdd
	* onEffectRemove

## Starting Roadmap

* General functionality (DONE)
* Setup Database (DONE)
* Basic trainer: daily rewards, balls, backpack (DONE)
* Basic pokemon: draw, list, inspect, release (DONE)
* Basic training: train, evolve (DONE)
* Basic money: money acquisition & shop (DONE)
* Leaderboards, sort/filter, shinies (DONE)
* Take care of other issues: help revamp, documentation, code qc, add emojis?
* Basic battling: placement, teams, moves (no abilities/held items)
* Database schema validation ?
* Automate stage deployment pipeline and testing