const express = require('express');
const router = express.Router();
const encuestaController = require('../controllers/encuestaController');

router.post('/registrar', encuestaController.registrarEncuesta);

module.exports = router;