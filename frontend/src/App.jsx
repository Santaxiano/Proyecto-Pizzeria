import LayoutPublico from './shared/layout/LayoutPublico';

const enlacesNav = [
  { id: 1, texto: 'Nosotros', destino: '#nosotros' },
  { id: 2, texto: 'Menú', destino: '#menu' },
  { id: 3, texto: 'Ubicación', destino: '#ubicacion' },
  { id: 4, texto: 'Contacto', destino: '#contacto' }
];

function App() {
  return (
    <LayoutPublico enlaces={enlacesNav}>
      <section>
        <h1>
          ¡Bienvenido a +PIZZA!
        </h1>
        <p>
          Masa artesanal y horno napolitano.
        </p>
      </section>
    </LayoutPublico>
  );
}

export default App;