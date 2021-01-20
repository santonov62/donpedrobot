const DELAY_MINUTES = 1 * 60000;
const disputeService = require('../backend/service/dispute.service');
const answerService = require('../backend/service/answer.service');
const bot = require('./bot');

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
  for (const {id: dispute_id, title, chat_id, message_id} of disputes) {
    const answers = await answerService.getByDisputeId({dispute_id});
    let yesUsers = '';
    let noUsers = '';
    for (const {value, username} of answers) {
      if (value === 'yes')
        yesUsers += ` @${username}`;
      if (value === 'no')
        noUsers += ` @${username}`;
    }

    let text = `*Спор завершен* 
    `;
    if (!!yesUsers)
      text += `Да, согласен: ${yesUsers}`;
    if (!!noUsers)
      text += `Да, согласен: ${noUsers}`;
    log(text);

    const opts = {
      parse_mode: "Markdown",
      chat_id: chat_id,
      reply_to_message_id: message_id,
    };
    await bot.sendMessage(chat_id, text, opts);
    await disputeService.resolve({id: dispute_id})
  };
}

function log(text, params = '') {
  console.log(`[backgroundChecker] -> ${text}`, params);
}

module.exports = {
  start
}