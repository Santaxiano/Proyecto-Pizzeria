import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';

const SALT_ROUNDS = 10; 
export const registro = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y password son obligatorios' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, email`,
      [nombre, email, hash]
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
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password son obligatorios' });
    }

    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    const usuario = rows[0];

    const passwordOk = usuario && (await bcrypt.compare(password, usuario.password));

    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email }, 
      env.JWT_SECRET, 
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    
    res.json({ token });
  } catch (err) {
    next(err);
  }
};

export const perfil = (req, res) => {
  res.json(req.usuario);
};
