import { useState, useEffect } from 'react';

export function useFetch(funcionService) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function realizarPeticion() {
      try {
        setCargando(true);
        const respuesta = await funcionService();
        setDatos(respuesta);
      } catch (err) {
        setError(err.message || 'Error al obtener los datos');
      } finally {
        setCargando(false);
      }
    }
    realizarPeticion();
  }, [funcionService]);

  return { datos, cargando, error };
}
