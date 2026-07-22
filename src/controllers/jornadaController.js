const jornadaService = require('../services/jornadaService');

exports.abrirJornada = async (req, res) => {
    const { usuario_id, monto_inversion } = req.body;

    if (!usuario_id || monto_inversion === undefined) {
        return res.status(400).json({ ok: false, msg: 'El id de usuario y el monto de inversión son obligatorios.' });
    }

    try {
        const resultado = await jornadaService.abrirJornadaService({ usuario_id, monto_inversion });
        return res.status(201).json({
            ok: true,
            msg: '¡Jornada iniciada con éxito! Ya puedes empezar a vender.',
            jornadaId: resultado.jornadaId
        });
    } catch (error) {
        console.error('Error al abrir la jornada:', error);
        
        if (error.statusCode === 400) {
            return res.status(400).json({
                ok: false,
                msg: error.message,
                jornadaId: error.jornadaId
            });
        }

        return res.status(500).json({ ok: false, msg: 'Error en el servidor al abrir la jornada.' });
    }
};

exports.obtenerEstadoJornada = async (req, res) => {
    const { usuario_id } = req.params;

    try {
        const resultado = await jornadaService.obtenerEstadoJornadaService(usuario_id);

        if (!resultado.activa) {
            return res.status(200).json({
                ok: true,
                activa: false,
                msg: resultado.msg
            });
        }

        return res.status(200).json({
            ok: true,
            activa: true,
            jornada: resultado.jornada
        });
    } catch (error) {
        console.error('Error al obtener el estado de la jornada:', error);
        return res.status(500).json({ ok: false, msg: 'Error en el servidor al consultar el estado de la jornada.' });
    }
};

exports.cerrarJornada = async (req, res) => {
    const { 
        jornada_id, 
        monto_inversion = null,
        monto_ventas_efectivo = 0.0, 
        monto_ventas_transferencia = 0.0, 
        ganancia_neta = 0.0, 
        encuesta_contestada = 0 
    } = req.body;

    if (!jornada_id) {
        return res.status(400).json({ ok: false, msg: 'El ID de la jornada es obligatorio para realizar el cierre.' });
    }

    try {
        const resultado = await jornadaService.cerrarJornadaService({
            jornada_id,
            monto_inversion,
            monto_ventas_efectivo,
            monto_ventas_transferencia,
            ganancia_neta,
            encuesta_contestada
        });

        return res.status(200).json({
            ok: true,
            msg: 'Jornada finalizada con éxito. Caja cerrada de forma permanente.',
            balance: resultado.balance
        });

    } catch (error) {
        console.error('Error al cerrar la jornada:', error);
        return res.status(500).json({ ok: false, msg: 'Error en el servidor al procesar el cierre de caja.' });
    }
};