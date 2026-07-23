const reporteService = require('../services/reporteService');

exports.obtenerHistorialSemanal = async (req, res) => {
    const { usuario_id } = req.params;

    try {
        const resultado = await reporteService.obtenerHistorialSemanalService(usuario_id);

        if (resultado.bloqueado) {
            return res.status(403).json({ 
                ok: false, 
                bloqueado: true,
                msg: resultado.msg 
            });
        }

        return res.status(200).json({
            ok: true,
            bloqueado: false,
            msg: resultado.msg,
            historial: resultado.historial
        });

    } catch (error) {
        console.error('Error al obtener el historial semanal:', error);
        return res.status(500).json({ ok: false, msg: 'Error en el servidor al cargar las estadísticas.' });
    }
};