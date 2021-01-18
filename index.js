const TelegramBot = require('node-telegram-bot-api');

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TOKEN;
if (!token)
  throw new Error(`TOKEN required!`);

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

bot.onText(/на баночку (.+)/, (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"

  const opts = {
    // reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      // keyboard: [
      //   ['Yes, i\'m in ❤']
      // ]
      inline_keyboard: [
        [
          {
            text: 'Yes, i\'m in ❤',
            // we shall check for this value when we listen
            // for "callback_query"
            callback_data: 'ok'
          }
        ]
      ]
    })
  };
  bot.sendMessage(chatId, `${resp}`, opts);

  // send back the matched "whatever" to the chat
  // bot.sendMessage(chatId, resp);
});

// Handle callback queries
bot.on('callback_query', function onCallbackQuery(callbackQuery) {
  const { data, message, from } = callbackQuery;
  const opts = {
    chat_id: message.chat.id,
    reply_to_message_id: message.message_id,
  };
  let text;
  const name = from.username || `${from.first_name} ${from.last_name}`

  if (data === 'ok') {
    text = `@${name} ставит баночку что да`;
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