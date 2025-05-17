const mysql = require('mysql2/promise');
require('dotenv').config();
const { URL } = require('url');

const databaseUrl = process.env.DATABASE_URL;
const url = new URL(databaseUrl);

const pool = mysql.createPool({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  port: url.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
