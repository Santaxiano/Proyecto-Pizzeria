// Token estricto para comparar nombres de variantes sin acentos, mayúsculas ni espacios.
const tokenVariante = (nombre) =>
  nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '');

const esVarianteValida = (variante) => (
  variante !== null &&
  typeof variante === 'object' &&
  !Array.isArray(variante) &&
  typeof variante.nombre === 'string' &&
  variante.nombre.trim() !== '' &&
  Number.isInteger(variante.precio) &&
  variante.precio >= 0
);

const variantesValidas = (variantes) => {
  if (!Array.isArray(variantes) || variantes.length === 0) return false;
  if (!variantes.every(esVarianteValida)) return false;

  const nombres = new Set();
  for (const variante of variantes) {
    const token = tokenVariante(variante.nombre);
    if (nombres.has(token)) return false;
    nombres.add(token);
  }
  return true;
};

const MAX_TOPPINGS = 20;
const LARGO_MAX_NOMBRE_TOPPING = 100;

const esToppingValido = (topping) => (
  topping !== null &&
  typeof topping === 'object' &&
  !Array.isArray(topping) &&
  typeof topping.nombre === 'string' &&
  topping.nombre.trim() !== '' &&
  topping.nombre.trim().length <= LARGO_MAX_NOMBRE_TOPPING &&
  Number.isInteger(topping.precio) &&
  topping.precio >= 0
);

// Los toppings son una lista de extras propios de cada comida. No se permite
// repetir el mismo nombre (sin importar acentos, mayúsculas o espacios).
const toppingsValidos = (toppings) => {
  if (!Array.isArray(toppings) || toppings.length > MAX_TOPPINGS) return false;
  if (!toppings.every(esToppingValido)) return false;

  const nombres = new Set();
  for (const topping of toppings) {
    const token = tokenVariante(topping.nombre);
    if (nombres.has(token)) return false;
    nombres.add(token);
  }
  return true;
};

const camposProducto = {
  nombre: { requerido: true, validar: (value) => typeof value === 'string' && value.trim() !== '' },
  categoria: { requerido: true, validar: (value) => typeof value === 'string' && value.trim() !== '' },
  variantes: { requerido: true, validar: variantesValidas },
  // Opcional: si no viene en un PUT, los toppings actuales no se tocan.
  toppings: { requerido: false, validar: toppingsValidos },
  permiteMitad: { requerido: false, validar: (value) => value === null || value === undefined || typeof value === 'boolean' },
  stock: { requerido: false, validar: (value) => value === null || value === undefined || (Number.isInteger(value) && value >= 0) },
  destacado: { requerido: false, validar: (value) => value === null || value === undefined || typeof value === 'boolean' },
  imagen: { requerido: false, validar: (value) => value === null || value === undefined || typeof value === 'string' },
  descripcion: { requerido: false, validar: (value) => value === null || value === undefined || typeof value === 'string' },
  // Opcional: si no viene, la receta del producto no se toca. [] deja al producto sin ingredientes.
  ingredientesIds: {
    requerido: false,
    validar: (value) => Array.isArray(value) && value.every((id) => Number.isInteger(id) && id > 0),
  },
};

export const validarProducto = (req, res, next) => {
  const body = req.body || {};

  for (const [campo, reglas] of Object.entries(camposProducto)) {
    const valor = body[campo];

    if (reglas.requerido && (valor === undefined || valor === null || valor === '')) {
      return res.status(400).json({ error: `El campo '${campo}' es obligatorio` });
    }

    if (valor !== undefined && !reglas.validar(valor)) {
      return res.status(400).json({ error: `El campo '${campo}' no tiene un formato o tipo válido` });
    }
  }

  // Los toppings son exclusivos de las comidas: pizzas y bebidas no los admiten.
  if (Array.isArray(body.toppings) && body.toppings.length > 0 && body.categoria?.trim() !== 'comidas') {
    return res.status(400).json({ error: 'Los toppings solo se pueden cargar en productos de categoría comidas' });
  }

  next();
};
