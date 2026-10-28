export const validarMesa = (req, res, next) => {
  const { capacidad, estado } = req.body || {};

  if (!Number.isInteger(capacidad) || capacidad <= 0) {
    return res.status(400).json({ error: 'La capacidad debe ser un entero positivo' });
  }

  if (typeof estado !== 'string' || estado.trim() === '') {
    return res.status(400).json({ error: 'El estado es obligatorio' });
  }

  next();
};