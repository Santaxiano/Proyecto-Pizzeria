export const validarIngrediente = (req, res, next) => {
  const { nombre, activo } = req.body || {};

  if (typeof nombre !== 'string' || nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  if (typeof activo !== 'boolean') {
    return res.status(400).json({ error: 'El campo activo debe ser booleano' });
  }

  next();
};