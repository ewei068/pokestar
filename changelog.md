# Pokestar Changelog

## 0.4.0 - The Leaderboard Update

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