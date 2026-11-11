// Pide el link de pago de un pedido ya registrado. Solo se manda el número de pedido:
// los ítems y precios los arma el backend desde la base.
import { API_URL } from './api';

export const generarLinkMercadoPago = async (pedidoId) => {
  try {
    const respuesta = await fetch(`${API_URL}/pagos/crear-preferencia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pedidoId: Number(pedidoId) }),
    });

    if (!respuesta.ok) {
      const errorData = await respuesta.json().catch(() => ({}));
      throw new Error(errorData.error || 'El servidor rechazó la solicitud de pago');
    }

    return await respuesta.json(); // Retorna { id, init_point }
  } catch (error) {
    console.error("Error en pagos.service:", error);
    throw error; // Lanza el error para que CarritoPage lo ataje y muestre una alerta
  }
};
