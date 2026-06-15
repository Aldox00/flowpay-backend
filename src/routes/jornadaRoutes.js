const express = require('express');
const router = express.Router();
const jornadaController = require('../controllers/jornadaController');

router.post('/abrir', jornadaController.abrirJornada);
router.get('/estado/:usuario_id', jornadaController.obtenerEstadoJornada);
router.put('/cerrar', jornadaController.cerrarJornada); // <-- Endpoint de Cierre de Caja

module.exports = router;