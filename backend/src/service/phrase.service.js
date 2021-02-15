const Phrase = require('../model/phrase.model');

const log = (text, params = '') => {
  console.log(`[phrase.service] -> ${text}`, params);
};

async function add({text}) {
  if (!text)
    throw new Error(`text required!`);
  const phrase = await Phrase.create({ text });
  log(`add`, phrase);
  return phrase;
}

async function search() {
  const phrases = await Phrase.findAll();
  log(`search`, phrases);
  return phrases

}

async function getOnePhrase() {
  const phrase = (await Phrase.findAll({
    order: [
      ['created_at', 'ASC'],
    ],
    limit: 1
  }))[0];
  log(`search`, phrase);
  return phrase;
}

async function remove({id}) {
  await Phrase.destroy({
    where: {
      id
    }
  });
}

module.exports = {
  add,
  search,
  getOnePhrase,
  remove
}