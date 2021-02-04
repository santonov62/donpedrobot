const { bot, sendPhrase, productionDayOffset } = require('./bot');
const moment = require('moment');
const DELAY_MINUTES = 30;
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
  const format = 'hh:mm:ss'
  const time = moment(productionDayOffset(moment()), format),
      beforeTime = moment('09:00:00', format),
      afterTime = moment('09:40:00', format);

  if (time.isBetween(beforeTime, afterTime)) {
    await sendPhrase({chat_ids: chat_ids.split(',')});
  }
}

function log(text, params = '') {
  console.log(`[phraseChecker] -> ${text}`, params);
}

module.exports = {
  start
}