jest.mock('../trainer', () => ({ ...jest.requireActual('../trainer'), getTrainer: jest.fn() }));
jest.mock('../party', () => ({ ...jest.requireActual('../party'), validatePartyForBattle: jest.fn() }));
const { getTrainer } = require('../trainer');
const { validatePartyForBattle } = require('../party');
const { createMockTrainer } = require('../../__testing__/mocks/trainer');
const { buildNpcBattle, projectNpcCatalog } = require('../npcBattle');

beforeEach(() => jest.clearAllMocks());
test('catalog projects configured ranges, unique ace-first species and daily availability', () => {
  const catalog = projectNpcCatalog({ defeatedNPCsToday: { blue: ['easy'] } });
  expect(catalog).toHaveLength(17);
  const blue = catalog.find(npc => npc.id === 'blue');
  const easy = blue.difficulties.find(difficulty => difficulty.id === 'easy');
  expect(easy).toMatchObject({ minLevel: 15, maxLevel: 19, count: 4, dailyClaimed: true,
    rewards: [{ name: 'Pokeball', quantity: 1, icon: 'poke-ball.png' }] });
  expect(easy.species[0]).toMatchObject({ name: 'Wartortle', ace: true });
  expect(new Set(easy.species.map(pokemon => pokemon.id)).size).toBe(easy.species.length);
  expect(blue.minLevel).toBe(15);
  expect(blue.maxLevel).toBeGreaterThan(19);
  expect(catalog.find(npc => npc.id === 'bugCatcher').difficulties[0].rewards).toEqual([]);
  expect(catalog.find(npc => npc.id === 'volo').displayName).not.toContain('**');
});
test('shared construction reads current party and preserves encounter/Auto settings', async () => {
  const { trainer, party } = createMockTrainer();
  trainer.hasDarkrai = true;
  trainer.dreamCards = 9;
  /** @type {jest.Mock} */ (getTrainer).mockResolvedValue({ data: trainer });
  /** @type {jest.Mock} */ (validatePartyForBattle).mockResolvedValue({ data: party.pokemons });
  const result = await buildNpcBattle({ user: trainer.user, npcId: 'blue', difficulty: 'easy', refreshIdentity: false });
  expect(result.err).toBeNull();
  expect(getTrainer).toHaveBeenCalledWith(trainer.user, false);
  expect(result.data).toMatchObject({ npcId: 'blue', difficulty: 'easy', hasStarted: false,
    autoData: expect.objectContaining({ canAuto: true, shouldShowAutoBattle: true, autoBattleCost: 7 }) });
  expect(Object.keys(result.data.teams)).toEqual(['NPC', 'Player']);
  const second = await buildNpcBattle({ user: trainer.user, npcId: 'blue', difficulty: 'easy' });
  expect(second.data.id).not.toBe(result.data.id);
});
test('invalid configuration and party errors remain ordinary rejected starts', async () => {
  expect(await buildNpcBattle({ user: { id: 'owner' }, npcId: 'missing', difficulty: 'easy' }))
    .toMatchObject({ code: 'invalid_npc' });
  expect(await buildNpcBattle({ user: { id: 'owner' }, npcId: 'blue', difficulty: 'missing' }))
    .toMatchObject({ code: 'invalid_difficulty' });
  /** @type {jest.Mock} */ (getTrainer).mockResolvedValue({ data: createMockTrainer().trainer });
  /** @type {jest.Mock} */ (validatePartyForBattle).mockResolvedValue({ err: 'No Pokemon in party.' });
  expect(await buildNpcBattle({ user: { id: 'owner' }, npcId: 'blue', difficulty: 'easy' }))
    .toMatchObject({ code: 'invalid_party', err: 'No Pokemon in party.' });
});
