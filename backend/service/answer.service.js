const db = require('./db.service');

const ADD_ANSWER = `INSERT INTO answers (
    "value", "dispute_id", "username"
) VALUES (
    $1, $2, $3
) RETURNING *`;

const add = async ({value, dispute_id, username}) => {
  const result = await db.query(ADD_ANSWER, [
    value,
    dispute_id,
    username
  ]);
  return result.rows[0];
};

const log = (text, params) => {
  console.log(`[answer.service] -> ${text}`, params);
};

module.exports = {
  add
};