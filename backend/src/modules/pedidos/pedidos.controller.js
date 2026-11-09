import { pool } from '../../config/db.js';

// Misma regla de envío que el carrito (frontend/src/features/carrito/components/ResumenCarrito.jsx).
// Si cambia allá, hay que cambiarla acá también.
const ENVIO_GRATIS_DESDE = 15000;
const COSTO_ENVIO = 1500;
const LARGO_MAX_DETALLE = 255; // pedidos.detalle es VARCHAR(255)

// Precio por tamaño: misma regla que la carta (frontend/src/features/carta/components/DetalleProducto.jsx).
// Un tamaño que no figura acá (ej. "8 porciones") paga el precio completo.
const MULTIPLICADOR_TAMANO = { '4 porciones': 0.6 };
const TAMANO_MITAD_Y_MITAD = '8 porciones';

// Zona de entrega: mismos valores que el front (frontend/src/shared/utils/pedidosUtils.js)
const UBICACION_LOCAL = { lat: -33.3021, lng: -66.3368 }; // Pringles 1091, San Luis
const RADIO_ENTREGA_KM = 5;
const LARGO_MAX_NOTAS = 255; // pedidos.notas es VARCHAR(255)

// Distancia en km entre dos puntos (fórmula de Haversine)
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const aRadianes = (grados) => grados * (Math.PI / 180);
  const dLat = aRadianes(lat2 - lat1);
  const dLon = aRadianes(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Suma a las notas un link de Google Maps con el punto exacto para el repartidor,
// recortando las notas del cliente si hace falta para no pasar los 255 caracteres.
const armarNotas = (notas, lat, lng) => {
  const texto = notas?.trim() || '';
  if (lat === undefined || lat === null) return texto || null;
  const link = `Ubicación: https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
  if (!texto) return link;
  const espacio = LARGO_MAX_NOTAS - link.length - 3; // 3 = " · "
  const recortado = texto.length > espacio ? `${texto.slice(0, espacio - 1)}…` : texto;
  return `${recortado} · ${link}`;
};

// Junta los items que son exactamente lo mismo (producto + tamaño + segundo sabor) sumando cantidades.
const unificarItems = (items) => {
  const lineas = new Map();
  for (const item of items) {
    const tamano = item.tamano?.trim() || null;
    const segundoSaborId = item.segundoSaborId ?? null;
    const clave = `${item.productoId}|${tamano}|${segundoSaborId}`;

    if (lineas.has(clave)) {
      lineas.get(clave).cantidad += item.cantidad;
    } else {
      lineas.set(clave, { productoId: item.productoId, tamano, segundoSaborId, cantidad: item.cantidad });
    }
  }
  return [...lineas.values()];
};

// Devuelve el mensaje de error de la primera línea inválida, o null si todas están bien.
const validarLineas = (lineas, productosPorId) => {
  for (const linea of lineas) {
    const producto = productosPorId.get(linea.productoId);

    if (linea.tamano && !(producto.tamanos ?? []).includes(linea.tamano)) {
      return `"${producto.nombre}" no tiene el tamaño "${linea.tamano}"`;
    }

    if (linea.segundoSaborId) {
      const segundo = productosPorId.get(linea.segundoSaborId);
      const mitadValida =
        linea.tamano === TAMANO_MITAD_Y_MITAD &&
        segundo.id !== producto.id &&
        producto.categoria === 'pizzas' && segundo.categoria === 'pizzas' &&
        producto.permitemitad && segundo.permitemitad;

      if (!mitadValida) {
        return `La mitad y mitad solo se puede pedir en ${TAMANO_MITAD_Y_MITAD} y entre dos pizzas distintas que la permitan`;
      }
    }
  }
  return null;
};

// POST público: lo usan el carrito (clientes) y el salón. El total y el detalle
// los arma el backend con los precios de la base; no se confía en lo que manda el front.
export const crear = async (req, res, next) => {
  const { cliente, telefono, tipo, direccionMesa, items, horario, notas, formaPago, lat, lng } = req.body;
  const pedidas = unificarItems(items);

  // El bloqueo del mapa en el front se puede saltar: acá se vuelve a controlar el radio de entrega
  const hayUbicacion = tipo === 'delivery' && typeof lat === 'number';
  if (hayUbicacion) {
    const distancia = calcularDistancia(UBICACION_LOCAL.lat, UBICACION_LOCAL.lng, lat, lng);
    if (distancia > RADIO_ENTREGA_KM) {
      return res.status(400).json({
        error: `El domicilio está a ${distancia.toFixed(1)} km y solo entregamos hasta ${RADIO_ENTREGA_KM} km`,
      });
    }
  }

  // Productos involucrados: los pedidos y los segundos sabores de las mitades
  const ids = [...new Set(pedidas.flatMap((l) => [l.productoId, l.segundoSaborId]).filter(Boolean))];

  try {
    // Precio, tamaños y disponibilidad (stock + efecto dominó de ingredientes) de cada producto
    const { rows: productos } = await pool.query(
      `SELECT p.id, p.nombre, p.precio, p.categoria, p.tamanos, p.permitemitad,
         (COALESCE(p.stock, 0) > 0 AND COALESCE(bool_and(i.activo), TRUE)) AS disponible
       FROM productos p
       LEFT JOIN producto_ingrediente pi ON pi.producto_id = p.id
       LEFT JOIN ingredientes i ON i.id = pi.ingrediente_id
       WHERE p.id = ANY($1::int[])
       GROUP BY p.id`,
      [ids]
    );
    const productosPorId = new Map(productos.map((p) => [p.id, p]));

    const inexistentes = ids.filter((id) => !productosPorId.has(id));
    if (inexistentes.length > 0) {
      return res.status(400).json({ error: `Los productos con id ${inexistentes.join(', ')} no existen` });
    }

    const errorLineas = validarLineas(pedidas, productosPorId);
    if (errorLineas) return res.status(400).json({ error: errorLineas });

    const noDisponibles = productos.filter((p) => !p.disponible);
    if (noDisponibles.length > 0) {
      return res.status(409).json({
        error: `No hay disponibilidad de: ${noDisponibles.map((p) => p.nombre).join(', ')}`,
      });
    }

    // La mitad y mitad cobra la mitad de cada pizza sumadas (ej. $9.000 y $11.000 -> $10.000),
    // igual que la carta (DetalleProducto.jsx) y comandas (FormularioComanda.jsx).
    const lineas = pedidas.map((l) => {
      const producto = productosPorId.get(l.productoId);
      const segundo = l.segundoSaborId ? productosPorId.get(l.segundoSaborId) : null;
      const multiplicador = MULTIPLICADOR_TAMANO[l.tamano] ?? 1;
      const precioUnitario = segundo
        ? Math.round((producto.precio * multiplicador) / 2 + (segundo.precio * multiplicador) / 2)
        : Math.round(producto.precio * multiplicador);
      return {
        productoId: l.productoId,
        nombre: segundo ? `${producto.nombre} / ${segundo.nombre}` : producto.nombre,
        tamano: l.tamano,
        segundoSaborId: l.segundoSaborId,
        cantidad: l.cantidad,
        precioUnitario,
        subtotal: precioUnitario * l.cantidad,
      };
    });

    const subtotal = lineas.reduce((acc, l) => acc + l.subtotal, 0);
    const costoEnvio = tipo === 'delivery' && subtotal < ENVIO_GRATIS_DESDE ? COSTO_ENVIO : 0;

    let detalle = lineas
      .map((l) => `${l.cantidad}x ${l.nombre}${l.tamano ? ` (${l.tamano})` : ''}`)
      .join(', ');
    if (detalle.length > LARGO_MAX_DETALLE) {
      detalle = `${detalle.slice(0, LARGO_MAX_DETALLE - 1)}…`;
    }

    // El pedido y sus líneas se guardan juntos: si algo falla no queda un pedido sin productos.
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows } = await client.query(
        `INSERT INTO pedidos
           (cliente, telefono, tipo, direccionmesa, total, detalle, usuario_id, estado, horario, notas, forma_pago)
         VALUES ($1, $2, $3, $4, $5, $6, NULL, 'Pendiente', $7, $8, $9)
         RETURNING *`,
        [
          cliente.trim(),
          telefono.trim(),
          tipo,
          direccionMesa?.trim() || null,
          subtotal + costoEnvio,
          detalle,
          horario?.trim() || null,
          armarNotas(notas, hayUbicacion ? lat : null, hayUbicacion ? lng : null),
          formaPago ?? 'efectivo',
        ]
      );
      const pedido = rows[0];

      await client.query(
        `INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, tamano, segundo_sabor_id, precio_unitario)
         SELECT $1, * FROM unnest($2::int[], $3::int[], $4::text[], $5::int[], $6::int[])`,
        [
          pedido.id,
          lineas.map((l) => l.productoId),
          lineas.map((l) => l.cantidad),
          lineas.map((l) => l.tamano),
          lineas.map((l) => l.segundoSaborId),
          lineas.map((l) => l.precioUnitario),
        ]
      );

      await client.query('COMMIT');
      res.status(201).json({ ...pedido, costoEnvio, items: lineas });
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
};

export const listar = async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pedidos ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  const { estado } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, req.idParseado]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM pedidos WHERE id = $1', [req.idParseado]);
    if (rowCount === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
