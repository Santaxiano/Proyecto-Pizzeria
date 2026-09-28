import { useState, useEffect } from 'react';
import { Link } from 'react-router';

const IMAGENES = [
  '/IMG_2169.jpeg',
  '/IMG_2171.jpeg',
  '/IMG_6043.jpeg',
  '/IMG_5211.jpeg'
];

function Hero() {
  const [indiceActual, setIndiceActual] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceActual((prevIndice) => (prevIndice + 1) % IMAGENES.length);
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <section className="hero-pantalla" id="inicio">
      {IMAGENES.map((img, index) => (
        <div 
          key={index} 
          style={{
            position: 'absolute',
            inset: 0,
            opacity: index === indiceActual ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: 0
          }}
        >
          <img 
            src={img} 
            alt={`Diapositiva ${index + 1}`} 
            className="hero-imagen"
          />
        </div>
      ))}

      <div className="hero-texto">
        <h1 className="display-2 fw-bold text-uppercase mb-2">
          +PIZZA
        </h1>
        <p className="fs-3 fw-semibold mb-4">Mucho más que pizza libre</p>
        <Link to="/menu" className="btn-pizza shadow">
          Ver Menú y Pedir
        </Link>
      </div>
    </section>
  );
}

export default Hero;