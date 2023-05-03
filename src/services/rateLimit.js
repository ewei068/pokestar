const userLastRequest = {}

// TODO: cleanup userLastRequest to remove old entries
/**
 * Given a user id, check to see when the user last made a successful request.
 * If the user has not made a request in the last second, return true and update 
 * the last request time. Else, return false.
 * @param {String} userId 
 */
const checkRateLimit = (userId) => {
    const now = Date.now();
    if (userLastRequest[userId] === undefined) {
        userLastRequest[userId] = now;
        return true;
    }
    if (now - userLastRequest[userId] > 1000) {
        userLastRequest[userId] = now;
        return true;
    }
    return false;
}

module.exports = {
    checkRateLimit: checkRateLimit
}
