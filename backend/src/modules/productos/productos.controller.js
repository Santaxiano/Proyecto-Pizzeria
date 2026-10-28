import { pool } from '../../config/db.js';

const camposProducto = {
  nombre: { requerido: true, validar: (value) => typeof value === 'string' && value.trim() !== '' },
  precio: { requerido: true, validar: (value) => Number.isInteger(value) && value >= 0 },
  categoria: { requerido: true, validar: (value) => typeof value === 'string' && value.trim() !== '' },
  tamanos: {
    requerido: false,
    validar: (value) => value === null || (Array.isArray(value) && value.every((item) => typeof item === 'string')),
  },
  permiteMitad: { requerido: false, validar: (value) => value === null || typeof value === 'boolean' },
  stock: { requerido: false, validar: (value) => value === null || (Number.isInteger(value) && value >= 0) },
  destacado: { requerido: false, validar: (value) => value === null || typeof value === 'boolean' },
  imagen: { requerido: false, validar: (value) => value === null || typeof value === 'string' },
  descripcion: { requerido: false, validar: (value) => value === null || typeof value === 'string' },
};

const parseId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export const listar = async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'El id debe ser un entero positivo' });

  try {
    const { rows } = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  const body = req.body ?? {};
  for (const [campo, regla] of Object.entries(camposProducto)) {
    const value = body[campo] ?? (regla.requerido ? undefined : null);
    if ((regla.requerido && value === undefined) || !regla.validar(value)) {
      return res.status(400).json({ error: `El campo ${campo} es obligatorio o tiene un formato inválido` });
    }
  }

  try {
    const values = [
      body.nombre.trim(), body.precio, body.categoria.trim(),
      body.tamanos ?? null, body.permiteMitad ?? null,
      body.stock ?? null, body.destacado ?? null,
      body.imagen ?? null, body.descripcion ?? null,
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
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'El id debe ser un entero positivo' });

  const body = req.body ?? {};

  for (const [campo, regla] of Object.entries(camposProducto)) {
    const value = body[campo] ?? (regla.requerido ? undefined : null);
    if ((regla.requerido && value === undefined) || !regla.validar(value)) {
      return res.status(400).json({ error: `El campo ${campo} es obligatorio o inválido para un PUT` });
    }
  }

  try {
    const values = [
      body.nombre.trim(), body.precio, body.categoria.trim(),
      body.tamanos ?? null, body.permiteMitad ?? null,
      body.stock ?? null, body.destacado ?? null,
      body.imagen ?? null, body.descripcion ?? null,
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
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'El id debe ser un entero positivo' });

  try {
    const { rowCount } = await pool.query('DELETE FROM productos WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
