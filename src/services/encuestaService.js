const Encuesta = require('../models/encuestaModel');

exports.registrarEncuestaService = async (jornada_id, id_usuario, pregunta_1, pregunta_2, pregunta_3) => {
    await Encuesta.guardarEncuesta(jornada_id, id_usuario, pregunta_1, pregunta_2, pregunta_3);
    
    return {
        msg: '¡Encuesta guardada con éxito!'
    };
};