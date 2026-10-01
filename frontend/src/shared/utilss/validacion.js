// aca revisa que el campo no esté vacío
export function esRequerido(valor) {
    return valor !== undefined && valor !== null && valor.trim() !== '';
}

// aca revisa que el texto tenga formato de correo (@ y dominio)
export function esEmailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}