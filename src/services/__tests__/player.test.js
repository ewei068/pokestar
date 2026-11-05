const { ObjectId } = require('mongodb');
const db = require('../../database/mongoHandler');
const trainerService = require('../trainer');
const { getPokemonFromUserId, listPokemons, findOwnedPokemons } = require('../pokemon');
const { createMockPokemon } = require('../../__testing__/mocks/pokemon');
const { createPlayerService, parseCollectionQuery } = require('../player');
const { buildNpcBattle } = require('../npcBattle');
const { getDurableBattleService } = require('../durableBattle');
const { validatePartyForBattle } = require('../party');
const { createMockTrainer } = require('../../__testing__/mocks/trainer');

jest.mock('../party', () => ({ ...jest.requireActual('../party'), validatePartyForBattle: jest.fn() }));

jest.mock('../durableBattle', () => ({ isDurableBattleEnabled: () => true, getDurableBattleService: jest.fn() }));
jest.mock('../npcBattle', () => ({ ...jest.requireActual('../npcBattle'), buildNpcBattle: jest.fn() }));

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

test('NPC starts use ordinary durable creation and keep success if participation fails', async () => {
  /** @type {jest.Mock} */ (buildNpcBattle).mockResolvedValue({ data: { id: 'new-battle' }, err: null });
  /** @type {jest.Mock} */ (getDurableBattleService).mockResolvedValue({ start: async () => ({ battleId: 'new-battle' }) });
  mockGrant.mockRejectedValue(new Error('grant unavailable'));
  const result = await service.interact(actor, { kind: 'npc.start', npcId: 'blue', difficulty: 'easy' });
  expect(result.battleId).toBe('new-battle');
  expect(buildNpcBattle).toHaveBeenCalledWith({ user: { id: actor }, npcId: 'blue', difficulty: 'easy', refreshIdentity: false });
  await expect(service.interact(actor, { kind: 'npc.start', npcId: 'blue', difficulty: 'easy', userId: 'other' })).rejects.toMatchObject({ code: 'invalid_interaction' });
});
test('NPC reads normalize trainer progress without a participation grant', async () => {
  trainer.defeatedNPCsToday = { blue: ['easy'] };
  const result = await service.npcs(actor);
  expect(result.npcs.find(npc => npc.id === 'blue').difficulties[0].dailyClaimed).toBe(true);
  expect(mockGetTrainer).toHaveBeenCalledWith({ id: actor }, false);
  expect(mockGrant).not.toHaveBeenCalled();
  trainer.lastTowerStage = 6;
  const dungeons = await service.dungeons(actor);
  const tower = await service.tower(actor);
  expect(dungeons.dungeons[0].id).toBe('mindTemple');
  expect(tower.lastTowerStage).toBe(6);
  expect(tower.floors).toHaveLength(20);
  expect(mockGrant).not.toHaveBeenCalled();
});

test('dungeon inserts and tower resumes grant participation, and a rejected floor does not', async () => {
  const mock = createMockTrainer();
  mock.trainer.lastTowerStage = 6;
  mockGetTrainer.mockResolvedValue({ data: mock.trainer });
  /** @type {jest.Mock} */ (validatePartyForBattle).mockResolvedValue({ data: mock.party.pokemons });
  const start = jest.fn().mockResolvedValue({ battleId: 'created' });
  const listActive = jest.fn().mockResolvedValue([]);
  /** @type {jest.Mock} */ (getDurableBattleService).mockResolvedValue({ start, listActive });
  mockGrant.mockResolvedValue({ err: null });
  await expect(service.interact(actor, { kind: 'dungeon.start', dungeonId: 'mindTemple', difficulty: 'medium' })).resolves.toMatchObject({ battleId: 'created' });
  expect(start).toHaveBeenCalledTimes(1);
  expect(mockGrant).toHaveBeenCalledWith(mock.trainer, 5, 10);
  listActive.mockResolvedValue([{ _id: 'floor-7', updatedAt: '2026-11-02T00:00:00.000Z', mode: { type: 'tower', stage: 7 } }]);
  await expect(service.interact(actor, { kind: 'tower.start', stage: 7 })).resolves.toMatchObject({ battleId: 'floor-7' });
  expect(start).toHaveBeenCalledTimes(1);
  expect(mockGrant).toHaveBeenCalledTimes(2);
  mockGrant.mockRejectedValue(new Error('grant unavailable'));
  await expect(service.interact(actor, { kind: 'dungeon.start', dungeonId: 'mindTemple', difficulty: 'medium' })).resolves.toMatchObject({ battleId: 'created' });
  mockGrant.mockClear();
  await expect(service.interact(actor, { kind: 'tower.start', stage: 8 })).rejects.toMatchObject({ code: 'tower_not_current', status: 400 });
  await expect(service.interact(actor, { kind: 'dungeon.start', dungeonId: 'missing', difficulty: 'medium' })).rejects.toMatchObject({ code: 'invalid_dungeon' });
  await expect(service.interact(actor, { kind: 'tower.start', stage: '7' })).rejects.toMatchObject({ code: 'invalid_interaction' });
  await expect(service.interact(actor, { kind: 'tower.start', stage: 7, userId: 'other' })).rejects.toMatchObject({ code: 'invalid_interaction' });
  expect(mockGrant).not.toHaveBeenCalled();
  expect(start).toHaveBeenCalledTimes(2);
});
