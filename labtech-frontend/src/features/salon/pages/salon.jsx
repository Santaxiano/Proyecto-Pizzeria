import { useState } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';
import { Link } from 'react-router';

import './salon.css';

const estadosPedido = ['libre', 'ocupada', 'reservada', 'por cobrar'];

const RestaurantKonva = () => {
  // Nuestro estado de mesas. Ahora usamos coordenadas absolutas (x, y)
  const [mesas, setMesas] = useState([
    { id: '1', label: 'Mesa 1', x: 50, y: 50, width: 80, height: 80, estado: 1 },
    { id: '2', label: 'Mesa 2', x: 200, y: 50, width: 80, height: 80, estado: 0 },
    { id: '3', label: 'Mesa 3', x: 50, y: 200, width: 80, height: 80, estado: 0 }
  ]);
  const colorMesa = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-rojo-tomate')
    .trim();
  const colorSombra = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-negro')
    .trim();

  // Esta función guarda la nueva posición exacta cuando soltamos la mesa
  const handleDragEnd = (e, id) => {
    const nuevaX = e.target.x();
    const nuevaY = e.target.y();

    const nuevasMesas = mesas.map((mesa) => {
      if (mesa.id === id) {
        return { ...mesa, x: nuevaX, y: nuevaY };
      }
      return mesa;
    });

    setMesas(nuevasMesas);
    console.log("Nuevas posiciones guardadas:", nuevasMesas);
  };

  return (
    <main className="reserva-pagina">
      <h2 className="reserva-titulo">Plano del restaurante</h2>
      <Link className="salon-boton-comanda" to="/gestor/comandas">
        Abrir comanda
      </Link>
      
      <div className="reserva-contenido">
        <div className="reserva-lienzo-contenedor">
          <Stage width={800} height={600}>
            <Layer>
              {mesas.map((mesa) => (
                <Group
                  key={mesa.id}
                  x={mesa.x}
                  y={mesa.y}
                  draggable
                  onDragEnd={(e) => handleDragEnd(e, mesa.id)}
                >
                  <Rect
                    width={mesa.width}
                    height={mesa.height}
                    fill={colorMesa}
                    cornerRadius={10}
                    shadowBlur={5}
                    shadowColor={colorSombra}
                    shadowOpacity={0.3}
                  />
                  <Text
                    text={mesa.label}
                    fontSize={16}
                    fontStyle="bold"
                    fill="white"
                    width={mesa.width}
                    height={mesa.height}
                    align="center"
                    verticalAlign="middle"
                  />
                </Group>
              ))}
            </Layer>
          </Stage>
        </div>

        <aside className="reserva-panel-estados" aria-label="Estados de pedidos por mesa">
          <h3>Estado de pedidos</h3>
          <ol className="reserva-lista-mesas">
            {mesas.map((mesa) => (
              <li className="reserva-mesa-estado" key={mesa.id}>
                <div className="reserva-mesa-encabezado">
                  <h4>{mesa.label}</h4>
                  <span className="reserva-estado-actual">{estadosPedido[mesa.estado]}</span>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </main>
  );
};

export default RestaurantKonva;