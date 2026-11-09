import { pool } from '../../config/db.js';
import { ZONA_HORARIA } from '../../config/zonaHoraria.js';
import { SELECT_MESAS } from '../Mesas/mesas.controller.js';

// Todas las fechas se cortan en hora argentina, sin importar la zona del servidor.
const MAX_DIAS = 366;
const FECHA_LOCAL_PEDIDO = `(p.creado_en AT TIME ZONE '${ZONA_HORARIA}')::date`;

const esFechaValida = (texto) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(texto);
};

const hoyEnArgentina = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: ZONA_HORARIA }).format(new Date()); // AAAA-MM-DD

const diasEntre = (desde, hasta) =>
  Math.round((new Date(`${hasta}T00:00:00Z`) - new Date(`${desde}T00:00:00Z`)) / 86_400_000) + 1;

const crearError = (mensaje) => Object.assign(new Error(mensaje), { status: 400 });

// Si es un solo día se agrupa por hora (0 a 23); si es un rango, por día.
// generate_series completa con 0 los días/horas sin pedidos para que el gráfico no tenga huecos.
const consultarSerie = (desde, hasta, porHora) => {
  if (porHora) {
    return pool.query(
      `SELECT LPAD(h::text, 2, '0') || ':00' AS etiqueta,
              COALESCE(SUM(p.total), 0)::int AS ventas,
              COUNT(p.id)::int AS pedidos
       FROM generate_series(0, 23) AS h
       LEFT JOIN pedidos p
         ON ${FECHA_LOCAL_PEDIDO} = $1::date
        AND EXTRACT(HOUR FROM p.creado_en AT TIME ZONE '${ZONA_HORARIA}') = h
       GROUP BY h
       ORDER BY h`,
      [desde]
    );
  }

  return pool.query(
    `SELECT to_char(d, 'YYYY-MM-DD') AS etiqueta,
            COALESCE(SUM(p.total), 0)::int AS ventas,
            COUNT(p.id)::int AS pedidos
     FROM generate_series($1::date, $2::date, INTERVAL '1 day') AS d
     LEFT JOIN pedidos p ON ${FECHA_LOCAL_PEDIDO} = d::date
     GROUP BY d
     ORDER BY d`,
    [desde, hasta]
  );
};

// GET /api/estadisticas?desde=AAAA-MM-DD&hasta=AAAA-MM-DD (ambos inclusive; por defecto, hoy)
export const obtener = async (req, res, next) => {
  const hoy = hoyEnArgentina();
  const desde = req.query.desde ?? hoy;
  const hasta = req.query.hasta ?? desde;

  if (!esFechaValida(desde) || !esFechaValida(hasta)) {
    return next(crearError('Las fechas deben tener el formato AAAA-MM-DD'));
  }
  if (desde > hasta) {
    return next(crearError("La fecha 'desde' no puede ser posterior a 'hasta'"));
  }
  if (diasEntre(desde, hasta) > MAX_DIAS) {
    return next(crearError(`El período no puede superar los ${MAX_DIAS} días`));
  }

  const porHora = desde === hasta;
  const rango = [desde, hasta];

  try {
    const [resumen, porTipo, serie, topProductos, reservas, proximas, mesas] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS cantidad, COALESCE(SUM(total), 0)::int AS ventas
         FROM pedidos p
         WHERE ${FECHA_LOCAL_PEDIDO} BETWEEN $1 AND $2`,
        rango
      ),
      pool.query(
        `SELECT tipo, COUNT(*)::int AS cantidad, COALESCE(SUM(total), 0)::int AS ventas
         FROM pedidos p
         WHERE ${FECHA_LOCAL_PEDIDO} BETWEEN $1 AND $2
         GROUP BY tipo`,
        rango
      ),
      consultarSerie(desde, hasta, porHora),
      pool.query(
        `SELECT pr.id, pr.nombre,
                SUM(dp.cantidad)::int AS cantidad,
                SUM(dp.cantidad * dp.precio_unitario)::int AS ventas
         FROM detalle_pedido dp
         JOIN pedidos p ON p.id = dp.pedido_id
         JOIN productos pr ON pr.id = dp.producto_id
         WHERE ${FECHA_LOCAL_PEDIDO} BETWEEN $1 AND $2
         GROUP BY pr.id, pr.nombre
         ORDER BY cantidad DESC, ventas DESC
         LIMIT 5`,
        rango
      ),
      pool.query(
        `SELECT COUNT(*)::int AS cantidad, COALESCE(SUM(comensales), 0)::int AS comensales
         FROM reservas
         WHERE fecha BETWEEN $1 AND $2`,
        rango
      ),
      // Próximas reservas desde este momento, sin importar el período elegido
      pool.query(
        `SELECT id, cliente, to_char(fecha, 'YYYY-MM-DD') AS fecha, to_char(hora, 'HH24:MI') AS hora, comensales, lugar
         FROM reservas
         WHERE (fecha + hora) >= (NOW() AT TIME ZONE '${ZONA_HORARIA}')
         ORDER BY fecha, hora
         LIMIT 5`
      ),
      // Las mesas no guardan historial: siempre es el estado actual, con la misma regla que el salón
      pool.query(`SELECT estado, COUNT(*)::int AS cantidad FROM (${SELECT_MESAS}) AS m GROUP BY estado`),
    ]);

    const { cantidad, ventas } = resumen.rows[0];
    const mesasPorEstado = Object.fromEntries(mesas.rows.map((m) => [m.estado, m.cantidad]));

    res.json({
      periodo: { desde, hasta, agrupadoPor: porHora ? 'hora' : 'dia' },
      pedidos: {
        cantidad,
        ventas,
        ticketPromedio: cantidad > 0 ? Math.round(ventas / cantidad) : 0,
        porTipo: ['delivery', 'retiro', 'mesa'].map((tipo) => {
          const fila = porTipo.rows.find((t) => t.tipo === tipo);
          return { tipo, cantidad: fila?.cantidad ?? 0, ventas: fila?.ventas ?? 0 };
        }),
        serie: serie.rows,
        topProductos: topProductos.rows,
      },
      reservas: {
        cantidad: reservas.rows[0].cantidad,
        comensales: reservas.rows[0].comensales,
        proximas: proximas.rows,
      },
      mesas: {
        total: mesas.rows.reduce((suma, m) => suma + m.cantidad, 0),
        libres: mesasPorEstado.Libre ?? 0,
        ocupadas: mesasPorEstado.Ocupada ?? 0,
        reservadas: mesasPorEstado.Reservada ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
};
