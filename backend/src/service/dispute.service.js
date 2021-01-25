const db = require('./db.service');
const moment = require('moment');
const Dispute = require('../model/dispute.model');
const { Op } = require("sequelize");

const EXPIRED_DISPUTES = `SELECT * FROM disputes 
WHERE "expired_at" < $1 
AND "resolved_at" IS NULL 
AND "chat_id" IS NOT NULL
AND "message_id" IS NOT NULL`;
const getExpired = async () => {
  const result = (await db.query(EXPIRED_DISPUTES, [moment()])) || [];
  log('getExpired', result.rows);
  return result.rows;
}

const DISPUTE_BY_ID = `SELECT * FROM disputes 
WHERE "id" = $1`;
const getById = async ({id}) => {
  const result = await db.query(DISPUTE_BY_ID, [id]);
  log(`getById ${id}`, result.rows[0]);
  return result.rows[0];
}

const DISPUTE_BY_CHAT_ID = `SELECT * FROM disputes 
WHERE "chat_id" = $1`;
const getByChatId = async ({chat_id}) => {
  const result = await db.query(DISPUTE_BY_ID, [chat_id]);
  log(`getByChatId ${chat_id}`, result.rows);
  return result.rows;
}

const getOpened = async ({chat_id}) => {
  chat_id = chat_id.toString();
  const disputes = await Dispute.findAll({
    where: {
      [Op.and]: [
        {
          chat_id
        }, {
          resolved_at: {
            [Op.is]: null,
          }
        }
      ]
    }
  });
  // console.log(disputes.every(user => user instanceof Dispute)); // true
  // console.log("All Disputes:", JSON.stringify(disputes, null, 2));

  log(`getOpened ${chat_id}`, disputes);
  return disputes;
}

const ADD_DISPUTE = `INSERT INTO disputes (
    "title", "expired_at", "chat_id", "message_id", "username"
) VALUES (
    $1, $2, $3, $4, $5
) RETURNING *`;

const add = async ({title, expired_at, chat_id, message_id, username}) => {
  const result = await db.query(ADD_DISPUTE, [
    title,
    expired_at,
    chat_id,
    message_id,
    username
  ]);
  log('add -> ', result.rows[0]);
  return result.rows[0];
};

const UPDATE_DISPUTE_EXPIRED = `UPDATE disputes
SET
  "expired_at" = $2,
  "message_id" = $3
WHERE
  id = $1
RETURNING *`;
const save = async ({id, expired_at, message_id}) => {
  const result = await db.query(UPDATE_DISPUTE_EXPIRED, [id, expired_at, message_id]);
  log('save -> ', result.rows[0]);
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
  log('resolve -> ', result.rows[0]);
  return result.rows[0];
};

const log = (text, params = '') => {
  console.log(`[disputes.service] -> ${text}`, JSON.stringify(params, null, 2));
};

module.exports = {
  add,
  save,
  getExpired,
  resolve,
  getById,
  getByChatId,
  getOpened
};