import { pool } from '../../config/db.js';

export const listar = async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos WHERE id = $1', [req.idParseado]);
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  const body = req.body;

  try {
    const values = [
      body.nombre.trim(),
      body.precio,
      body.categoria.trim(),
      body.tamanos ?? null,
      body.permiteMitad ?? null,
      body.stock ?? null,
      body.destacado ?? null,
      body.imagen ?? null,
      body.descripcion ?? null,
    ];

    const { rows } = await pool.query(
      `INSERT INTO productos (nombre, precio, categoria, tamanos, permitemitad, stock, destacado, imagen, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      values
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  const id = req.idParseado;
  const body = req.body;

  try {
    const values = [
      body.nombre.trim(),
      body.precio,
      body.categoria.trim(),
      body.tamanos ?? null,
      body.permiteMitad ?? null,
      body.stock ?? null,
      body.destacado ?? null,
      body.imagen ?? null,
      body.descripcion ?? null,
      id
    ];

    const { rows } = await pool.query(
      `UPDATE productos 
       SET nombre = $1, precio = $2, categoria = $3, tamanos = $4, permitemitad = $5, stock = $6, destacado = $7, imagen = $8, descripcion = $9 
       WHERE id = $10 
       RETURNING *`,
      values
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM productos WHERE id = $1', [req.idParseado]);
    if (rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};