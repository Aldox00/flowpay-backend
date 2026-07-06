const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 12926, // 🟢 Forzamos el casteo a número por si Render lo lee como texto
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  
  // 🟢 Parámetros de tiempo extra para que Aiven no cierre la puerta antes de tiempo
  connectTimeout: 20000, 
  acquireTimeout: 20000,
  
  // 🟢 Configuración SSL robusta requerida por DigitalOcean/Aiven
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