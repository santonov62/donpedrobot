process.env["NTBA_FIX_319"] = 1;
const TelegramBot = require('node-telegram-bot-api');
const disputeService = require('../backend/service/dispute.service');
const answerService = require('../backend/service/answer.service');
const moment = require('moment');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TOKEN;
if (!token)
  throw new Error(`TOKEN required!`);

const SET_EXPIRED_DISPUTE_TIMEOUT_MIN = 0.5;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const getUserName = (from) => {
  return `${from.username}` || `${from.first_name} ${from.last_name}`
}

bot.onText(/([Сс]порим на баночку|[Нн]а баночку что|[Нн]а баночку|[Сс]порим что|[Сс]порим) (.+)/, async (message, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const { from } = message;
  const chatId = message.chat.id;
  const title = match[2]; // the captured "whatever"
  const text = `@${getUserName(from)} спорит что *${title}*`;

  if (!text)
    return;
  const dispute = await disputeService.add({title, chat_id: chatId, message_id: message.message_id});

  const opts = {
    // reply_to_message_id: msg.message_id,
    parse_mode: "Markdown",
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: 'Да, согласен',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: JSON.stringify({
              dispute_id: dispute.id,
              action: 'answer',
              value: "yes"
            })
          },
          {
            text: 'Нет, не согласен',
            // we shall check for this value when we listen
            // for "callback_query"
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

  bot.sendMessage(chatId, `${text}`, opts);

  // send back the matched "whatever" to the chat
  // bot.sendMessage(chatId, resp);
});

let expiredMap = {};

// Handle callback queries
bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
  const { data, message, from } = callbackQuery;
  const {value, dispute_id, action} = JSON.parse(data);
  const username = getUserName(from);
  const chatId = message.chat.id;

  const opts = {
    parse_mode: "Markdown",
    chat_id: message.chat.id,
    reply_to_message_id: message.message_id,
  };


  if (action === 'answer') {
    let answer = await answerService.search({dispute_id, username});
    if (answer) {
      await answerService.save({...answer, value});
    } else {
      await answerService.add({value, dispute_id, username});
    }

    const uid = chatId + dispute_id;
    if (!expiredMap[uid]) {
      expiredMap[uid] = setTimeout(() => {
        requestExpired({dispute_id, chatId, opts});
      }, SET_EXPIRED_DISPUTE_TIMEOUT_MIN * 60000);
    }
    let text;
    const changeValue = answer ? `передумал` : ``;
    if (value === 'yes') {
      text = `@${username} ${changeValue} *Да, согласен*`;
    }
    if (value === 'no') {
      text = `@${username} ${changeValue} *Нет, не согласен*`;
    }
    bot.sendMessage(chatId, text, opts);
  }
  if (action === 'expired') {
    const expired_at = moment.unix(value);
    await disputeService.save({id: dispute_id, expired_at});
    let text = `@${username} установил дату окончания спора *${expired_at.calendar()}*`;
    bot.sendMessage(chatId, text, { ...opts, reply_to_message_id: message.reply_to_message.message_id });
  }
});

function requestExpired({dispute_id, chatId, opts}) {
  // const tomorrow  = moment().add(1,'days');
  bot.sendMessage(chatId, `Когда подвести итоги спора?`, {
    ...opts,
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

bot.onText(/\/disputes/, async (msg, match) => {
  const chatId = msg.chat.id;
  const opts = {
    parse_mode: "Markdown",
  }
  const text = '';
  bot.sendMessage(chatId, text, opts);
});
// Listen for any kind of message. There are different kinds of
// messages.
// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;
//
//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message');
// });

module.exports = bot
