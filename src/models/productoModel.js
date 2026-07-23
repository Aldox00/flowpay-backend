const pool = require('../config/db');

const Producto = {
    create: async (productoData) => {
        // 🟢 Se cambió 'precio_venta' por 'precio' para coincidir con la BD en Render
        const query = 'INSERT INTO productos (usuario_id, nombre, precio, foto_url) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(query, [
            productoData.usuario_id,
            productoData.nombre,
            productoData.precio ?? productoData.precio_venta,
            productoData.foto_url || null
        ]);
        return result;
    },

    findActivosByUsuarioId: async (usuario_id) => {
        const query = 'SELECT * FROM productos WHERE usuario_id = ? AND activo = 1';
        const [rows] = await pool.query(query, [usuario_id]);
        return rows;
    },

    findAllByUsuarioId: async (usuario_id) => {
        const query = 'SELECT * FROM productos WHERE usuario_id = ?';
        const [rows] = await pool.query(query, [usuario_id]);
        return rows;
    },

    updateEstado: async (id, activo) => {
        const query = 'UPDATE productos SET activo = ? WHERE id = ?';
        const [result] = await pool.query(query, [activo, id]);
        return result;
    }
};

module.exports = Producto;