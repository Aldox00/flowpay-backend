const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.post('/crear', productoController.crearProducto);
router.get('/activos/:usuario_id', productoController.obtenerProductosActivos);
router.get('/catalogo/:usuario_id', productoController.obtenerTodoElCatalogo);
router.put('/actualizar-estado', productoController.actualizarEstadoProducto);

module.exports = router;