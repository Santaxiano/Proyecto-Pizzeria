Contexto Técnico y Arquitectura del Proyecto

Este documento contiene el contexto arquitectónico de nuestro proyecto (Frontend y Backend).

Uso: Copiar el bloque de "Prompt de Inicialización" y pegarlo en cualquier asistente de IA (Claude, ChatGPT, Gemini) antes de pedirle que genere, refactorice o analice código. Esto evita que la IA sugiera estructuras incorrectas o invente capas que no utilizamos.

🤖 Prompt de Inicialización para la IA

Copia y pega el siguiente texto en tu primer mensaje con la IA:

Actúa como un Desarrollador Fullstack Senior experto en Node.js, Express y React. Lee el siguiente contexto técnico sobre la arquitectura de mi frontend y backend, y confirma que lo asimilaste respondiendo únicamente con la palabra "Entendido". No generes código ni sugerencias por ahora.

1. Contexto del Backend (Node.js + PostgreSQL)

Arquitectura Modular: El código fuente está centralizado en la carpeta src/ usando el "Segundo diseño". La aplicación se divide por funcionalidades dentro de src/modules/ (ej. auth, ingredientes, pedidos, productos).

Capas internas: Cada módulo contiene estrictamente dos archivos: [entidad].routes.js para definir los endpoints y [entidad].controller.js para resolver la petición y acceder a los datos. No existen carpetas separadas para servicios ni repositorios.

Base de Datos: El acceso a datos se hace con PostgreSQL mediante el paquete pg. Se utiliza un pool de conexiones único instanciado en src/config/db.js, el cual consume variables de entorno.

Seguridad y Middlewares: Las herramientas transversales residen en src/middlewares/. La protección de rutas usa verificarToken.js, que lee el JSON Web Token desde la cabecera, valida su firma y habilita el paso. Las contraseñas se encriptan con bcrypt.

2. Contexto del Frontend (Vite + React)

Arquitectura: Estamos usando una estricta "Feature-Driven Architecture" (Arquitectura Basada en Funcionalidades).

Carpetas Principales: El trabajo se divide en src/features/ para los dominios de negocio y src/shared/ para lo genérico (layouts y componentes universales).

División de Responsabilidades (Estricta): Internamente, cada módulo en features/ se divide en:

pages/ (.jsx): Para orquestar la pantalla completa.

components/ (.jsx): Para las piezas visuales específicas de ese módulo.

hooks/ (.js): Para mantener la lógica matemática y el estado aislado.

services/ (.js): Única capa autorizada para realizar peticiones fetch o comunicarse con el backend.

Asume estas reglas de estructura como absolutas para cualquier análisis, refactorización o generación de código en nuestras próximas interacciones.

🏗️ Resumen de Reglas para el Equipo

Si estás programando manualmente, recuerda estas reglas básicas derivadas de nuestra arquitectura:

Frontend

Separación JS vs JSX: Usa .jsx SOLO si el archivo dibuja HTML (retorna etiquetas). Usa .js para lógica pura (hooks, services).

Fetch aislado: Ningún componente (.jsx) debe tener un fetch() adentro. Todo pedido a la base de datos o archivo JSON se hace en la carpeta services/.

Flujo de Git: Trabaja solo en la carpeta de tu módulo (ej. features/ingredientes) y en tu propia rama (feat/stock).

Backend

Controladores con esteroides: Como usamos el "Diseño 2", la conexión a la base de datos (consultas SQL) y la lógica de validación van juntas adentro de [entidad].controller.js.

Rutas protegidas: No programes la verificación del token en cada ruta. Simplemente inyecta el middleware verificarToken en el archivo [entidad].routes.js donde haga falta proteger el acceso.