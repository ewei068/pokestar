const express = require('express');
const { createBattleApi } = require('../battleApi');
const { PlayerError } = require('../../services/player');

let server;
let url;
let service;
beforeEach(async () => {
  service = { equipment: jest.fn(), upgradeEquipment: jest.fn(), rerollEquipment: jest.fn(), build: jest.fn(), changeNature: jest.fn(), changeHeldItem: jest.fn(), npcs: jest.fn(), dungeons: jest.fn(), tower: jest.fn(), bag: jest.fn(), collection: jest.fn().mockResolvedValue({ items: [] }), detail: jest.fn(), training: jest.fn().mockResolvedValue({ pokemon: {}, locations: [] }), train: jest.fn().mockResolvedValue({ trained: true, gains: { exp: 35, evs: [0, 0, 0, 0, 0, 0] }, trainer: {}, pokemon: {}, locations: [] }), party: jest.fn(), profile: jest.fn(), interact: jest.fn().mockResolvedValue({ trainer: {} }) };
  const app = express();
  app.use(express.json());
  app.use('/api', createBattleApi({ battleService: { listActive: async () => [{ battleId: "owned-battle" }] }, sessionStore: { get: async (token) => token === 'valid' ? { userId: 'owner' } : null },
    siteOrigin: 'http://localhost:5173', clientId: '', clientSecret: '', redirectUri: 'http://localhost:3000/api/auth/discord/callback', playerService: service }));
  server = await new Promise((resolve) => { const listener = app.listen(0, () => resolve(listener)); });
  url = `http://localhost:${server.address().port}/api/player`;
});
afterEach(() => new Promise((resolve) => { server.close(resolve); }));
const headers = { Cookie: 'pokestar_session=valid', 'X-Player-Id': 'owner', Origin: 'http://localhost:5173', 'Content-Type': 'application/json' };
test('reads are authenticated, actor asserted, and never invoke granted interactions', async () => {
  expect((await fetch(`${url}/collection`)).status).toBe(401);
  expect((await fetch(`${url}/collection`, { headers: { ...headers, 'X-Player-Id': 'other' } })).status).toBe(409);
  const response = await fetch(`${url}/collection`, { headers });
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ items: [], discordUserId: 'owner' });
  expect(service.collection).toHaveBeenCalledWith('owner', {});
  expect(service.interact).not.toHaveBeenCalled();
});
test('explicit interaction requires site origin and uses authenticated actor', async () => {
  const body = JSON.stringify({ kind: 'collection', query: {} });
  expect((await fetch(`${url}/interactions`, { method: 'POST', headers: { ...headers, Origin: 'https://other.example' }, body })).status).toBe(403);
  expect(service.interact).not.toHaveBeenCalled();
  expect((await fetch(`${url}/interactions`, { method: 'POST', headers, body })).status).toBe(200);
  expect(service.interact).toHaveBeenCalledWith('owner', { kind: 'collection', query: {} });
});
test('NPC catalog and start use the same authenticated player boundary', async () => {
  service.npcs = jest.fn().mockResolvedValue({ npcs: [{ id: 'blue' }] });
  expect((await fetch(`${url}/npcs`)).status).toBe(401);
  expect((await fetch(`${url}/npcs`, { headers })).status).toBe(200);
  expect(service.npcs).toHaveBeenCalledWith('owner');
  expect(service.interact).not.toHaveBeenCalled();
  service.dungeons.mockResolvedValue({ dungeons: [] });
  service.tower.mockResolvedValue({ floors: [], lastTowerStage: 0 });
  expect((await fetch(`${url}/dungeons`)).status).toBe(401);
  expect((await fetch(`${url}/dungeons`, { headers })).status).toBe(200);
  expect(service.dungeons).toHaveBeenCalledWith('owner');
  expect((await fetch(`${url}/tower`, { headers })).status).toBe(200);
  expect(service.tower).toHaveBeenCalledWith('owner');
  service.bag = jest.fn().mockResolvedValue({ items: [{ id: '0', quantity: 24 }] });
  expect((await fetch(`${url}/bag`)).status).toBe(401);
  expect((await fetch(`${url}/bag`, { headers: { ...headers, 'X-Player-Id': 'other' } })).status).toBe(409);
  expect(await (await fetch(`${url}/bag`, { headers })).json()).toEqual({ discordUserId: 'owner', items: [{ id: '0', quantity: 24 }] });
  expect(service.bag).toHaveBeenCalledWith('owner');
  expect(service.interact).not.toHaveBeenCalled();
  const body = JSON.stringify({ kind: 'npc.start', npcId: 'blue', difficulty: 'easy' });
  expect((await fetch(`${url}/interactions`, { method: 'POST', headers: { ...headers, 'X-Player-Id': 'other' }, body })).status).toBe(409);
  expect(service.interact).not.toHaveBeenCalled();
  expect((await fetch(`${url}/interactions`, { method: 'POST', headers, body })).status).toBe(200);
  expect(service.interact).toHaveBeenCalledWith('owner', { kind: 'npc.start', npcId: 'blue', difficulty: 'easy' });
  const tower = JSON.stringify({ kind: 'tower.start', stage: 7 });
  expect((await fetch(`${url}/interactions`, { method: 'POST', headers, body: tower })).status).toBe(200);
  expect(service.interact).toHaveBeenCalledWith('owner', { kind: 'tower.start', stage: 7 });
});

test('active battles use account-scoped reads with an actor envelope', async () => {
  const response = await fetch(`${url}/battles`, { headers });
  expect(await response.json()).toEqual({ discordUserId: 'owner', battles: [{ battleId: 'owned-battle' }] });
  expect(service.interact).not.toHaveBeenCalled();
});

test('training read and mutation enforce session, actor and origin before operations', async () => {
  const path = `${url}/pokemon/owned-id`;
  const body = JSON.stringify({ locationId: '0' });
  expect((await fetch(`${path}/training`)).status).toBe(401);
  expect((await fetch(`${path}/training`, { headers: { ...headers, 'X-Player-Id': 'other' } })).status).toBe(409);
  const context = await fetch(`${path}/training`, { headers });
  expect(await context.json()).toEqual({ discordUserId: 'owner', pokemon: {}, locations: [] });
  expect(service.training).toHaveBeenCalledWith('owner', 'owned-id');
  expect(service.train).not.toHaveBeenCalled();
  expect((await fetch(`${path}/train`, { method: 'POST', headers: { ...headers, Cookie: '' }, body })).status).toBe(401);
  expect((await fetch(`${path}/train`, { method: 'POST', headers: { ...headers, 'X-Player-Id': 'other' }, body })).status).toBe(409);
  expect((await fetch(`${path}/train`, { method: 'POST', headers: { ...headers, Origin: 'https://other.example' }, body })).status).toBe(403);
  expect(service.train).not.toHaveBeenCalled();
  const result = await fetch(`${path}/train`, { method: 'POST', headers, body });
  expect(await result.json()).toEqual({ discordUserId: 'owner', trained: true, gains: { exp: 35, evs: [0, 0, 0, 0, 0, 0] }, trainer: {}, pokemon: {}, locations: [] });
  expect(service.train).toHaveBeenCalledWith('owner', 'owned-id', { locationId: '0' });
  expect(service.interact).not.toHaveBeenCalled();
});

test('training service rejections retain HTTP status without generic interaction grants', async () => {
  service.train.mockRejectedValueOnce(new PlayerError('invalid_training_request', 400));
  const response = await fetch(`${url}/pokemon/owned-id/train`, { method: 'POST', headers, body: JSON.stringify({ locationId: '0', exp: 100 }) });
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({ error: 'invalid_training_request' });
  service.training.mockRejectedValueOnce(new PlayerError('pokemon_not_found', 404));
  expect((await fetch(`${url}/pokemon/foreign-id/training`, { headers })).status).toBe(404);
  expect(service.interact).not.toHaveBeenCalled();
});


test('build read and domain mutations inherit session, actor and origin enforcement', async () => {
  service.build = jest.fn().mockResolvedValue({ pokemon: {}, natures: [], heldItems: [], mintQuantity: 3 });
  service.changeNature = jest.fn().mockResolvedValue({ changed: true });
  service.changeHeldItem = jest.fn().mockResolvedValue({ changed: false });
  const path = `${url}/pokemon/one`;
  expect((await fetch(`${path}/build`)).status).toBe(401);
  expect((await fetch(`${path}/build`, { headers: { ...headers, 'X-Player-Id': 'other' } })).status).toBe(409);
  expect((await fetch(`${path}/build`, { headers })).status).toBe(200);
  expect(service.build).toHaveBeenCalledWith('owner', 'one');
  for (const [action, body] of [['nature', { natureId: '3', expectedNatureId: '1' }], ['held-item', { heldItemId: null, expectedHeldItemId: 'h197' }]]) {
    expect((await fetch(`${path}/${action}`, { method: 'POST', headers: { ...headers, Cookie: '' }, body: JSON.stringify(body) })).status).toBe(401);
    expect((await fetch(`${path}/${action}`, { method: 'POST', headers: { ...headers, Origin: 'https://other.example' }, body: JSON.stringify(body) })).status).toBe(403);
    expect((await fetch(`${path}/${action}`, { method: 'POST', headers, body: JSON.stringify(body) })).status).toBe(200);
  }
  expect(service.changeNature).toHaveBeenCalledWith('owner', 'one', { natureId: '3', expectedNatureId: '1' });
  expect(service.changeHeldItem).toHaveBeenCalledWith('owner', 'one', { heldItemId: null, expectedHeldItemId: 'h197' });
  expect(service.interact).not.toHaveBeenCalled();
});

test('equipment read and spend routes enforce session, actor and origin without generic interactions', async () => {
  service.equipment = jest.fn().mockResolvedValue({ pieces: [], catalog: {} });
  service.upgradeEquipment = jest.fn().mockResolvedValue({ changed: true });
  service.rerollEquipment = jest.fn().mockResolvedValue({ changed: true });
  const path = `${url}/pokemon/one/equipment`;
  expect((await fetch(path)).status).toBe(401);
  expect((await fetch(path, { headers: { ...headers, 'X-Player-Id': 'other' } })).status).toBe(409);
  const context = await fetch(path, { headers });
  expect(context.status).toBe(200);
  expect(await context.json()).toEqual({ pieces: [], catalog: {}, discordUserId: 'owner' });
  expect(service.equipment).toHaveBeenCalledWith('owner', 'one');
  for (const [action, body] of [['upgrade', { equipmentType: 'powerBracer', expectedEquipment: { level: 4, slots: {} } }],
    ['reroll', { equipmentType: 'powerBracer', slotId: 'primary', expectedEquipment: { level: 4, slots: {} } }]]) {
    expect((await fetch(`${path}/${action}`, { method: 'POST', headers: { ...headers, Cookie: '' }, body: JSON.stringify(body) })).status).toBe(401);
    expect((await fetch(`${path}/${action}`, { method: 'POST', headers: { ...headers, 'X-Player-Id': 'other' }, body: JSON.stringify(body) })).status).toBe(409);
    expect((await fetch(`${path}/${action}`, { method: 'POST', headers: { ...headers, Origin: 'https://other.example' }, body: JSON.stringify(body) })).status).toBe(403);
    expect((await fetch(`${path}/${action}`, { method: 'POST', headers, body: JSON.stringify(body) })).status).toBe(200);
  }
  expect(service.upgradeEquipment).toHaveBeenCalledWith('owner', 'one', { equipmentType: 'powerBracer', expectedEquipment: { level: 4, slots: {} } });
  expect(service.rerollEquipment).toHaveBeenCalledWith('owner', 'one', { equipmentType: 'powerBracer', slotId: 'primary', expectedEquipment: { level: 4, slots: {} } });
  service.rerollEquipment.mockRejectedValueOnce(new PlayerError('equipment_uncertain', 503));
  const rejected = await fetch(`${path}/reroll`, { method: 'POST', headers, body: '{}' });
  expect(rejected.status).toBe(503);
  expect(await rejected.json()).toEqual({ error: 'equipment_uncertain' });
  expect(service.interact).not.toHaveBeenCalled();
});
