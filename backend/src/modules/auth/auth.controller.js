import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../../config/db.js';
import { env } from '../../config/env.js';

const SALT_ROUNDS = 10; 
const ROLES_VALIDOS = ['empleado', 'administrador'];

export const registro = async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const { nombre, email, password } = body;
    const rol = body.rol ?? 'empleado';
    if (
      typeof nombre !== 'string' || nombre.trim() === '' ||
      typeof email !== 'string' || email.trim() === '' ||
      typeof password !== 'string' || password === ''
    ) {
      return res.status(400).json({ error: 'Nombre, email y password son obligatorios' });
    }
    if (!ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({ error: 'El rol debe ser empleado o administrador' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, rol, password)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, rol`,
      [nombre.trim(), email.trim().toLowerCase(), rol, hash]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
      return res.status(400).json({ error: 'Email y password son obligatorios' });
    }

    // Sin distinguir mayúsculas: así también entran usuarios viejos guardados con mayúsculas
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    const usuario = rows[0];

    const passwordOk = usuario && (await bcrypt.compare(password, usuario.password));

    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }, 
      env.JWT_SECRET, 
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    res.json({ 
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (err) {
    next(err);
  }
};

export const perfil = (req, res) => {
  res.json(req.usuario);
};