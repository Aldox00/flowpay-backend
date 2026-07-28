const encuestaService = require('../services/encuestaService');

exports.registrarEncuesta = async (req, res) => {
    const {
        id_usuario,
        pregunta_1,
        pregunta_2,
        pregunta_3,
        jornada_id,
        puntuacion_app,
        puntuacion,
        comentarios
    } = req.body;

    const respuesta1 = pregunta_1 !== undefined
        ? pregunta_1
        : (puntuacion_app !== undefined ? puntuacion_app : puntuacion);
    const respuesta2 = pregunta_2 !== undefined
        ? pregunta_2
        : (comentarios !== undefined ? comentarios : null);
    const respuesta3 = pregunta_3 !== undefined ? pregunta_3 : null;

    if (!id_usuario && !jornada_id) {
        return res.status(400).json({ ok: false, msg: 'El ID de jornada y la puntuación son obligatorios.' });
    }

    if (respuesta1 === undefined) {
        return res.status(400).json({ ok: false, msg: 'El ID de jornada y la puntuación son obligatorios.' });
    }

    try {
        const resultado = await encuestaService.registrarEncuestaService({
            id_usuario,
            jornada_id,
            pregunta_1: respuesta1,
            pregunta_2: respuesta2,
            pregunta_3: respuesta3
        });

        return res.status(201).json({
            ok: true,
            msg: resultado.msg
        });
    } catch (error) {
        console.error('Error al registrar la encuesta:', error);

        if (error.message === 'No se encontró la jornada indicada.' || error.message === 'No se encontró el usuario asociado a la encuesta.') {
            return res.status(400).json({ ok: false, msg: error.message });
        }

        return res.status(500).json({ ok: false, msg: 'Error en el servidor al procesar la encuesta.' });
    }
};