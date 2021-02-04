const Phrase = require('../model/phrase.model');

const log = (text, params = '') => {
  console.log(`[phrase.service] -> ${text}`, params);
};

async function add({text}) {
  const phrase = await Phrase.create({ text });
  log(`add`, phrase);
  return phrase;
}

async function search() {
  const phrases = await Phrase.findAll();
  log(`search`, phrases);
  return phrases

}

module.exports = {
  add,
  search
}