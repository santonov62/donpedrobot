const { Pool } = require('pg');
const connectionString = require('../knexfile')[process.env.NODE_ENV].connection;
const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});
pool.connect(err => {
  if (err) throw err;
});

module.exports = pool;