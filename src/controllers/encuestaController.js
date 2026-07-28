const encuestaService = require('../services/encuestaService');

exports.registrarEncuesta = async (req, res) => {
    const { id_usuario, pregunta_1, pregunta_2, pregunta_3 } = req.body;

    if (!id_usuario || pregunta_1 === undefined || pregunta_2 === undefined || pregunta_3 === undefined) {
        return res.status(400).json({ ok: false, msg: 'id_usuario y las tres respuestas de encuesta son obligatorios.' });
    }

    try {
        const resultado = await encuestaService.registrarEncuestaService(id_usuario, pregunta_1, pregunta_2, pregunta_3);
        
        return res.status(201).json({
            ok: true,
            msg: resultado.msg
        });
    } catch (error) {
        console.error('Error al registrar la encuesta:', error);
        return res.status(500).json({ ok: false, msg: 'Error en el servidor al procesar la encuesta.' });
    }
};