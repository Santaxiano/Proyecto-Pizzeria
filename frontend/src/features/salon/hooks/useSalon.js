import { useState, useEffect } from 'react';
import { obtenerDatosSalon } from '../services/salonService';
import { useFetch } from '../../../shared/hooks/useFetch';
import { actualizarMesa, crearMesa as crearMesaAPI, eliminarMesa as eliminarMesaAPI, listarMesas } from '../services/mesaService';
import {
  actualizarReserva,
  crearReserva,
  editarReserva as editarReservaAPI,
  eliminarReserva as eliminarReservaAPI,
  listarReservas,
} from '../../reservas/services/reservaService';

const RESERVAS_VACIAS = [];
const MESAS_VACIAS = [];
// El estado "Reservada" depende de la hora (vence 30 min después de la reserva),
// así que las mesas se vuelven a pedir cada tanto para que cambien solas.
const INTERVALO_REFRESCO_MS = 60_000;

export function useSalon() {
  const { datos, cargando, error } = useFetch(obtenerDatosSalon);

  const [mesasOverride, setMesasOverride] = useState(null);
  const [reservasOverride, setReservasOverride] = useState(null);
  const reservas = reservasOverride ?? datos?.reservas ?? RESERVAS_VACIAS;
  // El estado de cada mesa ya viene calculado por el backend
  const mesas = mesasOverride ?? datos?.mesas ?? MESAS_VACIAS;

  const refrescarMesas = async () => {
    setMesasOverride(await listarMesas());
  };

  // Ocupar o liberar una mesa cambia el estado de su reserva (En curso / Finalizada) en el backend
  // Si falla no se muestra error: la mesa ya se actualizó y la agenda se corrige al recargar
  const refrescarReservas = async () => {
    try {
      setReservasOverride(await listarReservas());
    } catch (err) {
      console.error('No se pudieron recargar las reservas:', err);
    }
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      listarMesas().then(setMesasOverride).catch(() => {}); // si falla, se reintenta en el próximo ciclo
    }, INTERVALO_REFRESCO_MS);
    return () => clearInterval(intervalo);
  }, []);

  const actualizarEstadoLocal = (mesaActualizada) => {
    setMesasOverride((mesasActuales) => {
      const base = mesasActuales ?? datos?.mesas ?? [];
      return base.map((mesa) => mesa.id === mesaActualizada.id ? mesaActualizada : mesa);
    });
  };

  const agregarMesa = async (capacidad) => {
    const mesaCreada = await crearMesaAPI(capacidad);
    setMesasOverride((mesasActuales) => [...(mesasActuales ?? datos?.mesas ?? []), mesaCreada]);
  };

  const quitarMesa = async (id) => {
    await eliminarMesaAPI(id);
    setMesasOverride((mesasActuales) => ((mesasActuales ?? datos?.mesas ?? []).filter((mesa) => mesa.id !== id)));
  };

  // Sirve tanto para un cliente sin reserva como para el que llega a su reserva
  const ocuparMesa = async (id) => {
    const mesa = mesas.find((item) => item.id === id);
    if (!mesa) throw new Error('No se encontró la mesa seleccionada');
    const mesaActualizada = await actualizarMesa(mesa, 'Ocupada');
    actualizarEstadoLocal(mesaActualizada);
    if (mesa.reserva) await refrescarReservas(); // la reserva pasó a "En curso"
  };

  // Si la mesa tiene otra reserva de hoy pendiente, el backend la devuelve como 'Reservada'
  const liberarMesa = async (id) => {
    const mesa = mesas.find((item) => item.id === id);
    if (!mesa) throw new Error('No se encontró la mesa seleccionada');
    const mesaActualizada = await actualizarMesa(mesa, 'Libre');
    actualizarEstadoLocal(mesaActualizada);
    await refrescarReservas(); // si tenía una reserva "En curso", ahora está "Finalizada"
  };

  const agregarReserva = async (nuevaReserva) => {
    const reservaCreada = await crearReserva(nuevaReserva);
    setReservasOverride([...reservas, reservaCreada]);
    return reservaCreada;
  };

  const eliminarReserva = async (idReserva) => {
    await eliminarReservaAPI(idReserva);
    setReservasOverride(reservas.filter((reserva) => reserva.id !== String(idReserva)));
    await refrescarMesas();
  };

  const asignarReservaAMesa = async (idReserva, mesasIds) => {
    const reserva = reservas.find(r => r.id === idReserva);
    if (!reserva) throw new Error('No se encontró la reserva seleccionada');
    const reservaActualizada = await actualizarReserva(idReserva, { mesaIds: mesasIds.map(Number) });
    setReservasOverride(reservas.map((item) => (item.id === reservaActualizada.id ? reservaActualizada : item)));
    await refrescarMesas(); // así la mesa pasa a "Reservada" apenas se asigna
  };

  // Si cambió la fecha o la hora, el backend vuelve a controlar las mesas asignadas
  const editarReserva = async (reservaOriginal, datosFormulario) => {
    const reservaActualizada = await editarReservaAPI(reservaOriginal, datosFormulario);
    setReservasOverride(reservas.map((item) => (item.id === reservaActualizada.id ? reservaActualizada : item)));
    await refrescarMesas(); // la mesa puede dejar de figurar como reservada hoy (o empezar a hacerlo)
    return reservaActualizada;
  };

  return {
    mesas, reservas, cargando, error,
    agregarMesa, quitarMesa, ocuparMesa, liberarMesa,
    agregarReserva, editarReserva, eliminarReserva, asignarReservaAMesa
  };
}
