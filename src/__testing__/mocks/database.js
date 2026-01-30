/* eslint-disable class-methods-use-this */
/* eslint-disable lines-between-class-members */
const mockClient = {
  connect: jest.fn().mockResolvedValue(undefined),
  db: jest.fn().mockReturnValue({
    collection: jest.fn().mockReturnValue({
      insertOne: jest.fn().mockResolvedValue({ insertedId: "mock-id" }),
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      findOne: jest.fn().mockResolvedValue(null),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      }),
      deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    }),
  }),
};

const getCollection = jest.fn().mockResolvedValue({});
const insertDocument = jest.fn().mockResolvedValue({ insertedId: "mock-id" });
const updateDocument = jest.fn().mockResolvedValue({ modifiedCount: 1 });
const updateDocuments = jest.fn().mockResolvedValue({ modifiedCount: 1 });
const findDocument = jest.fn().mockResolvedValue(null);
const findDocuments = jest.fn().mockResolvedValue([]);
const findAndUpdateDocument = jest.fn().mockResolvedValue({ value: null });
const countDocuments = jest.fn().mockResolvedValue(0);
const deleteDocuments = jest.fn().mockResolvedValue({ deletedCount: 1 });

class QueryBuilder {
  constructor() {
    this.query = {};
  }
  where() {
    return this;
  }
  limit() {
    return this;
  }
  sort() {
    return this;
  }
  skip() {
    return this;
  }
  setInsert() {
    return this;
  }
  findOne() {
    return Promise.resolve(null);
  }
  find() {
    return Promise.resolve([]);
  }
  insertMany() {
    return Promise.resolve({ insertedCount: 0, insertedIds: {} });
  }
}

module.exports = {
  mockClient,
  getCollection,
  insertDocument,
  updateDocument,
  updateDocuments,
  findDocument,
  findDocuments,
  findAndUpdateDocument,
  countDocuments,
  deleteDocuments,
  QueryBuilder,
};
