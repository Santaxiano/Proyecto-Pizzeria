import LayoutPublico from './shared/layout/LayoutPublico';
import { RouterProvider } from 'react-router/dom'
import { router } from './router'

const enlacesNav = [
  { id: 1, texto: 'Nosotros', destino: '#nosotros' },
  { id: 2, texto: 'Menú', destino: '#menu' },
  { id: 3, texto: 'Ubicación', destino: '#ubicacion' },
  { id: 4, texto: 'Contacto', destino: '#contacto' }
];

function App() {
  return (
      <RouterProvider router={router}/>
  );
}



export default App;