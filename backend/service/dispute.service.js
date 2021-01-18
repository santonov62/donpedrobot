const db = require('./db.service');

const ADD_DISPUTE = `INSERT INTO disputes (
    "title", "expired_at"
) VALUES (
    $1, $2
) RETURNING *`;

const add = async ({title, expired_at}) => {
  const result = await db.query(ADD_DISPUTE, [
    title,
    expired_at
  ]);
  return result.rows[0];
};

const log = (text, params) => {
  console.log(`[disputes.service] -> ${text}`, params);
};

module.exports = {
  add
};