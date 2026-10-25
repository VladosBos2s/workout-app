const { Pool } = require('pg');
require('dotenv').config();

// Парсим параметры из DATABASE_URL или берем по отдельности
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  family: 4 // Принудительно заставляем использовать IPv4
});

// Дополнительная проверка, чтобы убедиться, что пул живой
pool.on('connect', () => {
  console.log('Успешное подключение к PostgreSQL через IPv4');
});

pool.on('error', (err) => {
  console.error('Ошибка в пуле PostgreSQL:', err);
});

module.exports = pool;