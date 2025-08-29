const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', (client) => {
  console.log('############################################################');
  console.log('### SUCESSO: CONEXÃO COM O BANCO DE DADOS ESTABELECIDA! ###');
  console.log(`### Banco: ${client.database}, Usuário: ${client.user} ###`);
  console.log('############################################################');
});

pool.on('error', (err, client) => {
    console.error('### ERRO INESPERADO NA CONEXÃO COM O BANCO ###', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};