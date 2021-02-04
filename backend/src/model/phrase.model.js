const { DataTypes } = require('sequelize');
const sequelize = require('../service/sequelize')

const Phrase = sequelize.define('phrase', {
  // Model attributes are defined here
  text: {
    type: DataTypes.STRING
  }
}, {
  raw: true,
});

Phrase.sync({alter: true});

module.exports = Phrase;