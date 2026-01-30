// eslint-disable-next-line global-require
jest.mock("../database/mongoHandler", () => require("./mocks/database"));

const { initialize } = require("../battle/data/initialize");

initialize();
