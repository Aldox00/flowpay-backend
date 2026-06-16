const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

router.get('/semanal/:usuario_id', reporteController.obtenerHistorialSemanal);

module.exports = router;