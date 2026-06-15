const Venta = require('../models/ventaModel');

exports.registrarVenta = async (req, res) => {
    const { jornada_id, total, tipo_pago, detalles } = req.body;

    if (!jornada_id || !total || !tipo_pago || !detalles || !detalles.length) {
        return res.status(400).json({ ok: false, msg: 'Datos de la venta incompletos o sin productos.' });
    }

    try {
        const ventaId = await Venta.createWithDetails({ jornada_id, total, tipo_pago }, detalles);

        return res.status(201).json({
            ok: true,
            msg: '¡Venta registrada con éxito!',
            ventaId
        });
        
    } catch (error) {
        console.error('Error al registrar la transacción:', error);
        return res.status(500).json({ ok: false, msg: 'Error en el servidor al procesar la venta.' });
    }
};