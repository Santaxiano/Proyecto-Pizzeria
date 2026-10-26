import { pool } from '../../config/db.js';

const parseId = (value) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

const validarCapacidad = (value) => Number.isInteger(value) && value > 0;
const validarEstado = (value) => typeof value === 'string' && value.trim() !== '';

const camposMesa = {
  capacidad: {
    validar: validarCapacidad,
    error: 'La capacidad debe ser un entero positivo',
  },
  estado: {
    validar: validarEstado,
    error: 'El estado no puede estar vacío',
  },
};

export const listar = async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM mesas ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'El id debe ser un entero positivo' });

  try {
    const { rows } = await pool.query('SELECT * FROM mesas WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  const { id, capacidad, estado } = req.body;
  const mesaId = parseId(id);
  if (mesaId === null) return res.status(400).json({ error: 'El id debe ser un entero positivo' });
  if (!validarCapacidad(capacidad)) {
    return res.status(400).json({ error: 'La capacidad debe ser un entero positivo' });
  }
  if (!validarEstado(estado)) {
    return res.status(400).json({ error: 'El estado es obligatorio' });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO mesas (id, capacidad, estado) VALUES ($1, $2, $3) RETURNING *',
      [mesaId, capacidad, estado.trim()]
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
  const campos = Object.keys(camposMesa).filter((campo) => body[campo] !== undefined);
  if (campos.length === 0) {
    return res.status(400).json({ error: 'Debe enviar capacidad o estado para actualizar' });
  }
  for (const campo of campos) {
    if (!camposMesa[campo].validar(body[campo])) {
      return res.status(400).json({ error: camposMesa[campo].error });
    }
  }

  try {
    const values = campos.map((campo) => (
      typeof body[campo] === 'string' ? body[campo].trim() : body[campo]
    ));
    const sets = campos.map((campo, index) => `${campo} = $${index + 1}`);
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE mesas SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).json({ error: 'El id debe ser un entero positivo' });

  try {
    const { rowCount } = await pool.query('DELETE FROM mesas WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
