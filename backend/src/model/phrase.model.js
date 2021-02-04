const { DataTypes } = require('sequelize');
const sequelize = require('../service/sequelize');

const Phrase = sequelize.define('phrase', {
  // Model attributes are defined here
  text: {
    type: DataTypes.TEXT
  }
});

Phrase.sync({alter: true});

module.exports = Phrase;