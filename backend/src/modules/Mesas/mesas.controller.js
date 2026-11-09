import { pool } from '../../config/db.js';
import { ZONA_HORARIA } from '../../config/zonaHoraria.js';

// Minutos de espera después de la hora reservada antes de liberar la mesa (por si el cliente no viene)
const TOLERANCIA_RESERVA_MIN = 30;

// La tabla mesas guarda solo el estado físico: 'Libre' u 'Ocupada'.
// "Reservada" se calcula: la mesa tiene asignada una reserva de HOY que todavía no venció
// (hora + tolerancia). Si está ocupada, gana 'Ocupada'. Las reservas de otros días no bloquean la mesa.
// Se exporta para que estadísticas cuente las mesas con la misma regla.
export const SELECT_MESAS = `
  SELECT m.id, m.capacidad,
    CASE
      WHEN m.estado = 'Ocupada' THEN 'Ocupada'
      WHEN r.id IS NOT NULL THEN 'Reservada'
      ELSE 'Libre'
    END AS estado,
    r.id AS reserva_id,
    r.cliente AS reserva_cliente,
    to_char(r.hora, 'HH24:MI') AS reserva_hora,
    r.comensales AS reserva_comensales
  FROM mesas m
  LEFT JOIN LATERAL (
    SELECT r.id, r.cliente, r.hora, r.comensales
    FROM reserva_mesa rm
    JOIN reservas r ON r.id = rm.reserva_id
    WHERE rm.mesa_id = m.id
      AND r.fecha = (NOW() AT TIME ZONE '${ZONA_HORARIA}')::date
      AND (r.fecha + r.hora + INTERVAL '${TOLERANCIA_RESERVA_MIN} minutes') >= (NOW() AT TIME ZONE '${ZONA_HORARIA}')
    ORDER BY r.hora
    LIMIT 1
  ) r ON TRUE
`;

const buscarMesaPorId = async (id) => {
  const { rows } = await pool.query(`${SELECT_MESAS} WHERE m.id = $1`, [id]);
  return rows[0];
};

export const listar = async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`${SELECT_MESAS} ORDER BY m.id`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const mesa = await buscarMesaPorId(req.idParseado);
    if (!mesa) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.json(mesa);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  const { capacidad, estado } = req.body;

  try {
    const { rows } = await pool.query(
      'INSERT INTO mesas (capacidad, estado) VALUES ($1, $2) RETURNING id',
      [capacidad, estado.trim()]
    );
    res.status(201).json(await buscarMesaPorId(rows[0].id));
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  const { capacidad, estado } = req.body;

  try {
    const { rowCount } = await pool.query(
      'UPDATE mesas SET capacidad = $1, estado = $2 WHERE id = $3',
      [capacidad, estado.trim(), req.idParseado]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
    // Se devuelve con el estado calculado: al liberar una mesa con reserva de hoy, vuelve a 'Reservada'
    res.json(await buscarMesaPorId(req.idParseado));
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
    // 23503: la mesa figura en reserva_mesa
    if (err.code === '23503') {
      const error = new Error('No se puede eliminar la mesa porque tiene reservas asignadas');
      error.status = 409;
      error.publicMessage = error.message;
      return next(error);
    }
    next(err);
  }
};
