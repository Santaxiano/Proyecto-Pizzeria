const TIPOS_VALIDOS = ['delivery', 'retiro', 'mesa'];
const FORMAS_PAGO = ['efectivo', 'mercadopago'];

const esTextoConContenido = (valor) => typeof valor === 'string' && valor.trim() !== '';
const esEnteroPositivo = (valor) => Number.isInteger(valor) && valor > 0;
const esOpcional = (valor) => valor === undefined || valor === null;
const esTextoOpcional = (valor, largoMax) =>
  esOpcional(valor) || (typeof valor === 'string' && valor.length <= largoMax);

const itemValido = (item) =>
  item &&
  esEnteroPositivo(item.productoId) &&
  esEnteroPositivo(item.cantidad) &&
  (esOpcional(item.tamano) || esTextoConContenido(item.tamano)) &&
  (esOpcional(item.segundoSaborId) || esEnteroPositivo(item.segundoSaborId));

// Valida la forma del body de POST /pedidos. Precios, total y disponibilidad
// los resuelve el controller consultando la base.
export const validarPedido = (req, res, next) => {
  const { cliente, telefono, tipo, direccionMesa, items, horario, notas, formaPago } = req.body || {};

  if (!esTextoConContenido(cliente)) {
    return res.status(400).json({ error: "El campo 'cliente' es obligatorio" });
  }

  if (!esTextoConContenido(telefono)) {
    return res.status(400).json({ error: "El campo 'telefono' es obligatorio" });
  }

  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({ error: `El tipo debe ser ${TIPOS_VALIDOS.join(', ')}` });
  }

  // Delivery necesita la dirección y mesa el número de mesa; en retiro es opcional.
  if (tipo !== 'retiro' && !esTextoConContenido(direccionMesa)) {
    return res.status(400).json({ error: `El campo 'direccionMesa' es obligatorio para pedidos de tipo ${tipo}` });
  }

  if (!esTextoOpcional(direccionMesa, 255)) {
    return res.status(400).json({ error: "El campo 'direccionMesa' debe ser texto de hasta 255 caracteres" });
  }

  if (!esTextoOpcional(horario, 100)) {
    return res.status(400).json({ error: "El campo 'horario' debe ser texto de hasta 100 caracteres" });
  }

  if (!esTextoOpcional(notas, 255)) {
    return res.status(400).json({ error: "El campo 'notas' debe ser texto de hasta 255 caracteres" });
  }

  if (!esOpcional(formaPago) && !FORMAS_PAGO.includes(formaPago)) {
    return res.status(400).json({ error: `La forma de pago debe ser ${FORMAS_PAGO.join(' o ')}` });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El pedido debe tener al menos un producto' });
  }

  if (!items.every(itemValido)) {
    return res.status(400).json({
      error: 'Cada item debe tener productoId y cantidad enteros mayores a 0 (tamano y segundoSaborId son opcionales)',
    });
  }

  next();
};
