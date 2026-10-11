const { getCollection } = require("../database/mongoHandler");
const { collectionNames } = require("../config/databaseConfig");
const { getDurableBattleService } = require("../services/durableBattle");
const { BattleWebService } = require("../battle/service/BattleWebService");
const { WebSessionStore } = require("./sessionStore");
const { createBattleApi } = require("./battleApi");
const { buildBattleCatalog } = require("./battleCatalog");

const createMongoBattleApi = async (config = process.env) => {
  const site = new URL(config.WEB_SITE_ORIGIN);
  if (site.protocol !== "https:" && site.hostname !== "localhost") {
    throw new Error("Web site origin must use HTTPS outside localhost");
  }
  const siteOrigin = site.origin;
  const redirectUri = config.WEB_DISCORD_REDIRECT_URI;
  const callback = new URL(redirectUri);
  if (callback.pathname !== "/api/auth/discord/callback" ||
      (callback.protocol !== "https:" && callback.hostname !== "localhost")) {
    throw new Error("Invalid web Discord redirect URI");
  }
  if (!config.CLIENT_ID || !config.DISCORD_CLIENT_SECRET) {
    throw new Error("Discord OAuth credentials are required for the web API");
  }
  const collection = await getCollection(collectionNames.WEB_SESSIONS);
  await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  const sessionStore = new WebSessionStore(collection);
  const battleService = new BattleWebService(await getDurableBattleService());
  return createBattleApi({
    battleService,
    sessionStore,
    siteOrigin,
    clientId: config.CLIENT_ID,
    clientSecret: config.DISCORD_CLIENT_SECRET,
    redirectUri,
    catalog: buildBattleCatalog(),
  });
};

module.exports = { createMongoBattleApi };
