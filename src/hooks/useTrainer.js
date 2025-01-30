const { useAwaitedMemo, useState, useCallback } = require("../deact/deact");
const { getTrainer } = require("../services/trainer");

/**
 * @param {DiscordUser} user
 * @param {DeactElement} ref
 * @returns {Promise<{
 *  trainer: WithId<Trainer>,
 *  setTrainer: (trainer: Trainer) => void,
 *  refreshTrainer: () => Promise<{ trainer?: WithId<Trainer>, err?: string }>,
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

  const refreshTrainer = useCallback(
    async () => {
      const { data: newTrainer, err: newErr } = await getTrainer(user);
      if (newErr) {
        return { err: newErr };
      }

      setTrainer(newTrainer);
      return { trainer: newTrainer };
    },
    [user, setTrainer],
    ref
  );

  return { trainer, setTrainer, err, refreshTrainer };
};

module.exports = useTrainer;
