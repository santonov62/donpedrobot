const Phrase = require('../model/phrase.model');

const log = (text, params = '') => {
  console.log(`[phrase.service] -> ${text}`, params);
};

async function add({text}) {
  const phrase = await Phrase.create({ text });
  log(`add`, phrase);
}

module.exports = {
  add
}