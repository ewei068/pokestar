class MemoryBattleCollection {
  constructor() {
    this.documents = new Map();
  }

  async insertOne(document) {
    if (this.documents.has(document._id))
      throw new Error("duplicate battle ID");
    this.documents.set(document._id, structuredClone(document));
    return { insertedId: document._id };
  }

  async findOne({ _id }) {
    const document = this.documents.get(_id);
    return document ? structuredClone(document) : null;
  }

  find({ participantIds, status }) {
    return {
      toArray: async () =>
        [...this.documents.values()]
          .filter(
            (document) =>
              document.participantIds.includes(participantIds) &&
              document.status === status,
          )
          .map((document) => structuredClone(document)),
    };
  }

  async updateOne(filter, update) {
    const document = this.documents.get(filter._id);
    const matches =
      document &&
      Object.entries(filter).every(([key, expected]) => {
        const actual = key
          .split(".")
          .reduce((value, part) => value?.[part], document);
        if (expected && typeof expected === "object") {
          if ("$lte" in expected) return actual <= expected.$lte;
          if ("$gt" in expected) return actual > expected.$gt;
        }
        return expected === null ? actual == null : actual === expected;
      });
    if (!matches) return { modifiedCount: 0 };
    for (const [key, value] of Object.entries(update.$set || {})) {
      const parts = key.split(".");
      const target = parts
        .slice(0, -1)
        .reduce((parent, part) => parent[part], document);
      target[parts.at(-1)] = structuredClone(value);
    }
    if (update.$push?.actions) {
      const addition = update.$push.actions;
      document.actions.push(...structuredClone(addition.$each || [addition]));
    }
    return { modifiedCount: 1 };
  }
}

module.exports = { MemoryBattleCollection };
