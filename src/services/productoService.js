const Producto = require('../models/productoModel');

exports.crearProductoService = async ({ usuario_id, nombre, precio, precio_venta }) => {
    const precioFinal = precio_venta ?? precio;
    const result = await Producto.create({ usuario_id, nombre, precio: precioFinal });
    return {
        id: result.insertId
    };
};

exports.obtenerProductosActivosService = async (usuario_id) => {
    const productos = await Producto.findActivosByUsuarioId(usuario_id);
    return { productos };
};

exports.obtenerTodoElCatalogoService = async (usuario_id) => {
    const productos = await Producto.findAllByUsuarioId(usuario_id);
    return { productos };
};

exports.actualizarEstadoProductoService = async (id, activo) => {
    await Producto.updateEstado(id, activo);
    return {
        msg: 'Estado del producto actualizado correctamente.'
    };
};