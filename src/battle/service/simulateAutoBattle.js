const { chooseNpcAction } = require("../../utils/battleUtils");

const yieldToEventLoop = () =>
  new Promise((resolve) => {
    setImmediate(resolve);
  });

/**
 * Simulate on a private engine. No persistence, currency, or rewards here.
 * @param {Battle} battle
 * @param {{chooseAction?: Function, maxActions?: number, yieldControl?: Function}=} options
 */
const simulateAutoBattle = async (
  battle,
  {
    chooseAction = chooseNpcAction,
    maxActions = 300,
    yieldControl = yieldToEventLoop,
  } = {},
) => {
  const actions = [];
  while (!battle.ended && actions.length < maxActions) {
    // Yield before each small batch, including the first, to keep Discord/HTTP responsive.
    if (actions.length % 5 === 0) await yieldControl();
    const actorUserId = battle.activePokemon.userId;
    const action = chooseAction(battle);
    const outcome = battle.performAction(action);
    if (!outcome.accepted)
      return { completed: false, reason: "auto_action_failed" };
    actions.push({
      actorUserId,
      action,
      events: outcome.events,
      log: outcome.log,
    });
  }
  return battle.ended
    ? { completed: true, actions, view: battle.takeSnapshot() }
    : { completed: false, reason: "auto_action_limit" };
};

module.exports = { simulateAutoBattle, yieldToEventLoop };
