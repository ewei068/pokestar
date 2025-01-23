const { useAwaitedMemo, useState } = require("../deact/deact");
const { getTrainer } = require("../services/trainer");

/**
 * @param {DiscordUser} user
 * @param {DeactElement} ref
 * @returns {Promise<{
 *  trainer: WithId<Trainer>,
 *  setTrainer: (trainer: Trainer) => void,
 *  err?: string
 * }>}
 */
const useTrainer = async (user, ref) => {
  // TODO: got to current tutorial stage
  const { data: initialTrainer, err } = await useAwaitedMemo(
    async () => getTrainer(user),
    [],
    ref
  );
  const [trainer, setTrainer] = useState(initialTrainer, ref);

  return { trainer, setTrainer, err };
};

module.exports = useTrainer;
