const createVoteWebhook = ({ addVote, logger, config = process.env }) => async (req, res) => {
  try {
    const authorization = req.header("Authorization");
    const isDbl = Boolean(config.DBL_SECRET) && authorization === config.DBL_SECRET;
    const isTopgg = Boolean(config.TOPGG_SECRET) && authorization === config.TOPGG_SECRET;
    if (!isDbl && !isTopgg) {
      res.sendStatus(401);
      return;
    }
    let success = false;
    if (isDbl) {
      const user = req.body;
      logger.info(`Received DBL vote from ${user.id}`);
      const { err } = await addVote(user);
      if (!err) {
        success = true;
      }
    } else if (isTopgg) {
      const user = {
        id: req.body.user,
      };
      logger.info(`Received TOP.GG vote from ${user.id}`);
      const { err } = await addVote(user, 2);
      if (!err) {
        success = true;
      }
    }

    if (success) {
      res.sendStatus(200);
    } else {
      res.sendStatus(500);
    }
  } catch (error) {
    logger.error(error);
    res.sendStatus(500);
  }
};

module.exports = { createVoteWebhook };
