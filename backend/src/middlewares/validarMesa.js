// "Reservada" no se guarda: se calcula a partir de las reservas (ver mesas.controller.js)
const ESTADOS_VALIDOS = ['Libre', 'Ocupada'];

export const validarMesa = (req, res, next) => {
  const { capacidad, estado } = req.body || {};

  if (!Number.isInteger(capacidad) || capacidad <= 0) {
    return res.status(400).json({ error: 'La capacidad debe ser un entero positivo' });
  }

  if (typeof estado !== 'string' || !ESTADOS_VALIDOS.includes(estado.trim())) {
    return res.status(400).json({ error: `El estado debe ser ${ESTADOS_VALIDOS.join(' u ')}` });
  }

  next();
};
