const ventaService = require('../services/ventaService');

exports.registrarVenta = async (req, res) => {
    let { jornada_id, total, tipo_pago, detalles } = req.body;

    let comprobante_url = null;
    if (req.file) {
        comprobante_url = req.file.filename;
    }

    try {
        const resultado = await ventaService.registrarVentaService({
            jornada_id,
            total,
            tipo_pago,
            comprobante_url,
            detalles
        });

        return res.status(201).json({
            ok: true,
            msg: '¡Venta registrada con éxito!',
            ventaId: resultado.ventaId
        });

    } catch (error) {
        console.error('Error al registrar la transacción:', error);

        if (error.statusCode === 400) {
            return res.status(400).json({ ok: false, msg: error.message });
        }

        return res.status(500).json({ ok: false, msg: 'Error en el servidor al procesar la venta.' });
    }
};