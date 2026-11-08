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

// Productos cuya receta incluye el ingrediente (tabla producto_ingrediente).
const buscarProductosQueLoUsan = async (ingredienteId) => {
  const { rows } = await pool.query(
    `SELECT p.id, p.nombre, p.categoria
     FROM productos p
     JOIN producto_ingrediente pi ON pi.producto_id = p.id
     WHERE pi.ingrediente_id = $1
     ORDER BY p.id`,
    [ingredienteId]
  );
  return rows;
};

export const listarProductos = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('SELECT 1 FROM ingredientes WHERE id = $1', [req.idParseado]);
    if (rowCount === 0) return res.status(404).json({ error: 'Ingrediente no encontrado' });

    res.json(await buscarProductosQueLoUsan(req.idParseado));
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    // Si lo usa algún producto, no se borra: se sugiere desactivarlo para no romper recetas.
    const productos = await buscarProductosQueLoUsan(req.idParseado);
    if (productos.length > 0) {
      return res.status(409).json({
        error: `No se puede eliminar el ingrediente porque lo usan: ${productos.map((p) => p.nombre).join(', ')}. Desactivalo en su lugar.`,
        productos,
      });
    }

    const { rowCount } = await pool.query('DELETE FROM ingredientes WHERE id = $1', [req.idParseado]);
    if (rowCount === 0) return res.status(404).json({ error: 'Ingrediente no encontrado' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};