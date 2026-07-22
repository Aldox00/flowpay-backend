const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper interno para firmar los tokens JWT
const generarJWT = (payload, expiresIn = '30d') => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET || 'firma_secreta_flowpay',
        { expiresIn }
    );
};

// 1. Registro de usuario
exports.registrarUsuario = async ({ nombre, correo, contrasena }) => {
    const userExists = await User.findByCorreo(correo);
    if (userExists) {
        const error = new Error('El correo ya está registrado');
        error.statusCode = 400;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedContrasena = await bcrypt.hash(contrasena, salt);

    await User.create({ nombre, correo, contrasena: hashedContrasena });
    return { msg: 'Usuario registrado con éxito' };
};

// 2. Login tradicional
exports.loginUsuario = async ({ correo, contrasena }) => {
    const user = await User.findByCorreo(correo);
    if (!user) {
        const error = new Error('Credenciales incorrectas (Correo no encontrado)');
        error.statusCode = 400;
        throw error;
    }

    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) {
        const error = new Error('Credenciales incorrectas (Contraseña incorrecta)');
        error.statusCode = 400;
        throw error;
    }

    const token = generarJWT({ id: user.id, nombre: user.nombre });

    return {
        token,
        usuario: {
            id: user.id,
            nombre: user.nombre,
            correo: user.correo,
            recordatorio_cierre: user.recordatorio_cierre,
            hora_recordatorio: user.hora_recordatorio
        }
    };
};

// 3. Login con Google OAuth2
exports.googleLoginService = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findByCorreo(email);

    if (!user) {
        try {
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
            console.error('❌ ERROR REAL EN BD AL CREAR USUARIO GOOGLE:', dbError);
            const error = new Error('Error interno en la base de datos al registrar la nueva cuenta de Google.');
            error.statusCode = 500;
            throw error;
        }
    }

    const token = generarJWT({ id: user.id, nombre: user.nombre });

    return {
        token,
        usuario: {
            id: user.id,
            nombre: user.nombre,
            correo: user.correo,
            recordatorio_cierre: user.recordatorio_cierre,
            hora_recordatorio: user.hora_recordatorio
        }
    };
};

// 4. Solicitar Código de Recuperación y enviar vía Brevo API
exports.solicitarRecuperacionService = async (correo) => {
    const user = await User.findByCorreo(correo);
    if (!user) {
        const error = new Error('No se encontró ningún usuario con este correo.');
        error.statusCode = 400;
        throw error;
    }

    const codigoSecreto = Math.floor(100000 + Math.random() * 900000).toString();
    const tiempoExpiracion = new Date(Date.now() + 15 * 60 * 1000);

    if (User.updateRecoveryCode) {
        await User.updateRecoveryCode(user.id, codigoSecreto, tiempoExpiracion);
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.SMTP_PASS,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: "FlowPay Soporte", email: "josuealdo510@gmail.com" },
                to: [{ email: user.correo }],
                subject: "🔢 Código de recuperación de contraseña - FlowPay",
                htmlContent: `
                    <div style="font-family: Arial, sans-serif; background-color: #111A2E; color: #ffffff; padding: 40px; border-radius: 20px; max-width: 450px; margin: auto; border: 1px solid rgba(255,255,255,0.1);">
                        <h2 style="color: #1DB954; text-align: center; font-size: 26px; margin-bottom: 5px;">FlowPay</h2>
                        <p style="font-size: 15px; color: #e0e0e0; text-align: center;">Hola, <strong>${user.nombre}</strong></p>
                        <p style="font-size: 13px; color: #a0a0a0; text-align: center; line-height: 20px;">Recibimos una solicitud para restablecer tu acceso. Introduce este código de seguridad de 6 dígitos dentro de la aplicación para verificar tu cuenta:</p>
                        
                        <div style="background-color: rgba(29, 185, 84, 0.08); border: 2px dashed #1DB954; border-radius: 12px; padding: 15px; text-align: center; margin: 25px 0;">
                            <span style="font-size: 34px; font-weight: bold; letter-spacing: 6px; color: #1DB954;">${codigoSecreto}</span>
                        </div>
                        
                        <p style="font-size: 11px; color: #666666; text-align: center; margin-top: 20px;">Este código expirará automáticamente en 15 minutos.</p>
                    </div>
                `
            })
        });

        if (response.ok) {
            console.log(`📧 ¡Correo enviado vía API a: ${user.correo}!`);
        } else {
            const errData = await response.text();
            console.error('❌ Brevo rechazó la petición API:', errData);
        }
    } catch (mailError) {
        console.error('❌ Error de red con API de Brevo:', mailError.message);
    }

    console.log(`\n=== 🔢 CÓDIGO GUARDADO EN SERVIDOR: ${codigoSecreto} ===\n`);

    return { correo: user.correo };
};

// 5. Verificar Código de Recuperación
exports.verificarCodigoService = async (correo, codigoIngresado) => {
    const user = await User.findByCorreo(correo);
    if (!user) {
        const error = new Error('Usuario no encontrado.');
        error.statusCode = 400;
        throw error;
    }

    if (!user.codigo_recuperacion || user.codigo_recuperacion !== codigoIngresado.trim()) {
        const error = new Error('El código de verificación es incorrecto.');
        error.statusCode = 400;
        throw error;
    }

    if (user.codigo_expiracion && new Date() > new Date(user.codigo_expiracion)) {
        const error = new Error('El código ha expirado. Solicita uno nuevo.');
        error.statusCode = 400;
        throw error;
    }

    const tokenAutorizado = generarJWT(
        { id: user.id, correo: user.correo, verificado: true },
        '10m'
    );

    return { token: tokenAutorizado };
};

// 6. Restablecer Contraseña
exports.restablecerContrasenaService = async (token, nuevaContrasena) => {
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'firma_secreta_flowpay');
    } catch (err) {
        const error = new Error('El token es inválido o ha expirado. Inténtalo de nuevo.');
        error.statusCode = 401;
        throw error;
    }

    if (!decoded.verificado) {
        const error = new Error('Acceso no autorizado para reestablecer credenciales.');
        error.statusCode = 401;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedContrasena = await bcrypt.hash(nuevaContrasena, salt);

    await User.updateContrasena(decoded.id, hashedContrasena);

    if (User.updateRecoveryCode) {
        await User.updateRecoveryCode(decoded.id, null, null);
    }

    return { msg: 'Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión.' };
};

exports.verificarProveedorService = async (correo) => {
    const user = await User.findByCorreo(correo);
    if (!user) {
        return { esGoogle: false };
    }
    return { esGoogle: user.proveedor_auth === 'google' };
};