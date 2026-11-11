import { pool } from '../../config/db.js';
import { CAMPOS_RESERVA } from '../../middlewares/validarReserva.js';

// Se asume que una reserva ocupa la mesa 2 horas (igual que el front)
const DURACION_RESERVA_SEG = 2 * 60 * 60;

const SELECT_RESERVAS = `
  SELECT r.*,
    COALESCE(
      array_agg(rm.mesa_id ORDER BY rm.mesa_id) FILTER (WHERE rm.mesa_id IS NOT NULL),
      ARRAY[]::integer[]
    ) AS mesas_ids
  FROM reservas r
  LEFT JOIN reserva_mesa rm ON rm.reserva_id = r.id
`;

export const listar = async (req, res, next) => {
  try {
    const { fecha } = req.query;
    let sql = SELECT_RESERVAS;
    const params = [];

    if (fecha) {
      sql += ' WHERE r.fecha = $1';
      params.push(fecha);
    }

    sql += ' GROUP BY r.id ORDER BY r.fecha ASC, r.hora ASC';

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  const { cliente, contacto, fecha, hora, comensales, lugar } = req.body;

  try {
    const { rows } = await pool.query(
      `INSERT INTO reservas (cliente, contacto, fecha, hora, comensales, lugar)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [cliente.trim(), contacto.trim(), fecha, hora, comensales, lugar.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  const id = req.idParseado;
  const { mesaId, mesaIds, ...datosReserva } = req.body;
  const entradas = Object.entries(datosReserva);
  const asignaciones = entradas.map(([campo], indice) => (
    `${CAMPOS_RESERVA[campo].columna} = $${indice + 1}`
  ));
  const valores = entradas.map(([, valor]) => (
    typeof valor === 'string' ? valor.trim() : valor
  ));
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Una reserva Finalizada (el cliente ya vino y se fue) no se puede modificar
    const { rows: actuales } = await client.query(
      'SELECT estado FROM reservas WHERE id = $1 FOR UPDATE',
      [id]
    );
    if (actuales.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }
    if (actuales[0].estado === 'Finalizada') {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'No se puede modificar una reserva finalizada' });
    }

    if (entradas.length > 0) {
      const { rowCount } = await client.query(
        `UPDATE reservas
         SET ${asignaciones.join(', ')}
         WHERE id = $${valores.length + 1}`,
        [...valores, id]
      );
      if (rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }
    } else {
      const { rowCount } = await client.query(
        'SELECT id FROM reservas WHERE id = $1 FOR UPDATE',
        [id]
      );
      if (rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }
    }

    if (Object.hasOwn(req.body, 'mesaIds')) {
      await asignarMesas(client, id, mesaIds);
    } else if (Object.hasOwn(req.body, 'mesaId')) {
      await asignarMesas(client, id, mesaId === null ? [] : [mesaId]);
    }

    const { rows } = await client.query(
      `${SELECT_RESERVAS} WHERE r.id = $1 GROUP BY r.id`,
      [id]
    );
    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      return next(rollbackError);
    }
    next(err);
  } finally {
    client.release();
  }
};

const asignarMesas = async (client, reservaId, mesaIds) => {
  const { rows: reservas } = await client.query(
    'SELECT fecha, hora FROM reservas WHERE id = $1 FOR UPDATE',
    [reservaId]
  );
  if (reservas.length === 0) {
    const error = new Error('Reserva no encontrada');
    error.status = 404;
    throw error;
  }

  const mesasIdsOrdenadas = [...mesaIds].sort((a, b) => a - b);

  if (mesasIdsOrdenadas.length > 0) {
    // FOR UPDATE: evita que otra petición asigne las mismas mesas al mismo tiempo.
    // No se rechazan mesas ocupadas: estar ocupada ahora no impide reservarla para más tarde u otro día.
    const { rows: mesas } = await client.query(
      'SELECT id FROM mesas WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE',
      [mesasIdsOrdenadas]
    );
    if (mesas.length !== mesasIdsOrdenadas.length) {
      const error = new Error('Mesa no encontrada');
      error.status = 404;
      throw error;
    }

    // Choque si otra reserva de la misma mesa empieza a menos de la duración de una reserva
    // (misma regla que el front: AgendaReservas.jsx, DURACION_RESERVA_MS)
    const reservasEnConflicto = await client.query(
      `SELECT 1
       FROM reserva_mesa rm
       JOIN reservas r ON r.id = rm.reserva_id
       WHERE rm.mesa_id = ANY($1::int[])
         AND rm.reserva_id <> $2
         AND r.estado <> 'Finalizada'
         AND ABS(EXTRACT(EPOCH FROM (
           (r.fecha + r.hora) - ($3::date + $4::time)
         ))) < $5
       LIMIT 1`,
      [mesasIdsOrdenadas, reservaId, reservas[0].fecha, reservas[0].hora, DURACION_RESERVA_SEG]
    );
    if (reservasEnConflicto.rowCount > 0) {
      const error = new Error('Una o más mesas ya están asignadas a otra reserva en ese horario');
      error.status = 409;
      error.publicMessage = error.message;
      throw error;
    }
  }

  // El estado "Reservada" de la mesa no se guarda: lo calcula mesas.controller.js a partir de reserva_mesa
  await client.query('DELETE FROM reserva_mesa WHERE reserva_id = $1', [reservaId]);
  if (mesasIdsOrdenadas.length > 0) {
    await client.query(
      `INSERT INTO reserva_mesa (reserva_id, mesa_id)
       SELECT $1, unnest($2::int[])`,
      [reservaId, mesasIdsOrdenadas]
    );
  }
};

export const eliminar = async (req, res, next) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const { rowCount: reservaExiste } = await client.query(
      'SELECT id FROM reservas WHERE id = $1 FOR UPDATE',
      [req.idParseado]
    );
    if (reservaExiste === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Al borrar el vínculo, la mesa deja de figurar como reservada (el estado se calcula)
    await client.query('DELETE FROM reserva_mesa WHERE reserva_id = $1', [req.idParseado]);
    const { rowCount } = await client.query('DELETE FROM reservas WHERE id = $1', [req.idParseado]);

    if (rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    await client.query('COMMIT');
    res.status(204).end();
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      return next(rollbackError);
    }
    next(err);
  } finally {
    client.release();
  }
};