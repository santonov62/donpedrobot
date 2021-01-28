const DELAY_MINUTES = 4 * 60000;
const disputeService = require('../../backend/src/service/dispute.service');
const {
  bot,
  generateDisputeResults,
  generateDisputeTitle,
  resolvedDispute} = require('./bot');

function start() {
  check();
  setInterval(() => {
    try {
      check();
    } catch (e) {
      log(`ERROR`, e.message);
    }
  }, DELAY_MINUTES);
}

async function check() {
  const disputes = await disputeService.getExpired();
  log('Disputes', disputes);
  // for (const {id: dispute_id, title, chat_id, message_id, username} of disputes) {
  for (const dispute of disputes) {
    await resolvedDispute(dispute);
  };
}

function log(text, params = '') {
  console.log(`[backgroundChecker] -> ${text}`, params);
}

log('STARTED!')

module.exports = {
  start
}