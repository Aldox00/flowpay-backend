const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.registrar = async (req, res) => {
    const { nombre, correo, contrasena } = req.body;

    if (!nombre || !correo || !contrasena) {
        return res.status(400).json({ ok: false, msg: 'Todos los campos son obligatorios' });
    }

    try {
        const userExists = await User.findByCorreo(correo);
        if (userExists) {
            return res.status(400).json({ ok: false, msg: 'El correo ya está registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedContrasena = await bcrypt.hash(contrasena, salt);

        // 🟢 Mantenemos el comportamiento por defecto de la base de datos ('manual')
        await User.create({ nombre, correo, contrasena: hashedContrasena });
        
        return res.status(201).json({ ok: true, msg: 'Usuario registrado con éxito' });

    } catch (error) {
        console.error('Error en el registro:', error);
        return res.status(500).json({ ok: false, msg: 'Error en el servidor al registrar usuario' });
    }
};

exports.login = async (req, res) => {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
        return res.status(400).json({ ok: false, msg: 'Por favor, ingresa todos los campos' });
    }

    try {
        const user = await User.findByCorreo(correo);
        if (!user) {
            return res.status(400).json({ ok: false, msg: 'Credenciales incorrectas (Correo no encontrado)' });
        }

        // 🟢 VALIDACIÓN QUIRÚRGICA: Si se registró con Google, bloqueamos el login manual
        if (user.proveedor_auth === 'google') {
            return res.status(400).json({ 
                ok: false, 
                msg: 'Esta cuenta utiliza autenticación de Google. Por favor, inicia sesión con el botón de Google.' 
            });
        }

        const isMatch = await bcrypt.compare(contrasena, user.contrasena);
        if (!isMatch) {
            return res.status(400).json({ ok: false, msg: 'Credenciales incorrectas (Contraseña incorrecta)' });
        }

        const token = jwt.sign(
            { id: user.id, nombre: user.nombre },
            process.env.JWT_SECRET || 'firma_secreta_flowpay',
            { expiresIn: '30d' }
        );

        return res.status(200).json({
            ok: true,
            token,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                correo: user.correo,
                recordatorio_cierre: user.recordatorio_cierre,
                hora_recordatorio: user.hora_recordatorio
            }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        return res.status(500).json({ ok: false, msg: 'Error en el servidor al iniciar sesión' });
    }
};

exports.googleLogin = async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ ok: false, msg: 'El token de Google es obligatorio.' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID, 
        });
        
        const payload = ticket.getPayload();
        const { email, name } = payload; 

        let user = await User.findByCorreo(email);
        
        if (!user) {
            try {
                // 🟢 Intentamos registrar al usuario nuevo automáticamente usando tu modelo original
                const newUserId = await User.createGoogleUser(name, email);
                user = { 
                    id: newUserId, 
                    nombre: name, 
                    correo: email, 
                    recordatorio_cierre: 0, 
                    hora_recordatorio: null,
                    proveedor_auth: 'google' 
                };
            } catch (dbError) {
                // 🔴 Si la base de datos de Aiven rebota el registro, aquí atrapamos el porqué real de forma limpia
                console.error('❌ ERROR REAL EN BD AL CREAR USUARIO GOOGLE:', dbError);
                return res.status(500).json({ 
                    ok: false, 
                    msg: 'Error interno en la base de datos al registrar la nueva cuenta de Google.',
                    error: dbError.message 
                });
            }
        }

        const token = jwt.sign(
            { id: user.id, nombre: user.nombre },
            process.env.JWT_SECRET || 'firma_secreta_flowpay',
            { expiresIn: '30d' }
        );

        return res.status(200).json({
            ok: true,
            token,
            usuario: {
                id: user.id,
                nombre: user.nombre,
                correo: user.correo,
                recordatorio_cierre: user.recordatorio_cierre,
                hora_recordatorio: user.hora_recordatorio
            }
        });

    } catch (error) {
        // 🔴 Este bloque ahora sólo se ejecuta si el token de Google de verdad es inválido o falló la verificación
        console.error('Error en Google Auth (Token):', error);
        return res.status(401).json({ ok: false, msg: 'Token de Google inválido o expirado.' });
    }
};

exports.solicitarRecuperacion = async (req, res) => {
    const { correo } = req.body;

    if (!correo) {
        return res.status(400).json({ ok: false, msg: 'El correo electrónico es requerido.' });
    }

    try {
        const user = await User.findByCorreo(correo);
        if (!user) {
            return res.status(400).json({ ok: false, msg: 'No se encontró ningún usuario con este correo.' });
        }

        // 🟢 VALIDACIÓN EXTRA: Tampoco dejamos recuperar contraseña a una cuenta de Google
        if (user.proveedor_auth === 'google') {
            return res.status(400).json({ 
                ok: false, 
                msg: 'Esta cuenta está registrada con Google. No es necesario restablecer contraseña.' 
            });
        }

        const tokenRecuperacion = jwt.sign(
            { id: user.id, correo: user.correo },
            process.env.JWT_SECRET || 'firma_secreta_flowpay',
            { expiresIn: '15m' }
        );

        console.log(`\n=== TOKEN DE RECUPERACIÓN GENERADO ===\n${tokenRecuperacion}\n======================================\n`);

        return res.status(200).json({
            ok: true,
            msg: 'Token de recuperación generado con éxito.',
            token: tokenRecuperacion
        });

    } catch (error) {
        console.error('Error en solicitarRecuperacion:', error);
        return res.status(500).json({ ok: false, msg: 'Error interno en el servidor al solicitar recuperación.' });
    }
};

exports.restablecerContrasena = async (req, res) => {
    const { token, nuevaContrasena } = req.body;

    if (!token || !nuevaContrasena) {
        return res.status(400).json({ ok: false, msg: 'El token y la nueva contraseña son obligatorios.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'firma_secreta_flowpay');
        
        const salt = await bcrypt.genSalt(10);
        const hashedContrasena = await bcrypt.hash(nuevaContrasena, salt);

        await User.updateContrasena(decoded.id, hashedContrasena);

        return res.status(200).json({
            ok: true,
            msg: 'Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión.'
        });

    } catch (error) {
        console.error('Error en restablecerContrasena:', error);
        return res.status(401).json({ ok: false, msg: 'El token es inválido o ha expirado.' });
    }
};