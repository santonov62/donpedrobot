const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./db')

const Dispute = sequelize.define('dispute', {
  // Model attributes are defined here
  title: {
    type: DataTypes.STRING
  }
}, {
  // Other model options go here
});

// `sequelize.define` also returns the model
console.log(Dispute === sequelize.models.User); // true

module.exports = Dispute;