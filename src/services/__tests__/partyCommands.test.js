const { ObjectId } = require('mongodb');
const db = require('../../database/mongoHandler');
const { getTrainer } = require('../trainer');
const { executePartyCommand } = require('../party');

jest.mock('../trainer', () => ({ getTrainer: jest.fn() }));
const mockGetTrainer = /** @type {jest.Mock} */ (getTrainer);
const mockGetCollection = /** @type {jest.Mock} */ (db.getCollection);
const mockUpdateDocument = /** @type {jest.Mock} */ (db.updateDocument);

let trainer;
const ids = Array.from({ length: 7 }, () => new ObjectId().toHexString());
beforeEach(() => {
  jest.clearAllMocks();
  trainer = { userId: 'owner', party: { rows: 3, cols: 4, pokemonIds: [...ids.slice(0, 6), ...Array(6).fill(null)] } };
  mockGetTrainer.mockResolvedValue({ data: trainer });
  mockGetCollection.mockResolvedValue({ find: jest.fn(({ userId, _id }) => ({ toArray: async () => userId === 'owner' ? _id.$in.map((id) => ({ _id: id, userId })) : [] })) });
  mockUpdateDocument.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
});
test('capacity allows replacement but rejects a seventh member in an empty position', async () => {
  expect(await executePartyCommand({ id: 'owner' }, { kind: 'party.place', pokemonId: ids[6], index: 6, expectedOccupant: null })).toMatchObject({ code: 'invalid_party_command' });
  expect(db.updateDocument).not.toHaveBeenCalled();
  expect(await executePartyCommand({ id: 'owner' }, { kind: 'party.place', pokemonId: ids[6], index: 0, expectedOccupant: ids[0] })).toMatchObject({ err: null });
  const [, filter, update] = mockUpdateDocument.mock.calls[0];
  expect(filter.party.pokemonIds[0]).toBe(ids[0]);
  expect(update.$set.party.pokemonIds[0]).toBe(ids[6]);
});
test('existing member swaps positions and remove clears only its slot', async () => {
  await executePartyCommand({ id: 'owner' }, { kind: 'party.place', pokemonId: ids[0], index: 1, expectedOccupant: ids[1] });
  expect(mockUpdateDocument.mock.calls[0][2].$set.party.pokemonIds.slice(0, 2)).toEqual([ids[1], ids[0]]);
  await executePartyCommand({ id: 'owner' }, { kind: 'party.remove', index: 0, expectedOccupant: ids[0] });
  expect(mockUpdateDocument.mock.calls[1][2].$set.party.pokemonIds[0]).toBeNull();
});
test('stale target, invalid indices and non-owned candidates cannot write', async () => {
  expect(await executePartyCommand({ id: 'owner' }, { kind: 'party.remove', index: 0, expectedOccupant: ids[1] })).toMatchObject({ code: 'party_changed' });
  expect(await executePartyCommand({ id: 'owner' }, { kind: 'party.remove', index: 0.5 })).toMatchObject({ code: 'invalid_party_command' });
  mockGetCollection.mockResolvedValue({ find: () => ({ toArray: async () => [] }) });
  expect(await executePartyCommand({ id: 'owner' }, { kind: 'party.place', pokemonId: ids[6], index: 0 })).toMatchObject({ code: 'pokemon_not_owned' });
  expect(db.updateDocument).not.toHaveBeenCalled();
});
test('guard conflict rereads and refuses a changed intended occupant', async () => {
  mockUpdateDocument.mockResolvedValue({ matchedCount: 0, modifiedCount: 0 });
  mockGetTrainer.mockResolvedValueOnce({ data: trainer }).mockResolvedValue({ data: { ...trainer, party: { ...trainer.party, pokemonIds: [ids[6], ...trainer.party.pokemonIds.slice(1)] } } });
  expect(await executePartyCommand({ id: 'owner' }, { kind: 'party.remove', index: 0, expectedOccupant: ids[0] })).toMatchObject({ code: 'party_changed' });
  expect(db.updateDocument).toHaveBeenCalledTimes(1);
});

test('hexadecimal IDs use canonical identity before comparison and persistence', async () => {
  const candidate = 'abcdefabcdefabcdefabcdef';
  await executePartyCommand({ id: 'owner' }, { kind: 'party.place', pokemonId: candidate.toUpperCase(), index: 0, expectedOccupant: ids[0].toUpperCase() });
  expect(mockUpdateDocument.mock.calls[0][2].$set.party.pokemonIds[0]).toBe(candidate);
  await executePartyCommand({ id: 'owner' }, { kind: 'party.place', pokemonId: ids[0].toUpperCase(), index: 1, expectedOccupant: ids[1].toUpperCase() });
  expect(mockUpdateDocument.mock.calls[1][2].$set.party.pokemonIds.slice(0, 2)).toEqual([ids[1], ids[0]]);
});
