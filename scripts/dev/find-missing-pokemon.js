const { pokemonIdEnum } = require("../../src/enums/pokemonEnums");
const { pokemonConfig } = require("../../src/config/pokemonConfig");

/**
 *
 */
function findMissingPokemon() {
  console.log(
    "Checking for Pokemon in pokemonIdEnum that are missing from pokemonConfig...\n"
  );

  const missingPokemon = [];

  // Get all Pokemon IDs from the enum
  const allPokemonIds = Object.values(pokemonIdEnum);

  // Check each Pokemon ID
  for (const pokemonId of allPokemonIds) {
    if (!pokemonConfig[pokemonId]) {
      const enumKey = Object.keys(pokemonIdEnum).find(
        (key) => pokemonIdEnum[key] === pokemonId
      );
      missingPokemon.push({
        id: pokemonId,
        name: enumKey,
      });
    }
  }

  // Print results
  if (missingPokemon.length === 0) {
    console.log(
      "✅ All Pokemon from pokemonIdEnum are present in pokemonConfig!"
    );
  } else {
    console.log(
      `❌ Found ${missingPokemon.length} Pokemon missing from pokemonConfig:\n`
    );

    missingPokemon.forEach((pokemon) => {
      console.log(`  ID: ${pokemon.id.padEnd(8)} Name: ${pokemon.name}`);
    });

    console.log(
      `\nTotal missing: ${missingPokemon.length} out of ${allPokemonIds.length} Pokemon`
    );
  }
}

// Run the check
findMissingPokemon();
