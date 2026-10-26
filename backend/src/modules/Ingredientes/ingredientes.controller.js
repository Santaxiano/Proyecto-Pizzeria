import { pool } from '../../config/db.js';

const parseId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const camposIngrediente = {
  nombre: {
    validar: (value) => typeof value === 'string' && value.trim() !== '',
    error: 'El nombre no puede estar vacío',
  },
  activo: {
    validar: (value) => typeof value === 'boolean',
    error: 'El campo activo debe ser booleano',
  },
};

export const listar = async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM ingredientes ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'El id debe ser un entero positivo' });

  try {
    const { rows } = await pool.query('SELECT * FROM ingredientes WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Ingrediente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  const { nombre, activo } = req.body;
  if (typeof nombre !== 'string' || nombre.trim() === '') {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (typeof activo !== 'boolean') {
    return res.status(400).json({ error: 'El campo activo debe ser booleano' });
  }

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
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'El id debe ser un entero positivo' });

  const body = req.body ?? {};
  const campos = Object.keys(camposIngrediente).filter((campo) => body[campo] !== undefined);
  if (campos.length === 0) {
    return res.status(400).json({ error: 'Debe enviar nombre o activo para actualizar' });
  }
  for (const campo of campos) {
    if (!camposIngrediente[campo].validar(body[campo])) {
      return res.status(400).json({ error: camposIngrediente[campo].error });
    }
  }

  try {
    const values = campos.map((campo) => (
      typeof body[campo] === 'string' ? body[campo].trim() : body[campo]
    ));
    const sets = campos.map((campo, index) => `${campo} = $${index + 1}`);
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE ingredientes SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Ingrediente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'El id debe ser un entero positivo' });

  try {
    const { rowCount } = await pool.query('DELETE FROM ingredientes WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Ingrediente no encontrado' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
