const ESTADOS_VALIDOS = ['Pendiente', 'Confirmada', 'Finalizada'];

export const validarEstadoPedido = (req, res, next) => {
  const { estado } = req.body || {};

  if (!ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({ error: 'El estado debe ser Pendiente, Confirmada o Finalizada' });
  }

  next();
};