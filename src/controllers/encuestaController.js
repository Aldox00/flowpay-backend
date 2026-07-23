const encuestaService = require('../services/encuestaService');

exports.registrarEncuesta = async (req, res) => {
    const { jornada_id, puntuacion_app, comentarios } = req.body;

    if (!jornada_id || !puntuacion_app) {
        return res.status(400).json({ ok: false, msg: 'El ID de jornada y la puntuación son obligatorios.' });
    }

    try {
        const resultado = await encuestaService.registrarEncuestaService(jornada_id, puntuacion_app, comentarios);
        
        return res.status(201).json({
            ok: true,
            msg: resultado.msg
        });
    } catch (error) {
        console.error('Error al registrar la encuesta:', error);
        return res.status(500).json({ ok: false, msg: 'Error en el servidor al procesar la encuesta.' });
    }
};