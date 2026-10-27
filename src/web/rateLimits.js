const { rateLimit } = require("express-rate-limit");
const { logger } = require("../log");

const DEFAULT_LIMITS = { general: 1200, login: 40, callback: 40, reads: 240, actions: 60 };

// Each bucket owns its store. Memory quotas assume one HTTP process; restarting
// resets them. Use a shared store before adding HTTP workers or instances.
const createApiRateLimits = ({ limits = {}, windowMs = 60000 } = {}) => {
  const budgets = { ...DEFAULT_LIMITS, ...limits };
  const deniedCounts = new Map();
  let logTimer;
  const recordDenial = (bucket) => {
    deniedCounts.set(bucket, (deniedCounts.get(bucket) || 0) + 1);
    if (!logTimer) {
      logTimer = setTimeout(() => {
        logger.warn("Web API rate limits", Object.fromEntries(deniedCounts));
        deniedCounts.clear();
        logTimer = undefined;
      }, 60000);
      logTimer.unref();
    }
  };
  return Object.fromEntries(Object.entries(budgets).map(([bucket, limit]) => {
    const userBucket = bucket === "reads" || bucket === "actions";
    return [bucket, rateLimit({
      windowMs,
      limit,
      identifier: bucket,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      skip: (request) => request.method === "OPTIONS",
      message: { error: "rate_limited" },
      handler: (request, response) => {
        recordDenial(bucket);
        response.status(429).json({ error: "rate_limited" });
      },
      ...(userBucket ? { keyGenerator: (request) => request.discordUserId } : {}),
    })];
  }));
};

// Only an explicitly configured loopback proxy may supply client addresses.
// That proxy must replace forwarding headers, and port 3000 must stay private.
const configureHttpProxy = (app, config = process.env) => {
  const setting = config.HTTP_TRUST_LOOPBACK_PROXY;
  if (setting && setting !== "false" && setting !== "true") {
    throw new Error("HTTP_TRUST_LOOPBACK_PROXY must be true or false");
  }
  if (setting !== "true") {
    app.set("trust proxy", false);
    return;
  }
  if (config.HTTP_HOST !== "127.0.0.1" && config.HTTP_HOST !== "::1") {
    throw new Error("Loopback proxy trust requires HTTP_HOST=127.0.0.1 or ::1");
  }
  app.set("trust proxy", (address, hop) => hop === 0 &&
    ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(address));
};

module.exports = { createApiRateLimits, configureHttpProxy };
