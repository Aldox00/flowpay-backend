const Encuesta = require('../models/encuestaModel');

exports.registrarEncuestaService = async (payload) => {
    await Encuesta.guardarEncuesta(payload);

    return {
        msg: '¡Encuesta guardada con éxito!'
    };
};