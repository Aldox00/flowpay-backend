const Jornada = require('../models/jornadaModel');
const pool = require('../config/db');

exports.obtenerHistorialSemanalService = async (usuario_id) => {
    const encuestaLiberada = await Jornada.verificarCandadoHistorial(usuario_id);

    if (!encuestaLiberada) {
        return {
            bloqueado: true,
            msg: 'Acceso denegado. Debes responder la encuesta de satisfacción para desbloquear tus estadísticas.'
        };
    }

    const queryHistorial = `
        SELECT 
            id, 
            monto_inversion, 
            monto_ventas_efectivo, 
            monto_ventas_transferencia, 
            (monto_ventas_efectivo + monto_ventas_transferencia) as total_vendido, 
            ganancia_neta, 
            fecha_fin
        FROM jornadas 
        WHERE usuario_id = ? AND estado = 'cerrada'
        ORDER BY fecha_fin DESC 
        LIMIT 7
    `;
    const [reportes] = await pool.query(queryHistorial, [usuario_id]);

    return {
        bloqueado: false,
        msg: 'Historial semanal cargado con éxito.',
        historial: reportes
    };
};