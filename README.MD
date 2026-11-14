Cómo Ejecutar el Proyecto e Integración (+PIZZA)
Asegurate de tener PostgreSQL corriendo en tu equipo antes de empezar.

1. Configuración de la Base de Datos
Para recrear la base de desarrollo desde cero, abrí una terminal en la raíz del proyecto y ejecutá:

Bash
dropdb -U postgres --if-exists Pizzeria
createdb -U postgres Pizzeria
psql -U postgres -d Pizzeria -v ON_ERROR_STOP=1 -f database/schema.sql
psql -U postgres -d Pizzeria -v ON_ERROR_STOP=1 -f database/seed.sql
(Nota: Si tu usuario local de PostgreSQL no es postgres, reemplazalo por el tuyo).
Estos comandos eliminan todos los datos existentes en `Pizzeria`. `schema.sql` crea las tablas en la base seleccionada y `seed.sql` carga los datos de prueba.

Si ya tenés una base creada con una versión anterior, aplicá las migraciones pendientes sin borrar datos:

Bash
psql -U postgres -d Pizzeria -v ON_ERROR_STOP=1 -f database/migraciones/001_envio_y_estado_reservas.sql
psql -U postgres -d Pizzeria -v ON_ERROR_STOP=1 -f database/migraciones/002_creado_en_reservas.sql

Los toppings están disponibles únicamente para productos de categoría `comidas`. Se administran desde Stock → editar/crear producto, y se guardan en `productos.toppings`; cada línea de pedido conserva una foto histórica en `detalle_pedido.toppings`.

2. Iniciar el Backend (Terminal 1)
En la carpeta backend/, copiá el archivo .env.example y nombralo .env.

Completá las variables de entorno (asegurate de poner tu PGPASSWORD, `PGDATABASE=Pizzeria` y tu JWT_SECRET).

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

Editar Producto (PUT): Hacé clic en "Editar", modificá el nombre, las variantes/tamaños con sus precios y guardá. Se actualizan los datos en la base.

Eliminar Producto (DELETE): Hacé clic en "Eliminar" sobre un producto de prueba para removerlo del sistema.

Parte 2:  Guía de Uso de la Colección de Postman (+PIZZA)

La colección está diseñada para probar de forma automatizada y ordenada todos los endpoints del backend que no están integrados directamente con el front-end (y también los de autenticación), cumpliendo con el requisito R6 del proyecto.

1. Importación y Configuración Inicial
  1- Abrí Postman.

  2- Hacé clic en el botón Import (Importar) y arrastrá el archivo MasPizza.postman_collection.json (o buscalo desde la compu).

  3- La colección ya viene configurada con Variables de Colección, por lo que no tenés que modificar ninguna petición manualmente:baseUrl: 
      Configurada por defecto en http://localhost:3000/api.   
      token, tokenEmpleado, productoId, etc.: Se autocompletan solos a medida que vas ejecutando las peticiones gracias a los scripts de prueba (tests) que incorporamos.   
  2. Cómo Ejecutar la Colección Completa (Recomendado)
  Para correr todas las pruebas de punta a punta de forma automática:
  
    1- Hacé clic en los tres puntos (...) al lado del nombre de la colección +PIZZA API en el panel izquierdo de Postman.
    2- Seleccioná Run collection (Ejecutar colección).
    3- Asegurate de que el backend esté levantado localmente (npm run dev en la carpeta backend) y la base de datos Pizzeria cargada con el schema.sql y el seed.sql.
    4- Hacé clic en el botón azul Run +PIZZA API.
        ¿Por qué funciona solo? Porque la primera carpeta es auth y el primer request es "Login admin", el cual valida el login y guarda automáticamente el token JWT en la variable de colección para que el resto de las carpetas (Privado) puedan autenticarse solas.   
  3. Estructura y Casos que Incluye la Colección
  La colección está dividida en tres grandes carpetas para organizar los recursos:
  
    A. Carpeta auth (Autenticación y Roles)
        -Login admin: Autentica al administrador con admin@maspizza.com / admin123 y guarda el token global.   
        -Login con credenciales inválidas: Prueba el caso de error enviando una contraseña incorrecta (espera un código 401 Unauthorized).   
        -Registro sin token / Registro con datos faltantes: Verifica las restricciones de seguridad y validación de campos obligatorios (espera códigos 401 y 400).  
        -Registro de empleado: Utiliza un script previo (Pre-request script) para generar un email único por timestamp, permitiendo correr la prueba múltiples veces sin chocar con errores de duplicado (espera un código 201 Created y valida que nunca devuelva la contraseña).   
        -Registro con email repetido: Prueba el conflicto al intentar registrar un correo ya existente (espera un código 409 Conflict).   
        -Registro con token de empleado: Evalúa el middleware de roles (verificarRol). Inicia sesión como empleado e intenta registrar a otro usuario; como no es admin, el sistema rechaza la petición con un 403 Forbidden.   
      B. Carpeta Publico (Sin Token)
        - Productos (Listar, Obtener por ID, Producto inexistente 404, ID inválido 400): Verifica el comportamiento de las rutas públicas del catálogo y cómo reacciona el backend ante errores de sintaxis en el parámetro :id (gestionado por nuestro middleware validarId).   
      C. Carpeta Privado (Requieren Token Bearer)
        -Productos: Incluye casos de éxito y error para Crear producto (guarda el ID devuelto en una variable), Crear sin token (401), Crear con datos inválidos / variante con precio inválido (400), Actualizar (PUT) y Eliminar (204 / 404).
        -Ingredientes: Permite administrar el stock de materia prima probando listar, obtener, crear, actualizar estados (activo: false) y eliminar insumos, además de validar restricciones cuando faltan datos obligatorios.   
        -Mesas: Prueba la gestión completa del salón (crear mesa con capacidad y estado, listar, actualizar su estado a "Ocupada", eliminar y controlar mesas inexistentes).   
        -Pedidos: Evalúa el acceso al listado de comandas tanto de forma autorizada como bloqueada sin token. 