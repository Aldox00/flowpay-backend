const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'flowpay',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.getConnection()
    .then(conexion => {
        console.log(' Conexión exitosa a la base de datos MySQL.');
        conexion.release(); 
    })
    .catch(error => {
        console.error('Error al conectar a la base de datos:', error.message);
    });

module.exports = pool;