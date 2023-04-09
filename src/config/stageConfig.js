const stageNames = {
    ALPHA: 'ALPHA',
    BETA: 'BETA',
    PROD: 'PROD'
};

const stageConfig = {
    [stageNames.ALPHA]: {
        prefix: 'psa!'
    },
    [stageNames.BETA]: {
        prefix: 'psb!'
    },
    [stageNames.PROD]: {
        prefix: 'ps!'
    }
}

module.exports = { stageNames, stageConfig };