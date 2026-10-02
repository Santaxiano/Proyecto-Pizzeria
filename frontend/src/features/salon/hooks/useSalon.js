import { useState, useEffect } from 'react';
import { obtenerDatosSalon } from '../services/salonService';
import { useFetch } from '../../../shared/hooks/useFetch';

export function useSalon() {
  const { datos, cargando, error } = useFetch(obtenerDatosSalon);
  
  const [mesas, setMesas] = useState(() => {
    const guardadas = localStorage.getItem('salon-mesas-v3');
    return guardadas ? JSON.parse(guardadas) : [];
  });

  const [reservas, setReservas] = useState(() => {
    const guardadas = localStorage.getItem('salon-reservas-v3');
    return guardadas ? JSON.parse(guardadas) : [];
  });

  useEffect(() => {
    if (datos && !localStorage.getItem('salon-mesas-v3')) {
      setMesas(datos.mesas);
      setReservas(datos.reservas);
    }
  }, [datos]);

  useEffect(() => {
    if (mesas.length > 0) localStorage.setItem('salon-mesas-v3', JSON.stringify(mesas));
    if (reservas.length > 0) localStorage.setItem('salon-reservas-v3', JSON.stringify(reservas));
  }, [mesas, reservas]);

  const agregarMesa = (capacidad) => {
    const nuevoId = mesas.length > 0 ? Math.max(...mesas.map(m => m.id)) + 1 : 1;
    setMesas([...mesas, { id: nuevoId, estado: 'Libre', capacidad: Number(capacidad) }]);
  };

  const quitarMesa = (id) => setMesas(mesas.filter(m => m.id !== id));

  const ocuparMesa = (id) => {
    setMesas(mesas.map(m => m.id === id ? { ...m, estado: 'Ocupada', reservaId: null } : m));
  };

  const liberarMesa = (id) => {
    setMesas(mesas.map(m => m.id === id ? { id: m.id, capacidad: m.capacidad, estado: 'Libre', reservaId: null, cliente: null } : m));
  };

  const agregarReserva = (nuevaReserva) => {
    setReservas([...reservas, { ...nuevaReserva, id: `res-${Date.now()}` }]);
  };

  const eliminarReserva = (idReserva) => {
    setReservas(reservas.filter(r => r.id !== idReserva));
    setMesas(mesas.map(m => m.reservaId === idReserva ? { id: m.id, capacidad: m.capacidad, estado: 'Libre', reservaId: null } : m));
  };

  const asignarReservaAMesa = (idReserva, idMesa) => {
    const reserva = reservas.find(r => r.id === idReserva);
    if (!reserva) return;

    const horaReserva = reserva.desde || reserva.hora;

    setMesas(mesas.map(m => {
      if (m.id === Number(idMesa)) {
        // Validación de turnos: Si ya tiene una reserva en otro horario, evitamos pisarla sin querer
        if (m.estado === 'Reservada' && m.desde && m.desde !== horaReserva) {
          alert(`⚠️ La Mesa ${idMesa} ya está reservada para el turno de las ${m.desde} hs. Elegí otra mesa o libera esta primero.`);
          return m;
        }

        return {
          ...m,
          estado: 'Reservada',
          reservaId: reserva.id,
          cliente: reserva.cliente || reserva.nombre,
          comensales: reserva.comensales || reserva.personas,
          desde: horaReserva
        };
      }
      return m;
    }));
  };

  return {
    mesas, reservas, cargando, error,
    agregarMesa, quitarMesa, ocuparMesa, liberarMesa,
    agregarReserva, eliminarReserva, asignarReservaAMesa
  };
}