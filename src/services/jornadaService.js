const Jornada = require('../models/jornadaModel');

exports.abrirJornadaService = async ({ usuario_id, monto_inversion }) => {
    const jornadaActiva = await Jornada.findActivaByUsuarioId(usuario_id);

    if (jornadaActiva) {
        const error = new Error('No puedes abrir una nueva jornada si ya tienes una activa. Cierra la caja actual primero.');
        error.statusCode = 400;
        error.jornadaId = jornadaActiva.id;
        throw error;
    }

    const result = await Jornada.create({ usuario_id, monto_inversion });
    return {
        jornadaId: result.insertId
    };
};

exports.obtenerEstadoJornadaService = async (usuario_id) => {
    const jornadaActiva = await Jornada.findActivaByUsuarioId(usuario_id);

    if (!jornadaActiva) {
        return {
            activa: false,
            msg: 'No hay ninguna jornada activa para este usuario.'
        };
    }

    return {
        activa: true,
        jornada: jornadaActiva
    };
};

exports.cerrarJornadaService = async (datosCierre) => {
    const balanceFinal = await Jornada.cerrar(datosCierre);
    return {
        balance: balanceFinal
    };
};