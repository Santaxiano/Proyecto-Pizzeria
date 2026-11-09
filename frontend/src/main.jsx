import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { instalarControlSesionVencida } from './shared/services/sesionVencida';

// Si el token vence mientras usás el gestor, te manda al login en vez de dejar todo fallando
instalarControlSesionVencida();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
