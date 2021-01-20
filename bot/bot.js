process.env["NTBA_FIX_319"] = 1;
const TelegramBot = require('node-telegram-bot-api');
const disputeService = require('../backend/service/dispute.service');
const answerService = require('../backend/service/answer.service');
const moment = require('moment');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TOKEN;
if (!token)
  throw new Error(`TOKEN required!`);

const REQUEST_EXPIRED_AFTER_MINUTES = 0.2;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const getUserName = (from) => {
  return from.username || `${from.first_name} ${from.last_name}`
}

bot.onText(/^\@don_pedrobot+\b$/, async (message, match) => {
  const chatId = message.chat.id;
  bot.sendMessage(chatId, `
  Я бот помогаю спорить. Напиши <b>"Спорим"</b> или обратись ко мне @don_pedrobot и через пробел укажи тему. 
  Примеры:
  @don_pedrobot Курс доллара будет расти
  <b>Спорим</b> Курс доллара будет расти
  <b>Спорим что</b> Курс доллара будет расти
  <b>На баночку</b> Курс доллара будет расти
  <b>На баночку что</b> Курс доллара будет расти`, {parse_mode: "HTML"});
});

bot.onText(/([Сс]порим на баночку|[Нн]а баночку что|[Нн]а баночку|[Сс]порим что|[Сс]порим)|@don_pedrobot (.+)/, async (message, match) => {
  const { from } = message;
  const chatId = message.chat.id;
  const title = match[2]; // the captured "whatever"
  if (!title)
    return;
  const text = `@${getUserName(from)} <b>${title}</b>`;

  const dispute = await disputeService.add({title, chat_id: chatId, message_id: message.message_id});
  setTimeout(() => {
    requestWhenExpired(dispute);
  }, REQUEST_EXPIRED_AFTER_MINUTES * 60000);
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

  bot.sendMessage(chatId, `${text}`, opts);
});

// Handle callback queries
bot.on('callback_query', async function onCallbackQuery(callbackQuery) {
  const { data, message, from } = callbackQuery;
  const {value, dispute_id, action} = JSON.parse(data);
  const username = getUserName(from);
  const chatId = message.chat.id;

  const opts = {
    parse_mode: "HTML",
    chat_id: message.chat.id,
    reply_to_message_id: message.message_id,
  };

  // const dispute = disputeService.getById({id: dispute_id});
  // if(!dispute)
  //   throw new Error(`No dispute with id: ${dispute_id}`);

  if (action === 'answer') {
    let answer = await answerService.search({dispute_id, username});
    if (answer) {
      await answerService.save({...answer, value});
    } else {
      await answerService.add({value, dispute_id, username});
    }

    let text;
    const changeValue = answer ? `передумал` : ``;
    if (value === 'yes') {
      text = `@${username} ${changeValue} <b>Да, согласен</b>`;
    }
    if (value === 'no') {
      text = `@${username} ${changeValue} <b>Нет, не согласен</b>`;
    }
    bot.sendMessage(chatId, text, opts);
  }
  if (action === 'expired') {
    const expired_at = moment.unix(value);
    await disputeService.save({id: dispute_id, expired_at});
    const formatDate = process.env.NODE_ENV === 'production' ? expired_at.add(3, 'hours').calendar() : expired_at.calendar()
    let text = `@${username} установил дату подведения итогов <b>${formatDate}</b>`;
    bot.sendMessage(chatId, text, { ...opts, reply_to_message_id: message.reply_to_message.message_id });
  }
});

function requestWhenExpired({id: dispute_id, chat_id, message_id}) {
  bot.sendMessage(chat_id, `Когда подвести итоги?`, {
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

module.exports = bot
