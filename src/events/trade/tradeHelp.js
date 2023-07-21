const { TRADE_HELP_STRING } = require("../../config/socialConfig");
const tradeHelp = async (interaction, data) => {
    await interaction.reply({
        content: TRADE_HELP_STRING,
        ephemeral: true
    });
}

module.exports = tradeHelp;