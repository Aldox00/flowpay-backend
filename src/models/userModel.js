const pool = require('../config/db'); 

const User = {
    findByEmail: async (correo) => {
        const query = 'SELECT * FROM usuarios WHERE correo = ?';
        const [rows] = await pool.query(query, [correo]);
        return rows[0]; 
    },

    create: async (userData) => {
        const query = 'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)';
        const [result] = await pool.query(query, [userData.nombre, userData.correo, userData.contrasena]);
        return result;
    }
};

module.exports = User;