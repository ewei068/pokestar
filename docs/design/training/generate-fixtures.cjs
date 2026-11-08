// Study catalog only. Never loads services or connects to a database.
const fs = require("node:fs");
const path = require("node:path");
const { locations, locationConfig } = require("../../../src/config/locationConfig");
const trainable = [locations.HOME, locations.RESTAURANT, locations.GYM,
  locations.DOJO, locations.TEMPLE, locations.SCHOOL, locations.TRACK,
  locations.BERRY_BUSH, locations.BERRY_FARM];
const catalog = trainable.map(id => ({ id, ...locationConfig[id] }));
fs.writeFileSync(path.join(__dirname, "fixtures.js"),
  `// Generated from locationConfig. Ownership and Pokemon values are illustrative.\nwindow.trainingLocations = ${JSON.stringify(catalog, null, 2)};\n`);
