const { getTrainer } = require('../../trainer/trainerUtils.js');

const trainerInfo = async (client, message) => {
    const trainer = await getTrainer(message.author);
    if (trainer.err) {
        message.channel.send(trainer.err);
        return;
    }
    message.channel.send(`Trainer ${trainer.data.user.username} has ${trainer.data.money} money.`);
}

module.exports = trainerInfo;