// Misma regla que el backend (backend/src/modules/configuracion/configuracion.controller.js).
// El backend vuelve a calcularlo al guardar el pedido: esto es solo para mostrarlo.
// config = { costoEnvio, envioGratisDesde }; envioGratisDesde = 0 significa sin envío gratis.
export function calcularEnvio(tipo, subtotal, config) {
  if (tipo !== 'delivery' || !config) return 0;
  if (config.envioGratisDesde > 0 && subtotal >= config.envioGratisDesde) return 0;
  return config.costoEnvio;
}

export function hayEnvioGratis(config) {
  return Boolean(config) && config.envioGratisDesde > 0;
}
