const { createHash, randomBytes } = require("crypto");

const SESSION_LIFETIME_MS = 14 * 24 * 60 * 60 * 1000;
const tokenHash = (token) => createHash("sha256").update(token).digest("hex");

class WebSessionStore {
  constructor(collection, { now = () => new Date() } = {}) {
    this.collection = collection;
    this.now = now;
  }

  async create(userId) {
    const token = randomBytes(32).toString("base64url");
    const expiresAt = new Date(this.now().getTime() + SESSION_LIFETIME_MS);
    await this.collection.insertOne({ _id: tokenHash(token), userId, expiresAt });
    return { token, expiresAt };
  }

  async get(token) {
    if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
      return null;
    }
    const session = await this.collection.findOne({ _id: tokenHash(token) });
    return session?.expiresAt > this.now() ? session : null;
  }

  async delete(token) {
    if (typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token)) {
      await this.collection.deleteOne({ _id: tokenHash(token) });
    }
  }
}

module.exports = { WebSessionStore, SESSION_LIFETIME_MS };
