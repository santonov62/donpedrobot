const DELAY_MINUTES = 4;
const disputeService = require('../../backend/src/service/dispute.service');
const {
  bot,
  updateDisputeMessage,
  resolveDispute} = require('./bot');

function start() {
  check();
  setInterval(() => {
    try {
      check();
    } catch (e) {
      log(`ERROR`, e.message);
    }
  }, DELAY_MINUTES * 60000);
  log('STARTED!');
}

async function check() {
  const disputes = await disputeService.getExpired();
  log('Disputes', disputes);
  // for (const {id: dispute_id, title, chat_id, message_id, username} of disputes) {
  for (const dispute of disputes) {
    await resolveDispute({dispute_id: dispute.id});
  };
}

function log(text, params = '') {
  console.log(`[backgroundChecker] -> ${text}`, params);
}


module.exports = {
  start
}