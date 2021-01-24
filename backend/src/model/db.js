const { Sequelize } = require('sequelize');
const connectionString = require('../../knexfile')[process.env.NODE_ENV].connection;

// Option 1: Passing a connection URI
const sequelize = new Sequelize(connectionString, {
  "define": {
    "createdAt": "created_at",
    "updatedAt": "updated_at"
  } /*don't forget to add host, port, dialect, etc.*/
}) // Example for postgres

module.exports = sequelize;