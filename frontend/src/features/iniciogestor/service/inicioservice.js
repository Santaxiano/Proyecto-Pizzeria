import { redirect } from 'react-router';

const CLAVE_SESION = 'pizzeria:sesion';

import usuariosData from '../../../../../backend/data/usuarios.json';

//  la funcion para lo que es el inicio de sesion
export async function iniciarSesion(email, password) {
    // aca busca directamente en el JSON que importamos de la carpeta backend
    const usuario = usuariosData.find(
        (u) => u.email === email.trim().toLowerCase() && u.password === password
    );

    // si no lo encuentra, lanza el error para que el formulario muestre el cartel rojo
    if (!usuario) {
        throw new Error('Email o contraseña incorrectos.');
    }

    // si lo encuentra, guardamos el "ticket" en la memoria del navegador
    const sesion = { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    return sesion;
}

//  la funcion  para manejar la memoria de la sesión
export function obtenerSesion() {
    try {
        return JSON.parse(sessionStorage.getItem(CLAVE_SESION));
    } catch {
        return null;
    }
}

export function cerrarSesion() {
    sessionStorage.removeItem(CLAVE_SESION);
}

// Validar accesos antes de cargar las páginas en el enrutador.
export function protegerRuta() {
    const sesion = obtenerSesion();
    if (!sesion) {
        throw redirect('/login'); // si no hay sesión, lo patea al login
    }
    return sesion;
}

export function redirigirSiHaySesion() {
    if (obtenerSesion()) {
        throw redirect('/gestor'); // si ya inició sesión y entra al login, lo manda directo al panel
    }
    return null;
}