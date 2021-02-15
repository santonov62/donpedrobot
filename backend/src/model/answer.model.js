const { DataTypes, Deferrable } = require('sequelize');
const sequelize = require('../service/sequelize');
const Dispute = require('./dispute.model');

const Answer = sequelize.define('answer', {
  // Model attributes are defined here
  value: {
    type: DataTypes.STRING
  },
  username: {
    type: DataTypes.STRING
  },
  dispute_id: {
    type: DataTypes.INTEGER,

    references: {
      // This is a reference to another model
      model: Dispute,

      // This is the column name of the referenced model
      key: 'id',

      // With PostgreSQL, it is optionally possible to declare when to check the foreign key constraint, passing the Deferrable type.
      deferrable: Deferrable.INITIALLY_IMMEDIATE
    }
  }
}, {
  raw: true,
});

module.exports = Answer;