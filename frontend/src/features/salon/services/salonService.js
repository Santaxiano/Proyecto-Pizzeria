import { listarReservas } from '../../reservas/services/reservaService';
import { listarMesas } from './mesaService';

export async function obtenerDatosSalon() {
  const [mesas, reservas] = await Promise.all([listarMesas(), listarReservas()]);

  return { mesas, reservas };
}