const express = require('express');
const { createBattleApi } = require('../battleApi');

let server;
let url;
let service;
beforeEach(async () => {
  service = { npcs: jest.fn(), dungeons: jest.fn(), tower: jest.fn(), collection: jest.fn().mockResolvedValue({ items: [] }), detail: jest.fn(), party: jest.fn(), profile: jest.fn(), interact: jest.fn().mockResolvedValue({ trainer: {} }) };
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
