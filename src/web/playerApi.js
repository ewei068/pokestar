const express = require("express");
const { PlayerError } = require("../services/player");

/**
 * Mounted after shared session/origin/rate-limit middleware has been configured.
 * @param {object} options
 * @param {ReturnType<import("../services/player").createPlayerService>} options.service
 * @param {import("../battle/service/BattleWebService").BattleWebService} options.battleService
 * @param {import("express").RequestHandler} options.requireSession
 * @param {import("express").RequestHandler} options.requireSiteOrigin
 * @param {Record<string, import("express").RequestHandler>} options.rateLimits
 */
const createPlayerApi = ({ service, battleService, requireSession, requireSiteOrigin, rateLimits }) => {
  const router = express.Router();
  router.use(requireSession);
  // The header is an assertion, never an identity source. It prevents a request
  // from an old tab acting as a newly signed-in account after cookies change.
  router.use((request, response, next) => {
    if (request.get("X-Player-Id") !== request.discordUserId) {
      response.status(409).json({ error: "account_changed" });
      return;
    }
    next();
  });
  /** @param {(request: import("express").Request) => Promise<object>} operation */
  const handle = (operation) => async (request, response, next) => {
    try {
      response.json({ ...await operation(request), discordUserId: request.discordUserId });
    } catch (error) {
      if (error instanceof PlayerError) response.status(error.status).json({ error: error.code });
      else next(error);
    }
  };
  router.get("/npcs", rateLimits.reads, handle((request) => service.npcs(request.discordUserId)));
  router.get("/dungeons", rateLimits.reads, handle((request) => service.dungeons(request.discordUserId)));
  router.get("/tower", rateLimits.reads, handle((request) => service.tower(request.discordUserId)));
  router.get("/bag", rateLimits.reads, handle((request) => service.bag(request.discordUserId)));
  router.get("/battles", rateLimits.reads, handle(async (request) => ({ battles: await battleService.listActive(request.discordUserId) })));
  router.get("/trainer", rateLimits.reads, handle((request) => service.profile(request.discordUserId)));
  router.get("/collection", rateLimits.reads, handle((request) => service.collection(request.discordUserId, request.query)));
  router.get("/pokemon/:id/training", rateLimits.reads, handle((request) => service.training(request.discordUserId, request.params.id)));
  router.post("/pokemon/:id/train", requireSiteOrigin, rateLimits.training, handle((request) => service.train(request.discordUserId, request.params.id, request.body)));
  router.get("/pokemon/:id/build", rateLimits.reads, handle((request) => service.build(request.discordUserId, request.params.id)));
  router.post("/pokemon/:id/nature", requireSiteOrigin, rateLimits.actions, handle((request) => service.changeNature(request.discordUserId, request.params.id, request.body)));
  router.post("/pokemon/:id/held-item", requireSiteOrigin, rateLimits.actions, handle((request) => service.changeHeldItem(request.discordUserId, request.params.id, request.body)));
  router.get("/pokemon/:id/equipment", rateLimits.reads, handle((request) => service.equipment(request.discordUserId, request.params.id)));
  router.post("/pokemon/:id/equipment/upgrade", requireSiteOrigin, rateLimits.actions, handle((request) => service.upgradeEquipment(request.discordUserId, request.params.id, request.body)));
  router.post("/pokemon/:id/equipment/reroll", requireSiteOrigin, rateLimits.actions, handle((request) => service.rerollEquipment(request.discordUserId, request.params.id, request.body)));
  router.get("/pokemon/:id", rateLimits.reads, handle((request) => service.detail(request.discordUserId, request.params.id)));
  router.get("/party", rateLimits.reads, handle((request) => service.party(request.discordUserId)));
  router.post("/interactions", requireSiteOrigin, rateLimits.actions, handle((request) => service.interact(request.discordUserId, request.body)));
  return router;
};

module.exports = { createPlayerApi };
