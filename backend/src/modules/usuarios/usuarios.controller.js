import { pool } from '../../config/db.js';

const ROLES_VALIDOS = ['empleado', 'administrador'];
const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const crearError = (status, mensaje) => Object.assign(new Error(mensaje), { status, publicMessage: mensaje });

// El sistema nunca puede quedar sin al menos un administrador
const contarOtrosAdministradores = async (idExcluido) => {
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS cantidad FROM usuarios WHERE rol = 'administrador' AND id <> $1",
    [idExcluido]
  );
  return rows[0].cantidad;
};

const obtenerRol = async (id) => {
  const { rows } = await pool.query('SELECT rol FROM usuarios WHERE id = $1', [id]);
  return rows[0]?.rol ?? null;
};

export const listar = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id, nombre, email, rol FROM usuarios ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  const id = req.idParseado;
  try {
    if (id === req.usuario.id) {
      return next(crearError(400, 'No podés eliminar tu propia cuenta'));
    }

    const rolActual = await obtenerRol(id);
    if (!rolActual) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (rolActual === 'administrador' && (await contarOtrosAdministradores(id)) === 0) {
      return next(crearError(409, 'No se puede eliminar al último administrador'));
    }

    await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  const id = req.idParseado;
  const { nombre, email, rol } = req.body ?? {};

  if (typeof nombre !== 'string' || nombre.trim() === '' || nombre.length > 255) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (typeof email !== 'string' || !EMAIL_VALIDO.test(email.trim())) {
    return res.status(400).json({ error: 'El email no tiene un formato válido' });
  }
  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: 'El rol debe ser empleado o administrador' });
  }

  try {
    const rolActual = await obtenerRol(id);
    if (!rolActual) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Quitarle el rol al último administrador dejaría el sistema sin nadie que lo gestione
    if (rolActual === 'administrador' && rol !== 'administrador'
      && (await contarOtrosAdministradores(id)) === 0) {
      return next(crearError(409, 'No se le puede quitar el rol al último administrador'));
    }

    const { rows } = await pool.query(
      'UPDATE usuarios SET nombre = $1, email = $2, rol = $3 WHERE id = $4 RETURNING id, nombre, email, rol',
      [nombre.trim(), email.trim().toLowerCase(), rol, id]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    next(err);
  }
};
