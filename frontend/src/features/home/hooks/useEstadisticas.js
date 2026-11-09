import { useCallback, useEffect, useMemo, useState } from 'react';
import { obtenerEstadisticas, obtenerPedidosRecientes } from '../services/dashboardService';

const INTERVALO_ACTUALIZACION_MS = 60_000;

// Fecha local en formato AAAA-MM-DD (no se usa toISOString porque pasa a UTC)
export function fechaLocal(fecha = new Date()) {
  return [
    fecha.getFullYear(),
    String(fecha.getMonth() + 1).padStart(2, '0'),
    String(fecha.getDate()).padStart(2, '0'),
  ].join('-');
}

function restarDias(dias) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fechaLocal(fecha);
}

// periodo: { tipo: 'hoy' | '7dias' | '30dias' | 'fecha', fecha: 'AAAA-MM-DD' }
function calcularRango(periodo) {
  const hoy = fechaLocal();
  switch (periodo.tipo) {
    case '7dias': return { desde: restarDias(6), hasta: hoy };
    case '30dias': return { desde: restarDias(29), hasta: hoy };
    case 'fecha': return { desde: periodo.fecha, hasta: periodo.fecha };
    default: return { desde: hoy, hasta: hoy };
  }
}

export function useEstadisticas() {
  const [periodo, setPeriodo] = useState({ tipo: 'hoy', fecha: fechaLocal() });
  const [estadisticas, setEstadisticas] = useState(null);
  const [pedidosRecientes, setPedidosRecientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  const rango = useMemo(() => calcularRango(periodo), [periodo]);

  const cargar = useCallback(async (enSegundoPlano = false) => {
    if (enSegundoPlano) setActualizando(true);
    else setCargando(true);
    setError('');

    try {
      const [datos, recientes] = await Promise.all([
        obtenerEstadisticas(rango.desde, rango.hasta),
        obtenerPedidosRecientes(),
      ]);
      setEstadisticas(datos);
      setPedidosRecientes(recientes);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el panel de inicio.');
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, [rango]);

  // Carga al entrar y cada vez que cambia el período; después se refresca solo cada 60 s
  useEffect(() => {
    const cargaInicial = window.setTimeout(() => cargar(), 0);
    const intervalo = window.setInterval(() => cargar(true), INTERVALO_ACTUALIZACION_MS);
    return () => {
      window.clearTimeout(cargaInicial);
      window.clearInterval(intervalo);
    };
  }, [cargar]);

  return {
    periodo,
    setPeriodo,
    rango,
    estadisticas,
    pedidosRecientes,
    cargando,
    actualizando,
    error,
    recargar: () => cargar(true),
  };
}
