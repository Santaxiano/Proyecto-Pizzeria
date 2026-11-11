// En Netlify se define VITE_API_URL con la URL del backend en Render.
// En local no hace falta configurar nada: usa localhost.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
