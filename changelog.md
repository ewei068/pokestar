# Pokestar Changelog

### 0.5.4 - Balance Patch

* Implemented various balance changes to fix the following issues:
    * AoE attacks OP
    * Setup moves not useful
    * Battles too short
    * Speed OP
* Slightly nerf AoE attacks
* Increased party size by one column to help avoid AoE
* Slightly nerfed CC (freeze, sleep)
* Mitigate early speed balancing with new effective speed calculation

### 0.5.3 (5/3)

* Implemented battle moves for Butterfree, Beedrill, Ratticate, Raichu!
* Balance changes:
    * Buffed Discharge, Flamethrower, Hydro Pump!
    * Buffed speed boosts!
    * Reduced miss chance!
* Add more level-up rewards.
* Increased starting Pokeballs.

### 0.5.2 (5/3)

* Added a battle refresh button. Press it if there are connectivity issues or glitches.
* The `/pvp` command now supports optionaly mentioning another user to only challenge them!
* Added more informative party info & failed command feedback.
* Users are now rate-limited at 1 interaction/second. Any additional interactions or commands will may be dropped.

### 0.5.1 (5/2)

* Patched daily rewards error.
* Patched state cleanup after battle end.

## 0.5.0 (5/2) - The Battle Update

A HUGE update that now supports battles! Add your Pokemon to your party and participate in fun, strategic 6v6 battles to gain massive rewards!

* Party commands:
    * `/partyadd <pokemonid> <position>`: Add a Pokemon to your party in positions 1-12!
    * `/partyremove <pokemonid|slot|"ALL">`: Remove a specified Pokemon from your party!
    * `/partyinfo`: View your party Pokemon and positions!
    * **NOTE:** Not all Pokemon have been implemented for battle yet, and you won't be able to add them into your party. Currently implemented Pokemon: Venusaur, Charizard, Blastoise, Pidgeot, Articuno, Zapdos, Moltres, Dragonite, Mewtwo. Use `/list filterby: battleEligible filtervalue: True` to find your battle eligible Pokemon!
* `/pvp`: Start a PVP challenge! Someone else in the same server may accept this challenge, and you will both face off in a 6v6 Pokemon battle! Make sure to use the above party commands to specify your party before battling!
    * In battle, you can use the select menus to select moves to use and targets to use the moves on.
    * The buttons can be toggled for more battle information.
    * All participating players get trainer EXP, Pokedollars, and Pokemon EXP when a battle ends, with winners getting more.
* Added party information to the `/trainerinfo` command!
* Failed component interaction now gives feedback!
* Updated some command documentation.

### 0.4.1 (4/24) - QOL Patch

Added a few helpful QOL features to make bot interaction easier!

* Revamped the `/help` command! Now includes an interactive menu and more descriptive command info, usage, and arguments.
* Added Pokemon and item emojis.
* Buffed money gained from commands and interactions.

## 0.4.0 (4/18) - The Leaderboard Update

How well do you stack up to your friends? Find out with leaderboards! In light of leaderboards, new stats are available for trainers and Pokemon.

* `/leaderboard`: See how you compare to other trainers! Choose different categories, and compare yourself globally or to your server members!
* The `/list` command now supports filtering and sorting!
* Added more informative Pokemon information to `/info`!
* Added more informative trainer information to `/trainerinfo`!
* Updated database optimizations and querying.
* Your new Pokemon may infrequently have a rare, different color palette...

## 0.3.0 (4/16) - The Pokedollar Update

* Added Pokedollars! Here are some ways to obtain them:
    * Certain commands and interactions give a small amount of Pokedollars.
    * Pokedollars have been added to daily rewards.
    * Level rewards also have Pokedollars. All level rewards have been reset; use `/levelrewards` to reclaim them!
    * Team Plasma will now offer you Pokedollars to release your Pokemon!
* `/pokemart`: Browse all the items for sale at the Pokemart!
* `/buy`: Spend your Pokedollars to buy something from the Pokemart!
* `/locations`: View the locations you have purchased!
    * Currently, you can buy and upgrade locations from the Pokemart.
    * Locations affect the experience and EVs gained when training. Use `/train <pokemonid> <location>` to specify a location to train at!
* Added more Pokemon and level rewards!
* Migrations have been added to help us better manage user data!

### 0.2.1 (4/13)

* Fixed prefix in commands displayed under bot information based on deployment stage.

## 0.2.0 (4/13) - The Training Update

The training update! Train your Pokemon and evolve them when they meet certain requirements.
Training EXP scales with your trainer level.

* `/train`: Train you Pokemon!
* `/evolve`: Evolve your Pokemon!
* Improved mobile compatibility: Pokemon IDs are printed as messages to copy on mobile.
* Added EXP bar to trainer info.
* Feedback for when an interaction expires due to timeout.
* Certain component interactions now grant EXP.
* Added more Pokemon!

## 0.1.0 (4/11) - Initial Release

Initial release! Supports very basic Pokemon, trainer, and gacha commands.

* `/daily`: Claim daily rewards!
* `/gacha`: Roll the Gacha for Pokemon!
* `/trainerinfo`: See your basic trainer info!
* `/list`: List your Pokemon and scroll through using buttons!
* `/info`: See your Pokemon's info!
* `/levelrewards`: Claim rewards for levelling up!
* `/release`: Release unwanted Pokemon!