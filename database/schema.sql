-- Crea la base y la tabla de productos.
-- Ejecutar con: psql -U postgres -f database/schema.sql
CREATE DATABASE "Pizzeria";

CREATE TABLE Usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    rol VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL
);


CREATE TABLE Productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio INT NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    tamanos TEXT[], 
    permiteMitad BOOLEAN,
    stock INT,
    destacado BOOLEAN,
    imagen VARCHAR(255),
    descripcion VARCHAR(255)
);


CREATE TABLE Ingredientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL
);

CREATE TABLE Producto_Ingrediente (
    producto_id INT,
    ingrediente_id INT,
    PRIMARY KEY (producto_id, ingrediente_id),
    FOREIGN KEY (producto_id) REFERENCES Productos(id),
    FOREIGN KEY (ingrediente_id) REFERENCES Ingredientes(id)
);


CREATE TABLE Pedidos (
    id VARCHAR(255) PRIMARY KEY,
    cliente VARCHAR(255) NOT NULL,
    telefono VARCHAR(255) NOT NULL,
    tipo VARCHAR(255) NOT NULL,
    direccionMesa VARCHAR(50),
    total INT NOT NULL,
    detalle VARCHAR(255),
    usuario_id INT,
    estado VARCHAR(50) NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);


CREATE TABLE Detalle_Pedido (
    pedido_id VARCHAR(255),
    producto_id INT,
    cantidad INT NOT NULL DEFAULT 1,
    PRIMARY KEY (pedido_id, producto_id),
    FOREIGN KEY (pedido_id) REFERENCES Pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES Productos(id)
);


CREATE TABLE Reservas (
    id VARCHAR(255) PRIMARY KEY,
    cliente VARCHAR(255) NOT NULL,
    contacto VARCHAR(255) NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    comensales INT NOT NULL,
    lugar VARCHAR(50) NOT NULL,
    usuario_id INT,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);


CREATE TABLE Mesas (
    id SERIAL PRIMARY KEY,
    capacidad INT NOT NULL,
    estado VARCHAR(50) NOT NULL
);

CREATE TABLE Reserva_Mesa (
    reserva_id VARCHAR(255),
    mesa_id INT,
    PRIMARY KEY (reserva_id, mesa_id),
    FOREIGN KEY (reserva_id) REFERENCES Reservas(id),
    FOREIGN KEY (mesa_id) REFERENCES Mesas(id)
);