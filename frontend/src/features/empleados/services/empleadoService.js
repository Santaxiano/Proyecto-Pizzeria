const URL_BASE = 'http://localhost:3000/api';

function obtenerToken() {
  const sesion = JSON.parse(sessionStorage.getItem('pizzeria:sesion'));
  return sesion ? sesion.token : null;
}

export async function registrarEmpleado(datosUsuario) {
  const token = obtenerToken();

  if (!token) {
    throw new Error('No tenés permisos para realizar esta acción. Iniciá sesión.');
  }

  const rolNormalizado = datosUsuario.rol === 'admin' ? 'administrador' : datosUsuario.rol;

  const respuesta = await fetch(`${URL_BASE}/auth/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
    body: JSON.stringify({
      nombre: datosUsuario.nombre,
      email: datosUsuario.email,
      password: datosUsuario.password,
      rol: rolNormalizado
    })
  });

  const data = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(data.error || 'No se pudo registrar al empleado');
  }

  return data; 
}