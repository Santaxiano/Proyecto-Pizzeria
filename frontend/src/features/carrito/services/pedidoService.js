// src/features/carrito/services/pedidoService.js
const URL_BASE = 'http://localhost:3000/api';

// Crea el pedido en el backend (POST público, sin token).
// El total, el envío y el detalle los calcula el backend con los precios de la base.
export async function crearPedido({ items, tipoEntrega, datosCliente, horario }) {
  const notas = [datosCliente.pisoDepto, datosCliente.indicaciones]
    .map((texto) => texto?.trim())
    .filter(Boolean)
    .join(' · ');

  const respuesta = await fetch(`${URL_BASE}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cliente: datosCliente.nombre.trim(),
      telefono: datosCliente.telefono.trim(),
      // El carrito usa "retirar"; en la base el tipo es "retiro"
      tipo: tipoEntrega === 'retirar' ? 'retiro' : tipoEntrega,
      direccionMesa: tipoEntrega === 'delivery' ? datosCliente.calleNumero.trim() : null,
      horario,
      notas: notas || null,
      formaPago: datosCliente.formaPago === 'transferencia' ? 'mercadopago' : 'efectivo',
      items: items.map((item) => ({
        productoId: item.id,
        cantidad: item.cantidad,
        tamano: item.tamanoElegido || null,
        segundoSaborId: item.esMitadYMitad ? item.segundoSaborId ?? null : null,
      })),
    }),
  });

  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}));
    throw new Error(errorData.error || 'No se pudo registrar el pedido');
  }

  return respuesta.json(); // { id, total, costoEnvio, items: [{ nombre, tamano, cantidad, precioUnitario, ... }], ... }
}
