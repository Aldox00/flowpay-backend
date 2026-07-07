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

    cerrar: async (datosCierre) => {
        const esObjetoCompleto = typeof datosCierre === 'object' && datosCierre !== null;
        const id_jornada = esObjetoCompleto ? datosCierre.jornada_id : datosCierre;

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
        
        const [rows] = await pool.query(queryTotales, [id_jornada]);
        if (!rows.length) throw new Error('Jornada no encontrada');

        const bd = rows[0];

        const inversionFinal = (esObjetoCompleto && datosCierre.monto_inversion !== null) 
            ? parseFloat(datosCierre.monto_inversion) 
            : parseFloat(bd.monto_inversion);

        const efectivoFinal = (esObjetoCompleto && datosCierre.monto_ventas_efectivo !== undefined) 
            ? parseFloat(datosCierre.monto_ventas_efectivo) 
            : parseFloat(bd.total_efectivo);

        const transferenciaFinal = (esObjetoCompleto && datosCierre.monto_ventas_transferencia !== undefined) 
            ? parseFloat(datosCierre.monto_ventas_transferencia) 
            : parseFloat(bd.total_transferencia);

        const gananciaFinal = (esObjetoCompleto && datosCierre.ganancia_neta !== undefined) 
            ? parseFloat(datosCierre.ganancia_neta) 
            : (efectivoFinal + transferenciaFinal) - inversionFinal;

        const encuestaFinal = (esObjetoCompleto && datosCierre.encuesta_contestada !== undefined) 
            ? parseInt(datosCierre.encuesta_contestada, 10) 
            : 0;

        const queryUpdate = `
            UPDATE jornadas 
            SET 
                monto_inversion = ?, 
                monto_ventas_efectivo = ?, 
                monto_ventas_transferencia = ?, 
                ganancia_neta = ?, 
                encuesta_contestada = ?, 
                estado = 'cerrada',
                fecha_fin = NOW() 
            WHERE id = ?
        `;
        
        await pool.query(queryUpdate, [
            inversionFinal, 
            efectivoFinal, 
            transferenciaFinal, 
            gananciaFinal, 
            encuestaFinal, 
            id_jornada
        ]);

        return {
            inversion: inversionFinal,
            monto_ventas_efectivo: efectivoFinal,
            monto_ventas_transferencia: transferenciaFinal,
            total_vendido: efectivoFinal + transferenciaFinal,
            ganancia_neta: gananciaFinal,
            encuesta_contestada: encuestaFinal
        };
    }, 

    verificarCandadoHistorial: async (usuario_id) => {
        const query = `
            SELECT encuesta_contestada 
            FROM jornadas 
            WHERE usuario_id = ? AND estado = 'cerrada'
            ORDER BY fecha_fin DESC 
            LIMIT 1
        `;
        const [rows] = await pool.query(query, [usuario_id]);
        
        if (rows.length === 0) return true; 
        
        return rows[0].encuesta_contestada === 1;
    }
};

module.exports = Jornada;