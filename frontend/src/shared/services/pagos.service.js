export const generarLinkMercadoPago = async (itemsParaMP, idReferencia) => {
  try {
    const respuesta = await fetch('http://localhost:3000/api/pagos/crear-preferencia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        items: itemsParaMP, 
        idReferencia: idReferencia 
      })
    });

    if (!respuesta.ok) {
      throw new Error('El servidor rechazó la solicitud de pago');
    }

    return await respuesta.json(); // Retorna { id, init_point }
  } catch (error) {
    console.error("Error en pagos.service:", error);
    throw error; // Lanza el error para que CarritoPage lo ataje y muestre una alerta
  }
};