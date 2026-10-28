import { pool } from '../../config/db.js';

export const listar = async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM mesas ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM mesas WHERE id = $1', [req.idParseado]);
    if (rows.length === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  const { capacidad, estado } = req.body;

  try {
    const { rows } = await pool.query(
      'INSERT INTO mesas (capacidad, estado) VALUES ($1, $2) RETURNING *',
      [capacidad, estado.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  const { capacidad, estado } = req.body;

  try {
    const { rows } = await pool.query(
      'UPDATE mesas SET capacidad = $1, estado = $2 WHERE id = $3 RETURNING *',
      [capacidad, estado.trim(), req.idParseado]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM mesas WHERE id = $1', [req.idParseado]);
    if (rowCount === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};