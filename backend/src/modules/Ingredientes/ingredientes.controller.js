import { pool } from '../../config/db.js';

export const listar = async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM ingredientes ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM ingredientes WHERE id = $1', [req.idParseado]);
    if (rows.length === 0) return res.status(404).json({ error: 'Ingrediente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  const { nombre, activo } = req.body;

  try {
    const { rows } = await pool.query(
      'INSERT INTO ingredientes (nombre, activo) VALUES ($1, $2) RETURNING *',
      [nombre.trim(), activo]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  const { nombre, activo } = req.body;

  try {
    const { rows } = await pool.query(
      'UPDATE ingredientes SET nombre = $1, activo = $2 WHERE id = $3 RETURNING *',
      [nombre.trim(), activo, req.idParseado]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Ingrediente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM ingredientes WHERE id = $1', [req.idParseado]);
    if (rowCount === 0) return res.status(404).json({ error: 'Ingrediente no encontrado' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};