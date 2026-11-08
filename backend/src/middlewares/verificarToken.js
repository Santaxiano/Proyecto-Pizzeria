import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { pool } from '../config/db.js'; // Agregamos la conexión a la BD

// Transformamos la función a async para poder usar await con la base de datos
export const verificarToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Falta el token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);

    // Validación contra la base de datos: ¿el usuario sigue existiendo?
    const { rowCount } = await pool.query('SELECT 1 FROM usuarios WHERE id = $1', [payload.id]);
    
    if (rowCount === 0) {
      return res.status(401).json({ error: 'La cuenta de usuario fue eliminada' });
    }

    req.usuario = {
      id: payload.id,
      nombre: payload.nombre,
      email: payload.email,
      rol: payload.rol,
    };
    next();
  } catch (err) {
    const mensaje = err.name === 'TokenExpiredError' ? 'Token vencido' : 'Token inválido';
    return res.status(401).json({ error: mensaje });
  }
};