// Convierte una fecha (Date, ISO o timestamp) al día LOCAL en formato AAAA-MM-DD.
// No usar toISOString(): pasa a UTC y después de las 21 h en Argentina ya da el día siguiente.
export function fechaLocalISO(fecha) {
  const valor = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(valor.getTime())) return '';

  return [
    valor.getFullYear(),
    String(valor.getMonth() + 1).padStart(2, '0'),
    String(valor.getDate()).padStart(2, '0'),
  ].join('-');
}

// Fecha de hoy en hora LOCAL con formato AAAA-MM-DD (el que usan los <input type="date">).
export function fechaLocalHoy() {
  return fechaLocalISO(new Date());
}
