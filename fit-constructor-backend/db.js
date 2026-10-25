const { Pool } = require('pg');
require('dotenv').config(); 

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Обязательно для Supabase в облаке
  },
  family: 4 // Принудительно IPv4 для обхода ENETUNREACH на Render
});

console.log('База данных postgreSQL успешно запущена!');
module.exports = pool;