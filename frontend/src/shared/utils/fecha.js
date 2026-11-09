// Fecha de hoy en hora LOCAL con formato AAAA-MM-DD (el que usan los <input type="date">).
// No usar new Date().toISOString(): pasa a UTC y después de las 21 h en Argentina ya da el día siguiente.
export function fechaLocalHoy() {
  const hoy = new Date();
  return [
    hoy.getFullYear(),
    String(hoy.getMonth() + 1).padStart(2, '0'),
    String(hoy.getDate()).padStart(2, '0'),
  ].join('-');
}
