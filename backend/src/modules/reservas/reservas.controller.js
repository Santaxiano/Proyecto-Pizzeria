import { pool } from '../../config/db.js';

export const listar = async (req, res, next) => {
  try {
    const { fecha } = req.query;
    let sql = 'SELECT * FROM reservas';
    const params = [];

    if (fecha) {
      sql += ' WHERE fecha = $1';
      params.push(fecha);
    }

    sql += ' ORDER BY fecha ASC, hora ASC';

    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};