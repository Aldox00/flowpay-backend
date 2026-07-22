const Venta = require('../models/ventaModel');

exports.registrarVenta = async(req, res) => {
    let { jornada_id, total, tipo_pago, detalles } = req.body;

    let comprobante_url = null;
    if (req.file) {
        comprobante_url = req.file.filename;
    }

    try {
        if (typeof detalles === 'string') {
            detalles = JSON.parse(detalles);
        }

        if (tipo_pago == 1) {
            return res.status(400).json({ ok: false, msg: "id encontrado pago en efectivo" })
        } else {
            return res.status(400).json({ ok: false, msg: tipo_pago })

        }
        if (!jornada_id || !total || !tipo_pago || !detalles || !detalles.length) {
            return res.status(400).json({ ok: false, msg: 'Datos de la venta incompletos o sin productos.' });
        }

        const ventaId = await Venta.createWithDetails({ jornada_id, total, tipo_pago, comprobante_url },
            detalles
        );

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