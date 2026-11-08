import { obtenerComandas } from '../../comandas/services/comandasService';
import { listarMesas } from '../../salon/services/mesaService';
import { listarReservas } from '../../reservas/services/reservaService';

function esDeHoy(fecha, hoy) {
  if (!fecha) return false;

  const valor = new Date(fecha);
  return !Number.isNaN(valor.getTime())
    && valor.getFullYear() === hoy.getFullYear()
    && valor.getMonth() === hoy.getMonth()
    && valor.getDate() === hoy.getDate();
}

function ordenarComandasRecientes(a, b) {
  const fechaA = a.created_at ? new Date(a.created_at).getTime() : 0;
  const fechaB = b.created_at ? new Date(b.created_at).getTime() : 0;

  if (fechaA !== fechaB) return fechaB - fechaA;
  return Number(b.id) - Number(a.id);
}

export async function obtenerResumenDashboard() {
  const [comandas, mesas, reservas] = await Promise.all([
    obtenerComandas(),
    listarMesas(),
    listarReservas(),
  ]);
  const hoy = new Date();
  const comandasDeHoy = comandas.filter((comanda) => esDeHoy(comanda.created_at, hoy));

  return {
    comandasPendientes: comandas.filter((comanda) => comanda.estado === 'Pendiente').length,
    mesasLibres: mesas.filter((mesa) => mesa.estado === 'Libre').length,
    mesasOcupadas: mesas.filter((mesa) => mesa.estado === 'Ocupada').length,
    mesasReservadas: mesas.filter((mesa) => mesa.estado === 'Reservada').length,
    reservasHoy: reservas.filter((reserva) => reserva.fecha === [
      hoy.getFullYear(),
      String(hoy.getMonth() + 1).padStart(2, '0'),
      String(hoy.getDate()).padStart(2, '0'),
    ].join('-')).length,
    ventasHoy: comandasDeHoy.reduce((total, comanda) => {
      const importe = Number(comanda.total);
      return total + (Number.isFinite(importe) ? importe : 0);
    }, 0),
    comandasRecientes: [...comandas].sort(ordenarComandasRecientes).slice(0, 5),
  };
}
