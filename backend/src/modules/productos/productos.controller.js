import { pool } from '../../config/db.js';

// Trae los productos junto con sus ingredientes (tabla producto_ingrediente).
// "disponible" es el efecto dominó: hay stock Y ninguno de sus ingredientes está inactivo.
// bool_and ignora los NULL, así que un producto sin ingredientes (ej. bebidas) depende solo del stock.
const SELECT_PRODUCTOS = `
  SELECT p.*,
    COALESCE(
      json_agg(json_build_object('id', i.id, 'nombre', i.nombre, 'activo', i.activo) ORDER BY i.id)
        FILTER (WHERE i.id IS NOT NULL),
      '[]'
    ) AS ingredientes,
    (COALESCE(p.stock, 0) > 0 AND COALESCE(bool_and(i.activo), TRUE)) AS disponible
  FROM productos p
  LEFT JOIN producto_ingrediente pi ON pi.producto_id = p.id
  LEFT JOIN ingredientes i ON i.id = pi.ingrediente_id
`;

const buscarProductoPorId = async (db, id) => {
  const { rows } = await db.query(`${SELECT_PRODUCTOS} WHERE p.id = $1 GROUP BY p.id`, [id]);
  return rows[0];
};

// Reemplaza la receta completa del producto con la lista recibida.
// Se llama siempre dentro de una transacción (db = client del pool).
const guardarIngredientes = async (db, productoId, ingredientesIds) => {
  const ids = [...new Set(ingredientesIds)];

  if (ids.length > 0) {
    const { rows } = await db.query('SELECT id FROM ingredientes WHERE id = ANY($1::int[])', [ids]);
    const existentes = new Set(rows.map((r) => r.id));
    const faltantes = ids.filter((id) => !existentes.has(id));
    
    if (faltantes.length > 0) {
      // Creamos el error y le asignamos el status para que lo ataje el errorHandler
      const error = new Error(`Los ingredientes con id ${faltantes.join(', ')} no existen`);
      error.status = 400;
      throw error;
    }
  }

  await db.query('DELETE FROM producto_ingrediente WHERE producto_id = $1', [productoId]);

  if (ids.length > 0) {
    await db.query(
      `INSERT INTO producto_ingrediente (producto_id, ingrediente_id)
       SELECT $1, unnest($2::int[])`,
      [productoId, ids]
    );
  }
};

const valoresProducto = (body) => [
  body.nombre.trim(),
  body.precio,
  body.categoria.trim(),
  body.tamanos ?? null,
  body.permiteMitad ?? null,
  body.stock ?? null,
  body.destacado ?? null,
  body.imagen ?? null,
  body.descripcion ?? null,
];

export const listar = async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`${SELECT_PRODUCTOS} GROUP BY p.id ORDER BY p.id`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const producto = await buscarProductoPorId(pool, req.idParseado);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  const body = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO productos (nombre, precio, categoria, tamanos, permitemitad, stock, destacado, imagen, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      valoresProducto(body)
    );
    const id = rows[0].id;

    if (body.ingredientesIds !== undefined) {
      await guardarIngredientes(client, id, body.ingredientesIds);
    }

    const producto = await buscarProductoPorId(client, id);
    await client.query('COMMIT');
    res.status(201).json(producto);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err); // Delegamos el error al middleware global
  } finally {
    client.release();
  }
};

export const actualizar = async (req, res, next) => {
  const id = req.idParseado;
  const body = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rowCount } = await client.query(
      `UPDATE productos
       SET nombre = $1, precio = $2, categoria = $3, tamanos = $4, permitemitad = $5, stock = $6, destacado = $7, imagen = $8, descripcion = $9
       WHERE id = $10`,
      [...valoresProducto(body), id]
    );

    if (rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Si no mandan ingredientesIds, la receta queda como estaba (ej. el botón Activar/Desactivar).
    if (body.ingredientesIds !== undefined) {
      await guardarIngredientes(client, id, body.ingredientesIds);
    }

    const producto = await buscarProductoPorId(client, id);
    await client.query('COMMIT');
    res.json(producto);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    next(err); // Delegamos el error al middleware global
  } finally {
    client.release();
  }
};

export const eliminar = async (req, res, next) => {
  const id = req.idParseado;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM producto_ingrediente WHERE producto_id = $1', [id]);
    const { rowCount } = await client.query('DELETE FROM productos WHERE id = $1', [id]);

    if (rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await client.query('COMMIT');
    res.status(204).end();
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    // 23503: el producto figura en algún pedido (detalle_pedido)
    if (err.code === '23503') {
      const error = new Error('No se puede eliminar el producto porque tiene pedidos asociados');
      error.status = 409;
      return next(error);
    }
    next(err);
  } finally {
    client.release();
  }
};