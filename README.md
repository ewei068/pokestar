<div align="center">
    <h1 style="text-align: center;">
        <a href=https://discord.com/oauth2/authorize?client_id=1093411444877439066&permissions=18136036801601&scope=applications.commands%20bot>
            Pokéstar
        </a>
    </h1>
</div>

<div align="center">
    <p style="text-align: center;">
        A Pokémon Discord bot. Currently open for beta testing! <b><a href=https://discord.com/api/oauth2/authorize?client_id=1093411444877439066&permissions=517610982464&scope=bot%20applications.commands>Invite Pokéstar to your server.</a></b>
    </p>
    <p style="text-align: center;">
        <b><a href=https://discord.com/api/oauth2/authorize?client_id=1093411444877439066&permissions=517610982464&scope=bot%20applications.commands>👾 Discord</a> • <a href= https://discord.gg/ygVPUXeJXZ>💻 Server</a> • <a href=https://github.com/ewei068/pokestar#tutorial>📝 Tutorial</a> • <a href=https://github.com/ewei068/pokestar#all-commands>💬 Commands</a>
    </p>
</div>

<p align="center">
  <a href="https://discord.com/api/oauth2/authorize?client_id=1093411444877439066&permissions=517610982464&scope=bot%20applications.commands" target="_blank">
    <img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/pokestar-main.png">
  </a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images//events/pokestar-op-banner.png" height="300">
</p>

## Why Pokéstar?

Pokéstar focuses on a few key features that sets it apart from other Pokemon Discord bots, making for a fresh, fun experience.

**Battling**

The main focus of Pokéstar is the unique 6v6 battling system. Battles involve *all 6 Pokemon* on each side battling at once, a new system designed specially for this bot. 

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/battle.gif" height="500">

The new format makes for fun and exciting teamplay among Pokemon, while keeping or adapting many mechanics from the original Pokemon games to stay true to the original, competitve format.

Right now, only PvP battles are implemented. In the future, we plan to implement more battle formats such as PvE, server raids, and Co-op. Additionally, original Pokemon mechanics such as abilities and held items will be adapted as well. The future for battling in Pokéstar is very exciting, so join now and stay tuned!

**Socialization**

Pokéstar aims to take advantage of Discord's inherently social nature by adding social mechanics to the game. Already, functions such as battling and leaderboards exist for this. However, we plan make the bot more social-focused by adding features such as trading, server gifts, and co-op raids.

**Interactivity**

Pokéstar tries to be a fluid and responsive experience. Components and UI are a core focus of Pokéstar to make the bot easy to interact with and fun to use. (NOTE: I am not a UI designer whatsover so this is definitely a WIP)

**Convinced? [Invite Pokéstar to your server!](https://discord.com/api/oauth2/authorize?client_id=1093411444877439066&permissions=517610982464&scope=bot%20applications.commands)**

## Tutorial

### 👉 Getting Started

**[IMPORTANT] Bot Usage**

* This bot supports both slash commands and legacy message commands with the `psb!` prefix, but it's recommended to use slash commands.
* User's are rate limited to 1 interaction every 0.75 seconds. This normally isn't an issue, but could result in interactions occasionally being dropped.
* For security purposes, some (not all) button interactions are limited to only the initial user, and may expire after periods of inactivity.
* **If you're ever lost or would like more information about commands or a command, use `/help` or `/help <command>` for more information!**

**---**

You can use almost any command to start you journey! I would recommend **using `/trainerinfo` to get your basic trainer information.**

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/trainerinfo.png" height="200">

As you can see, you don't have much yet. All trainers start off with some starter money and that's about it. You also start with a few Pokeballs! **Use `/backpack` to see your items.**

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/backpack.png" height="200">

You will use these Pokeballs to get your first few Pokemon!

### ⚡ Pokemon

**Gacha**

The only way to get new Pokemon currently is with the Gacha system. The gacha costs 1 Pokeball of the type you want to use. **Use `/gacha` to get your first Pokemon!** Use the buttons to choose your Pokeball to use. **I would recommend using 10 Pokeballs on the Standard banner.**

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/gacha.gif" height="300">

New Pokemon come at level 5 and have a few randomized attributes, such as IVs and nature. Note that these Pokemon also have a rarity! Rare Pokemon are harder to get, but tend to be better. **You can increase the chances of getting a rare Pokemon by using a better Pokeball;** however, these Pokeballs are harder to come by. The exact gacha rates are as follows (Common/Rare/Epic/Legendary):

* Pokeball: 70/25/4/1
* Greatball: 30/55/12/3
* Ultraball: 0/45/50/5
* Masterball: 0/0/90/10

The gacha also features other mechanics such as rate-up Pokemon, banners, and a pity system. To learn more, select the "Info" tab when using the gacha.

**Pokemon Info**

When you recieved a Pokemon from the gacha, its ID is displayed. **To view more information on a Pokemon, use `/info <id>`.**

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/info.png" height="400">

This brings up a detailed information display of this Pokemon. If the Pokemon has moves (not all Pokemon moves have been implemented yet, hang tight!), then move descriptions will be displayed too. We will go over these moves more in-depth later.

**Viewing Pokemon**

To view all your Pokemon, **use `/list`.**

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/list.png" height="250">

If you have more than 10 Pokemon, you will be able to use the buttons on the bottom to scroll through all your Pokemon. You can also use `/list <page>` to go to a specific page immediately. **The list command also supports more complex filtering and sorting options; use `/help list` to learn more.**

Using the selection menu will allow you to view a Pokemon's detailed information easily.

**Training**

To increase your Pokemon's experience, **use the `/train <id>` command!**

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/train.png" height="150">

When your Pokemon gains experience, it may level up to! As you may notice, experience gain is fairly slow and inefficient at the beginning. We will go over some ways to make this better in the next few sections.

**[MOBILE PLAYERS] Playing on Mobile**

Mobile play is a bit more difficult because Discord makes it hard to copy text. Therefore, it's hard to copy a Pokemon's ID to inspect & train. The workaround to this is that a Pokemon's ID is typically listed within the message text to copy. **To copy a Pokemon's ID on mobile, long press a message and press copy text.**

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/mobile.jpg" height="300">

You can now paste the Pokemon's ID into the commands that need it. If you want to copy and ID from the `/list` command, use the selection menu to bring up that Pokemon's info, then copy the ID from there.

### 💪 Progression

**Daily Rewards**

Make sure to claim your daily rewards every day! This is a very easy way to get some free resources. **Use `/daily` to claim your daily rewards!** These rewards reset at 00:00 UTC.

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/daily.png" height="250">

**Voting**

Use `/vote` to vote and get rewards! Every vote gives ₽200 and 2 Pokeballs, and can be done every 12 hours. Once voted, press "Claim Rewards" to get your rewards. Using all your votes would be a great source of extra Pokeballs and money!

**Trainer Experience**

You may have noticed that your trainer (not Pokemon) has levelled up! Most commands and some button interactions give passive trainer experience. Battles (which we cover later) also give trainer experience. You can view your level progress with `/trainerinfo`.

There are a two key benefits to levelling up. You can use `/levelrewards` to claim your level-up rewards.

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/levelrewards.png" height="150">

Level rewards are very lucrative and are a great way to get resources, especially in the early game when levels are quick.

The second benefit is Pokemon training. **Higher level trainers have a passive Pokemon experience multiplier,** increasing the experience their Pokemon gains from all sources.

**Money**

Similar to trainer experience, money is gained passively just for playing. Unlike trainer experience, you can get money from other sources such as rewards and releasing Pokemon. **You can spend money at the `/pokemart`.**

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/pokemart.gif" height="300">

Use the selection menus of the Pokemart to browse its categories and stock. You can also buy items at the Pokemart. Note that certain items have daily purchase limits. **You can also buy items directly with `/buy <itemid> <quantity?>`.**

**Locations**

In the Pokemart, you may have noticed locations. Currently, locations have 3 levels, with the price increasing each level. **To view your locations, use `/locations`.**

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/locations.png" height="200">

Once you purchase a location, **you can train a Pokemon there with `/train <id> <location>`.**

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/train-location.png" height="150">

**Different locations provide different benefits, increasing EXP gained and providing EVs** based on the location's level. NOTE: if a location isn't specified while training, the location will default to "Home", which provides boosted EXP. The exact boosts are listed below (lv.1/lv.2/lv.3):

* Home: (4 EXP / 7 EXP/ 10 EXP)
* Restaurant: (3 EXP, 4 HP / 4.5 EXP, 8 HP / 6 EXP, 12 HP)
* Gym: (3 EXP, 4 Atk / 4.5 EXP, 8 Atk / 6 EXP, 12 Atk)
* Dojo: (3 EXP, 4 Def / 4.5 EXP, 8 Def / 6 EXP, 12 Def)
* Temple: (3 EXP, 4 SpA / 4.5 EXP, 8 SpA / 6 EXP, 12 SpA)
* School: (3 EXP, 4 SpD / 4.5 EXP, 8 SpD / 6 EXP, 12 SpD)
* Track: (3 EXP, 4 Spe / 4.5 EXP, 8 Spe / 6 EXP, 12 Spe)

**Evolution**

Once you get enough EXP, use **/evolve <id>** to evolve your Pokemon.

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/evolve.png" height="400">

This will bring up a selection menu where you can preview and confirm your Pokemon's evolution. Right now, all Pokemon evolve via levels.

### ⚔️ Battling

**Party**

Before you battle, you must add Pokemon to your party. Your party has positions 1-12, but only 6 Pokemon can be present at a time. **You can add a Pokemon to your party with `/partyadd <id> <position>`.**

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/partyadd.png" height="300">

If the desired Pokemon is already in your party, this command will swap positions instead of adding or removing Pokemon. If you already have a Pokemon in the given position, that Pokemon will be swapped out.

The positioning of your Pokemon does matter! We will go over the positioning system in-depth later, but it's recommended to put tanky Pokemon in the front (1-4), squishy Pokemon in the back (9-12), and spread your Pokemon apart to avoid AoE.

If you would like to remove Pokemon, **use `/partyremove <id|position|ALL>`.**

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/partyremove.png" height="300">

Note the last argument can have many different options. If a Pokemon ID is specified, that Pokemon will be removed if it exists. If a position is specified, the Pokemon at that position will be removed if it exists. If "ALL" is specified, then all Pokemon will be removed. **Using `/partyremove ALL` also resets your party if it ever glitches out and can't be used.**

**PvE**

PvE is a great way to hone your battle mechanics and level up your Pokemon quickly! **To start a PvE battle, use `/pve`,** and select an NPC you wish to battle.

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/pve.gif" height="300">

The trainer selection information contains information about the different difficulties, levels, and Pokemon an NPC has. Select a difficulty around your level and begin the battle! **You can also use `/pve <npcid> <difficulty>` to jump straight into the battle,** skipping the selection menus. **PvE is a great way to grind Pokemon EXP and money,** especially at higher levels.

**PvP**

To initiate a friendly battle within your server, **use `/pvp`.**

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/pvp.png" height="250">

An opponent may now accept your challenge and the battle is on! You can also provide an @ mention like `/pvp @user` and only the mentioned user may accept the challenge.

At the end of your battle, both players will recieve trainer experience and money. Pokemon will also gain experience based on the levels of fainted Pokemon. Note that this experience is boosted by the trainer level exp multiplier.

### 🔧 Battle Mechanics

**Important Note:** Sometimes battles may glitch, where the battle is processed by the server but not displayed correctly on Discord (typically occurs when network is spotty). In this case, all players may be unable to take actions without glitching. **If this happens, all players should spam the "refresh" button to reload the data from the server, and try to continue battling.** If still experiencing bugs, please let me know or create an issue in this repository. Battles are currently very new and very prone to glitches.

**---**

The battling system works differently from traditional Pokemon, while attempting to inherit or adapt mechanics from the original games. Here are the key game mechanics and some of their differences from the main games. **If you're low on time focus on: Positioning, Turn Order, Moving, and Cooldowns.**

**Positioning**

Positioning is a big part of the strategy in battles. Up to 6 Pokemon will be placed on a 3x4 grid, numbered 1-12. The "front" row is 1-4, while the "back" row is 9-12. Note that the appearance of the positions may be flipped during a real battle for UI sake, but the mechanics remain the same.

Strategic positioning is important because most attacks in the game can only target the front row. Therefore, it may be beneficial to protect your squishy damage dealers or supports behind tanky frontliners. Additionally, many attacks in this game have AoE. Supporting moves may also have friendly AoE. You may want to position your team around dodging enemy AoE while maximizing effectiveness of friendly AoE.

**Turn Order**

Turn order is decided by combat readiness. **All Pokemon start with 0 combat readiness and gain combat readiness based on their speed. When a Pokemon reaches 100 combat readiness, it is their turn and their combat readiness resets to 0.** Note that this sytem means certain Pokemon with very high speed may "lap" slower Pokemon and go multiple times in a row. This also means you can tune the speeds of your Pokemon to go in specific orders.

**Moving**

If it's one of your Pokemon's turns, you can move! **You can use the selection menu to select a move to use.** Once a move is selected, another selection menu will show up with the eligible targets of that move. **Select a Pokemon to use that move against them.** Note: the position of a Pokemon is listed in the select menu in order to more easily distinguish them.

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/move-select.gif" height="250">

In rare cases, your Pokemon may be incapacitated and can't move, or your Pokemon may have no available moves with eligible targets. In this scenario, simply press the "next" button to go to the next turn.

**Battle Information**

The top row of a battle has various information buttons. 

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/battle-info.gif" height="300">

* The team buttons display team Pokemon, their HP and combat readiness, and their acquired effects. 
* The "Moves" button displays move information. 
* The "Hide" hides the information panel if it's getting in your way.
* The "Refresh" button reloads battle information in case of glitching (see the "important note" above).

**Move Sets**

All Pokemon have 4 moves only. Movesets consisit of 1 "basic" move, 2 "power" moves, and 1 "ultimate" move, indicating their general power level. In the future, we plan to support Pokemon learning more than 4 moves and choosing between them.

You can view a Pokemon's moves with `/info <id>`. If a Pokemon has moves, their moves will be displayed. This can also be viewed in battle in with the "Moves" button.

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/move-info.png" height="150">

There is a lot to unpack in the move details, and we will spend the next few sections going over them.

**Targetting**

The most important aspect of a move is its targeting. This is seen in the "target" section of a move's information. The target field is in the form of party type / position / AoE pattern.

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/move-target.png" height="50">

The **Party Type** of a move target specifies which team the Pokemon is allowed to target. This only has 3 options: ally, enemy, or any.

The **Position** of a move target specifies where in the party a move is allowed to target. Most moves have the position of "Front", which means they can only target Pokemon in the front row until all Pokemon in that row have fainted. The exact configuration of every target position is listed below:

* Self: May only target the user
* Non-self: Target anyone but the user
* Any: Target any user in the selected party
* Front: Can only target the non-fainted frontmost row
* Back: Can only target the non-fainted backmost row

**AoE**

AoE is an important unqiue feature of this battling system. Many moves hit multiple Pokemon, but hit based on a positioning system! The effects of the different AoE patterns are listed below:

* Single: Only hits the target
* All: Hits all Pokemon **in the target party**
* All except self: Hits all Pokemon in target party except user
* Row: Hits all Pokemon in the target row
* Column: Hits all Pokemon in the target column
* Random: Hits a random Pokemon in the target party
* Square: Hits all Pokemon within 1 space of the target, including diagonals
* Cross: Hits all Pokemon directly Up/Down/Left/Right of the target, and the target

Note that some moves may have effects on other Pokemon not targeted. These target configurations are just a general guidelines, and any additionaly effects will be listed in the move description.

**Type Advantages**

Each move has a move type:

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/move-type.png" height="50">

Just like the main game, moves will deal more or less damage based on type advantages. In order to reduce the polarization of this effect, the **type mutlipliers have been reduced**, and all non-effective types (like normal vs ghost), will still deal damage, although very little. However, type advantages now have another effect, in missing moves.

**Missing**

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/move-miss.png" height="150">

To reduce the polarization of random accuracy effects, missing has been tuned down in this system. If a move misses, it will only deal 70% damage and not apply any effects to target Pokemon (usually). Another change introduced is that **type advantages have a slight effect on hit chance**, making type advantages matter in this aspect. The following is the type advantage => hit chance modifier:

* 4x: hit chance * 1.4
* 2x: hit chance * 1.15
* 0.5x: hit chance * 0.8
* 0.25x: hit chance * 0.6
* 0x: guarateed miss

**Effects**

Some moves apply effects, which can be broken down into 2 main categories.

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/status-condition.png" height="50">

Status Conditions: **Most status conditions work similarly to the game**. Most are permanent unless cleansed, can't be replaced, and are separate from other conditions. In this battle system, sleep and freeze have been nerfed to reduce CC. Additionally, fire moves that thaw Pokemon also deal 1.5x damage!

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/effect.png" height="100">

Other effects: All other effects work as duration-based effects. Pokemon will remain with the effect until it is cleansed or its duration runs out. Effect durations are reduced by 1 **after** a Pokemon moves. **The information panels display remaining effect durations.**

**Cooldowns**

Many moves in the game have a cooldown. **When a move is used, the move will go on cooldown** for its specified duration (with some exceptions). Move cooldowns are displayed in the move information panel and in the move selection menu.

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/cooldown.png" height="50">

**When a move is on cooldown, it cannot be used.** Move cooldowns are reduced by 1 at the end of a Pokemon's turn.

**Battle End**

The battle ends when all Pokemon on one team faints, or if over 100 turns have passed. In the latter case, the battle ends in a draw. When a battle ends, all participants gain rewards, with winners gaining more.

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/battle-win.png" height="100">

### More Information

For more information about what commands do, use the `/help` command to browse command categories and commands. You can also skip to a command with `/help <command>`.

<img src="https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/help.gif" height="250">

All of the commands are also listed below for your convenience:

## All Commands

The command usages for all commands are listed below. **If a command argument has a ?, it means the argument is optional.**

### 🧢 Trainer Commands

**`/trainerinfo`**: Displays your trainer card with information such as number of Pokemon, Pokedollars, and level progress.

**`/daily`**: Get your daily rewards, including Pokedollars and Pokeballs. You can get your daily rewards once every 24 hours, resetting at 00:00 UTC.

**`/backpack`**: Get info about your backpack items.

**`/levelrewards`**: Claim your level rewards, including Pokedollars and Pokeballs. You can claim your level rewards once every level, starting at level 2.

**`/locations`**: Displays a list of locations you own and the levels of each location.

### ⚡ Pokemon Commands

**`/gacha`**: Roll the gacha to get a random Pokemon. You can use different Pokeballs to increase your chances of getting a rare Pokemon. Get Pokeballs at the `/pokemart`, daily rewards, or level rewards.

**`/info <pokemonid: string>`**: Display info about a Pokemon, including its stats, EVs/IVs, and level progress.

**`/list <page?: int> <filterby?: string> <filtervalue?: string> <sortby?: string> <descending?: bool>`**: List your Pokemon. For more complicated functionality, you can filter and sort the list.
For example, you can filter for Pokemon named 'Pikachu' by using `/list 1 name Pikachu`.
If using message commands and you want to sort but not filter, pass 'none' as the filterby argument.
For example, you can sort by combat power by using `psb!list 1 none none combatPower`.

**`/pokedex <species?: string>`**: Browse all information about a Pokedex species, including its general information, base stats, and moves. Specify a species to skip to that species.

**`/train <pokemonid: string> <location?: string>`**: Train a Pokemon to increase its level or EVs. If a location is specified, you will get more EVs but less EXP. Level up your locations to increase their EV and EXP bonuses.

**`/evolve <pokemonid: string>`**: Evolve a Pokemon. You must meet the requirements to evolve said Pokemon. Once done, a list of possible evolutions will be displayed. You can then choose which evolution you want.

**`/release <pokemonids: string>`**: Release up to 10 Pokemon, separated by a space. You will get Pokedollars for each Pokemon you release based on their rarity.

### 🛒 Shop Commands

**`/pokemart`**: Browse and buy the items in stock in the Pokemart.

**`/buy <itemid: string> <quantity?: int>`**: Buy an item from the Pokemart. You can buy up to 10 items at a time. Certain items may also have daily limits, reset at midnight UTC.

### ⚔️ Battle Commands

**`/pvp <opponent?: user>`**: Initiates a battle in the channel. Another player may choose to accept the battle. If opponent is specified, only the opponent may accept the battle. If a level is specified, all Pokemon are scaled to that level.

**`/pve <npcid?: string> <difficulty?: string>`**: Browse a list of NPC trainers to battle! Specify an NPC and difficulty to directly battle them.

**`/partyinfo`**: Get detailed information about your party.

**`/partyadd <pokemonid: string> <position: int>`**: Add a Pokemon to your party at a specified position. If the Pokemon is in the party already, swaps with another Pokemon. If the position is full, removes the Pokemon at that position first.

**`/partyremove <option: string>`**: Remove Pokemon(s) from your party depending on `option`:
If `option` is a number, attempts to remove a Pokemon at that position,
If `option` is a Pokemon ID, attempts to remove Pokemon with that ID,
If `option` is ALL, removes all Pokemon from your party.

### 💬 Social Commands

**`/vote`**: Vote for the bot and claim rewards, ₽200 and 2 Pokeballs per-vote! You can vote on every site once every 12 hours.

**`/leaderboard <category: string> <scope?: string>`**: Get the leaderboards. How well do you stack up?

**`/invite`**: Invite the bot to your server.

### ❓ Help Commands

**`/help <command?: string>`**: Help with command usage. If no command is specified, shows an interactive embed to browse commands. If a command is specified, shows usage information for that command.

**`/tutorial`**: Get a tutorial on how to play.

**`/changelog`**: View all the update changes!

## Privacy

User data is stored whenever Pokemon-related commands are used in order to keep track of user-related data such as Pokemon and inventory. The following Discord User data is stored and used:

* User ID: Used to uniquely identify a user and retrieve/store their Pokemon data.
* Username and discriminator: Used to customize messages (ex: username#discriminator's Pokemon) and in the leaderboard.
* Avatar ID: Used to display avatar in trainer info, can only be accessed by the original user.

Whenever any of these fields change, the old data is removed. Pokemon data for each user is also stored, but can only be accessed by the original user. The data is stored on Google Cloud.

For questions or to remove your data, DM me on Discord (`140671879227768832`) or on the support server (TBD). If you would like your data to be deleted, note that this will remove all your progress.

Also see [Discord's Privacy Policy](https://discord.com/privacy).

Thank you for playing Pokestar!

## Credits

* Emojis & Sprites: 
    * https://veekun.com/dex/downloads
    * https://github.com/msikma/pokesprite/tree/master
    * PokeAPI
    * Bulbapedia
* Pokemon Data: PokeAPI
