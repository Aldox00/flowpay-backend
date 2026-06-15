const Producto = require('../models/productoModel');

exports.crearProducto = async (req, res) => {
    const { usuario_id, nombre, precio } = req.body;

    if (!usuario_id || !nombre || precio === undefined) {
        return res.status(400).json({ ok: false, msg: 'Todos los campos (usuario_id, nombre, precio) son obligatorios.' });
    }

    try {
        const result = await Producto.create({ usuario_id, nombre, precio });
        return res.status(201).json({
            ok: true,
            msg: 'Producto agregado al catálogo con éxito.',
            productoId: result.insertId
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        return res.status(500).json({ ok: false, msg: 'Error en el servidor al registrar el producto.' });
    }
};

exports.obtenerProductos = async (req, res) => {
    const { usuario_id } = req.params;

    try {
        const productos = await Producto.findByUsuarioId(usuario_id);
        return res.status(200).json({
            ok: true,
            productos
        });
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return res.status(500).json({ ok: false, msg: 'Error en el servidor al empaquetar el catálogo.' });
    }
};