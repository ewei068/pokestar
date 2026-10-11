const stateParts = (record) => [
  1,
  record._id,
  record.revision,
  record.status,
  record.completionStatus,
  record.updatedAt,
  record.expiresAt,
  record.resultExpiresAt,
];

const battleStateId = (record) => Buffer.from(
  JSON.stringify(stateParts(record)),
).toString("base64url");

/**
 * An invalid or future cursor requests the full action history.
 * @param {string} stateId
 * @param {object} record
 */
const revisionFromStateId = (stateId, record) => {
  try {
    const parts = JSON.parse(Buffer.from(stateId, "base64url").toString("utf8"));
    if (!Array.isArray(parts) || parts.length !== 8 ||
        parts[0] !== 1 || parts[1] !== record._id ||
        !Number.isSafeInteger(parts[2]) || parts[2] < 0 ||
        parts[2] > record.revision) return 0;
    return parts[2];
  } catch {
    return 0;
  }
};

module.exports = { battleStateId, revisionFromStateId };
