import { useState, useEffect } from 'react';

export default function HomePage() {
  const [indiceActual, setIndiceActual] = useState(0);

  const imagenes = [
    '/IMG_2169.jpeg',
    '/IMG_2171.jpeg',
    '/IMG_6043.jpeg',
    '/IMG_5211.jpeg'
  ];

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceActual((prevIndice) => (prevIndice + 1) % imagenes.length);
    }, 5000);

    return () => clearInterval(intervalo);
  }, [imagenes.length]);

  return (
    <>
      {/* Carrusel de fotitos */}
      <section className="contenedor-carrusel" id="inicio">
        
        {/* Renderizado dinámico de las diapositivas */}
        {imagenes.map((img, index) => (
          <div 
            key={index} 
            className={`diapositiva-carrusel ${index === indiceActual ? 'activa' : ''}`}
          >
            <img src={img} alt={`Diapositiva ${index + 1}`} />
          </div>
        ))}

        <div className="superposicion-hero">
          <div className="contenido-hero">
            <h1>+PIZZA</h1>
            <p>Mucho más que pizza libre</p>
            <a href="menu" className="boton-hero">Ver Carta</a>
          </div>
        </div>
      </section>

      {/* SECCIÓN SOBRE NOSOTROS */}
      <section id="nosotros" className="seccion-nosotros">
        <div className="contenedor-nosotros">
          <div className="contenido-nosotros">
            <span className="insignia-nosotros">Nuestra Pasión</span>
            <h2>Mucho más que pizza libre</h2>
            <p className="destacado-nosotros">
              En +Pizza sabemos que una buena experiencia no empieza cuando llega la comida, sino desde el momento en que entrás por la puerta de Pringles 1091.
            </p>
            <p className="texto-nosotros">
              Nuestro horno napolitano de alta temperatura fusiona tradición, fuego y materias primas de primera calidad para lograr una cocción perfecta, rápida y crocante. Acá no se trata solo de las clásicas: vas a descubrir combinaciones únicas, sabores que no esperabas y la libertad de repetir las veces que quieras.
            </p>
            <p className="texto-nosotros">
              Contamos con un salón cálido y un <strong>subsuelo exclusivo con barra</strong>, ideal para festejar recibidas, cumpleaños, reuniones de trabajo o simplemente compartir risas y buena onda con tu grupo.
            </p>

            <div className="estadisticas-nosotros">
              <div className="elemento-estadistica">
                <span className="numero-estadistica">+45</span>
                <span className="etiqueta-estadistica">Variedades</span>
              </div>
              <div className="elemento-estadistica">
                <span className="numero-estadistica">450°C</span>
                <span className="etiqueta-estadistica">Horno Napolitano</span>
              </div>
            </div>
          </div>

          <div className="contenedor-imagen-nosotros">
            <img src="/IMG_5205.jpeg" className="imagen-principal-nosotros" alt="Nuestra pizzería" />
            <div className="tarjeta-experiencia-nosotros">
              <h4>Pizza Libre</h4>
              <p>Comé todo lo que quieras.</p>
            </div>
          </div>
        </div>
      </section>

      
      {/* MAPA DE UBICACIÓN */}
      <div id="ubicacion" className="contenedor-mapa">
        <iframe 
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3334.6063688195847!2d-66.3353594!3d-33.3023035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95d43922f7a1f3ab%3A0x21ccb338553cc5fe!2s%2BPIZZA!5e0!3m2!1ses!2sar!4v1700000000000!5m2!1ses!2sar" 
          width="100%" 
          height="380" 
          style={{ border: 0, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
          allowFullScreen
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade"
          title="Ubicación +Pizza"
        >
        </iframe>
      </div>
    </>
  );
}