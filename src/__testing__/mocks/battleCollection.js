class MemoryBattleCollection {
  constructor() {
    this.documents = new Map();
  }

  async insertOne(document) {
    if (this.documents.has(document._id)) throw new Error("duplicate battle ID");
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
    if (
      !document ||
      (filter.revision !== undefined && document.revision !== filter.revision) ||
      document.status !== filter.status ||
      (filter.expiresAt?.$lte && document.expiresAt > filter.expiresAt.$lte)
    ) {
      return { modifiedCount: 0 };
    }
    Object.assign(document, structuredClone(update.$set));
    if (update.$push?.actions) {
      document.actions.push(structuredClone(update.$push.actions));
    }
    return { modifiedCount: 1 };
  }
}

module.exports = { MemoryBattleCollection };
