const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.post('/crear', productoController.crearProducto);
router.get('/usuario/:usuario_id', productoController.obtenerProductos);

module.exports = router;