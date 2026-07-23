const Encuesta = require('../models/encuestaModel');

exports.registrarEncuestaService = async (jornada_id, puntuacion_app, comentarios) => {
    await Encuesta.guardarYLiberarHistorial(jornada_id, puntuacion_app, comentarios);
    
    return {
        msg: '¡Encuesta guardada con éxito! Historial semanal desbloqueado.'
    };
};