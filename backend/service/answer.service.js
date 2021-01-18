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

const SEARCH_ANSWER = `SELECT * FROM answers WHERE 
                dispute_id = $1 AND username = $2`;
const search = async ({dispute_id, username}) => {
  const result = await db.query(SEARCH_ANSWER, [dispute_id, username]);
  return result.rows && result.rows[0];
};

const UPDATE_ANSWER_VALUE = `UPDATE answers
SET
  "value" = $2
WHERE
  id = $1
RETURNING *`;
const save = async ({id, value}) => {
  const result = await db.query(UPDATE_ANSWER_VALUE, [id, value]);
  return result.rows[0];
};

const log = (text, params) => {
  console.log(`[answer.service] -> ${text}`, params);
};

module.exports = {
  add,
  search,
  save
};