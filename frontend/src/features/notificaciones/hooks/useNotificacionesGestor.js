import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fechaLocalHoy } from '../../../shared/utils/fecha';
import { obtenerNotificaciones } from '../services/notificacionesService';

const INTERVALO_POLLING_MS = 15_000;
const DURACION_TOAST_MS = 8_000;
const MAX_TOASTS = 3;
const RETENCION_LEIDAS_MS = 30 * 24 * 60 * 60 * 1000;

const CLAVE_LEIDAS = 'maspizza:notificaciones:leidas';
const CLAVE_SONIDO = 'maspizza:notificaciones:sonido';

function leerLeidas() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_LEIDAS));
    if (!guardado || typeof guardado !== 'object') return {};

    const limite = Date.now() - RETENCION_LEIDAS_MS;
    return Object.fromEntries(
      Object.entries(guardado).filter(([, fecha]) => Number(fecha) >= limite)
    );
  } catch {
    return {};
  }
}

function guardarLeidas(leidas) {
  try {
    const limite = Date.now() - RETENCION_LEIDAS_MS;
    const vigentes = Object.fromEntries(
      Object.entries(leidas).filter(([, fecha]) => Number(fecha) >= limite)
    );
    localStorage.setItem(CLAVE_LEIDAS, JSON.stringify(vigentes));
  } catch {
    // Si el navegador bloquea localStorage, las notificaciones siguen funcionando en memoria.
  }
}

function leerSonidoActivo() {
  try {
    return localStorage.getItem(CLAVE_SONIDO) !== 'false';
  } catch {
    return true;
  }
}

function guardarSonidoActivo(activo) {
  try {
    localStorage.setItem(CLAVE_SONIDO, String(activo));
  } catch {
    // Sin persistencia: el sonido se mantiene activo durante la sesión actual.
  }
}

export function useNotificacionesGestor() {
  const [notificacionesHoy, setNotificacionesHoy] = useState([]);
  const [resumenHoy, setResumenHoy] = useState({ total: 0, pedidos: 0, reservas: 0 });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);

  const [leidas, setLeidas] = useState(leerLeidas);
  const [toasts, setToasts] = useState([]);
  const [sonidoActivo, setSonidoActivo] = useState(leerSonidoActivo);

  const [panelAbierto, setPanelAbierto] = useState(false);
  const [fechaPanel, setFechaPanel] = useState(() => fechaLocalHoy());
  const [notificacionesFecha, setNotificacionesFecha] = useState([]);
  const [cargandoFecha, setCargandoFecha] = useState(false);
  const [errorFecha, setErrorFecha] = useState('');

  const montado = useRef(true);
  const enCursoHoy = useRef(false);
  const solicitudFecha = useRef(0);
  const idsConocidos = useRef(null);
  const hoyActual = useRef(fechaLocalHoy());
  const timersToasts = useRef(new Map());
  const audioCtx = useRef(null);
  const sonidoActivoRef = useRef(sonidoActivo);

  useEffect(() => {
    sonidoActivoRef.current = sonidoActivo;
    guardarSonidoActivo(sonidoActivo);
  }, [sonidoActivo]);

  useEffect(() => {
    const timers = timersToasts.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  const cerrarToast = useCallback((toastId) => {
    const timer = timersToasts.current.get(toastId);
    if (timer) {
      clearTimeout(timer);
      timersToasts.current.delete(toastId);
    }
    setToasts((prev) => prev.filter((toast) => toast.toastId !== toastId));
  }, []);

  const agregarToast = useCallback((notificacion) => {
    const toastId = `${notificacion.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    setToasts((prev) => [...prev, { ...notificacion, toastId }].slice(-MAX_TOASTS));

    const timer = setTimeout(() => {
      timersToasts.current.delete(toastId);
      setToasts((prev) => prev.filter((toast) => toast.toastId !== toastId));
    }, DURACION_TOAST_MS);

    timersToasts.current.set(toastId, timer);
  }, []);

  // Sonido suave de dos tonos generado con Web Audio (no necesita archivo mp3).
  // Si el navegador exige una interacción previa, el error se ignora.
  const reproducirSonido = useCallback(() => {
    try {
      const ClaseAudio = window.AudioContext || window.webkitAudioContext;
      if (!ClaseAudio) return;

      if (!audioCtx.current) audioCtx.current = new ClaseAudio();
      const contexto = audioCtx.current;
      if (contexto.state === 'suspended') contexto.resume().catch(() => {});

      const oscilador = contexto.createOscillator();
      const ganancia = contexto.createGain();
      const ahora = contexto.currentTime;

      oscilador.type = 'sine';
      oscilador.frequency.setValueAtTime(880, ahora);
      oscilador.frequency.exponentialRampToValueAtTime(660, ahora + 0.18);

      ganancia.gain.setValueAtTime(0.0001, ahora);
      ganancia.gain.exponentialRampToValueAtTime(0.07, ahora + 0.02);
      ganancia.gain.exponentialRampToValueAtTime(0.0001, ahora + 0.28);

      oscilador.connect(ganancia);
      ganancia.connect(contexto.destination);
      oscilador.start(ahora);
      oscilador.stop(ahora + 0.3);
    } catch {
      // El navegador no permite reproducir audio: la notificación visual sigue funcionando.
    }
  }, []);

  const cargarHoy = useCallback(async ({ silencioso = false } = {}) => {
    if (enCursoHoy.current || !montado.current) return;
    enCursoHoy.current = true;
    if (!silencioso) setCargando(true);

    try {
      const datos = await obtenerNotificaciones(fechaLocalHoy());
      if (!montado.current) return;

      const fecha = datos.fecha || fechaLocalHoy();
      if (fecha !== hoyActual.current) {
        // Cambió el día mientras el gestor tenía la pestaña abierta:
        // los pedidos del día nuevo sí deben generar aviso.
        hoyActual.current = fecha;
        idsConocidos.current = new Set();
      }

      const lista = Array.isArray(datos.notificaciones) ? datos.notificaciones : [];
      setNotificacionesHoy(lista);
      setResumenHoy(datos.resumen ?? { total: 0, pedidos: 0, reservas: 0 });
      setError('');
      setUltimaActualizacion(new Date());

      if (idsConocidos.current === null) {
        // Primera carga: se toma la foto actual sin avisar por lo que ya existía.
        idsConocidos.current = new Set(lista.map((notificacion) => notificacion.id));
        return;
      }

      const nuevas = lista.filter((notificacion) => !idsConocidos.current.has(notificacion.id));
      if (nuevas.length === 0) return;

      nuevas.forEach((notificacion) => idsConocidos.current.add(notificacion.id));
      nuevas.slice(-MAX_TOASTS).forEach(agregarToast);
      if (sonidoActivoRef.current) reproducirSonido();
    } catch (err) {
      if (montado.current && err.name !== 'AbortError') {
        setError(err.message || 'No se pudieron actualizar las notificaciones');
      }
    } finally {
      enCursoHoy.current = false;
      if (montado.current && !silencioso) setCargando(false);
    }
  }, [agregarToast, reproducirSonido]);

  // Polling cada 15 s. Se pausa si la pestaña está en segundo plano y se
  // actualiza apenas el gestor vuelve a mirar el panel.
  useEffect(() => {
    montado.current = true;
    // Se difiere la primera carga para no hacer setState dentro del cuerpo del efecto.
    const cargaInicial = window.setTimeout(() => cargarHoy(), 0);

    const intervalo = window.setInterval(() => {
      if (document.visibilityState === 'visible') cargarHoy({ silencioso: true });
    }, INTERVALO_POLLING_MS);

    const alVolverALaPestana = () => {
      if (document.visibilityState === 'visible') cargarHoy({ silencioso: true });
    };

    document.addEventListener('visibilitychange', alVolverALaPestana);

    return () => {
      montado.current = false;
      window.clearTimeout(cargaInicial);
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolverALaPestana);
    };
  }, [cargarHoy]);

  const cargarFecha = useCallback(async (fecha, { silencioso = false } = {}) => {
    if (!fecha) return;

    const solicitud = ++solicitudFecha.current;
    if (!silencioso) {
      setCargandoFecha(true);
      setErrorFecha('');
      setNotificacionesFecha([]);
    }

    try {
      const datos = await obtenerNotificaciones(fecha);
      if (!montado.current || solicitud !== solicitudFecha.current) return;

      setNotificacionesFecha(Array.isArray(datos.notificaciones) ? datos.notificaciones : []);
      setErrorFecha('');
    } catch (err) {
      if (montado.current && solicitud === solicitudFecha.current && err.name !== 'AbortError') {
        setErrorFecha(err.message || 'No se pudieron cargar las notificaciones de esa fecha');
      }
    } finally {
      if (montado.current && solicitud === solicitudFecha.current && !silencioso) {
        setCargandoFecha(false);
      }
    }
  }, []);

  // Mientras el panel está abierto también se refresca solo (por si llega algo nuevo).
  useEffect(() => {
    if (!panelAbierto) return undefined;

    const cargaInicial = window.setTimeout(() => cargarFecha(fechaPanel), 0);
    const intervalo = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        cargarFecha(fechaPanel, { silencioso: true });
      }
    }, INTERVALO_POLLING_MS);

    return () => {
      window.clearTimeout(cargaInicial);
      window.clearInterval(intervalo);
    };
  }, [panelAbierto, fechaPanel, cargarFecha]);

  const recargarFecha = useCallback(() => cargarFecha(fechaPanel), [cargarFecha, fechaPanel]);

  const abrirPanel = useCallback(() => {
    setFechaPanel(fechaLocalHoy());
    setPanelAbierto(true);
  }, []);

  const cerrarPanel = useCallback(() => setPanelAbierto(false), []);

  const marcarTodasComoLeidas = useCallback(() => {
    const esHoy = fechaPanel === fechaLocalHoy();
    const lista = esHoy ? notificacionesHoy : notificacionesFecha;
    if (lista.length === 0) return;

    const ahora = Date.now();
    setLeidas((prev) => {
      const siguiente = { ...prev };
      lista.forEach((notificacion) => {
        siguiente[notificacion.id] = ahora;
      });
      guardarLeidas(siguiente);
      return siguiente;
    });
  }, [fechaPanel, notificacionesHoy, notificacionesFecha]);

  const alternarSonido = useCallback(() => {
    setSonidoActivo((prev) => !prev);
  }, []);

  const noLeidasHoy = useMemo(
    () => notificacionesHoy.reduce(
      (total, notificacion) => total + (leidas[notificacion.id] ? 0 : 1),
      0
    ),
    [notificacionesHoy, leidas]
  );

  return {
    // Campana y avisos
    notificacionesHoy,
    resumenHoy,
    noLeidasHoy,
    cargando,
    error,
    ultimaActualizacion,
    toasts,
    cerrarToast,
    sonidoActivo,
    alternarSonido,

    // Panel por fecha
    panelAbierto,
    abrirPanel,
    cerrarPanel,
    fechaPanel,
    setFechaPanel,
    notificacionesFecha,
    cargandoFecha,
    errorFecha,
    recargarFecha,
    leidas,
    marcarTodasComoLeidas,
  };
}
