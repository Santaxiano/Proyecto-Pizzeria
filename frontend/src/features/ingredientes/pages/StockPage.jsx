import { useState } from 'react';
import { useStock } from '../hooks/useStock';
import TablaProductos from '../components/TablaProductos';
import TablaMateriaPrima from '../components/TablaMateriaPrima';

export default function StockPage() {
  const { ingredientes, productos, toggleIngrediente, toggleProducto, cargando } = useStock();
  
  // Estado para controlar qué pestaña está activa ('productos' o 'ingredientes')
  const [tabActiva, setTabActiva] = useState('productos');

  if (cargando) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Cargando datos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* ── Encabezado de la sección ── */}
      <div className="row mb-4">
        <div className="col">
          <h1 className="h3 fw-bold text-dark">Control de Menú e Insumos</h1>
          <p className="text-muted mb-0">
            Gestioná la disponibilidad de las pizzas o marcá ingredientes agotados para pausar productos en cadena.
          </p>
          <hr />
        </div>
      </div>

      {/* ── Resumen dinámico (cambia según la pestaña seleccionada) ── */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-md-4">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body">
              <p className="card-text text-muted small mb-1">
                {tabActiva === 'productos' ? 'Total en Menú' : 'Total de Insumos'}
              </p>
              <span className="fs-4 fw-bold">
                {tabActiva === 'productos' ? productos.length : ingredientes.length}
              </span>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body">
              <p className="card-text text-muted small mb-1">
                {tabActiva === 'productos' ? 'Disponibles' : 'Con Stock'}
              </p>
              <span className="fs-4 fw-bold text-success">
                {tabActiva === 'productos'
                  ? productos.filter((p) => p.disponible).length
                  : ingredientes.filter((i) => i.activo).length}
              </span>
            </div>
          </div>
        </div>
        <div className="col-sm-6 col-md-4">
          <div className="card text-center border-0 shadow-sm">
            <div className="card-body">
              <p className="card-text text-muted small mb-1">
                {tabActiva === 'productos' ? 'Pausados' : 'Sin Stock'}
              </p>
              <span className="fs-4 fw-bold text-danger">
                {tabActiva === 'productos'
                  ? productos.filter((p) => !p.disponible).length
                  : ingredientes.filter((i) => !i.activo).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sistema de Pestañas (Tabs) de Bootstrap ── */}
      <ul className="nav nav-tabs mb-4 border-bottom-0">
        <li className="nav-item">
          <button
            className={`nav-link rounded-top ${
              tabActiva === 'productos' 
                ? 'active fw-bold text-danger border-danger border-bottom-0' 
                : 'text-dark border-0'
            }`}
            onClick={() => setTabActiva('productos')}
          >
            🍕 Menú Final y Bebidas
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link rounded-top ${
              tabActiva === 'ingredientes' 
                ? 'active fw-bold text-danger border-danger border-bottom-0' 
                : 'text-dark border-0'
            }`}
            onClick={() => setTabActiva('ingredientes')}
          >
            🍅 Materia Prima e Insumos
          </button>
        </li>
      </ul>

      {/* ── Renderizado Condicional del Contenido ── */}
      <div className="row">
        <div className="col">
          {tabActiva === 'productos' ? (
            <TablaProductos 
              productos={productos} 
              onToggle={toggleProducto} 
            />
          ) : (
            <TablaMateriaPrima 
              ingredientes={ingredientes} 
              onToggle={toggleIngrediente} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
