const URL_BASE = 'http://localhost:3000/api/reservas';

function nombreCampo(datos, api, alternativo) {
  return Object.hasOwn(datos, alternativo) ? alternativo : api;
}

function fechaValida(fecha) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return false;
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const valor = new Date(anio, mes - 1, dia);
  if (valor.getFullYear() !== anio || valor.getMonth() !== mes - 1 || valor.getDate() !== dia) return false;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return valor >= hoy;
}

export function validarDatosReserva(datos) {
  const errores = {};
  const campos = [
    ['cliente', 'nombre', datos.cliente ?? datos.nombre, 255],
    ['contacto', 'whatsapp', datos.contacto ?? datos.whatsapp, 255],
    ['lugar', 'motivo', datos.lugar ?? datos.motivo ?? 'Salón Principal', 50],
  ];

  for (const [api, alternativo, valor, maximo] of campos) {
    const campo = nombreCampo(datos, api, alternativo);
    if (typeof valor !== 'string' || valor.trim() === '') {
      errores[campo] = 'Este campo es obligatorio.';
    } else if (valor.trim().length > maximo) {
      errores[campo] = `No puede superar los ${maximo} caracteres.`;
    } else if (api === 'contacto' && valor.trim().replace(/\D/g, '').length < 8) {
      errores[campo] = 'Ingresá al menos 8 dígitos de contacto.';
    }
  }

  const fechaCampo = nombreCampo(datos, 'fecha', 'fecha');
  if (typeof datos.fecha !== 'string' || !fechaValida(datos.fecha)) {
    errores[fechaCampo] = 'Seleccioná una fecha válida a partir de hoy.';
  }

  const horaCampo = nombreCampo(datos, 'hora', 'hora');
  if (typeof datos.hora !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(datos.hora)) {
    errores[horaCampo] = 'Seleccioná un horario válido.';
  }

  const comensales = datos.comensales ?? datos.personas;
  const comensalesCampo = nombreCampo(datos, 'comensales', 'personas');
  if (!Number.isInteger(comensales) || comensales <= 0) {
    errores[comensalesCampo] = 'Ingresá una cantidad entera mayor que cero.';
  }

  return errores;
}

function obtenerToken() {
  try {
    return JSON.parse(sessionStorage.getItem('pizzeria:sesion'))?.token;
  } catch {
    return null;
  }
}

function headersAPI(requiereToken = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (requiereToken) {
    const token = obtenerToken();
    if (!token) throw new Error('Iniciá sesión para gestionar las reservas');
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function solicitar(url, opciones, mensajeError) {
  const respuesta = await fetch(url, opciones);

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || mensajeError);
  }

  if (respuesta.status === 204) return null;
  return respuesta.json();
}

export function adaptarReserva(reserva) {
  const fecha = typeof reserva.fecha === 'string' && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(reserva.fecha)
    ? reserva.fecha.slice(0, 10)
    : null;
  if (!fecha) {
    throw new Error('La API devolvió una fecha de reserva inválida');
  }

  const hora = reserva.hora?.slice(0, 5);
  const mesasIds = (reserva.mesas_ids ?? reserva.mesasIds ?? []).map(Number);
  return {
    ...reserva,
    id: String(reserva.id),
    fecha,
    mesasIds,
    hora,
    desde: hora,
    personas: reserva.comensales,
    nombre: reserva.cliente,
    whatsapp: reserva.contacto,
    motivo: reserva.lugar,
    lugarMotivo: reserva.lugar,
  };
}

export async function crearReserva(datos) {
  const errores = validarDatosReserva(datos);
  if (Object.keys(errores).length > 0) {
    const error = new Error('Revisá los campos indicados.');
    error.campos = errores;
    throw error;
  }

  const reserva = await solicitar(URL_BASE, {
    method: 'POST',
    headers: headersAPI(),
    body: JSON.stringify({
      cliente: datos.cliente ?? datos.nombre,
      contacto: datos.contacto ?? datos.whatsapp,
      fecha: datos.fecha,
      hora: datos.hora,
      comensales: datos.comensales ?? datos.personas,
      lugar: datos.lugar ?? datos.motivo ?? 'Salón Principal',
    }),
  }, 'No se pudo crear la reserva');

  return adaptarReserva(reserva);
}

export async function listarReservas(fecha) {
  const url = fecha ? `${URL_BASE}?fecha=${encodeURIComponent(fecha)}` : URL_BASE;
  const reservas = await solicitar(url, {
    headers: headersAPI(true),
  }, 'No se pudieron cargar las reservas');

  return reservas.map(adaptarReserva);
}

export async function actualizarReserva(id, cambios) {
  const reserva = await solicitar(`${URL_BASE}/${id}`, {
    method: 'PATCH',
    headers: headersAPI(true),
    body: JSON.stringify(cambios),
  }, 'No se pudo actualizar la reserva');

  return adaptarReserva(reserva);
}

export async function eliminarReserva(id) {
  await solicitar(`${URL_BASE}/${id}`, {
    method: 'DELETE',
    headers: headersAPI(true),
  }, 'No se pudo eliminar la reserva');
}