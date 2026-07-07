const pool = require('../config/db'); 

const User = {
    findByCorreo: async (correo) => {
        const query = 'SELECT * FROM usuarios WHERE correo = ?';
        const [rows] = await pool.query(query, [correo]);
        return rows[0]; 
    },

    create: async (userData) => {
        const query = 'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)';
        const [result] = await pool.query(query, [userData.nombre, userData.correo, userData.contrasena]);
        return result;
    },

    createGoogleUser: async (nombre, correo) => {
        const query = `INSERT INTO usuarios (nombre, correo, contrasena, proveedor_auth) VALUES (?, ?, NULL, 'google')`;
        const [result] = await pool.query(query, [nombre, correo]);
        return result.insertId; // Retorna el ID del nuevo usuario creado
    },

    updateContrasena: async (id, nuevaContrasenaEncriptada) => {
        const query = 'UPDATE usuarios SET contrasena = ? WHERE id = ?';
        const [result] = await pool.query(query, [nuevaContrasenaEncriptada, id]);
        return result;
    }
};

module.exports = User;