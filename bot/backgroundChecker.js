const DELAY_MINUTES = 15 * 60000;
const disputeService = require('../backend/service/dispute.service');
const answerService = require('../backend/service/answer.service');
const bot = require('./bot');

check();
setInterval(check, DELAY_MINUTES);

async function check() {
  const disputes = await disputeService.expired();
  log('Disputes', disputes);
  for (const {id, title, chat_id, message_id} of disputes) {
    const answers = await answerService.byDisputeId({dispute_id: id});
    let yesUsers = '';
    let noUsers = '';
    for (const {value, username} of answers) {
      if (value === 'yes')
        yesUsers += ` @${username}`;
      if (value === 'no')
        noUsers += ` @${username}`;
    }

    let text = `Спор завершен 
    *${title}*
    `;
    if (!!yesUsers)
      text += `Да, согласен: ${yesUsers}`;
    if (!!noUsers)
      text += `Да, согласен: ${noUsers}`;
    log(text);
    // bot.sendMessage(chatId, text, opts);
  };
}


function log(text, params = '') {
  console.log(`[backgroundChecker] -> ${text}`, params);
}