export const validarId = (req, res, next) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: 'El ID proporcionado no es un número válido' });
  }

  req.idParseado = id; 
  next();
};