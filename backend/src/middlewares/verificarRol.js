// Se usa siempre después de verificarToken, que es quien carga req.usuario
export const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'Falta el token' });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tenés permisos para realizar esta acción' });
    }

    next();
  };
};
