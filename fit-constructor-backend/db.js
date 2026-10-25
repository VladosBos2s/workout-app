const { Pool } = require('pg');
require('dotenv').config(); 

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD, // Если здесь undefined, падает ошибка SASL
  port: process.env.DB_PORT,
});
console.log('База данных postgreSQL успешно запущена!')
module.exports = pool;
