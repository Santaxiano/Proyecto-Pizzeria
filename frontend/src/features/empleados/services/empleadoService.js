export async function registrarEmpleado(datosUsuario) {
    // Simulamos una demora de conexión de 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Validamos que no falte nada crítico por las dudas
    if (!datosUsuario.email || !datosUsuario.password || !datosUsuario.rol) {
        throw new Error('Faltan datos obligatorios para el registro.');
    }
    
    console.log("Empleado registrado:", datosUsuario);
    return true; 
}