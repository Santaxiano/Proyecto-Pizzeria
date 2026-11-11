import { pool } from '../../config/db.js';

// Tope razonable para evitar errores de tipeo (ej. un cero de más)
const MONTO_MAXIMO = 1_000_000;

// Valores por defecto si la fila de configuración todavía no existe
const ENVIO_POR_DEFECTO = { costoEnvio: 1500, envioGratisDesde: 15000 };

// La usan este controller y pedidos.controller.js (para cobrar el envío con el valor guardado)
export const obtenerConfigEnvio = async (cliente = pool) => {
  const { rows } = await cliente.query(
    'SELECT costo_envio, envio_gratis_desde FROM configuracion WHERE id = 1'
  );
  if (rows.length === 0) return { ...ENVIO_POR_DEFECTO };
  return {
    costoEnvio: Number(rows[0].costo_envio),
    envioGratisDesde: Number(rows[0].envio_gratis_desde),
  };
};

// Misma regla que el front (frontend/src/shared/utils/envio.js).
// envioGratisDesde = 0 significa que no hay envío gratis: se cobra siempre.
export const calcularEnvio = (tipo, subtotal, { costoEnvio, envioGratisDesde }) => {
  if (tipo !== 'delivery') return 0;
  if (envioGratisDesde > 0 && subtotal >= envioGratisDesde) return 0;
  return costoEnvio;
};

const esMontoValido = (valor) => Number.isInteger(valor) && valor >= 0 && valor <= MONTO_MAXIMO;

export const obtener = async (_req, res, next) => {
  try {
    res.json(await obtenerConfigEnvio());
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  const { costoEnvio, envioGratisDesde } = req.body;

  if (!esMontoValido(costoEnvio)) {
    return res.status(400).json({ error: `El costo de envío debe ser un número entero entre 0 y ${MONTO_MAXIMO}` });
  }
  if (!esMontoValido(envioGratisDesde)) {
    return res.status(400).json({ error: `El monto para envío gratis debe ser un número entero entre 0 y ${MONTO_MAXIMO}` });
  }

  try {
    // Si la fila no existe (base sin migrar del todo) se crea
    await pool.query(
      `INSERT INTO configuracion (id, costo_envio, envio_gratis_desde) VALUES (1, $1, $2)
       ON CONFLICT (id) DO UPDATE SET costo_envio = EXCLUDED.costo_envio, envio_gratis_desde = EXCLUDED.envio_gratis_desde`,
      [costoEnvio, envioGratisDesde]
    );
    res.json(await obtenerConfigEnvio());
  } catch (err) {
    next(err);
  }
};
