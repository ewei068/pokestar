import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { describe, it } from "node:test";
import { crySpeciesId, soundConfig } from "./soundConfig";

const { pokemonConfig } = createRequire(import.meta.url)("../../../../src/config/pokemonConfig.js") as
  { pokemonConfig: Record<string, { name: string }> };
const cryFile = (id: string) => new URL(`../../../public/audio/cries/${id}.mp3`, import.meta.url);

describe("Pokémon cries", () => {
  it("uses real species and forms directly and explicitly maps custom species", () => {
    assert.equal(crySpeciesId("25"), "25");
    assert.equal(crySpeciesId("10007"), "10007");
    assert.equal(crySpeciesId("25-1"), "25");
    assert.equal(crySpeciesId("10007-1"), "10007");
    assert.equal(crySpeciesId("20091"), "91");
    assert.equal(crySpeciesId("20383-1"), "383");
  });

  it("keeps unmapped custom species silent instead of requesting a missing file", () => {
    assert.equal(crySpeciesId("25-9"), null);
    assert.equal(crySpeciesId("20999"), null);
    assert.equal(soundConfig.cry("20999"), null);
  });

  it("has a downloaded cry for every configured species", () => {
    const missing = Object.keys(pokemonConfig).filter(speciesId => {
      const id = crySpeciesId(speciesId);
      return !id || !existsSync(cryFile(id));
    });
    assert.deepEqual(missing, [], "Map custom species in crySpecies.json, then run npm run download-cries");
  });
});
