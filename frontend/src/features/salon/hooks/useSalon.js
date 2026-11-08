import { useState, useEffect, useMemo } from 'react';
import { obtenerDatosSalon } from '../services/salonService';
import { useFetch } from '../../../shared/hooks/useFetch';
import { actualizarMesa, crearMesa as crearMesaAPI, eliminarMesa as eliminarMesaAPI } from '../services/mesaService';
import { actualizarReserva, crearReserva, eliminarReserva as eliminarReservaAPI } from '../../reservas/services/reservaService';

const RESERVAS_VACIAS = [];
const MESAS_VACIAS = [];
const VENTANA_PREVIA_MS = 30 * 60 * 1000; // 30 min antes de la reserva
const DURACION_RESERVA_MS = 2 * 60 * 60 * 1000; // La reserva asume 2 horas de ocupación

function reservaEnVentana(reserva, ahora) {
  const inicio = new Date(`${reserva.fecha}T${reserva.hora || reserva.desde}`).getTime();
  return Number.isFinite(inicio) && 
         ahora >= (inicio - VENTANA_PREVIA_MS) && 
         ahora <= (inicio + DURACION_RESERVA_MS);
}

export function useSalon() {
  const { datos, cargando, error } = useFetch(obtenerDatosSalon);

  const [mesasOverride, setMesasOverride] = useState(null);
  const [reservasOverride, setReservasOverride] = useState(null);
  const [ahora, setAhora] = useState(Date.now);
  const reservas = reservasOverride ?? datos?.reservas ?? RESERVAS_VACIAS;
  const mesasBase = mesasOverride ?? datos?.mesas ?? MESAS_VACIAS;

  useEffect(() => {
    const intervalo = setInterval(() => setAhora(Date.now()), 30_000);
    return () => clearInterval(intervalo);
  }, []);

  const mesas = useMemo(() => mesasBase.map((mesa) => {
    const reserva = reservas.find((item) => (
      item.mesasIds.includes(Number(mesa.id)) && reservaEnVentana(item, ahora)
    ));

    if (reserva) {
      return {
        ...mesa, estado: 'Reservada', reservaId: reserva.id,
        cliente: reserva.cliente, comensales: reserva.comensales, desde: reserva.hora,
      };
    }

    if (mesa.estado === 'Reservada') {
      return { ...mesa, estado: 'Libre', reservaId: null, cliente: null, comensales: null, desde: null };
    }

    return mesa;
  }), [mesasBase, reservas, ahora]);

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

  const ocuparMesa = async (id) => {
    const mesa = mesas.find((item) => item.id === id);
    if (!mesa) throw new Error('No se encontró la mesa seleccionada');
    const mesaActualizada = await actualizarMesa(mesa, 'Ocupada');
    actualizarEstadoLocal(mesaActualizada);
  };

  const liberarMesa = async (id) => {
    const mesa = mesas.find((item) => item.id === id);
    if (!mesa) throw new Error('No se encontró la mesa seleccionada');
    if (mesa.estado === 'Reservada') {
      throw new Error('La mesa está asignada a una reserva; liberala desde la agenda');
    }
    const mesaActualizada = await actualizarMesa(mesa, 'Libre');
    actualizarEstadoLocal(mesaActualizada);
  };

  const agregarReserva = async (nuevaReserva) => {
    const reservaCreada = await crearReserva(nuevaReserva);
    setReservasOverride([...reservas, reservaCreada]);
    return reservaCreada;
  };

  const eliminarReserva = async (idReserva) => {
    const reserva = reservas.find((item) => item.id === String(idReserva));
    await eliminarReservaAPI(idReserva);
    setReservasOverride(reservas.filter((reserva) => reserva.id !== String(idReserva)));
    if (reserva?.mesasIds.length) {
      const mesasLiberadas = new Set(reserva.mesasIds);
      setMesasOverride(mesasBase.map((mesa) => (
        mesasLiberadas.has(mesa.id) ? { ...mesa, estado: 'Libre' } : mesa
      )));
    }
  };

  const asignarReservaAMesa = async (idReserva, mesasIds) => {
    const reserva = reservas.find(r => r.id === idReserva);
    if (!reserva) throw new Error('No se encontró la reserva seleccionada');
    const reservaActualizada = await actualizarReserva(idReserva, { mesaIds: mesasIds.map(Number) });
    setReservasOverride(reservas.map((item) => (item.id === reservaActualizada.id ? reservaActualizada : item)));
  };

  return {
    mesas, reservas, cargando, error,
    agregarMesa, quitarMesa, ocuparMesa, liberarMesa,
    agregarReserva, eliminarReserva, asignarReservaAMesa
  };
}