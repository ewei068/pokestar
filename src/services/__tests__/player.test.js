process.env.STAGE ||= "ALPHA";
const { ObjectId } = require('mongodb');
const db = require('../../database/mongoHandler');
const trainerService = require('../trainer');
const { getPokemonFromUserId, listPokemons, findOwnedPokemons } = require('../pokemon');
const { createMockPokemon } = require('../../__testing__/mocks/pokemon');
const { createPlayerService, parseCollectionQuery } = require('../player');
const { backpackItems } = require('../../config/backpackConfig');
const { buildNpcBattle } = require('../npcBattle');
const { getDurableBattleService } = require('../durableBattle');
const { validatePartyForBattle } = require('../party');
const { createMockTrainer } = require('../../__testing__/mocks/trainer');

const nature = jest.mocked(require('../pokemonNature').changePokemonNature);
  const held = jest.mocked(require('../pokemon').changeHeldItem);
  const remove = jest.mocked(require('../pokemon').removeHeldItem);
const equipmentDomain = jest.mocked(require('../pokemonEquipment'));
const { equipmentConfig, modifierSlotConfig, modifierConfig } = require('../../config/equipmentConfig');

jest.mock('../party', () => ({ ...jest.requireActual('../party'), validatePartyForBattle: jest.fn() }));

jest.mock('../durableBattle', () => ({ isDurableBattleEnabled: () => true, getDurableBattleService: jest.fn() }));
jest.mock('../npcBattle', () => ({ ...jest.requireActual('../npcBattle'), buildNpcBattle: jest.fn() }));

jest.mock('../trainer', () => ({ getTrainer: jest.fn(), addExpAndMoneyTrainer: jest.fn() }));
jest.mock('../pokemonNature', () => ({ ...jest.requireActual('../pokemonNature'), changePokemonNature: jest.fn() }));
jest.mock('../pokemon', () => ({ ...jest.requireActual('../pokemon'), changeHeldItem: jest.fn(), removeHeldItem: jest.fn() }));
jest.mock('../pokemonEquipment', () => ({ ...jest.requireActual('../pokemonEquipment'), upgradeEquipmentLevel: jest.fn(), rerollStatSlot: jest.fn() }));


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
  expect(result.pokemon.nature).toEqual({ id: '1', name: 'Lonely', raisedStat: 1, loweredStat: 2 });
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
  listActive.mockResolvedValue([{ battleId: 'floor-7', updatedAt: '2026-11-02T00:00:00.000Z', mode: { type: 'tower', stage: 7 } }]);
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

test('bag reads owned rows in catalog order without a participation grant', async () => {
  trainer.backpack = {
    0: { 0: 24, 1: 0, stray: 4 },
    1: { 7: Number.NaN, h1178: 9 },
    3: { h1178: 1 },
  };
  const result = await service.bag(actor);
  expect(result.items.map((item) => [item.id, item.quantity, item.icon])).toEqual([
    [backpackItems.POKEBALL, 24, 'poke-ball.png'],
    [backpackItems.HEAVY_DUTY_BOOTS, 1, 'heavy-duty-boots.png'],
  ]);
  expect(result.items[0].name).toBe('Pokeball');
  expect(result.items[0]).not.toHaveProperty('emoji');
  expect(result.items[1]).not.toHaveProperty('cost');
  expect(result).not.toHaveProperty('backpack');
  expect(mockGrant).not.toHaveBeenCalled();

  delete trainer.backpack;
  await expect(service.bag(actor)).resolves.toEqual({ items: [] });
  expect(mockGrant).not.toHaveBeenCalled();
});

describe('owned training', () => {
  const mockUpdate = /** @type {jest.Mock} */ (db.updateDocument);
  beforeEach(() => {
    trainer.locations = { 1: 3, 7: 1, 8: 1 };
    mockUpdate.mockImplementation(async (collection, filter, patch) => {
      if (collection === 'userPokemon') {
        const stored = documents.find((pokemon) => pokemon._id.equals(filter._id));
        Object.assign(stored, patch.$set);
      }
      return { modifiedCount: 1 };
    });
    mockGrant.mockImplementation(async (record, exp, money) => {
      trainer.exp += exp;
      trainer.money += money;
      return { err: null };
    });
  });
  test('context is a pure owned read with free Home and actual next clamped gains', async () => {
    documents[0].level = 100;
    documents[0].evs = [251, 250, 0, 0, 0, 0];
    const result = await service.training(actor, documents[0]._id.toHexString());
    expect(result.pokemon.id).toBe(documents[0]._id.toHexString());
    expect(result.pokemon.exp).toBeNull();
    expect(result.locations).toHaveLength(9);
    expect(result.locations[0]).toMatchObject({ id: '0', level: 0, owned: true, canTrain: false, nextGains: { exp: 35 } });
    expect(result.locations[1]).toMatchObject({ level: 3, owned: true, canTrain: true, nextGains: { exp: 105, evs: [1, 0, 0, 0, 0, 0] } });
    expect(result.locations[2]).toMatchObject({ owned: false, canTrain: false });
    expect(result.locations[8]).toMatchObject({ canTrain: true, nextGains: { evs: [-10, -10, 0, 0, 0, 0] } });
    expect(mockGrant).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
  test('accepted training grants only configured train participation and returns fresh projections', async () => {
    const result = await service.train(actor, documents[0]._id.toHexString(), { locationId: '1' });
    expect(result).toMatchObject({ trained: true, gains: { exp: 105, evs: [12, 0, 0, 0, 0, 0] }, trainer: { money: 150 }, pokemon: { evs: [12, 0, 0, 0, 0, 0] } });
    expect(result.warning).toBeUndefined();
    expect(mockGrant).toHaveBeenCalledTimes(1);
    expect(mockGrant).toHaveBeenCalledWith(trainer, 15, 50);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
  });
  test('strict payload, ownership, malformed IDs and locations reject without effects', async () => {
    const id = documents[0]._id.toHexString();
    for (const input of [null, [], {}, { locationId: 0 }, { locationId: '0', amount: 10 }, { kind: 'train' }]) {
      await expect(service.train(actor, id, input)).rejects.toMatchObject({ code: 'invalid_training_request' });
    }
    for (const locationId of ['2', '9', '50', '__proto__']) {
      await expect(service.train(actor, id, { locationId })).rejects.toMatchObject({ code: 'invalid_training_location' });
    }
    for (const pokemonId of ['malformed', new ObjectId().toHexString()]) {
      await expect(service.train(actor, pokemonId, { locationId: '0' })).rejects.toMatchObject({ code: 'pokemon_not_found', status: 404 });
    }
    documents[0].userId = 'other';
    await expect(service.training(actor, id)).rejects.toMatchObject({ code: 'pokemon_not_found' });
    await expect(service.train(actor, id, { locationId: '0' })).rejects.toMatchObject({ code: 'pokemon_not_found' });
    expect(mockGrant).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
  test('completion returns zero gains and profile with no grant, event or write', async () => {
    documents[0].level = 100;
    const result = await service.train(actor, documents[0]._id.toHexString(), { locationId: '0' });
    expect(result).toMatchObject({ trained: false, gains: { exp: 0, evs: [0, 0, 0, 0, 0, 0] }, trainer: { money: 100 } });
    expect(mockGrant).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
  test('grant failure preserves confirmed primary gains, warns and never replays', async () => {
    mockGrant.mockRejectedValue(new Error('grant uncertain'));
    const result = await service.train(actor, documents[0]._id.toHexString(), { locationId: '1' });
    expect(result).toMatchObject({ trained: true, gains: { exp: 105, evs: [12, 0, 0, 0, 0, 0] } });
    expect(result.warning).toContain('Training saved');
    expect(mockGrant).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledTimes(1);
  });
  test('post-commit refresh failure still returns confirmed gains with warning', async () => {
    mockGetTrainer.mockResolvedValueOnce({ data: trainer }).mockResolvedValueOnce({ data: trainer }).mockRejectedValueOnce(new Error('refresh unavailable'));
    const result = await service.train(actor, documents[0]._id.toHexString(), { locationId: '1' });
    expect(result).toMatchObject({ trained: true, gains: { exp: 105, evs: [12, 0, 0, 0, 0, 0] } });
    expect(result.warning).toContain('refreshed state');
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockGrant).toHaveBeenCalledTimes(1);
  });
});


test('build composes domain previews and owned inventory without grants or private documents', async () => {
  trainer.backpack = { 1: { 7: 3 }, 3: { h197: 1 } };
  const result = await service.build(actor, documents[0]._id.toHexString());
  expect(result.natures).toHaveLength(25);
  expect(result.pokemon.nature.id).toBe(String(documents[0].natureId));
  expect(result.mintQuantity).toBe(3);
  expect(result.heldItems.map(item => item.id)).toEqual(['h197']);
  expect(result).not.toHaveProperty('backpack');
  expect(result.pokemon).not.toHaveProperty('userId');
  expect(mockGrant).not.toHaveBeenCalled();
});

test('domain mutation grants only changed operations, rejects injected fields and preserves saved results on grant failure', async () => {
  const id = documents[0]._id.toHexString();
  nature.mockResolvedValue({ data: { trainer, pokemon: documents[0], changed: true } });
  mockGrant.mockResolvedValue({ err: null });
  const changed = await service.changeNature(actor, id, { natureId: '3', expectedNatureId: '1' });
  expect(changed.changed).toBe(true);
  expect(nature).toHaveBeenCalledWith({ id: actor }, id, '3', '1');
  expect(mockGrant).toHaveBeenCalledWith(trainer, 10, 25);
  mockGrant.mockClear();
  held.mockResolvedValue({ data: { trainer, pokemon: documents[0], changed: false } });
  await service.changeHeldItem(actor, id, { heldItemId: 'h197', expectedHeldItemId: null });
  expect(mockGrant).not.toHaveBeenCalled();
  remove.mockResolvedValue({ data: { trainer, pokemon: documents[0], changed: true } });
  mockGrant.mockRejectedValue(new Error('grant unavailable'));
  const result = await service.changeHeldItem(actor, id, { heldItemId: null, expectedHeldItemId: 'h197' });
  expect(result.changed).toBe(true);
  expect(result.warning).toMatch(/saved/i);
  expect(mockGrant).toHaveBeenCalledWith(trainer, 5, 10);
  expect(remove).toHaveBeenCalledTimes(1);
  await expect(service.changeNature(actor, id, { natureId: '3', expectedNatureId: '1', userId: 'other' })).rejects.toMatchObject({ status: 400 });
  await expect(service.changeHeldItem(actor, id, { heldItemId: 'h197' })).rejects.toMatchObject({ status: 400 });
  nature.mockResolvedValue({ err: 'changed', code: 'nature_changed', status: 409 });
  await expect(service.changeNature(actor, id, { natureId: '3', expectedNatureId: '1' })).rejects.toMatchObject({ code: 'nature_changed', status: 409 });
});

const equipmentFixture = () => /** @type {Equipment} */ ({ level: 4, slots: Object.fromEntries(Object.entries(equipmentConfig.powerBracer.slots)
  .map(([id, slot]) => [id, { modifier: slot.modifiers[0], quality: 75 }])) });

test('equipment reads project canonical values, costs and transparent configured rules without spending', async () => {
  const before = equipmentFixture();
  documents[0].equipments.powerBracer = structuredClone(before);
  trainer.money = 12480;
  trainer.backpack = { 1: { 6: 32 } };
  const inventory = structuredClone(trainer.backpack);
  const context = await service.equipment(actor, documents[0]._id.toHexString());
  expect(context.money).toBe(12480);
  expect(context.pieces).toHaveLength(1);
  expect(context.pieces[0]).toMatchObject({ id: 'powerBracer', level: 4,
    expectedEquipment: before, upgradeCost: { money: 1000, shards: 5 } });
  expect(context.pieces[0].slots[0]).toMatchObject({ id: 'primary', modifier: 'baseAtk', value: 9, nextValue: 11, quality: 75 });
  expect(context.materials.find(item => item.id === '6')).toMatchObject({ name: 'Willpower Shard', quantity: 32 });
  expect(context.materials.find(item => item.id === '4').quantity).toBe(0);
  expect(context.catalog).toMatchObject({ maxLevel: 10, rerollCost: { money: 1000, shards: 5 }, moneyPerShard: 200 });
  expect(context.catalog.types).toHaveLength(6);
  for (const type of context.catalog.types) {
    expect(type.materialId).toBe(equipmentConfig[type.id].material);
    for (const [slotId, pool] of Object.entries(type.slots)) expect(pool).toEqual(equipmentConfig[type.id].slots[slotId].modifiers);
  }
  expect(context.catalog.slots.map(slot => slot.scalesWithLevel)).toEqual(Object.values(modifierSlotConfig).map(slot => slot.level));
  expect(context.catalog.modifiers).toHaveLength(Object.keys(modifierConfig).length);
  expect(context.pokemon).not.toHaveProperty('userId');
  expect(context.pokemon).not.toHaveProperty('equipments');
  expect(documents[0].equipments.powerBracer).toEqual(before);
  expect(trainer.backpack).toEqual(inventory);
  expect(mockGrant).not.toHaveBeenCalled();
  expect(equipmentDomain.upgradeEquipmentLevel).not.toHaveBeenCalled();
});

test('maxed, missing and incomplete equipment never acquire an upgrade quote through reads', async () => {
  const id = documents[0]._id.toHexString();
  expect((await service.equipment(actor, id)).pieces).toEqual([]);
  documents[0].equipments.powerBracer = { level: 4, slots: {} };
  expect((await service.equipment(actor, id)).pieces).toEqual([]);
  documents[0].equipments.powerBracer = { ...equipmentFixture(), level: 10 };
  expect((await service.equipment(actor, id)).pieces[0].upgradeCost).toBeNull();
  documents[0].userId = 'other';
  await expect(service.equipment(actor, id)).rejects.toMatchObject({ status: 404 });
  expect(mockGrant).not.toHaveBeenCalled();
});

test('equipment adapters grant configured participation once and preserve duplicate-roll success', async () => {
  const id = documents[0]._id.toHexString();
  const before = equipmentFixture();
  documents[0].equipments.powerBracer = structuredClone(before);
  mockGrant.mockResolvedValue({ err: null });
  equipmentDomain.upgradeEquipmentLevel.mockResolvedValue({ data: { trainer, pokemon: documents[0], changed: true,
    previousEquipment: before, equipmentType: 'powerBracer' } });
  const upgraded = await service.upgradeEquipment(actor, id, { equipmentType: 'powerBracer', expectedEquipment: before });
  expect(upgraded.changed).toBe(true);
  expect(upgraded.change).toMatchObject({ kind: 'upgrade', equipmentType: 'powerBracer', previousEquipment: before });
  expect(equipmentDomain.upgradeEquipmentLevel).toHaveBeenCalledWith({ id: actor }, id, 'powerBracer', before);
  expect(mockGrant).toHaveBeenCalledWith(trainer, 15, 0);
  mockGrant.mockClear();
  equipmentDomain.rerollStatSlot.mockResolvedValue({ data: { trainer, pokemon: documents[0], changed: true,
    previousEquipment: before, equipmentType: 'powerBracer', slotId: 'primary' } });
  const rolled = await service.rerollEquipment(actor, id, { equipmentType: 'powerBracer', slotId: 'primary', expectedEquipment: before });
  expect(rolled.changed).toBe(true);
  expect(rolled.pieces[0].expectedEquipment).toEqual(before);
  expect(rolled.change).toMatchObject({ kind: 'reroll', slotId: 'primary' });
  expect(equipmentDomain.rerollStatSlot).toHaveBeenCalledWith({ id: actor }, id, 'powerBracer', 'primary', before);
  expect(mockGrant).toHaveBeenCalledTimes(1);
  expect(mockGrant).toHaveBeenCalledWith(trainer, 15, 0);
});

test('equipment requests allowlist fields and require an observed piece before calling the domain', async () => {
  const id = documents[0]._id.toHexString();
  const expectedEquipment = equipmentFixture();
  for (const input of [null, [], {}, { equipmentType: 'powerBracer' },
    { equipmentType: 'powerBracer', expectedEquipment, money: 0 },
    { equipmentType: 'powerBracer', expectedEquipment: null },
    { equipmentType: { $ne: '' }, expectedEquipment }]) {
    await expect(service.upgradeEquipment(actor, id, input)).rejects.toMatchObject({ status: 400 });
  }
  for (const input of [{ equipmentType: 'powerBracer', expectedEquipment },
    { equipmentType: 'powerBracer', slotId: {}, expectedEquipment },
    { equipmentType: 'powerBracer', slotId: 'primary', expectedEquipment, quality: 100 }]) {
    await expect(service.rerollEquipment(actor, id, input)).rejects.toMatchObject({ status: 400 });
  }
  expect(equipmentDomain.upgradeEquipmentLevel).not.toHaveBeenCalled();
  expect(equipmentDomain.rerollStatSlot).not.toHaveBeenCalled();
  expect(mockGrant).not.toHaveBeenCalled();
});

test('rejected equipment operations grant nothing; saved quest/grant/read warnings never replay', async () => {
  const id = documents[0]._id.toHexString();
  const before = equipmentFixture();
  documents[0].equipments.powerBracer = structuredClone(before);
  equipmentDomain.upgradeEquipmentLevel.mockResolvedValue({ err: 'changed', code: 'equipment_changed', status: 409 });
  await expect(service.upgradeEquipment(actor, id, { equipmentType: 'powerBracer', expectedEquipment: before }))
    .rejects.toMatchObject({ code: 'equipment_changed', status: 409 });
  expect(mockGrant).not.toHaveBeenCalled();
  equipmentDomain.upgradeEquipmentLevel.mockClear();
  equipmentDomain.upgradeEquipmentLevel.mockResolvedValue({ data: { trainer, pokemon: documents[0], changed: true,
    previousEquipment: before, equipmentType: 'powerBracer' }, warning: 'Equipment saved, but quest progress could not be confirmed.' });
  mockGrant.mockResolvedValue({ err: null });
  const questWarning = await service.upgradeEquipment(actor, id, { equipmentType: 'powerBracer', expectedEquipment: before });
  expect(questWarning.warning).toMatch(/quest progress/);
  expect(equipmentDomain.upgradeEquipmentLevel).toHaveBeenCalledTimes(1);
  mockGrant.mockRejectedValue(new Error('grant failed'));
  const grantWarning = await service.upgradeEquipment(actor, id, { equipmentType: 'powerBracer', expectedEquipment: before });
  expect(grantWarning.changed).toBe(true);
  expect(grantWarning.warning).toMatch(/saved/i);
  equipmentDomain.upgradeEquipmentLevel.mockClear();
  mockGetTrainer.mockResolvedValue({ err: 'read unavailable', data: null });
  const readWarning = await service.upgradeEquipment(actor, id, { equipmentType: 'powerBracer', expectedEquipment: before });
  expect(readWarning.changed).toBe(true);
  expect(readWarning.pieces[0].id).toBe('powerBracer');
  expect(readWarning.warning).toMatch(/saved/i);
  expect(equipmentDomain.upgradeEquipmentLevel).toHaveBeenCalledTimes(1);
});
