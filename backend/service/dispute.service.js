const db = require('./db.service');
const moment = require('moment');

const EXPIRED_DISPUTES = `SELECT * FROM disputes 
WHERE "expired_at" < $1 
AND "resolved_at" IS NULL 
AND "chat_id" IS NOT NULL
AND "message_id" IS NOT NULL`;
const getExpired = async () => {
  const result = await db.query(EXPIRED_DISPUTES, [moment().add(6, 'days')]);
  return result.rows;
}

const ADD_DISPUTE = `INSERT INTO disputes (
    "title", "expired_at", "chat_id", "message_id"
) VALUES (
    $1, $2, $3, $4
) RETURNING *`;

const add = async ({title, expired_at, chat_id, message_id}) => {
  const result = await db.query(ADD_DISPUTE, [
    title,
    expired_at,
    chat_id,
    message_id
  ]);
  return result.rows[0];
};

const UPDATE_DISPUTE_EXPIRED = `UPDATE disputes
SET
  "expired_at" = $2
WHERE
  id = $1
RETURNING *`;
const save = async ({id, expired_at}) => {
  const result = await db.query(UPDATE_DISPUTE_EXPIRED, [id, expired_at]);
  return result.rows[0];
};

const UPDATE_DISPUTE_RESOLVE = `UPDATE disputes
SET
  "resolved_at" = $2
WHERE
  id = $1
RETURNING *`;
const resolve = async ({id}) => {
  const result = await db.query(UPDATE_DISPUTE_RESOLVE, [id, moment()]);
  return result.rows[0];
};

const log = (text, params) => {
  console.log(`[disputes.service] -> ${text}`, params);
};

module.exports = {
  add,
  save,
  getExpired,
  resolve
};