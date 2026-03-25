const { Pool } = require('pg');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
