const pool = require('../config/db');

const Venta = {
    createWithDetails: async (ventaData, detalles) => {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction(); 
            const queryVenta = `
                INSERT INTO ventas (jornada_id, total, tipo_pago, comprobante_url) 
                VALUES (?, ?, ?, ?)
            `;
            const [resultVenta] = await connection.query(queryVenta, [
                ventaData.jornada_id,
                ventaData.total,
                ventaData.tipo_pago,
                ventaData.comprobante_url || null 
            ]);

            const ventaId = resultVenta.insertId; 

            const queryDetalle = `
                INSERT INTO detalles_ventas (venta_id, producto_id, cantidad, precio_unitario) 
                VALUES (?, ?, ?, ?)
            `;

            for (const item of detalles) {
                await connection.query(queryDetalle, [
                    ventaId,
                    item.producto_id,
                    item.cantidad,
                    item.precio_unitario
                ]);
            }

            await connection.commit(); 
            return ventaId;

        } catch (error) {
            await connection.rollback(); 
            throw error;
        } finally {
            connection.release(); 
        }
    }
};

module.exports = Venta;