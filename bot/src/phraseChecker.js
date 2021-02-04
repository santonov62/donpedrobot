const { bot, sendPhrase } = require('./bot');
const phraseService = require('../../backend/src/service/phrase.service');
const DELAY_MINUTES = 4;
const chat_ids = process.env.CHAT_ID;

function start() {
  if (!chat_ids) {
    log('WARN!', 'process.env.CHAT_ID required!');
    return;
  }
  post();
  setInterval(async () => {
    try {
      await post();
    } catch (e) {
      log(`ERROR`, e.message);
    }
  }, DELAY_MINUTES * 60000);
  log('STARTED!');
}

async function post() {
  for (const chat_id of chat_ids.split(',')) {
    await sendPhrase({chat_id, silent: true});
  }
}

function log(text, params = '') {
  console.log(`[phraseChecker] -> ${text}`, params);
}

module.exports = {
  start
}