const DELAY_MINUTES = 4 * 60000;
const disputeService = require('../../backend/src/service/dispute.service');
const {bot, generateDisputeResults,generateDisputeTitle} = require('./bot');

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
  for (const {id: dispute_id, title, chat_id, message_id, username} of disputes) {
    const opts = {
      parse_mode: "HTML",
      chat_id: chat_id,
      reply_to_message_id: message_id,
    };
    let text = `<b>Спор окончен</b>\n`;
    text += `${generateDisputeTitle({username, title})}`;
    text += await generateDisputeResults({dispute_id});
    try {
      await bot.sendMessage(chat_id, text, opts);
    } catch(e) {
      log('ERROR: ', e.message)
    } finally {
      await disputeService.resolve({id: dispute_id});
    }
  };
}

function log(text, params = '') {
  console.log(`[backgroundChecker] -> ${text}`, params);
}

log('STARTED!')

module.exports = {
  start
}