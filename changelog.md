# Pokéstar Changelog

### 0.11.3 (7/10) - Gen 2 Wrap-up

* **Gen 2 Wrap-up Event:**
  * Event Pokemon:
    * Gold's Typhlosion (Epic): Gold's powerful Typhlosion which sacrifices some utility for more damage!
    * Dark Tyranitar (Epic): A corrupted Tyranitar which is more offensive-focussed!
    * Shadow Lugia (Legendary): A corrupted Lugia which inverts its offenses and defenses, as well as having more damaging moves!
  * New limited-time event! Check out `/events` to learn more!
  * New Pokemon: Slowpoke, Slowbro, Slowking, Hitmonlee, Tyrogue, Hitmontop
  * Abilities: Solar Power, Regenerator
* **Celebi:** The second Mythical Pokemon in Pokestar! Celebi is designed to be a grindy Pokemon, that rewards mid-game players with a less grindy experience!
  * Use `/celebi` and follow the steps in order to obtain!
  * Celebi has two abilities:
    * Time Acceleration: Gain increased daily rewards and faster Pokemon experience gain!
    * Time Travel: Sacrifice Pokeballs daily to get unavailable limited Pokemon!
* Equipment swapping: Use `/equipmentswap` to change equipment between Pokemon!
* Buy more Pokemon Storage by purchasing the Computer Lab location!
* Greatly increased dungeon rewards and Very Hard difficulty dungeon rewards!
* Increased flat HP modifier in equipment.
* Bug fixes:
  * Patched Lugia's incorrect stats
  * Patched Multiscale's incorrect ID
  * Fixed a few Pokemon not having correct evolutions
* Expired the Gen 2 and Team Rocket events.

### 0.11.2 (7/4) - Gen 2 Phase 2

* **Gen 2 Phase 2:**
  * Pokemon: Poliwag, Poliwhirl, Poliwrath, Scyther, Ledyba, Ledian, Spinarak, Ariados, Sunkern, Sunflora, Wooper, Quagsire, Marill, Azumarill, Politoed, Wobbuffet, Pineco, Forretress, Skarmory, Houndour, Houndoom, Phanpy, Donphan, Scizor, Miltank, Larvitar, Pupitar, Tyranitar, Lugia, Ho-Oh
  * Abilities: Drizzle, Drought, Sand Stream, Swift Swim, Chlorophyll, Swarm, Huge Power, Shadow Tag
  * **Weather conditions have been added to the game!** Weather conditions are passive effects that affect all Pokemon. 
    * When created, weather lasts 10 turns, +1 turn for each non-fainted Pokemon on the battlefield.
    * Current Weather coditions: Sandstorm, Harsh Sun, Rain
  * Gave NPCs and dungeons more Gen 2 Pokemon.
  * Added NPCs: Aroma Lady and Gold. Defeat Gold daily for Pokeballs!
* **Due to Discord Support being shitty, we have to remove prefix message commands.** Now, you can mention Pokestar instead to get the same effect. For example, `psb!trainerinfo` will turn into `<@1093411444877439066> trainerinfo`.
* You can now use Pokemon name instead of ID in the following commands: `/equipment`, `/evolve`, `/info`, `/nature`! This only works for slash commands, not message commands.
* Fixed bug where refreshing a battle may crash the bot.
* Vote streaks now start at 0 again.
* Minor UI cleanup.

### 0.11.1 (6/27)

* **Reworked Voting:** Voting has some new changes now, including streaks!
  * Every vote contributes to the voting streak.
  * You can get up to a 5x reward multiplier through streaks. The exact numbers are as follows:
    * 0 streak -> 1x rewards, 5 streak -> 2x rewards, 15 streak -> 3x rewards, 30 streak -> 4x rewards, 50 streak -> 5x rewards
  * To compensate for the rework, **everyone is temporarily starting at 5 streak!**
  * The base voting rewards are now $100, 1 Pokeball, and 1 of each shard. This reward starts off less than previously, but can get much higher through streaks.
  * Removed Botlist voting because that site hasn't really gotten traction.
* **Name Selection:** We are experimenting with easier ways to select Pokemon.
  * **For only `/partyadd`,** we are experimenting with an approach that allows you to enter either and ID or name of a Pokemon to add to your party.
  * If multiple Pokemon are found, a selection list will be brought up to select a specific Pokemon.
  * This system may be buggy or unintuitive, so please test it out and give your feedback! We will roll this system out to more commands once we verify that it's good, so your feedback is important here.
* Added commas to all Pokedollar displays
* Bug fixes:
  * Fixed Rocket Meowth NPC not using correct moves
  * Fixed Berry Bush/Farm not deducting EVs if at max EVs
* Ended the Twitch Plays Pokemon event

## 0.11.0 (6/21) - Generation II

Generation 2 has arrived! Many Generation 2 Pokemon will be released over 2 updates bringing many new features!

* **Generation 2**
  * Pokemon: Chikorita, Bayleef, Meganium, Cyndaquil, Quilava, Typhlosion, Totodile, Croconaw, Feraligatr, Sentret, Furret, Hoothoot, Noctowl, Crobat, Mareep, Flaffy, Ampharos, Bellossom, Hoppip, Skiploom, Jumpluff, Espeon, Umbreon, Steelix, Heracross, Blissey, Raikou, Entei, Suicune
  * Abilities: Insomnia, Sheer Force, Guts, Magic Bounce
  * Some dungeons now have Gen 2 Pokemon!
  * A small Gen 2 celebration event is taking place! Use `/events` for more info.
* Added level rewards up to level 100!
* Flat equipment modifiers now scale with Pokemon level. Equipment is the same strength at level 100, but is less powerful if your Pokemon is lower level.
* Party auto options: You now have a few more options for how your party is filled!
* Party add button: You can now add Pokemon to your party from their `/info` screen!

### 0.10.1 (6/17)

* `/nature`: You can now change your Pokemon's nature with Mints! Get Mints daily from battling Tower Tycoon Palmer!
* Added NPC Tower Tycoon Palmer: a Legendary Pokemon trainer and the boss of the Pokemon Tower! 
* Minor UI improvements:
  * Added emojis to some selection rows!
  * Starting to replace buttons names with emojis!
  * Some selection rows will now have default selections!
* Slightly increased New Island's difficulty.
* Bug fixes:
  * Fixed money and EXP being incorrectly added after battles.
  * Fixed Pickup's battle information messages.
  * Fixed Mew's IV total not displaying properly in `/list`. You may need to refresh your Mew with `/mew` for this to update.

## 0.10.0 (6/13) - Team Rocket & Mew

* **New Event: Team Rocket Takeover!** Use `/events` for more details:
  * Two limited event `/pve` stages: Team Rocket and Gold Rush!
  * New Permanent Dungeon: New Island from Mewtwo Strikes Back!
  * New limited event Pokemon:
    * Jessie's Arbok (Epic): A fast physical attacker with a terrifying glare!
    * James's Weezing (Epic): A self-destructive tank whose smoke helps allies evade attacks!
    * Rocket Meowth (Legendary): A super speedy support who can reduce cooldowns and steal enemy Pokemon!
    * Armored Mewtwo (Legendary): A bulky variation of Mewtwo that trades off some offenses for tankiness!
* **Mew: the first Mythical Pokemon in Pokestar!**
  * Mythical Pokemon are special Pokemon with unique effects, and can only be obtained once.
  * Mew's gimick is the ability to freely customize its moves and nature to fit any role!
  * Use `/mew` to configure your mew. You must defeat New Island in `/dungeons` first.
* EV reduction and tuning: train your Pokemon at the Berry Bush or Berry Farm to reduce their EVs by 1 or 10 respectively!
* Added trainer icons to `/pve`!
* Removed the `battleEligible` filter in `/list` and replaced it with the `locked` filter.
* Updated `/daily` to take advantage of Discord's dynamic time display.
* Bug Fixes:
  * Fixed Mimic bugs when mimicking already known move.
  * Fixed bug where Lord Helix's Holy Pump was calculated as Water type instead of Psychic type.
* Ended the Launch Celebration event.
* **The Twitch Plays Pokemon event will end in a week! Make sure to pick up the limited event Pokemon!**

### 0.9.3 (6/8) - Bug Fixes and Minor Content

* New Pokemon and Abilities:
  * Pokemon:
    * Ekans/Arbok: An early-game Pokemon with offensive and support capabilities!
    * Nidoran/Nidorina/Nidoqueen: A hybrid attacker with the ability to boost its allies!
    * Bellsprout/Weepinbell/Victreebel: A hybrid attacker who punishes enemies with high attack!
    * Lickitung: A bulky Pokemon that specializes in incapacitating enemies!
    * Koffing/Weezing: A strong physical tank with a deadly Explosion + Destiny Bond combo!
  * Abilities: Own Tempo, Levitate
* Game Adjustments:
  * Made some Pokemon level-up faster!
  * Reduced Pokedollar cost of equipment upgrades by 20%!
* Bug fixes:
  * Patched equipment reroll display.
  * Modify username display for new Discord usernames (no discriminator).
  * Patched issues with tie battles breaking.
  * Gave Staryu an evolution to Starmie (whoops).
  * Fixed Sleep Talk not properly registering AoE moves.

### 0.9.2 (6/7) - Twitch Plays Pokemon Mini Event

* New Twitch Plays Pokemon mini-event! Use `/events` for more details!
  * New limited NPC: Twitch Plays Red!
  * New limited Dungeon: Bloody Sunday!
  * New limited event Pokemon:
    * aaabaaajss (Epic, Pidgeot): A fast physical attacker with utility and the ability to revive!
    * AAAAAAAAAA (Epic, Nidoking): A strong special attacker who gains value out of its attack stat!
    * AATTVVV (Epic, Venomoth): A fast support Pokemon that can prevent enemies from using attack moves!
    * AIIIIIIRRR (Epic, Lapras): A bulky hybrid attacker who can manipulate how its moves are used!
    * False Prophet (Legendary, Flareon): An incredibly powerful physical attacker with great coverage! Also has a devestating utility move and an ability which punishes CR gain!
    * Lord Helix (Legendary, Omastar): A highly durable protect tank that spreads debuffs! Has two different modes!
    * AA-j (Legendary, Zapdos): A powerful area attacker that can spread its own debuffs onto enemies!
* New Pokemon/Abilities:
  * Paras/Parasect: A support Pokemon specializing in spreading status conditions!
  * Ability: Effect Spore.
* The `/pokedex` now supports faster browsing! Press the "Return" button to view a list a Pokemon to scroll through!
* You can now sort by Pokedex number in `/list`! Use `/list sortOrder: pokedexOrder`!
* `/daily` now displays a timer until next reward if you've already claimed today!
* **The Launch Celebration Event will be ending in 1 week! Make sure to pick up your perfect set of launch event legendaries before they go away!**

### 0.9.1 (6/1) - QoL Patch

* New Pokemon and abilities:
  * Pokemon:
    * Nidoran/Nidorino/Nidoking: An all-round attacker with great coverage!
    * Venonat/Venomoth: A good beginner Pokemon with solid debuffing & status moves!
    * Farfetch'd: A mediocre physical attacker (plz wait for Sirfetch'd).
    * Omanyte/Omastar: A defensive Protect tank with good utility!
  * Abilities: Poison Point and Shield Dust.
* Revamped the `/tutorial`!
* Party saving: You can now save party configurations to use for later!
  * Use `/parties` to view your saved parties.
  * Use `/partyload` to swap your active party with one of your saved parties.
* `/partyauto`: Autofill your party with your strongest Pokemon!
* Lock Pokemon: You can now lock your Pokemon in the `/info` panel to prevent them from being accidentally released! Legendary and shiny Pokemon are automatically locked.

## 0.9.0 (5/30) - Dungeons and Equipment

* **Equipment:** You can now power-up your Pokemon with equipment! Use `/equipment <pokemonid>` to learn more!
  * Equipment provides boosts in stats to your Pokemon, allowing you to customize and fine-tune your Pokemon's battle abilities.
  * All Pokemon start out with Level 1 base equipment and can be upgraded in level.
  * Equipment also has stat quality and random modifiers which can be rerolled!
  * Equipment upgrades require Pokedollars and shards (see below).
* **Shard Materials**
  * Shards are used to upgrade equipment! Different shards upgrade different equipment.
  * Daily shards can be obtained from `/daily` and from the `/pokemart`.
  * Shards can be farmed from the dungeon (see below).
* **Dungeons:** New endgame content to farm shards! Use `/dungeons` to learn more!
  * Dungeons are difficult, multi-stage endgame battles.
  * Three dungeons are currently available with custom boss Pokemon.
    * You can view these boss Pokemon at the end of the `/pokedex`.
  * Defeat dungeons to gain shards and upgrade your equipment!
* **More Pokemon and Abilities!**
  * Pokemon:
    * Shellder/Cloyster: A tank with absurdly high defense, and also scales off defense!
    * Onix: A high-defense Endure tank that protects its allies from AoE attacks!
    * Krabby/Kingler: A hard-hitting pure physical attacker!
    * Voltorb/Electrode: The fastest Taunt user in the game with a devastating explosion!
    * Hitmonchan: A solid bruiser with a powerful counter!
    * Mr. Mime: A bulky support with tons of tricks up its sleeve! Can mimic ultimates!
  * Abilities: Iron Fist, Filter
* **Adjustments:**
  * Ice beam now hits a column, but deals less damage with less chance to freeze.
  * Nerfed taunt to 2 turn duration.
  * Nerf stealth rock damage from 1/10th HP to 1/12th HP.
* Added more level rewards: up to level 75!
* Slightly improved `/list` filtering! Now is case-insensitive and will partially match. Search is still a WIP and will be worked on in the future.
* Switched the Legendary/Mythical colors.
* Modified effective speed calculation to account for equipment.
* Fixed bug allowing purchase of too many Pokeballs from the shop.
* Fixed bug with status condition damage breaking abilities.

### 0.8.2 (5/27) - Pokemon and Abilities

* Add more Pokemon, abilities, and NPCs!
    * Pokemon: 
        * Vulpix, Ninetales: A fast tank with great supporting moves!
        * Oddish, Gloom, Vileplume: An all-rounder with tanking and attacking capabilities!
        * Meowth, Persian: A speedy early-game support with great utility and the ability to earn Pokedollars!
        * Grimer, Muk: A solid tank that punishes fast-moving enemies with poison!
        * Staryu, Starmie: A fast attacker with supportive capabilities!
        * Jynx: An annoying support with lots of CC and a deadly Perish Song!
        * Chansey: A high-health healer/support that cleanses status and debuffs!
        * Aerodactyl: A fast lead with utility and damage moves to cripple enemies!
        * Pinsir: An impactful attacker that sets up for high-damaging moves!
    * Abilities: Illuminate, Natural Cure, Hyper Cutter, Poison Touch, Technician
    * NPCs: Ace Trainer (changes Pokemon depending on day)
* Adjustments:
    * Rework Stealth Rock: deals less damage but also deals damage upon receiving buffs.
    * Replace Jolteon's Volt Switch with Baton Pass.
    * Reduced the cooldown of Thunder Wave from 4 to 3.
* Nerfed level rewards, but spread them out more evenly.
* Add ability display to `/partyinfo`.
* Add inventory display to level rewards.
* Fix trainer daily shop limits not updating properly.

### 0.8.1 (5/21)

* Gacha QOL: now rolling the gacha doesn't create a new message.
* Top.gg voting is now added and **counts twice!!**
* \[Experimental\] New speed balancing! Changed effective speed calculations. See [old speed](https://github.com/ewei068/pokestar/blob/608b7db946f2d9f927ad25077a0cd778b94138dd/src/utils/pokemonUtils.js#L72) and [new speed](https://github.com/ewei068/pokestar/blob/a55e00e335e9ae6a1750cd8e20dba014e2857b63/src/utils/pokemonUtils.js#L72).
* Patched a few ability bugs.
* Added a privacy policy.
* All prefix message commands will be depreciated soon in favor of slash commands.

## 0.8.0 (5/20) - Abilities and Events

To celebrate the roll-out of Pokestar, we are throwing a launch event! Additionally, abilities have been implemented to greatly affect the tide of battle!

* Abilities have been added! Abilities are powerful passive effects! Not all abilities are added yet, but most Pokemon should have at least one working ability.
    * Use `/pokedex` to see what a Pokemon's ability does!
    * Fixed evolutions giving incorrect abilities.
* Launch Celebration! Use `/events` for more details.
* Event Pokemon are here! Use `/gacha` to collect limited-time custom event Pokemon!
* Pokemon tabs: getting Pokemon info now has tabs for general info and battle info!
* Using `/tutorial` now also displays a short quickstart guide!
* Shiny Pokemon are now worth 100x their original value!
* Possibly fixed battle start edge case bug on slow connection.

### 0.7.4 (5/18)

* Added more Pokemon: Exeggcute, Exeggutor, Rhyhorn, Rhydon!
* Added NPC Blue!
* Nerfed Tailwind: now only increases CR of backmost row.
* Buffed Rapid Spin: now cleanses diagonal allies and deals more damage to enemies.
* Few more minor move adjustments.
* Some trainers (Red and Blue) now give daily rewards for defeating them!
* Added more level rewards!
* Added level display in party when HP isn't shown.
* Patch Pokeballs not being added in vote rewards.
* Added stats posting to Botlist.me.

### 0.7.3 (5/17) - Bot Rollout

* `/vote`: Vote for the bot on listing websites every 12 hours to claim rewards!
* ALL POKEMON are now battle eligible! Hooray!
* Added a release all on page button when listing.
* Fixed a few gacha bugs.

### 0.7.2 (5/16) - Gacha Overhaul

* Gacha Overhaul: The `/gacha` now has banners with **rate-up Pokemon** and a **pity system!**
* Added battle moves for Pokemon: Clefairy, Jigglypuff, Zubat, Diglett, Growlithe, Geodude, Graveler, Magnemite!
* Increased shiny rate!
* Small balance tweaks.
* Buff the `/train` EXP and EV gain.
* Slightly nerfed overall EXP gain.

### 0.7.1 (5/13) - Battle QoL Patch

* Added battle moves for: Pidgey, Pidgeotto, Rattata, Pikachu, Eevee, Dratini, Dragonair! Also added the Dragon Trainer NPC!
* Add a replay button to PvE battles.
* Add Pokemon level-up text to end-battle information.
* Added a level option to friendly PvP battles.
* Raised max trainer level to 100, add level rewards to level 30.
* Added type icons.
* Patched NPC needing to skip turns causing crash.
* Patched Pokemart crashing everything.

## 0.7.0 (5/12) - PvE Update

The PvE update is here! Use `/pve` to jump into a battle vs an NPC! NPCs come in different difficulties and varieties, adding for interesting and different battles. NPC battling is also a great way to level up your Pokemon!

* `/pve`: Initiate a battle vs an AI NPC!
    * Use the selection menu to select an NPC.
    * Select a difficulty close to your Pokemon level.
    * To battle an NPC directly, use `/pve <npcid> <difficulty>`.
* Added battle moves for: Bulbasaur, Ivysaur, Charmander, Charmeleon, Squirtle, Wartortle, Caterpie, Metapod, Weedle, Kakuna, Magikarp!
* Gacha Pokemon now start out at level 5!
* Increased max number of Pokemon to 500.
* Decreased the evolution level requirement for some beginner Pokemon.
* Improved `README.md`.

### 0.6.2 (5/10) - Gacha Patch

* Added battle moves for: Golbat, Dugtrio, Arcanine, Magneton. Now all currently added final-evoution Pokemon are battle-eligible!
* Gacha improvements:
    * You can now specifiy the quantity of Pokeballs you want to use, up to 10!
    * Beginner trainers are luckier for their first few Pokeball rolls!
* Patch skip turn failing when having status condition.

### 0.6.1 (5/9)

* Added battle moves for: Clefable, Wigglytuff, Gyarados!
* `/pokedex`: View Pokemon species data, such as base stats and moves!
* Balance changes:
    * Buffed: Agility (now grants 15% CR), Sky Attack (now flinches all enemies), and Heal Bell (more healing)
    * Reworked: Aqua Ring (now gives increased healing to fewer targets)
    * Nerfed: Future Sight (hits fewer targets)
* You can now see how many Pokeballs you have left when using `/gacha`!

## 0.6.0 (5/8) - First Beta Release

Added a few quality of life and easy of use features as we gear up for a public beta release. Also implemented moves for some popular Pokemon!

* Added more battle eligible Pokemon: Lapras, Vaporeon, Jolteon, Flareon, and Snorlax!
* `/tutorial`: Added a beginner tutorial!
* `/invite`: Invite the bot to your server!
* `/changelog`: See the complete update history!
* Selecting a Pokemon from a list now displays Pokemon information.
* You can now purchase items directly from the `/pokemart`!

### 0.5.6 (5/6)

* Add new battle-eligible Pokemon: Alakazam, Machamp, Golem, and Gengar!
* Patch a few party and damage calculation bugs.
* Reduce rate limit to 0.75 seconds.
* Added more helpful command feedback!

### 0.5.4 (5/5) - Balance Patch

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