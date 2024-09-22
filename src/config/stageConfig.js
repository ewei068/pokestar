const stageNames = {
  ALPHA: "ALPHA",
  BETA: "BETA",
  PROD: "PROD",
};

const stageConfig = {
  [stageNames.ALPHA]: {
    prefix: "<@1093393531860688916>",
  },
  [stageNames.BETA]: {
    prefix: "<@1093411444877439066>",
  },
  [stageNames.PROD]: {
    prefix: "<@1093411444877439066>",
  },
};

module.exports = { stageNames, stageConfig };
