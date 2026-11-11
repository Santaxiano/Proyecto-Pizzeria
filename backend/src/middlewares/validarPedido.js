const TIPOS_VALIDOS = ['delivery', 'retiro', 'mesa'];
const FORMAS_PAGO = ['efectivo', 'mercadopago'];

const esTextoConContenido = (valor) => typeof valor === 'string' && valor.trim() !== '';
const esEnteroPositivo = (valor) => Number.isInteger(valor) && valor > 0;
const esOpcional = (valor) => valor === undefined || valor === null;
const esCoordenada = (valor, maximo) => typeof valor === 'number' && Number.isFinite(valor) && Math.abs(valor) <= maximo;
const esTextoOpcional = (valor, largoMax) =>
  esOpcional(valor) || (typeof valor === 'string' && valor.length <= largoMax);

const MAX_TOPPINGS = 20;
const LARGO_MAX_NOMBRE_TOPPING = 100;

const tokenTopping = (nombre) =>
  nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '');

// El front puede mandar solo los nombres o los objetos { nombre, precio }.
// El precio que venga en el objeto se ignora: el controller usa el de la base.
const nombreTopping = (topping) => {
  if (typeof topping === 'string') return topping;
  if (topping && typeof topping === 'object' && !Array.isArray(topping)) return topping.nombre;
  return null;
};

const toppingsValidos = (toppings) => {
  if (esOpcional(toppings)) return true;
  if (!Array.isArray(toppings) || toppings.length > MAX_TOPPINGS) return false;

  const nombres = new Set();
  for (const topping of toppings) {
    const nombre = nombreTopping(topping);
    if (typeof nombre !== 'string' || nombre.trim() === '') return false;
    if (nombre.trim().length > LARGO_MAX_NOMBRE_TOPPING) return false;

    const token = tokenTopping(nombre);
    if (nombres.has(token)) return false;
    nombres.add(token);
  }
  return true;
};

const itemValido = (item) =>
  item &&
  esEnteroPositivo(item.productoId) &&
  esEnteroPositivo(item.cantidad) &&
  (esOpcional(item.tamano) || esTextoConContenido(item.tamano)) &&
  (esOpcional(item.segundoSaborId) || esEnteroPositivo(item.segundoSaborId)) &&
  toppingsValidos(item.toppings);

// Valida la forma del body de POST /pedidos. Precios, total y disponibilidad
// los resuelve el controller consultando la base.
export const validarPedido = (req, res, next) => {
  const { cliente, telefono, tipo, direccionMesa, items, horario, notas, formaPago } = req.body || {};

  if (!TIPOS_VALIDOS.includes(tipo)) {
    return res.status(400).json({ error: `El tipo debe ser ${TIPOS_VALIDOS.join(', ')}` });
  }

  // Los pedidos de mesa se identifican por el número de mesa: el gestor puede
  // crearlos sin nombre ni teléfono. Delivery y retiro siguen exigiendo ambos.
  if (tipo !== 'mesa') {
    if (!esTextoConContenido(cliente)) {
      return res.status(400).json({ error: "El campo 'cliente' es obligatorio" });
    }

    if (!esTextoConContenido(telefono)) {
      return res.status(400).json({ error: "El campo 'telefono' es obligatorio" });
    }
  }

  if (!esTextoOpcional(cliente, 255)) {
    return res.status(400).json({ error: "El campo 'cliente' debe ser texto de hasta 255 caracteres" });
  }

  if (!esTextoOpcional(telefono, 255)) {
    return res.status(400).json({ error: "El campo 'telefono' debe ser texto de hasta 255 caracteres" });
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

  // Ubicación del mapa: opcional, pero si viene tienen que venir las dos coordenadas y ser válidas
  const { lat, lng } = req.body;
  const hayUbicacion = !esOpcional(lat) || !esOpcional(lng);
  if (hayUbicacion && !(esCoordenada(lat, 90) && esCoordenada(lng, 180))) {
    return res.status(400).json({ error: 'La ubicación debe tener lat y lng numéricas válidas' });
  }
  // Un cliente (sin token) que pide delivery tiene que marcar su domicilio en el mapa.
  // Las comandas del gestor (con token) no tienen mapa, así que para ellas es opcional.
  if (tipo === 'delivery' && !hayUbicacion && !req.usuario) {
    return res.status(400).json({ error: 'Marcá tu domicilio en el mapa para hacer un pedido con delivery' });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'El pedido debe tener al menos un producto' });
  }

  if (!items.every(itemValido)) {
    return res.status(400).json({
      error: 'Cada item debe tener productoId y cantidad enteros mayores a 0 (tamano, segundoSaborId y toppings son opcionales; los toppings no pueden repetirse)',
    });
  }

  next();
};
