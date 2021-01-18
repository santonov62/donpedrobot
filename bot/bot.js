process.env["NTBA_FIX_319"] = 1;
const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TOKEN;
if (!token)
  throw new Error(`TOKEN required!`);

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const getName = (from) => {
  return `${from.username}` || `${from.first_name} ${from.last_name}`
}

bot.onText(/([Сс]порим на баночку|[Нн]а баночку что|[Нн]а баночку|[Сс]порим что|[Сс]порим) (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message
  const { from } = msg;
  const chatId = msg.chat.id;
  const theme = match[2]; // the captured "whatever"
  const text = `@${getName(from)} спорит что *${theme}*`;

  const opts = {
    // reply_to_message_id: msg.message_id,
    parse_mode: "Markdown",
    reply_markup: JSON.stringify({
      // keyboard: [
      //   ['Yes, i\'m in ❤']
      // ]
      inline_keyboard: [
        [
          {
            text: 'Да, согласен',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'yes'
          },
          {
            text: 'Нет, не согласен',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'no'
          },
        ]
      ]
    })
  };
  bot.sendMessage(chatId, `${text}`, opts);

  // send back the matched "whatever" to the chat
  // bot.sendMessage(chatId, resp);
});

// Handle callback queries
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  const { data, message, from } = callbackQuery;
  const opts = {
    parse_mode: "Markdown",
    chat_id: message.chat.id,
    reply_to_message_id: message.message_id,
  };
  let text;

  if (data === 'yes') {
    text = `${name} *Да, согласен*`;
  }
  if (data === 'no') {
    text = `${getName(from)} *Нет, не согласен*`;
  }

  bot.sendMessage(message.chat.id, text, opts);
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
