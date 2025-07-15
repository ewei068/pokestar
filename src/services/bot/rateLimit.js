/**
 * @file
 * @author Elvis Wei
 * @date 2023
 * @section Description
 *
 * rateLimit.js get rateLimited kid, next time get a better isp. (Rate limits the user's requests to stop bots or rampaging users)
 */
const userLastRequest = {};

// TODO: cleanup userLastRequest to remove old entries
/**
 * Given a user id, check to see when the user last made a successful request.
 * If the user has not made a request in the last 3/4ths second, return true and update
 * the last request time. Else, return false.
 * @param {String} userId
 */
const checkRateLimit = (userId) => {
  const now = Date.now();
  if (userLastRequest[userId] === undefined) {
    userLastRequest[userId] = now;
    return true;
  }
  if (now - userLastRequest[userId] > 750) {
    userLastRequest[userId] = now;
    return true;
  }
  return false;
};

module.exports = {
  checkRateLimit,
};
