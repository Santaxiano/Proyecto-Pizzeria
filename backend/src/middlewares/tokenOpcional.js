import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Para rutas públicas que se comportan distinto si quien llama es del personal.
// Si viene un token válido carga req.usuario; si no viene (o no es válido) sigue como anónimo.
// Ej: POST /pedidos lo usan los clientes (sin login) y las comandas del gestor (con token).
export const tokenOpcional = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = jwt.verify(authHeader.split(' ')[1], env.JWT_SECRET);
      req.usuario = { id: payload.id, nombre: payload.nombre, email: payload.email, rol: payload.rol };
    } catch {
      // token vencido o inválido: se trata como cliente anónimo
    }
  }
  next();
};
