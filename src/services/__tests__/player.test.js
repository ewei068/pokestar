const { ObjectId } = require('mongodb');
const db = require('../../database/mongoHandler');
const trainerService = require('../trainer');
const { getPokemonFromUserId, listPokemons, findOwnedPokemons } = require('../pokemon');
const { createMockPokemon } = require('../../__testing__/mocks/pokemon');
const { createPlayerService, parseCollectionQuery } = require('../player');

jest.mock('../trainer', () => ({ getTrainer: jest.fn(), addExpAndMoneyTrainer: jest.fn() }));

const mockGetTrainer = /** @type {jest.Mock} */ (trainerService.getTrainer);
const mockGetCollection = /** @type {jest.Mock} */ (db.getCollection);
const mockGrant = /** @type {jest.Mock} */ (trainerService.addExpAndMoneyTrainer);

const actor = '123';
let trainer;
let documents;
let service;
beforeEach(() => {
  jest.clearAllMocks();
  trainer = { userId: actor, user: { username: 'Player' }, level: 1, exp: 0, money: 100,
    party: { rows: 3, cols: 4, pokemonIds: Array(12).fill(null) } };
  documents = [10, 60, 30].map((level) => ({ ...createMockPokemon({ level, userId: actor }), _id: new ObjectId(), combatPower: 999999 }));
  mockGetTrainer.mockResolvedValue({ data: trainer });
  mockGetCollection.mockResolvedValue({ find: jest.fn((filter) => {
    expect(filter.userId).toBe(actor);
    return { toArray: async () => documents };
  }), findOne: jest.fn(async (filter) => documents.find((p) => p.userId === filter.userId && p._id.equals(filter._id)) || null) });
  service = createPlayerService();
});

test('query accepts only bounded scalars and rejects database operators/unknown keys', () => {
  for (const query of [{ userId: 'other' }, { search: { $ne: '' } }, { pageSize: '101' }, { page: '-1' }, { sort: '$where' }]) {
    expect(() => parseCollectionQuery(query)).toThrow();
  }
});

test('collection derives current CP before sorting and pages deterministically without writes', async () => {
  const result = await service.collection(actor, { sort: 'cp', order: 'desc', pageSize: '2' });
  expect(result.items.map((p) => p.level)).toEqual([60, 30]);
  expect(result.total).toBe(3);
  expect(result.totalPages).toBe(2);
  expect(result.items[0].combatPower).not.toBe(999999);
  expect(result.items[0].ivPercent).toBe(100);
  expect(db.updateDocument).not.toHaveBeenCalled();
  expect(documents[0].combatPower).toBe(999999);
});

test('owned detail never returns another owner document', async () => {
  documents[0].userId = 'other';
  await expect(service.detail(actor, documents[0]._id.toHexString())).rejects.toMatchObject({ code: 'pokemon_not_found', status: 404 });
});

test('filtering uses current party membership, rarity and literal search', async () => {
  trainer.party.pokemonIds[0] = documents[0]._id.toHexString();
  const result = await service.collection(actor, { inParty: 'true' });
  expect(result.items.map((p) => p.id)).toEqual([documents[0]._id.toHexString()]);
  expect((await service.collection(actor, { search: '.*' })).total).toBe(0);
});

test('pure reads do not grant; successful explicit reads grant once without retrying failures', async () => {
  mockGrant.mockResolvedValue({ err: null });
  await service.collection(actor, {});
  await service.detail(actor, documents[0]._id.toHexString());
  expect(trainerService.addExpAndMoneyTrainer).not.toHaveBeenCalled();
  await service.interact(actor, { kind: 'inspect', pokemonId: documents[0]._id.toHexString() });
  expect(trainerService.addExpAndMoneyTrainer).toHaveBeenCalledTimes(1);
  expect(trainerService.addExpAndMoneyTrainer).toHaveBeenCalledWith(trainer, 5, 10);
  mockGrant.mockRejectedValue(new Error('database unavailable'));
  await expect(service.interact(actor, { kind: 'collection', query: {} })).resolves.toHaveProperty('items');
  expect(trainerService.addExpAndMoneyTrainer).toHaveBeenCalledTimes(2);
  await expect(service.interact(actor, { kind: 'inspect', pokemonId: new ObjectId().toHexString() })).rejects.toMatchObject({ status: 404 });
  expect(trainerService.addExpAndMoneyTrainer).toHaveBeenCalledTimes(2);
});

test('detail projects nature/moves/ability and excludes private ownership data', async () => {
  documents[0].moveIds = []; // Stored catches inherit the species moves, as battles do.
  const result = await service.detail(actor, documents[0]._id.toHexString());
  expect(result.pokemon.nature).toEqual({ name: 'Lonely', raisedStat: 1, loweredStat: 2 });
  expect(result.pokemon.moves).toHaveLength(4);
  expect(result.pokemon.moves[0]).toHaveProperty('description');
  expect(result.pokemon).not.toHaveProperty('userId');
  expect(result.pokemon).not.toHaveProperty('_id');
});

test('Discord detail uses the same owned pure lookup without persisted refresh writes', async () => {
  const result = await getPokemonFromUserId(actor, documents[0]._id.toHexString());
  expect(result.err).toBeNull();
  expect(result.data.combatPower).not.toBe(999999);
  expect(db.findAndUpdateDocument).not.toHaveBeenCalled();
  expect(db.updateDocument).not.toHaveBeenCalled();
});


test('Discord and HTTP share fresh CP ordering and owner cannot be overridden', async () => {
  const discord = await listPokemons(actor, { page: 1, pageSize: 2, sort: { combatPower: -1 }, filter: { userId: 'attacker' } });
  const browser = await service.collection(actor, { page: 1, pageSize: 2, sort: 'cp', order: 'desc' });
  expect(discord.data.map((pokemon) => pokemon._id.toHexString())).toEqual(browser.items.map((pokemon) => pokemon.id));
  expect(discord.lastPage).toBe(false);
  await findOwnedPokemons(actor, { userId: 'attacker' }); // Mock asserts every query owner.
  expect(db.updateDocument).not.toHaveBeenCalled();
});
