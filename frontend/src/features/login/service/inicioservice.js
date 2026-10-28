import { redirect } from 'react-router';

const CLAVE_SESION = 'pizzeria:sesion';
const URL_BASE = 'http://localhost:3000/api'; 

export async function iniciarSesion(email, password) {
    // Le pegamos directo a tu API real con PostgreSQL
    const respuesta = await fetch(`${URL_BASE}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            email: email.trim().toLowerCase(), 
            password: password 
        })
    });

    if (!respuesta.ok) {
        throw new Error('Email o contraseña incorrectos.');
    }

    const data = await respuesta.json();

    const sesion = { 
        token: data.token, 
        id: data.usuario?.id, 
        nombre: data.usuario?.nombre, 
        email: data.usuario?.email, 
        rol: data.usuario?.rol 
    };
    
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    return sesion;
}

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

export function protegerRuta() {
    const sesion = obtenerSesion();
    if (!sesion || !sesion.token) {
        throw redirect('/login'); 
    }
    return sesion;
}

export function redirigirSiHaySesion() {
    const sesion = obtenerSesion();
    if (sesion && sesion.token) {
        throw redirect('/gestor'); 
    }
    return null;
}