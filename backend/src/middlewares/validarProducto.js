const camposProducto = {
  nombre: { requerido: true, validar: (value) => typeof value === 'string' && value.trim() !== '' },
  precio: { requerido: true, validar: (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 },
  categoria: { requerido: true, validar: (value) => typeof value === 'string' && value.trim() !== '' },
  tamanos: {
    requerido: false,
    validar: (value) => value === null || value === undefined || (Array.isArray(value) && value.every((item) => typeof item === 'string')),
  },
  permiteMitad: { requerido: false, validar: (value) => value === null || value === undefined || typeof value === 'boolean' },
  stock: { requerido: false, validar: (value) => value === null || value === undefined || (Number.isInteger(value) && value >= 0) },
  destacado: { requerido: false, validar: (value) => value === null || value === undefined || typeof value === 'boolean' },
  imagen: { requerido: false, validar: (value) => value === null || value === undefined || typeof value === 'string' },
  descripcion: { requerido: false, validar: (value) => value === null || value === undefined || typeof value === 'string' },
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

  next();
};