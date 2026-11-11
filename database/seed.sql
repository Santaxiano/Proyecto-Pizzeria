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
  (id, nombre, variantes, categoria, permitemitad, stock, destacado, imagen, descripcion, toppings)
VALUES
  (1, 'Muzzarella', '[{"nombre": "4 porciones", "precio": 9000}, {"nombre": "8 porciones", "precio": 15000}]'::jsonb, 'pizzas', TRUE, 50, TRUE, '/muzzarella.jpg', 'Salsa de tomate casera, abundante muzzarella, aceitunas verdes y orégano fresco al horno napolitano.', '[]'::jsonb),
  (2, 'Napolitana', '[{"nombre": "4 porciones", "precio": 10800}, {"nombre": "8 porciones", "precio": 18000}]'::jsonb, 'pizzas', TRUE, 40, TRUE, '/napo.jpg', 'Muzzarella, rodajas de tomate natural, ajo picado, parmesano gratinado y hojas de albahaca fresca.', '[]'::jsonb),
  (3, 'Fugazzeta', '[{"nombre": "4 porciones", "precio": 9600}, {"nombre": "8 porciones", "precio": 16000}]'::jsonb, 'pizzas', TRUE, 25, FALSE, '/fuga.jpg', 'Doble masa rellena de queso cremoso y muzzarella, cubierta con finas tiras de cebolla caramelizada.', '[]'::jsonb),
  (4, 'Pollo con barbacoa', '[{"nombre": "4 porciones", "precio": 9000}, {"nombre": "8 porciones", "precio": 15000}]'::jsonb, 'pizzas', TRUE, 50, TRUE, '/barbacoa.jpg', 'Muzzarella fundida, abundante pollo desmechado, aros de cebolla morada y un exquisito glaseado de salsa barbacoa.', '[]'::jsonb),
  (5, '+Burger', '[{"nombre": "Simple", "precio": 14500}, {"nombre": "Doble con Papas", "precio": 18000}]'::jsonb, 'comidas', FALSE, 30, TRUE, '/hamburguesa.jpeg', 'Doble medallón de carne smash de 120g, cheddar fundido, bacon crocante y salsa especial en pan brioche.', '[{"nombre": "Cheddar extra", "precio": 800}, {"nombre": "Bacon extra", "precio": 1000}, {"nombre": "Huevo frito", "precio": 600}, {"nombre": "Papas extra", "precio": 1200}]'::jsonb),
  (6, 'Hamburguesa bañada en chedar con panceta', '[{"nombre": "Para compartir", "precio": 18000}]'::jsonb, 'comidas', FALSE, 20, FALSE, '/ham.jpeg', 'Doble hamburguesa casera en pan artesanal, con panceta crocante y bañada completamente en una cascada de cheddar fundido.', '[{"nombre": "Cheddar extra", "precio": 800}, {"nombre": "Panceta extra", "precio": 1000}, {"nombre": "Papas fritas", "precio": 1500}]'::jsonb),
  (7, 'Cerveza Patagonia 710ml', '[{"nombre": "Amber Lager", "precio": 7500}, {"nombre": "Kune", "precio": 7500}, {"nombre": "Porter", "precio": 7500}, {"nombre": "24.7", "precio": 7500}, {"nombre": "Bohemian Pilsener", "precio": 7500}, {"nombre": "Weisse", "precio": 7500}]'::jsonb, 'bebidas', FALSE, 60, FALSE, '/patagonia.jpg', 'Cerveza de origen patagónico. Disfrutá de nuestras distintas variedades clásicas y especiales.', '[]'::jsonb),
  (8, 'Pepsi cola', '[{"nombre": "500ml", "precio": 5000}, {"nombre": "2L", "precio": 8000}]'::jsonb, 'bebidas', FALSE, 80, FALSE, '/pepsi2l.jpg', 'Gaseosa línea clásica sabor original. Bien fría, ideal para acompañar tus comidas.', '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  variantes = EXCLUDED.variantes,
  categoria = EXCLUDED.categoria,
  permitemitad = EXCLUDED.permitemitad,
  stock = EXCLUDED.stock,
  destacado = EXCLUDED.destacado,
  imagen = EXCLUDED.imagen,
  descripcion = EXCLUDED.descripcion,
  toppings = EXCLUDED.toppings;

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
INSERT INTO detalle_pedido (id, pedido_id, producto_id, cantidad, tamano, segundo_sabor_id, precio_unitario, toppings) VALUES
  (1, 1, 2, 1, '8 porciones', NULL, 9800, '[]'::jsonb),
  (2, 1, 7, 1, NULL, NULL, 4200, '[]'::jsonb),
  (3, 2, 1, 1, '8 porciones', NULL, 8500, '[]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  pedido_id = EXCLUDED.pedido_id,
  producto_id = EXCLUDED.producto_id,
  cantidad = EXCLUDED.cantidad,
  tamano = EXCLUDED.tamano,
  segundo_sabor_id = EXCLUDED.segundo_sabor_id,
  precio_unitario = EXCLUDED.precio_unitario,
  toppings = EXCLUDED.toppings;

INSERT INTO reserva_mesa (reserva_id, mesa_id) VALUES
  (1, 1),
  (1, 2),
  (2, 5)
ON CONFLICT (reserva_id, mesa_id) DO NOTHING;

-- Fila única de configuración con los valores de envío iniciales
INSERT INTO configuracion (id, costo_envio, envio_gratis_desde) VALUES (1, 1500, 15000)
ON CONFLICT (id) DO NOTHING;

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
  pg_get_serial_sequence('detalle_pedido', 'id'),
  COALESCE(MAX(id), 1),
  MAX(id) IS NOT NULL
) FROM detalle_pedido;
SELECT setval(
  pg_get_serial_sequence('reservas', 'id'),
  COALESCE(MAX(id), 1),
  MAX(id) IS NOT NULL
) FROM reservas;

COMMIT;
