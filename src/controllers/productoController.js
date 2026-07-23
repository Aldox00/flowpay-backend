const productoService = require('../services/productoService');

exports.crearProducto = async (req, res) => {
    const { usuario_id, nombre, precio, precio_venta } = req.body;
    const precioVenta = precio_venta ?? precio;
    
    if (!usuario_id || !nombre || precioVenta === undefined) {
        return res.status(400).json({ ok: false, msg: 'Datos del producto incompletos.' });
    }

    try {
        const resultado = await productoService.crearProductoService({ usuario_id, nombre, precio: precioVenta });
        return res.status(201).json({ ok: true, msg: 'Producto creado exitosamente.', id: resultado.id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, msg: 'Error al crear el producto.' });
    }
};

exports.obtenerProductosActivos = async (req, res) => {
    const { usuario_id } = req.params;

    try {
        const resultado = await productoService.obtenerProductosActivosService(usuario_id);
        return res.status(200).json({ ok: true, productos: resultado.productos });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, msg: 'Error al obtener productos activos.' });
    }
};

exports.obtenerTodoElCatalogo = async (req, res) => {
    const { usuario_id } = req.params;

    try {
        const resultado = await productoService.obtenerTodoElCatalogoService(usuario_id);
        return res.status(200).json({ ok: true, productos: resultado.productos });
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
        const resultado = await productoService.actualizarEstadoProductoService(id, activo);
        return res.status(200).json({ ok: true, msg: resultado.msg });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, msg: 'Error al actualizar el estado del producto.' });
    }
};