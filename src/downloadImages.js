const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { pokemonConfig } = require('./config/pokemonConfig');

const saveDirectory = "../extra_data/images/tier_list";

for (const [id, pokemon] of Object.entries(pokemonConfig)) {
    if (pokemon.evolution || pokemon.unobtainable) {
        continue;
    }
    const imageUrl = pokemon.sprite;
    const filename = `${id}.png`;

    // Download the image using Axios
    axios({
        method: 'get',
        url: imageUrl,
        responseType: 'stream'
    })
    .then(response => {
        // Create a writable stream and pipe the image data to it
        const imagePath = path.join(saveDirectory, filename);
        const writer = fs.createWriteStream(imagePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
        console.log(`Image downloaded and saved as: ${imagePath}`);
        });

        writer.on('error', err => {
        console.error('Error while saving the image:', err);
        });
    })
    .catch(error => {
        console.error('Error while downloading the image:', error);
    });
}
