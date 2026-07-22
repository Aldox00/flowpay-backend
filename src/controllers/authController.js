const authService = require('../services/authService');

exports.registrar = async (req, res) => {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ ok: false, msg: 'Todos los campos son obligatorios' });
    }

    try {
        const resultado = await authService.registrarUsuario({ nombre, correo, contrasena });
        return res.status(201).json({ ok: true, msg: resultado.msg });
    } catch (error) {
        console.error('Error en el registro:', error);
        const status = error.statusCode || 500;
        return res.status(status).json({ ok: false, msg: error.message || 'Error en el servidor al registrar usuario' });
    }
};

exports.login = async (req, res) => {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({ ok: false, msg: 'Por favor, ingresa todos los campos' });
    }

    try {
        const resultado = await authService.loginUsuario({ correo, contrasena });
        return res.status(200).json({
            ok: true,
            token: resultado.token,
            usuario: resultado.usuario
        });
    } catch (error) {
        console.error('Error en el login:', error);
        const status = error.statusCode || 500;
        return res.status(status).json({ ok: false, msg: error.message || 'Error en el servidor al iniciar sesión' });
    }
};

exports.googleLogin = async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ ok: false, msg: 'El token de Google es obligatorio.' });
    }

    try {
        const resultado = await authService.googleLoginService(idToken);
        return res.status(200).json({
            ok: true,
            token: resultado.token,
            usuario: resultado.usuario
        });
    } catch (error) {
        console.error('Error en Google Auth (Token):', error);
        const status = error.statusCode || 401;
        return res.status(status).json({ ok: false, msg: error.message || 'Token de Google inválido o expirado.' });
    }
};

exports.solicitarRecuperacion = async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ ok: false, msg: 'El correo electrónico es requerido.' });
    }

    try {
        const resultado = await authService.solicitarRecuperacionService(correo);
        return res.status(200).json({
            ok: true,
            msg: 'Código de seguridad enviado con éxito a tu correo electrónico.',
            correo: resultado.correo
        });
    } catch (error) {
        console.error('❌ Error crítico en solicitarRecuperacion:', error);
        const status = error.statusCode || 500;
        return res.status(status).json({ ok: false, msg: error.message || 'Error interno en el servidor.' });
    }
};

exports.verificarCodigo = async (req, res) => {
    const { correo, codigoIngresado } = req.body;

    if (!correo || !codigoIngresado) {
        return res.status(400).json({ ok: false, msg: 'El correo y el código son obligatorios.' });
    }

    try {
        const resultado = await authService.verificarCodigoService(correo, codigoIngresado);
        return res.status(200).json({
            ok: true,
            msg: 'Código verificado con éxito. Identidad confirmada.',
            token: resultado.token
        });
    } catch (error) {
        console.error('Error en verificarCodigo:', error);
        const status = error.statusCode || 500;
        return res.status(status).json({ ok: false, msg: error.message || 'Error interno al validar el código.' });
    }
};

exports.restablecerContrasena = async (req, res) => {
    const { token, nuevaContrasena } = req.body;

    if (!token || !nuevaContrasena) {
        return res.status(400).json({ ok: false, msg: 'El token y la nueva contraseña son obligatorios.' });
    }

    try {
        const resultado = await authService.restablecerContrasenaService(token, nuevaContrasena);
        return res.status(200).json({
            ok: true,
            msg: resultado.msg
        });
    } catch (error) {
        console.error('Error en restablecerContrasena:', error);
        const status = error.statusCode || 401;
        return res.status(status).json({ ok: false, msg: error.message || 'El token es inválido o ha expirado. Inténtalo de nuevo.' });
    }
};

exports.verificarProveedor = async (req, res) => {
    const { correo } = req.query;

    if (!correo) {
        return res.status(400).json({ ok: false, msg: 'El correo es requerido' });
    }

    try {
        const resultado = await authService.verificarProveedorService(correo);
        return res.status(200).json({ ok: true, esGoogle: resultado.esGoogle });
    } catch (error) {
        console.error('Error al verificar proveedor:', error);
        const status = error.statusCode || 500;
        return res.status(status).json({ ok: false, msg: error.message || 'Error en el servidor al verificar proveedor' });
    }
};