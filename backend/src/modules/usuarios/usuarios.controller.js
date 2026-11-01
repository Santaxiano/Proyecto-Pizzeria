import { pool } from '../../config/db.js';

export const listar = async (req, res, next) =>{
    try{
    const {rows} = await pool.query('SELECT id, nombre, email, rol FROM usuarios ORDER BY id');
    res.json(rows);
    }catch(err){
        next(err);
    }
}

export const eliminar = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM usuarios WHERE id = $1', [req.idParseado]);
    if (rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const actualizar = async (req, res, next) => {
  try {
    const { nombre, email, rol } = req.body;
    
    const { rows } = await pool.query(
      'UPDATE usuarios SET nombre = $1, email = $2, rol = $3 WHERE id = $4 RETURNING id, nombre, email, rol',
      [nombre, email, rol, req.idParseado]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    next(err);
  }
};