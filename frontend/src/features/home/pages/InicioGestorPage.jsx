import { useState, useEffect } from 'react';
import { Link } from 'react-router';

export default function InicioGestorPage({ cambiarVista }) {
  
  const [resumen, setResumen] = useState({
    comandasPendientes: 0,
    mesasLibres: 0,
    mesasOcupadas: 0,
    totalVentasHoy: 0
  });

  useEffect(() => {
    try {
      const comandas = JSON.parse(localStorage.getItem('gestor-pedidos') || '[]');
      const mesas = JSON.parse(localStorage.getItem('salon-mesas-v3') || '[]');

      const pendientes = comandas.filter(c => c.estado === 'Pendiente').length;
      const libres = mesas.filter(m => m.estado === 'Libre').length;
      const ocupadas = mesas.filter(m => m.estado === 'Ocupada' || m.estado === 'Reservada').length;
      
      // Sumamos el total de las comandas que no estén finalizadas
      const ventas = comandas
        .filter(c => c.estado !== 'Finalizada')
        .reduce((acc, c) => acc + Number(c.total || 0), 0);

      setResumen({
        comandasPendientes: pendientes,
        mesasLibres: libres,
        mesasOcupadas: ocupadas,
        totalVentasHoy: ventas
      });
    } catch (e) {
      console.error("Error al cargar resumen del gestor", e);
    }
  }, []);

  return (
    <div className="container py-4">
      {/* ENCABEZADO */}
      <header className="mb-4 pb-3 border-bottom">
        <h1 className="h3 fw-bold" style={{ color: 'var(--color-negro)' }}>Panel de Control 🍕</h1>
        <p className="text-muted mb-0">Resumen general de la actividad de la pizzería en tiempo real.</p>
      </header>

      {/* TARJETAS DE MÉTRICAS RÁPIDAS */}
      <div className="row row-cols-1 row-cols-md-3 g-4 mb-5">
        
        <div className="col">
          <div className="card border-0 shadow-sm bg-light h-100 border-start border-4 border-danger">
            <div className="card-body">
              <span className="text-muted small fw-bold text-uppercase">Pedidos Pendientes</span>
              <h2 className="display-6 fw-bold mt-2 text-danger">{resumen.comandasPendientes}</h2>
              <p className="text-secondary small mb-0">Comandas esperando confirmación o cocina.</p>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card border-0 shadow-sm bg-light h-100 border-start border-4 border-success">
            <div className="card-body">
              <span className="text-muted small fw-bold text-uppercase">Estado del Salón</span>
              <div className="d-flex gap-3 mt-2">
                <div>
                  <h4 className="fw-bold text-success mb-0">{resumen.mesasLibres}</h4>
                  <small className="text-secondary">Libres</small>
                </div>
                <div className="border-start ps-3">
                  <h4 className="fw-bold text-dark mb-0">{resumen.mesasOcupadas}</h4>
                  <small className="text-secondary">Ocupadas</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card border-0 shadow-sm bg-light h-100 border-start border-4 border-dark">
            <div className="card-body">
              <span className="text-muted small fw-bold text-uppercase">Ventas Activas en Curso</span>
              <h2 className="display-6 fw-bold mt-2 text-dark">$ {resumen.totalVentasHoy}</h2>
              <p className="text-secondary small mb-0">Suma total de comandas vigentes.</p>
            </div>
          </div>
        </div>

      </div>

      {/* ACCESOS DIRECTOS */}
      <div className="card border-0 shadow-sm p-4 bg-white">
        <h5 className="fw-bold mb-3">Acciones Rápidas</h5>
        <p className="text-muted small mb-4">Seleccioná a qué módulo querés ingresar para continuar operando.</p>
        
        <div className="d-flex flex-wrap gap-3">
          <Link to="/gestor/salon" className="btn btn-outline-dark px-4 py-2 fw-bold text-decoration-none">
            🍽️ Ir a Gestión de Salón y Mesas
          </Link>
          <Link to="/gestor/comandas" className="btn btn-outline-dark px-4 py-2 fw-bold text-decoration-none">
            📋 Ir a Gestión de Pedidos
          </Link>
          <Link to="/gestor/stock" className="btn btn-outline-dark px-4 py-2 fw-bold text-decoration-none">
            📦 Ver Stock
          </Link>
        </div>
      </div>
    </div>
  );
}