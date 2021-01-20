process.env["NTBA_FIX_319"] = 1;
const TelegramBot = require('node-telegram-bot-api');
const disputeService = require('../../backend/src/service/dispute.service');  //hack
const answerService = require('../../backend/src/service/answer.service');  //hack
const moment = require('moment');
const REQUEST_EXPIRED_AFTER_MINUTES = 0.2;

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TOKEN;
if (!token)
  throw new Error(`TOKEN required!`);


// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

bot.onText(/^@don_pedrobot+\b$/, async (message, match) => {
  const chatId = message.chat.id;
  bot.sendMessage(chatId, `
  Я бот помогаю спорить. Напиши <b>"Спорим"</b> или обратись ко мне @don_pedrobot и через пробел укажи тему. 
  
  Примеры:
  @don_pedrobot Курс доллара будет расти
  <b>Спорим</b> Курс доллара будет расти
  <b>Спорим что</b> Курс доллара будет расти
  <b>Спорим на баночку</b> Курс доллара будет расти
  <b>На баночку</b> Курс доллара будет расти
  <b>На баночку что</b> Курс доллара будет расти
  
  Команды:
  /disputes - Показать список незавершенных споров`, {parse_mode: "HTML"});
});

bot.onText(/([Сс]порим на баночку|[Нн]а баночку что|[Нн]а баночку|[Сс]порим что|[Сс]порим|@don_pedrobot) (.+)/, async (message, match) => {
  const { from } = message;
  const chatId = message.chat.id;
  const title = match[2]; // the captured "whatever"
  if (!title)
    return;
  const text = generateDisputeTitle({from, title});

  let dispute = await disputeService.add({title, chat_id: chatId});
  // setTimeout(() => {
  //   sendWhenExpiredDispute(dispute);
  // }, REQUEST_EXPIRED_AFTER_MINUTES * 60000);
  const opts = {
    parse_mode: "HTML",
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: 'Да, согласен',
            callback_data: JSON.stringify({
              dispute_id: dispute.id,
              action: 'answer',
              value: "yes"
            })
          },
          {
            text: 'Нет, не согласен',
            callback_data: JSON.stringify({
              dispute_id: dispute.id,
              action: 'answer',
              value: "no"
            })
          },
        ]
      ]
    })
  };

  const {message_id} = await bot.sendMessage(chatId, `${text}`, opts);
  dispute = await disputeService.save({ ...dispute, message_id});
  setTimeout(() => {
    sendWhenExpiredDispute(dispute);
  }, REQUEST_EXPIRED_AFTER_MINUTES * 60000);
});

bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
  const { data, message, from } = callbackQuery;
  const {value, action, dispute_id, title} = JSON.parse(data);
  // const {message_id} = message;
  const chat_id = message.chat.id;
  const username = getUserName(from);

  // const dispute = disputeService.getById({id: dispute_id});
  // if(!dispute)
  //   throw new Error(`No dispute with id: ${dispute_id}`);

  let dispute = await disputeService.getById({id: dispute_id});
  const {message_id} = dispute;
  if (action === 'answer') {
    // if (!dispute) {
    //   dispute = await disputeService.add({title, chat_id: chat_id, message_id});
    // }
    // const {id: dispute_id} = dispute;

    let answer = await answerService.search({dispute_id, username});
    if (answer) {
      await answerService.save({...answer, value});
    } else {
      await answerService.add({value, dispute_id, username});
    }

    const opts = {
      parse_mode: "HTML",
      chat_id,
      message_id,
      reply_markup: message.reply_markup
    };

    let text = await generateDisputeTitle({from, title: dispute.title});
    text += await generateDisputeResults({dispute_id});

    // const changeValue = answer ? `передумал` : ``;
    // if (value === 'yes') {
    //   text += `\n@${username} ${changeValue} <b>Да, согласен</b>`;
    // }
    // if (value === 'no') {
    //   text += `\n@${username} ${changeValue} <b>Нет, не согласен</b>`;
    // }
    // bot.sendMessage(chatId, text, opts);

    bot.editMessageText(text, opts);

  }
  if (action === 'expired') {
    const opts = {
      parse_mode: "HTML",
      chat_id: chat_id,
      reply_to_message_id: message_id,
    };
    const expired_at = moment.unix(value);
    await disputeService.save({...dispute, expired_at});
    const formatDate = process.env.NODE_ENV === 'production' ? expired_at.add(3, 'hours').calendar() : expired_at.calendar()
    let text = `@${username} установил дату подведения итогов <b>${formatDate}</b>`;
    // bot.sendMessage(chat_id, text, { ...opts, reply_to_message_id: dispute.message_id });
    bot.sendMessage(chat_id, text, opts);
  }
});

function sendWhenExpiredDispute({id: dispute_id, chat_id, message_id}) {
  bot.sendMessage(chat_id, `Когда показать результаты?`, {
    parse_mode: "HTML",
    chat_id,
    reply_to_message_id: message_id,
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: 'Через 10 мин',
            callback_data: JSON.stringify({
              dispute_id: dispute_id,
              action: 'expired',
              value: moment().add(10, 'minutes').unix()
            })
          },
          {
            text: 'Через час',
            callback_data: JSON.stringify({
              dispute_id: dispute_id,
              action: 'expired',
              value: moment().add(1, 'hours').unix()
            })
          }
        ],
        [
          {
            text: 'Завтра',
            callback_data: JSON.stringify({
              dispute_id: dispute_id,
              action: 'expired',
              value: moment().add(1, 'days').unix()
            })
          },
          {
            text: 'Послезавтра',
            callback_data: JSON.stringify({
              dispute_id: dispute_id,
              action: 'expired',
              value: moment().add(2, 'days').unix()
            })
          }
        ],
        [
          {
            text: 'Через неделю',
            callback_data: JSON.stringify({
              dispute_id: dispute_id,
              action: 'expired',
              value: moment().add(7, 'days').unix()
            })
          },
          {
            text: 'Через месяц',
            callback_data: JSON.stringify({
              dispute_id: dispute_id,
              action: 'expired',
              value: moment().add(1, 'month').unix()
            })
          }
        ]
      ]
    })
  });
}

bot.onText(/\/disputes/, async (message, match) => {
  const { from } = message;
  const chat_id = message.chat.id;
  const opts = {parse_mode: "HTML"}
  const disputes = await disputeService.getOpened({chat_id});
  const text = disputes.reduce((acc, {title, expired_at}, index) => acc +
  `${index+1}. ${title} -> <b>${moment(expired_at).calendar()}</b>\n`, ``) || 'Нет незавершенных';

  bot.sendMessage(chat_id, `${text}`, opts);
});

async function generateDisputeResults({dispute_id}) {
  const answers = await answerService.getByDisputeId({dispute_id});
  let yesUsers = '';
  let noUsers = '';
  for (const {value, username} of answers) {
    if (value === 'yes')
      yesUsers += ` @${username}`;
    if (value === 'no')
      noUsers += ` @${username}`;
  }

  let text = '';
  if (!!yesUsers)
    text += `Да, согласен: ${yesUsers}`;
  if (!!noUsers)
    text += `Нет, не согласен: ${noUsers}`;

  return text;
}

function generateDisputeTitle({from, title}) {
  return `@${getUserName(from)} спорит что <b>${title}</b>\n`
}

function log(text, params = '') {
  console.log(`[bot] -> ${text}`, params);
}

function getUserName (from) {
  return from.username || `${from.first_name} ${from.last_name}`
}

log('STARTED!');

module.exports = {
  bot,
  generateDisputeTitle,
  generateDisputeResults
}
