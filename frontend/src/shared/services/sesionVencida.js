import { cerrarSesion } from '../../features/login/service/inicioservice';

const URL_API = 'http://localhost:3000/api';
let instalado = false;
let redirigiendo = false;

// Hay muchos services, cada uno con su propio fetch. En vez de tocarlos todos, se envuelve
// fetch una sola vez: si una petición a nuestra API que llevaba token responde 401
// (token vencido o cuenta eliminada) dentro del gestor, se cierra la sesión y se va al login.
// El login con contraseña incorrecta no manda token, así que no entra en esta regla.
export function instalarControlSesionVencida() {
  if (instalado) return;
  instalado = true;

  const fetchOriginal = window.fetch.bind(window);

  window.fetch = async (recurso, opciones = {}) => {
    const respuesta = await fetchOriginal(recurso, opciones);

    const url = typeof recurso === 'string' ? recurso : recurso?.url ?? String(recurso);
    const headers = new Headers(opciones.headers ?? (recurso instanceof Request ? recurso.headers : undefined));
    const llevabaToken = headers.has('Authorization');
    const enGestor = window.location.pathname.startsWith('/gestor');

    if (respuesta.status === 401 && llevabaToken && enGestor && url.startsWith(URL_API) && !redirigiendo) {
      redirigiendo = true;
      cerrarSesion();
      window.location.assign('/login?sesion=vencida');
    }

    return respuesta;
  };
}
