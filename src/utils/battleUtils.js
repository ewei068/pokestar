const { pokemonConfig } = require('../config/pokemonConfig');

const buildPartyString = (pokemons, rows, cols) => {
    let globalIndex = 0;
    let partyString = '';
    for (let i = 0; i < rows; i++) {
        // build top line
        let rowString = '`';
        for (let j = 0; j < cols; j++) {
            const pokemon = pokemons[globalIndex];
            rowString += '+-----';
            if (j == cols - 1) {
                rowString += '+`';
            }
            globalIndex++;
        }
        globalIndex -= cols;
        partyString += rowString + '\n';

        rowString = '`';
        for (let j = 0; j < cols; j++) {
            const pokemon = pokemons[globalIndex];
            const emoji = pokemon ? pokemonConfig[pokemon.speciesId].emoji : '⬛';
            rowString += `| \`${emoji}\` `;
            globalIndex++;
            if (j == cols - 1) {
                rowString += '|`';
            }
        }
        globalIndex -= cols;
        partyString += rowString + '\n';

        rowString = '`';
        for (let j = 0; j < cols; j++) {
            const position = globalIndex + 1;
            rowString += `+--${position}--`;
            if (j == cols - 1) {
                rowString += '+`';
            }
            globalIndex++;
        }
        partyString += rowString;
        if (i < rows - 1) {
            partyString += '\n';
        }
    }
    
    return partyString;
}

module.exports = {
    buildPartyString,
};