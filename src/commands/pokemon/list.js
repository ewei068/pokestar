const { getTrainer } = require('../../extensions/trainer');

const list = async (user) => {
    const trainer = await getTrainer(user);
    if (trainer.err) {
        return { embed: null, err: trainer.err };
    }



    const embed = buildListEmbed(trainer.data);
    return { embed: embed, err: null };
}