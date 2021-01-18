const { Pool } = require('pg');
const connectionString = require('../knexfile').connection;
const pool = new Pool({ connectionString: connectionString });
pool.connect(err => {
  if (err) throw err;
});

module.exports = pool;