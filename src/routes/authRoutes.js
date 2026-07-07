const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/registrar', authController.registrar);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin); 
router.post('/forgot-password', authController.solicitarRecuperacion); 
router.post('/verify-code', authController.verificarCodigo);            
router.post('/reset-password', authController.restablecerContrasena);  
router.get('/verificar-proveedor', authController.verificarProveedor);

module.exports = router;