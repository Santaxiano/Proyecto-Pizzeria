import { MercadoPagoConfig, Preference } from 'mercadopago';
import { env } from '../../config/env.js';

export const crearPreferencia = async (req, res, next) => {
  try {
    if (!env.MERCADOPAGO_ACCESS_TOKEN) {
      console.error("Falta el token de Mercado Pago en el .env");
      return res.status(500).json({ error: 'Token no configurado' });
    }

    const client = new MercadoPagoConfig({ accessToken: env.MERCADOPAGO_ACCESS_TOKEN });
    const { items, idReferencia } = req.body;

    const preference = new Preference(client);
    
    // Prestá atención a esta estructura: todo va adentro de "body"
    const result = await preference.create({
      body: {
        items: items,
        external_reference: idReferencia,
        back_urls: {
          success: 'http://localhost:5173/pago-exitoso',
          failure: 'http://localhost:5173/pago-fallido',
          pending: 'http://localhost:5173/pago-pendiente'
        },
        //auto_return: 'approved' COMENTADO TEMPORALMENTE PARA QUE ANDE
      }
    });

    res.json({ id: result.id, init_point: result.init_point });
  } catch (error) {
    console.error("Error en Mercado Pago:", error);
    res.status(500).json({ error: 'Error al crear preferencia' });
  }
};