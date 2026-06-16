const Producto = require('../models/productoModel');

exports.crearProducto = async (req, res) => {
    const { usuario_id, nombre, precio } = req.body;
    if (!usuario_id || !nombre || precio === undefined) {
        return res.status(400).json({ ok: false, msg: 'Datos del producto incompletos.' });
    }
    try {
        const result = await Producto.create({ usuario_id, nombre, precio });
        return res.status(201).json({ ok: true, msg: 'Producto creado exitosamente.', id: result.insertId });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, msg: 'Error al crear el producto.' });
    }
};

exports.obtenerProductosActivos = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const productos = await Producto.findActivosByUsuarioId(usuario_id);
        return res.status(200).json({ ok: true, productos });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, msg: 'Error al obtener productos activos.' });
    }
};

exports.obtenerTodoElCatalogo = async (req, res) => {
    const { usuario_id } = req.params;
    try {
        const productos = await Producto.findAllByUsuarioId(usuario_id);
        return res.status(200).json({ ok: true, productos });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, msg: 'Error al obtener el catálogo completo.' });
    }
};

exports.actualizarEstadoProducto = async (req, res) => {
    const { id, activo } = req.body; // activo será 1 o 0
    if (id === undefined || activo === undefined) {
        return res.status(400).json({ ok: false, msg: 'ID y estado activo son requeridos.' });
    }
    try {
        await Producto.updateEstado(id, activo);
        return res.status(200).json({ ok: true, msg: 'Estado del producto actualizado correctamente.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, msg: 'Error al actualizar el estado del producto.' });
    }
};