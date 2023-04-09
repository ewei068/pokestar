const { getTrainer } = require('../../util/trainerUtils.js');
const { buildTrainerEmbed } = require('../../embeds/trainerEmbeds.js');

const trainerInfo = async (client, message) => {
    const trainer = await getTrainer(message.author);
    if (trainer.err) {
        console.error(trainer.err);
        message.channel.send(trainer.err);
        return;
    }
    const embed = buildTrainerEmbed(trainer.data);
    message.channel.send({ embeds: [embed] });
}

module.exports = trainerInfo;