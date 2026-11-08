-- Ejecutar despues de schema.sql, conectado a Pizzeria:
-- psql -U postgres -d Pizzeria -f database/seed.sql
-- Usuario: admin@maspizza.com | Contrasena: admin123
-- Los valores base se corresponden con los JSON de backend/data.

BEGIN;
SET client_encoding = 'UTF8';
INSERT INTO usuarios (id, nombre, email, rol, password) VALUES
  (1, 'Administrador', 'admin@maspizza.com', 'administrador', '$2b$10$VbffhZSRpWESiAbJMtOau.IFOdpdG3iZtMixD/LKeDhw3yWy8FJyq')
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  email = EXCLUDED.email,
  rol = EXCLUDED.rol,
  password = EXCLUDED.password;

INSERT INTO productos
  (id, nombre, precio, categoria, tamanos, permitemitad, stock, destacado, imagen, descripcion)
VALUES
  (1, 'Muzzarella Clásica', 8500, 'pizzas', ARRAY['4 porciones', '8 porciones'], TRUE, 50, TRUE, '/IMG_2169.jpeg', 'Salsa de tomate casera, abundante muzzarella, aceitunas verdes y orégano fresco al horno napolitano.'),
  (2, 'Napolitana Especial', 9800, 'pizzas', ARRAY['4 porciones', '8 porciones'], TRUE, 40, TRUE, '/IMG_2171.jpeg', 'Muzzarella, rodajas de tomate natural, ajo picado, parmesano gratinado y hojas de albahaca fresca.'),
  (3, 'Fugazzeta Rellena', 10500, 'pizzas', ARRAY['4 porciones', '8 porciones'], TRUE, 25, FALSE, '/IMG_6043.jpeg', 'Doble masa rellena de queso cremoso y muzzarella, cubierta con finas tiras de cebolla caramelizada.'),
  (4, 'Hamburguesa Doble Smash +Pizza', 9200, 'comidas', ARRAY['Simple', 'Doble con Papas'], FALSE, 30, TRUE, '/IMG_5211.jpeg', 'Doble medallón de carne smash de 120g, cheddar fundido, bacon crocante y salsa especial en pan brioche.'),
  (5, 'Lomo Completo San Luis', 11500, 'comidas', ARRAY['Para compartir'], FALSE, 20, FALSE, '/IMG_5205.jpeg', 'Bife de lomo tierno, lechuga, tomate, jamón, queso, huevo frito y mayonesa casera en pan casero.'),
  (6, 'Mascrazzy de Jamón y Queso', 4500, 'comidas', ARRAY['Individual'], FALSE, 15, FALSE, '/IMG_2169.jpeg', 'Tartita individual crocante rellena de queso tybo fundido y jamón cocido seleccionado.'),
  (7, 'Cerveza Corona 710ml', 4200, 'bebidas', ARRAY['710ml'], FALSE, 60, FALSE, '/IMG_2171.jpeg', 'Cerveza rubia bien fría con rodaja de lima.'),
  (8, 'Coca Cola 1.5L', 3200, 'bebidas', ARRAY['1.5L'], FALSE, 80, FALSE, '/IMG_6043.jpeg', 'Línea clásica sabor original retornable/descartable.')
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  precio = EXCLUDED.precio,
  categoria = EXCLUDED.categoria,
  tamanos = EXCLUDED.tamanos,
  permitemitad = EXCLUDED.permitemitad,
  stock = EXCLUDED.stock,
  destacado = EXCLUDED.destacado,
  imagen = EXCLUDED.imagen,
  descripcion = EXCLUDED.descripcion;

INSERT INTO ingredientes (id, nombre, activo) VALUES
  (1, 'Muzzarella', TRUE),
  (2, 'Salsa de tomate', TRUE),
  (3, 'Aceitunas verdes', TRUE),
  (4, 'Orégano', TRUE),
  (5, 'Tomate en rodajas', TRUE),
  (6, 'Ajo', TRUE),
  (7, 'Parmesano', TRUE),
  (8, 'Albahaca fresca', TRUE),
  (9, 'Queso cremoso', TRUE),
  (10, 'Cebolla caramelizada', TRUE),
  (11, 'Longaniza calabresa', TRUE),
  (12, 'Aceitunas negras', TRUE),
  (13, 'Ají molido', TRUE),
  (14, 'Jamón cocido', TRUE),
  (15, 'Morrones asados', TRUE),
  (16, 'Roquefort', FALSE),
  (17, 'Cebolla', TRUE),
  (18, 'Jamón crudo', TRUE),
  (19, 'Rúcula', TRUE),
  (20, 'Tomates cherry', TRUE),
  (21, 'Filetes de anchoa', TRUE),
  (22, 'Alcaparras', TRUE),
  (23, 'Nueces', TRUE),
  (24, 'Cebolla de verdeo', TRUE),
  (25, 'Miel', TRUE),
  (26, 'Aceite de oliva', TRUE),
  (27, 'Provolone', TRUE),
  (28, 'Palmitos', FALSE),
  (29, 'Salsa golf', TRUE),
  (30, 'Huevo duro', TRUE),
  (31, 'Champignones', TRUE),
  (32, 'Salsa blanca', TRUE),
  (33, 'Pepperoni', TRUE)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  activo = EXCLUDED.activo;

INSERT INTO mesas (id, capacidad, estado) VALUES
  (1, 2, 'Libre'),
  (2, 2, 'Libre'),
  (3, 4, 'Libre'),
  (4, 4, 'Libre'),
  (5, 6, 'Libre'),
  (6, 8, 'Libre')
ON CONFLICT (id) DO UPDATE SET
  capacidad = EXCLUDED.capacidad,
  estado = EXCLUDED.estado;

INSERT INTO pedidos
  (id, cliente, telefono, tipo, direccionmesa, total, detalle, usuario_id, estado)
VALUES
  (1, 'Marta Gómez', '5492664112233', 'delivery', 'Av. Lafinur 500', 14500, '1x Pizza Especial, 1x Cerveza Andes', NULL, 'Pendiente'),
  (2, 'Carlos Ruiz', '5492664998877', 'retiro', 'Pasa a buscar 21:30hs', 9000, '1x Pizza Muzzarella', NULL, 'Confirmada')
ON CONFLICT (id) DO UPDATE SET
  cliente = EXCLUDED.cliente,
  telefono = EXCLUDED.telefono,
  tipo = EXCLUDED.tipo,
  direccionmesa = EXCLUDED.direccionmesa,
  total = EXCLUDED.total,
  detalle = EXCLUDED.detalle,
  usuario_id = EXCLUDED.usuario_id,
  estado = EXCLUDED.estado;

INSERT INTO reservas
  (id, cliente, contacto, fecha, hora, comensales, lugar, usuario_id)
VALUES
  (1, 'Martín Palermo', '5492664112233', CURRENT_DATE + 7, TIME '21:30', 6, 'Festejo de cumpleaños', NULL),
  (2, 'Sofía Vergara', '5492664998877', CURRENT_DATE + 14, TIME '20:00', 2, 'Salón principal', NULL)
ON CONFLICT (id) DO UPDATE SET
  cliente = EXCLUDED.cliente,
  contacto = EXCLUDED.contacto,
  fecha = EXCLUDED.fecha,
  hora = EXCLUDED.hora,
  comensales = EXCLUDED.comensales,
  lugar = EXCLUDED.lugar,
  usuario_id = EXCLUDED.usuario_id;

INSERT INTO producto_ingrediente (producto_id, ingrediente_id) VALUES
  (1, 1),
  (1, 2),
  (1, 3),
  (1, 4),
  (2, 1),
  (2, 5),
  (2, 6),
  (2, 7),
  (2, 8),
  (3, 1),
  (3, 9),
  (3, 10),
  (5, 14),
  (5, 30),
  (6, 14)
ON CONFLICT (producto_id, ingrediente_id) DO NOTHING;

-- La fuente JSON de pedidos solo trae el texto detalle; estas lineas de
-- detalle_pedido son relaciones de ejemplo para poder probar esa tabla.
INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad) VALUES
  (1, 2, 1),
  (1, 7, 1),
  (2, 1, 1)
ON CONFLICT (pedido_id, producto_id) DO UPDATE SET
  cantidad = EXCLUDED.cantidad;

INSERT INTO reserva_mesa (reserva_id, mesa_id) VALUES
  (1, 1),
  (1, 2),
  (2, 5)
ON CONFLICT (reserva_id, mesa_id) DO NOTHING;
SELECT setval(
  pg_get_serial_sequence('usuarios', 'id'),
  COALESCE(MAX(id), 1),
  MAX(id) IS NOT NULL
) FROM usuarios;
SELECT setval(
  pg_get_serial_sequence('productos', 'id'),
  COALESCE(MAX(id), 1),
  MAX(id) IS NOT NULL
) FROM productos;
SELECT setval(
  pg_get_serial_sequence('ingredientes', 'id'),
  COALESCE(MAX(id), 1),
  MAX(id) IS NOT NULL
) FROM ingredientes;
SELECT setval(
  pg_get_serial_sequence('mesas', 'id'),
  COALESCE(MAX(id), 1),
  MAX(id) IS NOT NULL
) FROM mesas;
SELECT setval(
  pg_get_serial_sequence('pedidos', 'id'),
  COALESCE(MAX(id), 1),
  MAX(id) IS NOT NULL
) FROM pedidos;
SELECT setval(
  pg_get_serial_sequence('reservas', 'id'),
  COALESCE(MAX(id), 1),
  MAX(id) IS NOT NULL
) FROM reservas;

COMMIT;
