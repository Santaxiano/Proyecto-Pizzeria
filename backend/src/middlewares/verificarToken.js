import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization; 

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Falta el token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    req.usuario = { id: payload.id, nombre: payload.nombre, email: payload.email };
    next(); 
  } catch (err) {
    const mensaje = err.name === 'TokenExpiredError' ? 'Token vencido' : 'Token inválido';
    return res.status(401).json({ error: mensaje });
  }
};
