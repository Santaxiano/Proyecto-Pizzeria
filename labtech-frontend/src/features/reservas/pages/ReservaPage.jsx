import React, { useState } from 'react';
import { Stage, Layer, Rect, Text, Group } from 'react-konva';

const RestaurantKonva = () => {
  // Nuestro estado de mesas. Ahora usamos coordenadas absolutas (x, y)
  const [mesas, setMesas] = useState([
    { id: '1', label: 'Mesa 1', x: 50, y: 50, width: 80, height: 80 },
    { id: '2', label: 'Mesa 2', x: 200, y: 50, width: 80, height: 80 },
    { id: '3', label: 'Mesa 3', x: 50, y: 200, width: 80, height: 80 }
  ]);

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
    <div style={{ padding: '20px' }}>
      <h2>Plano del Restaurante (Konva - Lienzo Libre)</h2>
      
      {/* El contenedor visual del lienzo */}
      <div style={{ border: '2px solid #ccc', display: 'inline-block', backgroundColor: '#f0f0f0' }}>
        
        {/* Stage es el lienzo principal. Le damos un tamaño fijo. */}
        <Stage width={800} height={600}>
          
          {/* Layer es la capa donde dibujamos */}
          <Layer>
            {mesas.map((mesa) => (
              /* 
                Group nos permite agrupar el Cuadrado (Rect) y el Texto (Text) 
                para que se muevan juntos. Hacemos que todo el grupo sea "draggable".
              */
              <Group
                key={mesa.id}
                x={mesa.x}
                y={mesa.y}
                draggable
                onDragEnd={(e) => handleDragEnd(e, mesa.id)}
              >
                {/* El cuadrado que representa la mesa */}
                <Rect
                  width={mesa.width}
                  height={mesa.height}
                  fill="#4CAF50"
                  cornerRadius={10} // Bordes redondeados
                  shadowBlur={5}    // Pequeña sombra para dar profundidad
                  shadowColor="black"
                  shadowOpacity={0.3}
                />
                
                {/* El texto centrado dentro del cuadrado */}
                <Text
                  text={mesa.label}
                  fontSize={16}
                  fontStyle="bold"
                  fill="white"
                  width={mesa.width} // Usar el mismo ancho ayuda a centrar el texto
                  height={mesa.height} // Usar el mismo alto
                  align="center"
                  verticalAlign="middle"
                />
              </Group>
            ))}
          </Layer>
        </Stage>
      </div>
      
      <p style={{ color: '#666', marginTop: '10px' }}>
        Toma una mesa y muévela a cualquier parte. Verás que se queda exactamente donde la dejas.
      </p>
    </div>
  );
};

export default RestaurantKonva;