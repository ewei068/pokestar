const { getTrainerLevelExp, MAX_TRAINER_LEVEL } = require("../config/trainerConfig");

/**
 * @typedef {object} TrainerProfile
 * @property {string} displayName
 * @property {string | null} avatarUrl
 * @property {number} level
 * @property {number} money
 * @property {{ current: number, required: number } | null} exp
 */

/**
 * Select the acting trainer's shell fields without exposing stored player data.
 * @param {Trainer} trainer
 * @returns {TrainerProfile}
 */
const projectTrainerProfile = (trainer) => {
  const { username, avatar } = trainer.user || {};
  const levelExp = getTrainerLevelExp(trainer.level);
  return {
    displayName: typeof username === "string" && username.trim() ? username.trim() : "Trainer",
    avatarUrl: typeof avatar === "string" && avatar
      ? `https://cdn.discordapp.com/avatars/${encodeURIComponent(trainer.userId)}/${encodeURIComponent(avatar)}.png`
      : null,
    level: trainer.level,
    money: trainer.money,
    exp: trainer.level >= MAX_TRAINER_LEVEL ? null : {
      current: trainer.exp - levelExp,
      required: getTrainerLevelExp(trainer.level + 1) - levelExp,
    },
  };
};

module.exports = { projectTrainerProfile };
