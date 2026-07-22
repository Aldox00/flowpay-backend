const Venta = require('../models/ventaModel');

exports.registrarVentaService = async ({ jornada_id, total, tipo_pago, comprobante_url, detalles }) => {
    let detallesParsed = detalles;

    if (typeof detalles === 'string') {
        detallesParsed = JSON.parse(detalles);
    }

    if (!jornada_id || !total || !tipo_pago || !detallesParsed || !detallesParsed.length) {
        const error = new Error('Datos de la venta incompletos o sin productos.');
        error.statusCode = 400;
        throw error;
    }

    const ventaId = await Venta.createWithDetails(
        { jornada_id, total, tipo_pago, comprobante_url }, 
        detallesParsed
    );

    return { ventaId };
};