import { MercadoPagoConfig, Preference } from 'mercadopago';
import { env } from '../../config/env.js';
import { pool } from '../../config/db.js';

const crearError = (status, mensaje) => Object.assign(new Error(mensaje), { status, publicMessage: mensaje });

// POST público (el cliente paga sin iniciar sesión). Recibe solo { pedidoId }:
// los ítems y precios salen de la base, nunca del navegador.
export const crearPreferencia = async (req, res, next) => {
  const pedidoId = req.body?.pedidoId;
  if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
    return res.status(400).json({ error: "El campo 'pedidoId' debe ser un entero positivo" });
  }

  if (!env.MERCADOPAGO_ACCESS_TOKEN) {
    console.error('Falta el token de Mercado Pago en el .env');
    return res.status(500).json({ error: 'Token no configurado' });
  }

  try {
    const { rows: pedidos } = await pool.query(
      'SELECT id, total, estado, forma_pago FROM pedidos WHERE id = $1',
      [pedidoId]
    );
    const pedido = pedidos[0];
    if (!pedido) return next(crearError(404, 'Pedido no encontrado'));
    if (pedido.forma_pago !== 'mercadopago') {
      return next(crearError(409, 'El pedido no se paga con Mercado Pago'));
    }
    if (pedido.estado !== 'Pendiente') {
      return next(crearError(409, 'El pedido ya no está pendiente de pago'));
    }

    // Precios guardados al momento de la venta (detalle_pedido.precio_unitario)
    const { rows: lineas } = await pool.query(
      `SELECT dp.cantidad, dp.precio_unitario, dp.tamano,
              p.nombre, s.nombre AS segundo_sabor
       FROM detalle_pedido dp
       JOIN productos p ON p.id = dp.producto_id
       LEFT JOIN productos s ON s.id = dp.segundo_sabor_id
       WHERE dp.pedido_id = $1
       ORDER BY dp.id`,
      [pedidoId]
    );
    if (lineas.length === 0) return next(crearError(409, 'El pedido no tiene productos'));

    const items = lineas.map((l) => ({
      title: `${l.nombre}${l.segundo_sabor ? ` / ${l.segundo_sabor}` : ''}${l.tamano ? ` (${l.tamano})` : ''}`,
      unit_price: l.precio_unitario,
      quantity: l.cantidad,
      currency_id: 'ARS',
    }));

    // Lo que falta para llegar al total guardado es el costo de envío
    const subtotal = lineas.reduce((suma, l) => suma + l.precio_unitario * l.cantidad, 0);
    const envio = pedido.total - subtotal;
    if (envio > 0) {
      items.push({ title: 'Costo de envío', unit_price: envio, quantity: 1, currency_id: 'ARS' });
    }

    const client = new MercadoPagoConfig({ accessToken: env.MERCADOPAGO_ACCESS_TOKEN });
    const result = await new Preference(client).create({
      body: {
        items,
        external_reference: String(pedido.id),
        back_urls: {
          success: 'http://localhost:5173/pago-exitoso',
          failure: 'http://localhost:5173/pago-fallido',
          pending: 'http://localhost:5173/pago-pendiente',
        },
        //auto_return: 'approved' COMENTADO TEMPORALMENTE PARA QUE ANDE
      },
    });

    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    console.error('Error en Mercado Pago:', error);
    res.status(500).json({ error: 'Error al crear preferencia' });
  }
};
