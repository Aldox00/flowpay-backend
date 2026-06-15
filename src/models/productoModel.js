const pool = require('../config/db');

const Producto = {
    create: async (productoData) => {
        const query = 'INSERT INTO productos (usuario_id, nombre, precio_venta) VALUES (?, ?, ?)';
        const [result] = await pool.query(query, [
            productoData.usuario_id, 
            productoData.nombre, 
            productoData.precio
        ]);
        return result;
    },

    findByUsuarioId: async (usuario_id) => {
        const query = 'SELECT * FROM productos WHERE usuario_id = ?';
        const [rows] = await pool.query(query, [usuario_id]);
        return rows;
    }
};

module.exports = Producto;