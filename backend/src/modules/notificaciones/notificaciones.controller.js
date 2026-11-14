import { pool } from '../../config/db.js';
import { ZONA_HORARIA } from '../../config/zonaHoraria.js';

// Los cortes de "hoy" y las horas que se muestran se calculan en hora argentina,
// sin importar la zona horaria del servidor o del navegador.
const FECHA_LOCAL = (alias) => `(${alias}.creado_en AT TIME ZONE '${ZONA_HORARIA}')::date`;
const HORA_LOCAL = (alias) => `to_char(${alias}.creado_en AT TIME ZONE '${ZONA_HORARIA}', 'HH24:MI')`;

const esFechaValida = (texto) => {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(texto);
};

const hoyEnArgentina = () => new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA_HORARIA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());

const crearError = (mensaje) => Object.assign(new Error(mensaje), { status: 400 });

// Historial del día: pedidos y reservas ordenados por el momento en que se recibieron.
// Se devuelve una lista única para que el front no tenga que cruzar dos endpoints.
export const listar = async (req, res, next) => {
  const fecha = req.query.fecha ?? hoyEnArgentina();

  if (!esFechaValida(fecha)) {
    return next(crearError('La fecha debe tener el formato AAAA-MM-DD'));
  }

  try {
    const { rows } = await pool.query(
      `SELECT
         'pedido'::text AS tipo,
         p.id,
         p.cliente,
         p.detalle,
         p.total,
         p.tipo AS tipo_pedido,
         p.estado,
         p.creado_en,
         ${HORA_LOCAL('p')} AS hora,
         NULL::int AS comensales,
         NULL::text AS fecha_reserva,
         NULL::text AS hora_reserva,
         NULL::text AS lugar
       FROM pedidos p
       WHERE ${FECHA_LOCAL('p')} = $1::date

       UNION ALL

       SELECT
         'reserva'::text AS tipo,
         r.id,
         r.cliente,
         NULL::text AS detalle,
         NULL::int AS total,
         NULL::text AS tipo_pedido,
         r.estado,
         r.creado_en,
         ${HORA_LOCAL('r')} AS hora,
         r.comensales,
         to_char(r.fecha, 'YYYY-MM-DD') AS fecha_reserva,
         to_char(r.hora, 'HH24:MI') AS hora_reserva,
         r.lugar
       FROM reservas r
       WHERE ${FECHA_LOCAL('r')} = $1::date

       ORDER BY creado_en DESC, tipo ASC, id DESC`,
      [fecha]
    );

    let pedidos = 0;
    let reservas = 0;

    const notificaciones = rows.map((fila) => {
      const base = {
        // El prefijo evita que un pedido y una reserva con el mismo id se pisen en el front
        id: `${fila.tipo}-${fila.id}`,
        tipo: fila.tipo,
        referenciaId: fila.id,
        cliente: fila.cliente,
        creadoEn: fila.creado_en,
        hora: fila.hora,
        estado: fila.estado,
      };

      if (fila.tipo === 'pedido') {
        pedidos += 1;
        return {
          ...base,
          detalle: fila.detalle || 'Pedido sin detalle',
          total: fila.total,
          tipoPedido: fila.tipo_pedido,
        };
      }

      reservas += 1;
      return {
        ...base,
        detalle: `${fila.comensales} ${fila.comensales === 1 ? 'persona' : 'personas'} · ${fila.hora_reserva} hs · ${fila.lugar}`,
        comensales: fila.comensales,
        fechaReserva: fila.fecha_reserva,
        horaReserva: fila.hora_reserva,
        lugar: fila.lugar,
      };
    });

    res.json({
      fecha,
      notificaciones,
      resumen: {
        total: notificaciones.length,
        pedidos,
        reservas,
      },
    });
  } catch (err) {
    next(err);
  }
};
