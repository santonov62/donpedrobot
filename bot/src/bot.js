process.env["NTBA_FIX_319"] = 1;
const TelegramBot = require('node-telegram-bot-api');
const disputeService = require('../../backend/src/service/dispute.service');  //hack
const answerService = require('../../backend/src/service/answer.service');  //hack
const moment = require('moment');
moment.locale('ru');
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

bot.onText(/([Сс]порим на баночку|[Нн]а баночку что|[Нн]а баночку|[Сс]порим что|[Сс]порим|@don_pedrobot),?\s(.+)/, async (message, match) => {
  const { from } = message;
  const chat_id = message.chat.id;
  const title = match[2];
  const username = _getUserName(from);
  if (!title)
    return;
  const text = generateDisputeTitle({username, title});

  let dispute = await disputeService.add({title, chat_id, username});
  const opts = {
    parse_mode: "HTML",
    reply_markup: JSON.stringify({
      inline_keyboard: _getDisputeButtons({dispute_id: dispute.id})
    })
  };

  const {message_id} = await bot.sendMessage(chat_id, `${text}`, opts);
  dispute = await disputeService.save({ ...dispute, message_id});
  sendWhenExpiredDispute(dispute);
  bot.pinChatMessage(chat_id, message_id,{disable_notification: true});
});

bot.onText(/\/disputes/, async (message, match) => {
  const { from } = message;
  const chat_id = message.chat.id;
  const disputes = await disputeService.getOpened({chat_id});
  let index = 1;
  for (const {title, expired_at, id: dispute_id, username, message_id} of disputes) {
    const opts = {
      parse_mode: "HTML",
      // reply_to_message_id: message_id,
      reply_markup: JSON.stringify({
        inline_keyboard: [
          [
            {
              text: 'завершить',
              callback_data: JSON.stringify({
                dispute_id: dispute_id,
                action: 'resolve'
              })
            },
          ]
        ]
      })
    }
    let text = ``;
    text += `<b>${index++}.</b> ${generateDisputeTitle({title, username})}`;
    text += `${await generateDisputeResults({dispute_id})}`;
    text += `${generateDisputeExpired({expired_at})}`;
    try {
      await bot.sendMessage(chat_id, `${text}`, {...opts, reply_to_message_id: message_id });
    } catch (e) {
      log(`ERROR: `, e.message);
      await bot.sendMessage(chat_id, `${text}`, opts)
    }
  }
  if (!disputes || disputes.length === 0)
    bot.sendMessage(chat_id, `Ничего нет`, {parse_mode: "HTML"});
});

bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
  try {
    const {data, message, from} = callbackQuery;
    const {value, action, dispute_id, title} = JSON.parse(data);
    const chat_id = message.chat.id;
    const username = _getUserName(from);

    let dispute = await disputeService.getById({id: dispute_id});
    if (action === 'answer') {
      let answer = await answerService.search({dispute_id, username});
      if (answer) {
        await answerService.save({...answer, value});
      } else {
        await answerService.add({value, dispute_id, username});
      }
      await updateDisputeMessage(dispute);
    }
    if (action === 'expired') {
      const opts = {
        parse_mode: "HTML",
        chat_id: chat_id,
        message_id: message.message_id,
      };
      // const expired_at = moment.unix(value);
      const [count, type] = value.split('_');
      const expired_at = moment().add(count, type);
      dispute = await disputeService.save({...dispute, expired_at});
      // let text = `${message.text}\n`;
      const text = `@${username} установил дату завершения спора <b>${formatDate(expired_at)}</b>\n`;
      await bot.editMessageText(text, opts);
      await updateDisputeMessage(dispute);
    }
    if (action === 'resolve') {
      await resolveDispute({dispute_id: dispute.id});
      bot.deleteMessage(chat_id, message.message_id);
    }
  } catch (e) {
    log(`ERROR: `, e.message);
  }
});

async function updateDisputeMessage({id: dispute_id, chat_id, message_id, expired_at, title, username, resolved_at}) {
  const opts = {
    parse_mode: "HTML",
    chat_id,
    message_id,
  };
  if (!resolved_at) {
    opts.reply_markup = JSON.stringify({
      inline_keyboard: _getDisputeButtons({dispute_id})
    })
  }

  const text = await generateDisputeMessage({username, title, dispute_id, expired_at, resolved_at});
  await bot.editMessageText(text, opts);
}

async function generateDisputeMessage({username, title, dispute_id, expired_at, resolved_at}) {
  let text = await generateDisputeTitle({username, title});
  text += await generateDisputeResults({dispute_id});
  text += await generateDisputeExpired({expired_at, resolved_at});
  return text;
}

function sendWhenExpiredDispute({id: dispute_id, chat_id, message_id}) {
  bot.sendMessage(chat_id, `Когда показать результаты?`, {
    parse_mode: "HTML",
    chat_id,
    reply_markup: JSON.stringify({
      inline_keyboard: _getExpiredButtons({dispute_id})
    })
  });
}

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
    text += `Да, согласен: ${yesUsers}\n`;
  if (!!noUsers)
    text += `Нет, не согласен: ${noUsers}\n`;

  return text;
}

function generateDisputeTitle({username, title}) {
  if (!!username)
    return `@${username} спорит <b>${title}</b>\n`;
  return `<b>${title}</b>\n`;
}

function generateDisputeExpired({expired_at, resolved_at}) {
  if (!!resolved_at)
    return `Завершен <b>${productionDayOffset(resolved_at).format('Do MMMM YYYY, HH:mm')}</b>`;
  return expired_at ? `Дата завершения: <b>${formatDate(expired_at)}</b>\n` : '';
}

function productionDayOffset(date) {
  return process.env.NODE_ENV === 'production' ? moment(date).add(3, 'hours') : moment(date)
}

function formatDate(date) {
  return productionDayOffset(date).calendar();
}

async function resolveDispute({dispute_id}) {
  const dispute = await disputeService.resolve({id: dispute_id});
  const {title, chat_id, message_id, username, expired_at, resolved_at} = dispute;
  const opts = {
    parse_mode: "HTML",
    chat_id: chat_id
  };
  let text = `<b>Спор завершен</b>\n`;
  text += await generateDisputeMessage({username, title, dispute_id, expired_at, resolved_at});
  try {
    await bot.sendMessage(chat_id, text, {...opts, reply_to_message_id: message_id,});
  } catch(e) {
    log('ERROR: ', e.message);
    await bot.sendMessage(chat_id, text, opts);
  } finally {
    await updateDisputeMessage(dispute);
    bot.unpinChatMessage(chat_id, {message_id});
  }
}

function _getUserName (from) {
  return from.username || `${from.first_name} ${from.last_name}`
}

function _getDisputeButtons({dispute_id}) {
  return [
    [
      {
        text: 'Да, согласен',
        callback_data: JSON.stringify({
          dispute_id: dispute_id,
          action: 'answer',
          value: "yes"
        })
      },
      {
        text: 'Нет, не согласен',
        callback_data: JSON.stringify({
          dispute_id: dispute_id,
          action: 'answer',
          value: "no"
        })
      },
    ]
  ]
}

function _getExpiredButtons({dispute_id}) {
  return [
    [
      {
        text: 'Через 10 мин',
        callback_data: JSON.stringify({
          dispute_id: dispute_id,
          action: 'expired',
          // value: moment().add(10, 'minutes').unix()
          value: '10_minutes'
        })
      },
      {
        text: 'Через час',
        callback_data: JSON.stringify({
          dispute_id: dispute_id,
          action: 'expired',
          value: '1_hours'
        })
      }
    ],
    [
      {
        text: 'Завтра',
        callback_data: JSON.stringify({
          dispute_id: dispute_id,
          action: 'expired',
          value: '1_days'
        })
      },
      {
        text: 'Послезавтра',
        callback_data: JSON.stringify({
          dispute_id: dispute_id,
          action: 'expired',
          value: '2_days'
        })
      }
    ],
    [
      {
        text: 'Через неделю',
        callback_data: JSON.stringify({
          dispute_id: dispute_id,
          action: 'expired',
          value: '7_days'
        })
      },
      {
        text: 'Через месяц',
        callback_data: JSON.stringify({
          dispute_id: dispute_id,
          action: 'expired',
          value: '1_month'
        })
      }
    ]
  ]
}

function log(text, params = '') {
  console.log(`[bot] -> ${text}`, params);
}

log('STARTED!');

module.exports = {
  bot,
  generateDisputeTitle,
  generateDisputeResults,
  resolveDispute,
  updateDisputeMessage
}
