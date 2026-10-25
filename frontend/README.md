# Proyecto Pizzeria

Aplicación web para la gestión y venta de una pizzería. El proyecto en esta etapa incluye un frontend en React para la parte pública del negocio y un panel de gestión interno, con datos almacenados en archivos JSON para facilitar la ejecución local sin requerir una base de datos externa.

## Funcionalidades principales

- Catálogo de productos con detalle por item
- Carrito de compras
- Reservas de mesas
- Sección de contacto
- Inicio de sesión para el gestor
- Panel del gestor con acceso a:
  - salón
  - comandas
  - stock

## Tecnologías utilizadas

- React
- Vite
- React Router
- Bootstrap
- JavaScript

## Requisitos previos

Antes de ejecutar el proyecto, debes tener instalado:

- Node.js 
- npm

## Estructura del proyecto

Proyecto-Pizzeria/
├── backend/
│   └── data/
│       ├── ingrediente.json
│       ├── mesas.json
│       ├── pedidos.json
│       ├── producto_ingrediente.json
│       ├── productos.json
│       ├── reservas.json
│       └── usuarios.json
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── README.md
└── ...


La carpeta `backend/data` se sirve automáticamente desde Vite para que la app pueda consumir los JSON sin necesidad de un backend separado.

## Instalación y ejecución para usar

1. Abre una terminal en la carpeta raíz del proyecto.
2. Entra a la carpeta `frontend`:

cd frontend

3. Instala las dependencias:

npm install

4. Inicia el proyecto en modo desarrollo:

npm run dev 

5. Abre el navegador en:

http://localhost:5173

## Acceso al panel del gestor

La aplicación incluye un usuario de prueba para ingresar al sistema:

- Email: `admin@maspizza.com`
- Contraseña: `admin123`

Luego puede acceder a la ruta:

http://localhost:5173/login

o si ya inició sesión, directamente al panel:

http://localhost:5173/gestor

## Autor

Proyecto desarrollado para la materia de laboratorio de tecnología por Javier Mateo Sanchez Garis, Santiago Alaniz Cornejo y Samir Paez.
