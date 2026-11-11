import { pool } from '../../config/db.js';
import { ZONA_HORARIA } from '../../config/zonaHoraria.js';

// Minutos de espera después de la hora reservada antes de liberar la mesa (por si el cliente no viene)
const TOLERANCIA_RESERVA_MIN = 30;

// La tabla mesas guarda solo el estado físico: 'Libre' u 'Ocupada'.
// "Reservada" se calcula: la mesa tiene asignada una reserva de HOY que todavía no venció
// (hora + tolerancia) y que no está Finalizada. Si está ocupada, gana 'Ocupada'.
// Las reservas de otros días no bloquean la mesa.
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
      AND r.estado <> 'Finalizada'
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

// Además de cambiar la mesa, mueve el estado de la reserva asignada:
// - Ocupar una mesa 'Reservada' (llegó el cliente)  -> la reserva pasa a 'En curso'
// - Liberar la mesa                                -> sus reservas 'En curso' pasan a 'Finalizada',
//   salvo que la reserva tenga otra mesa todavía ocupada (reservas de varias mesas)
export const actualizar = async (req, res, next) => {
  const { capacidad, estado } = req.body;
  const id = req.idParseado;
  const estadoNuevo = estado.trim();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Estado calculado antes del cambio, para saber si la mesa estaba esperando una reserva
    const { rows: previas } = await client.query(`${SELECT_MESAS} WHERE m.id = $1`, [id]);
    if (previas.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }
    const anterior = previas[0];

    await client.query(
      'UPDATE mesas SET capacidad = $1, estado = $2 WHERE id = $3',
      [capacidad, estadoNuevo, id]
    );

    if (estadoNuevo === 'Ocupada' && anterior.estado === 'Reservada' && anterior.reserva_id) {
      await client.query(
        `UPDATE reservas SET estado = 'En curso' WHERE id = $1 AND estado = 'Pendiente'`,
        [anterior.reserva_id]
      );
    }

    if (estadoNuevo === 'Libre') {
      await client.query(
        `UPDATE reservas r SET estado = 'Finalizada'
         WHERE r.estado = 'En curso'
           AND r.id IN (SELECT reserva_id FROM reserva_mesa WHERE mesa_id = $1)
           AND NOT EXISTS (
             SELECT 1 FROM reserva_mesa rm
             JOIN mesas m ON m.id = rm.mesa_id
             WHERE rm.reserva_id = r.id AND rm.mesa_id <> $1 AND m.estado = 'Ocupada'
           )`,
        [id]
      );
    }

    // Se devuelve con el estado calculado: si la mesa tiene otra reserva de hoy pendiente, vuelve a 'Reservada'
    const { rows } = await client.query(`${SELECT_MESAS} WHERE m.id = $1`, [id]);
    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err);
  } finally {
    client.release();
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
