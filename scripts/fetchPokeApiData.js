const fs = require("fs");
const path = require("path");

const BASE_URL = "https://pokeapi.co/api/v2";
const BATCH_SIZE = 25;
const BATCH_INTERVAL_MS = 1000;
const OUTPUT_PATH = path.join(__dirname, "..", "data", "pokemonData.json");

const STAT_ORDER = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
];

/**
 *
 * @param url
 */
async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json();
}

/**
 *
 * @param text
 */
function cleanFlavorText(text) {
  return text
    .replace(/\f/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 *
 * @param slug
 */
function titleCase(slug) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("-");
}

/**
 *
 * @param url
 */
function extractIdFromUrl(url) {
  return Number(url.split("/").filter(Boolean).pop());
}

/**
 *
 */
async function fetchAllPokemonIds() {
  const listData = await fetchJson(`${BASE_URL}/pokemon?limit=100000&offset=0`);
  return listData.results.map((entry) => ({
    name: entry.name,
    id: extractIdFromUrl(entry.url),
  }));
}

/**
 *
 * @param pokemonSlug
 * @param speciesData
 */
function buildName(pokemonSlug, speciesData) {
  const enName = speciesData.names.find((n) => n.language.name === "en");
  if (!enName) {
    return titleCase(pokemonSlug);
  }

  const speciesSlug = speciesData.name;
  if (pokemonSlug === speciesSlug) {
    return enName.name;
  }

  const suffix = pokemonSlug.startsWith(`${speciesSlug}-`)
    ? pokemonSlug.slice(speciesSlug.length + 1)
    : pokemonSlug;
  return `${enName.name}-${titleCase(suffix)}`;
}

/**
 *
 * @param speciesData
 */
function buildDescription(speciesData) {
  const enEntries = speciesData.flavor_text_entries?.filter(
    (f) => f.language.name === "en",
  );
  if (!enEntries || enEntries.length === 0) return "";
  return cleanFlavorText(enEntries[0].flavor_text);
}

/**
 *
 * @param pokemonData
 * @param speciesData
 */
function buildEntry(pokemonData, speciesData) {
  const name = buildName(pokemonData.name, speciesData);
  const description = buildDescription(speciesData);

  const types = pokemonData.types
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name);

  const baseStats = STAT_ORDER.map((statName) => {
    const stat = pokemonData.stats.find((s) => s.stat.name === statName);
    return stat ? stat.base_stat : 0;
  });

  const abilities = pokemonData.abilities
    .sort((a, b) => a.slot - b.slot)
    .map((a) => ({
      id: extractIdFromUrl(a.ability.url),
      name: a.ability.name,
      isHidden: a.is_hidden,
    }));

  return {
    name,
    description,
    types,
    baseStats,
    sprite: pokemonData.sprites.front_default,
    shinySprite: pokemonData.sprites.front_shiny,
    abilities,
  };
}

/**
 *
 * @param id
 * @param speciesCache
 */
async function processPokemon(id, speciesCache) {
  const pokemonData = await fetchJson(`${BASE_URL}/pokemon/${id}`);
  const speciesId = extractIdFromUrl(pokemonData.species.url);

  if (!speciesCache.has(speciesId)) {
    speciesCache.set(
      speciesId,
      await fetchJson(`${BASE_URL}/pokemon-species/${speciesId}`),
    );
  }

  return { id, entry: buildEntry(pokemonData, speciesCache.get(speciesId)) };
}

/**
 *
 * @param ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 *
 */
async function main() {
  console.log("Fetching Pokemon list from PokeAPI...");
  const allPokemon = await fetchAllPokemonIds();
  console.log(`Found ${allPokemon.length} Pokemon total`);

  const speciesCache = new Map();
  const results = {};
  let processed = 0;
  let failed = 0;

  for (let i = 0; i < allPokemon.length; i += BATCH_SIZE) {
    const batch = allPokemon.slice(i, i + BATCH_SIZE);
    const batchStart = Date.now();

    const batchResults = await Promise.allSettled(
      batch.map(({ id }) => processPokemon(id, speciesCache)),
    );

    for (const result of batchResults) {
      if (result.status === "fulfilled") {
        results[result.value.id] = result.value.entry;
        processed++;
      } else {
        failed++;
        console.error(`  Failed: ${result.reason.message}`);
      }
    }

    const elapsed = Date.now() - batchStart;
    const remaining = BATCH_INTERVAL_MS - elapsed;
    if (remaining > 0 && i + BATCH_SIZE < allPokemon.length) {
      await sleep(remaining);
    }

    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allPokemon.length / BATCH_SIZE);
    process.stdout.write(
      `\r  Batch ${batchNum}/${totalBatches} (${processed} fetched, ${failed} failed)`,
    );
  }

  console.log("");

  const sorted = {};
  for (const id of Object.keys(results).sort((a, b) => Number(a) - Number(b))) {
    sorted[id] = results[id];
  }

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(sorted, null, 2));

  console.log(
    `\nDone! Wrote ${Object.keys(sorted).length} entries to ${OUTPUT_PATH}`,
  );
  if (failed > 0) {
    console.log(`${failed} Pokemon failed to fetch`);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
