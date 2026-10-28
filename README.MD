Cómo Ejecutar el Proyecto e Integración (+PIZZA)
Asegurate de tener PostgreSQL corriendo en tu equipo antes de empezar.

1. Configuración de la Base de Datos (Ejecutar una sola vez)
Abrí una terminal en la raíz del proyecto y ejecutá estos comandos para crear la estructura y cargar los datos de prueba:

Bash
dropdb -U postgres --if-exists Pizzeria
createdb -U postgres Pizzeria
psql -U postgres -d Pizzeria -f database/schema.sql
psql -U postgres -d Pizzeria -f database/seed.sql
(Nota: Si tu usuario local de PostgreSQL no es postgres, reemplazalo por el tuyo).

2. Iniciar el Backend (Terminal 1)
En la carpeta backend/, copiá el archivo .env.example y nombralo .env.

Completá las variables de entorno (asegurate de poner tu PGPASSWORD, el nombre DB_NAME=Pizzeria y tu JWT_SECRET).

En la primera terminal, ejecutá:

Bash
cd backend
npm install
npm run dev
El servidor quedará corriendo en http://localhost:3000.

3. Iniciar el Frontend (Terminal 2)
En una segunda terminal, levantá la interfaz en React:

Bash
cd frontend
npm install
npm run dev
La aplicación web se abrirá en http://localhost:5173.

Guía de Pruebas e Integración
Parte 1: Pruebas desde la Interfaz Web (Frontend + Backend)
1. Navegación Pública (Cliente)
Abrí la app en http://localhost:5173.

Navegá por la carta en la sección Menú: los productos se leen en tiempo real desde PostgreSQL.

Probá los filtros por categoría y la búsqueda por nombre/ingrediente. Entrá al detalle de un producto para verificar la carga.

2. Autenticación e Inicio de Sesión
Andá al footer (pie de página) y hacé clic en el botón "Acceso al personal" (o ingresá a http://localhost:5173/login).

Prueba de Error (Credenciales Incorrectas): Ingresá admin@maspizza.com con la clave error123.

Resultado: La pantalla muestra la alerta de error devuelta por el servidor (401 Unauthorized).

Prueba de Éxito (Admin): Ingresá las credenciales válidas:

Email: admin@maspizza.com

Contraseña: admin123

Resultado: Redirección automática al /gestor. Se almacena el token JWT y el rol en la sesión.

3. Registro de Nuevo Personal (Requisito R5 - Endpoint Protegido)
En el menú lateral del Gestor, hacé clic en "Registrar Personal" (solo visible para administradores).

Prueba de Conflicto (Email Duplicado): Intentá crear un usuario con el email admin@maspizza.com.

Resultado: El backend responde 409 Conflict y la interfaz muestra la alerta "Ya existe un usuario con ese email".

Prueba de Éxito: Completá con un usuario nuevo (ej. Nombre: Empleado Test, Email: empleado@maspizza.com, Rol: Empleado, Clave: empleado123).

Resultado: Cuenta creada exitosamente. La contraseña se guarda encriptada con bcrypt en PostgreSQL.

4. ABM / CRUD de Productos (Gestión de Stock)
Ingresá a "Gestión de Stock" en el panel del Gestor.

Crear Producto (POST): Hacé clic en "Nuevo Producto", completá los campos y guardá. Se guarda en la BD y aparece en la lista de inmediato.

Editar Producto (PUT): Hacé clic en "Editar", modificá el precio o nombre y guardá. Se actualizan los datos en la base.

Eliminar Producto (DELETE): Hacé clic en "Eliminar" sobre un producto de prueba para removerlo del sistema.

Parte 2: Pruebas de la API REST (Postman / cURL)
1. Obtener Token JWT (Login)
Método: POST

URL: http://localhost:3000/api/auth/login

Headers: Content-Type: application/json

Body:

JSON
{
  "email": "admin@maspizza.com",
  "password": "admin123"
}
Respuesta (200 OK): Retorna el token JWT en formato texto y los datos del usuario logueado.

2. Prueba de Seguridad y Middlewares
Acceso denegado sin Token (verificarToken)
Método: GET

URL: http://localhost:3000/api/ingredientes

Respuesta (401 Unauthorized): { "error": "Falta el token" }

Petición Autorizada con Bearer Token
Método: GET

URL: http://localhost:3000/api/ingredientes

Headers: Authorization: Bearer PEGA_ACA_TU_TOKEN

Respuesta (200 OK): Retorna el listado de insumos de materia prima.

3. Validaciones Sintácticas y Middlewares Propios
Middleware validarId (Sintaxis de URL)
Método: GET

URL: http://localhost:3000/api/productos/abc

Respuesta (400 Bad Request): { "error": "El ID proporcionado no es un número válido" }

Middleware validarProducto (Payload Inválido)
Método: POST

URL: http://localhost:3000/api/productos

Headers:

Authorization: Bearer PEGA_ACA_TU_TOKEN

Content-Type: application/json

Body:

JSON
{
  "nombre": "",
  "precio": -100,
  "categoria": "pizzas"
}
Respuesta (400 Bad Request): { "error": "El campo 'nombre' es obligatorio" }

Actualización Completa de Mesas (PUT)
Método: PUT

URL: http://localhost:3000/api/mesas/1

Headers:

Authorization: Bearer PEGA_ACA_TU_TOKEN

Content-Type: application/json

Body:

JSON
{
  "capacidad": 4,
  "estado": "ocupada"
}
Respuesta (200 OK): Retorna el objeto de la mesa actualizado en PostgreSQL.