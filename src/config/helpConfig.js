const LAUNCH_CELEBRATION_DESCRIPTION = `🎉**LAUNCH CELEBRATION**🎉

Welcome to Pokestar! To celebrate the launch and the bot rollout, we're throwing a special little celebration event to help new players and release custom Pokemon!

👉 **Starting Rewards:** Trainers now permanently start with an increased amount of Pokeballs and rare Pokeballs!

<:ashpikachu:1109522092283658250> **Event Pokemon:** Powerful custom Pokemon based off of famous trainers are available for a limited time! Use \`/gacha\` to try your luck!

🎁 **Vote Rewards:** Vote rewards have doubled for a limited time! Use \`/vote\` and vote every 12 hours to get free Pokeballs!

<:greatball:1100296107759779840> **NPC Battles:** Certain NPC battles now give increased rewards for a limited time! Use \`/pve\` to challenge NPCs!

🖌️ **Art Credits**:
* Shiny Hat Pikachu: https://www.deviantart.com/lukethefoxen/art/Pikachu-with-Ash-s-Hat-923733788
`

const TPP_DESCRIPTION = `🎮**Twitch Plays Pokemon**🎮

The Twitch Plays Pokemon mini-event has arrived! Including new PvE content and limited custom Pokemon!

🧢 **Twitch Plays Red:** Fight the limited-time event trainer Twitch Plays Red! Defeat him every day to get 2 free <:greatball:1100296107759779840> Greatballs! Use \`/pve tppRed\` to challenge him!

🖥️ **Bloody Sunday:** Re-live the historic Bloody Sunday with the new limited-time dungeon, giving 2 of each equipment shards! Use \`/dungeons\` to challenge it!

<:lordhelix:1114224346873991268> **Event Pokemon:** Powerful custom event Pokemon from Twitch Plays Pokemon are now available for a limited time! Use \`/gacha\` to try your luck!

🖌️ **Art Credits**:
* Shiny Event Pokemon Sprites: [hamigakimomo](https://hamigakimomo.tumblr.com/post/77911455524/i-decided-to-make-custom-rb-sprites-for-the)
* Bloody Sunday Art: https://imgur.com/70oeGPX
`

const gameEventConfig = [
    {
        "name": "Twitch Plays Pokemon",
        "description": TPP_DESCRIPTION,
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/events/pokestar-tpp-banner.png",
    },
    {
        "name": "Launch Celebration",
        "description": LAUNCH_CELEBRATION_DESCRIPTION,
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/events/pokestar-launch-banner.png",
    }
]

SUPPORT_SERVER_INVITE = "https://discord.gg/ygVPUXeJXZ";

const tutorialConfig = [
    {
        "name": "Welcome to Pokestar!",
        "description": `Welcome to Pokestar! Pokestar is a battle-focused Pokemon Discord bot! This tutorial will guide you through the basics of Pokestar. **For more information, please [join the support server](${SUPPORT_SERVER_INVITE}) or use \`/help\` for help with commands!**`,
        "image": "https://dbl-static.usercontent.prism.gg/02f7065e82d8c66e66299b74eda565b6.png",
    },
    {
        "name": "Getting Started",
        "description": "To get started, take a look at you profile and items. **Use `/trainerinfo` and `/backpack`** to find all the information you need about your trainer.",
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/trainerinfo.png",
    },
    {
        "name": "Catching Pokemon",
        "description": "**To catch new Pokemon, use the `/gacha` command**. The gacha costs Pokeballs, with rare Pokeballs catching rarer Pokemon. I would recommend using 10 Pokeballs on the standard banner.",
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/gacha.gif",
    },
    {
        "name": "Pokemon Info",
        "description": "To view your Pokemon, use `/list`. You can also use `/info <pokemonId>` to view more information about a specific Pokemon.",
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/info.png",
    },
    {
        "name": "Upgrading Pokemon",
        "description": "**Use `/train <pokemonId>` to level up your Pokemon.** You can also train at a location (discussed later) for fast EXP training or EV training.\n\nOnce you've progressed more, use `/evolve` and `/equipment` to power-up your Pokemon even more.",
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/train.png",
    },
    {
        "name": "Pokeballs",
        "description": "The two easiest ways to get more Pokeballs are **`/daily` and `/vote`.** You can claim daily rewards once a day, and vote on each site twice a day.",
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/daily.png",
    },
    {
        "name": "Progression",
        "description": "Both **money and trainer experience** are passively gained while playing. Levelling up your trainer makes your Pokemon gain more experience and allows you to claim level rewards. **Use `/levelrewards` to claim rewards for leveling up.**",
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/levelrewards.png",
    },
    {
        "name": "Money",
        "description": "Money is used to buy items from the PokeMart. **Use `/pokemart` to view the PokeMart.** Items include Pokeballs, upgrade materials, and locations. **Locations are used to EV train Pokemon or get EXP faster.**",
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/pokemart.gif",
    },
    {
        "name": "Party",
        "description": "Your party is the Pokemon you use in battle. **Use `/partyadd <pokemonId> <position>` and `/partyremove <pokemonId|position>` to manage your party.** In Pokestar, party position matters! Put tanky Pokemon in the front, and spread your Pokemon out to avoid AoE damage.\n\n**Alternatively, use `/partyauto` to automatically fill your party with your strongest Pokemon.**",
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/partyadd.png",
    },
    {
        "name": "Battle",
        "description": "There are multiple battle types in Pokestar. The two most basic ones are `/pve` and `/pvp`. \n\n**PvE** battles are against NPCs. PvE is a great way of gaining Pokemon EXP and learning the battle mechanics.\n\n**PvP** battles are friendly challenges against other players. Get some friends and see how well you stack up against each other!",
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/pve.gif",
    },
    {
        "name": "Battle Mechanics",
        "description": "The Pokestar battle mechanics tries to adapt the mechanics from the original game with RPG gacha style mechanics from games such as Epic 7 and Summoners War. The mechanics are a bit complicated, so **if you want to learn more, [visit this page](https://github.com/ewei068/pokestar#-battle-mechanics).**\n\nThe most important mechanic to understand is how to move. **When it's your turn, use the selection menu to select a move. Then, use the bottom selection menu to select a target.**",
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/move-select.gif",
    },
    {
        "name": "Tutorial Complete!",
        "description": `Congratulations! You've completed the basic tutorial! **If you'd like to learn more, please [join the support server](${SUPPORT_SERVER_INVITE}) or use \`/help\` for help with commands!** Thank you for using Pokestar, and we hope you enjoy your experience!`,
        "image": "https://raw.githubusercontent.com/ewei068/pokestar/main/media/images/help.gif",
    },
]

const quickstartString = 
`**Quickstart Guide**
* **Catch** Pokemon with \`/gacha\`
* **View** Pokemon info with \`/info\` and \`/list\`
* **Upgrade** Pokemon with \`/train\`, \`/evolve\`, and \`/equipment\`
* Get more **Pokeballs** with \`/daily\`, \`/vote\`, \`/pokemart\`, and \`/levelrewards\`
* Manage your **party** with \`/partyadd\` and \`/partyremove\`
* **Battle** with \`/pve\`, \`/pvp\`, and \`/dungeons\` (gains lots of EXP too)
* **Usage notes [PLEASE READ]:**
  * The bot supports slash commands (\`/\`) and legacy message commands with prefix \`psb!\`, but slash commands are recommended
  * Users have a small rate limit so some interactions may be dropped
  * The bot is still in early development and may be buggy
* **For more information, please view the tutorial below or use \`/help\`!**`;

module.exports = { 
    gameEventConfig,
    tutorialConfig,
    quickstartString,
    SUPPORT_SERVER_INVITE
};