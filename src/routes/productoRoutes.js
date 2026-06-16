const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.post('/crear', productoController.crearProducto);// Solo los activos para vender
router.get('/catalogo/:usuario_id', productoController.obtenerTodoElCatalogo); 
router.put('/actualizar-estado', productoController.actualizarEstadoProducto); 

module.exports = router;