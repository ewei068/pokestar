const { buildUrlButton } = require("../../components/urlButton");

const TUTORIAL_URL = "https://github.com/ewei068/pokestar/blob/main/README.md#tutorial";

const tutorial = async () => {
    const quickstartString = `**Quickstart Guide**
* **Catch** Pokemon with \`/gacha\`
* **View** Pokemon info with \`/info\` and \`/list\`
* **Upgrade** Pokemon with \`/train\` and \`/evolve\`
* Get more **Pokeballs** with \`/daily\`, \`/vote\`, \`/pokemart\`, and \`/levelrewards\`
* Manage your **party** with \`/partyadd\` and \`/partyremove\`
* **Battle** with \`/pve\` and \`/pvp\` (gains lots of EXP too)
* **Usage notes [PLEASE READ]:**
    * The bot supports slash commands (\`/\`) and legacy message commands with prefix \`psb!\`, but slash commands are recommended
    * Users have a small rate limit so some interactions may be dropped
    * The bot is still in early development and may be buggy
* **For more information, please view the tutorial below or use \`/help\`!**`;
    const send1 = {
        content: quickstartString,
        ephemeral: true
    }

    const button = buildUrlButton([{
        label: "Tutorial",
        url: TUTORIAL_URL
    }]);
    const send2 = {
        content: "View the beginner tutorial here!",
        components: [button]
    }

    return { send1: send1, send2: send2, err: null };
}

const tutorialMessageCommand = async (message) => {
    const { send1, send2, err } = await tutorial();
    if (err) {
        await message.channel.send(`${err}`);
        return { err: err };
    } else {
        await message.reply(send1);
        await message.channel.send(send2);
    }
}

const tutorialSlashCommand = async (interaction) => {
    const { send1, send2, err } = await tutorial();
    if (err) {
        await interaction.reply(`${err}`);
        return { err: err };
    } else {
        await interaction.reply(send1);
        await interaction.followUp(send2);
    }
}

module.exports = {
    message: tutorialMessageCommand,
    slash: tutorialSlashCommand
};