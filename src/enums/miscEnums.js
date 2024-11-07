// TODO: try to move these to their respective files

const refreshIntervalEnum = Object.freeze({
  DAILY: 24 * 60 * 60 * 1000,
  WEEKLY: 7 * 24 * 60 * 60 * 1000,
  BIWEEKLY: 14 * 24 * 60 * 60 * 1000,
});

module.exports = {
  refreshIntervalEnum,
};
