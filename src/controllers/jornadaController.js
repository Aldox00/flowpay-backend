const Jornada = require('../models/jornadaModel');

exports.abrirJornada = async (req, res) => {
    const { usuario_id, monto_inversion } = req.body;

    if (!usuario_id || monto_inversion === undefined) {
        return res.status(400).json({ ok: false, msg: 'El id de usuario y el monto de inversión son obligatorios.' });
    }

    try {
        const jornadaActiva = await Jornada.findActivaByUsuarioId(usuario_id);
        
        if (jornadaActiva) {
            return res.status(400).json({ 
                ok: false, 
                msg: 'No puedes abrir una nueva jornada si ya tienes una activa. Cierra la caja actual primero.',
                jornadaId: jornadaActiva.id
            });
        }

        const result = await Jornada.create({ usuario_id, monto_inversion });
        return res.status(201).json({
            ok: true,
            msg: '¡Jornada iniciada con éxito! Ya puedes empezar a vender.',
            jornadaId: result.insertId
        });

    } catch (error) {
        console.error('Error al abrir la jornada:', error);
        return res.status(500).json({ ok: false, msg: 'Error en el servidor al abrir la jornada.' });
    }
};

exports.obtenerEstadoJornada = async (req, res) => {
    const { usuario_id } = req.params;

    try {
        const jornadaActiva = await Jornada.findActivaByUsuarioId(usuario_id);
        
        if (!jornadaActiva) {
            return res.status(200).json({ ok: true, activa: false, msg: 'No hay ninguna jornada activa para este usuario.' });
        }

        return res.status(200).json({
            ok: true,
            activa: true,
            jornada: jornadaActiva
        });

    } catch (error) {
        console.error('Error al obtener el estado de la jornada:', error);
        return res.status(500).json({ ok: false, msg: 'Error en el servidor al consultar el estado de la jornada.' });
    }
};

exports.cerrarJornada = async (req, res) => {
    const { jornada_id } = req.body;

    if (!jornada_id) {
        return res.status(400).json({ ok: false, msg: 'El ID de la jornada es obligatorio para realizar el cierre.' });
    }

    try {
        const balanceFinal = await Jornada.cerrar(jornada_id);

        return res.status(200).json({
            ok: true,
            msg: 'Jornada finalizada con éxito. Caja cerrada de forma permanente.',
            balance: balanceFinal
        });

    } catch (error) {
        console.error('Error al cerrar la jornada:', error);
        return res.status(500).json({ ok: false, msg: 'Error en el servidor al procesar el cierre de caja.' });
    }
};