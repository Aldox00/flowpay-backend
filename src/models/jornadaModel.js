const pool = require('../config/db');

const Jornada = {
    findActivaByUsuarioId: async (usuario_id) => {
        const query = "SELECT * FROM jornadas WHERE usuario_id = ? AND estado = 'activa'";
        const [rows] = await pool.query(query, [usuario_id]);
        return rows[0];
    },

    create: async (jornadaData) => {
        const query = 'INSERT INTO jornadas (usuario_id, monto_inversion, estado) VALUES (?, ?, ?)';
        const [result] = await pool.query(query, [
            jornadaData.usuario_id,
            jornadaData.monto_inversion,
            'activa'
        ]);
        return result;
    },

    cerrar: async (jornada_id) => {
        const queryTotales = `
            SELECT 
                j.monto_inversion,
                COALESCE(SUM(CASE WHEN v.tipo_pago = 'Efectivo' THEN v.total ELSE 0 END), 0) as total_efectivo,
                COALESCE(SUM(CASE WHEN v.tipo_pago = 'Transferencia' THEN v.total ELSE 0 END), 0) as total_transferencia
            FROM jornadas j
            LEFT JOIN ventas v ON j.id = v.jornada_id
            WHERE j.id = ?
            GROUP BY j.id
        `;
        
        const [rows] = await pool.query(queryTotales, [jornada_id]);
        if (!rows.length) throw new Error('Jornada no encontrada');

        const { monto_inversion, total_efectivo, total_transferencia } = rows[0];
        
        const inversion = parseFloat(monto_inversion);
        const efectivo = parseFloat(total_efectivo);
        const transferencia = parseFloat(total_transferencia);
        
        const ganancia_neta = (efectivo + transferencia) - inversion;

        const queryUpdate = `
            UPDATE jornadas 
            SET monto_ventas_efectivo = ?, monto_ventas_transferencia = ?, ganancia_neta = ?, estado = 'cerrada' 
            WHERE id = ?
        `;
        
        await pool.query(queryUpdate, [efectivo, transferencia, ganancia_neta, jornada_id]);

        return {
            inversion,
            monto_ventas_efectivo: efectivo,
            monto_ventas_transferencia: transferencia,
            total_vendido: efectivo + transferencia,
            ganancia_neta
        };
    }
};

module.exports = Jornada;