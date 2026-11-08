import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { obtenerResumenDashboard } from '../services/dashboardService';

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const clasesEstado = {
  Pendiente: 'bg-danger',
  Confirmada: 'bg-primary',
  Finalizada: 'bg-success',
};

function mostrarFecha(fecha) {
  if (!fecha) return 'Sin fecha registrada';

  const valor = new Date(fecha);
  return Number.isNaN(valor.getTime()) ? 'Fecha no disponible' : formatoFecha.format(valor);
}

export default function InicioGestorPage() {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  const cargarResumen = useCallback(async (enSegundoPlano = false) => {
    if (enSegundoPlano) {
      setActualizando(true);
    } else {
      setCargando(true);
    }

    setError('');
    try {
      setResumen(await obtenerResumenDashboard());
    } catch (err) {
      setError(err.message || 'No se pudo cargar el panel de inicio.');
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  }, []);

  useEffect(() => {
    const cargaInicial = window.setTimeout(() => cargarResumen(), 0);
    const intervalo = window.setInterval(() => cargarResumen(true), 60_000);
    return () => {
      window.clearTimeout(cargaInicial);
      window.clearInterval(intervalo);
    };
  }, [cargarResumen]);

  if (cargando) {
    return (
      <div className="text-center py-5" role="status">
        <div className="spinner-border text-danger" aria-hidden="true" />
        <p className="text-muted mt-3 mb-0">Cargando el resumen del negocio...</p>
      </div>
    );
  }

  if (!resumen) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <p className="mb-3">{error || 'No se pudo cargar el panel de inicio.'}</p>
          <button className="btn btn-outline-danger" onClick={() => cargarResumen()}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const tarjetas = [
    {
      titulo: 'Pedidos pendientes',
      valor: resumen.comandasPendientes,
      detalle: 'Esperando confirmación o preparación.',
      color: 'danger',
      icono: '📋',
    },
    {
      titulo: 'Ventas de hoy',
      valor: formatoMoneda.format(resumen.ventasHoy),
      detalle: 'Total de pedidos registrados hoy.',
      color: 'dark',
      icono: '💰',
    },
    {
      titulo: 'Mesas libres',
      valor: resumen.mesasLibres,
      detalle: `${resumen.mesasOcupadas} ocupadas · ${resumen.mesasReservadas} reservadas`,
      color: 'success',
      icono: '🍽️',
    },
    {
      titulo: 'Reservas de hoy',
      valor: resumen.reservasHoy,
      detalle: 'Reservas programadas para hoy.',
      color: 'primary',
      icono: '📅',
    },
  ];

  return (
    <div className="container-fluid py-4 px-xl-4">
      <header className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--color-negro)' }}>
            Panel de inicio 🍕
          </h1>
          <p className="text-muted mb-0">
            Resumen de la actividad de hoy y accesos a la gestión del negocio.
          </p>
        </div>
        <button
          className="btn btn-outline-dark"
          onClick={() => cargarResumen()}
          disabled={actualizando}
        >
          {actualizando ? 'Actualizando...' : '↻ Actualizar'}
        </button>
      </header>

      {error && (
        <div className="alert alert-warning" role="alert">
          No se pudo actualizar el panel: {error}
        </div>
      )}

      <section aria-label="Resumen del día" className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
        {tarjetas.map((tarjeta) => (
          <div className="col" key={tarjeta.titulo}>
            <article className={`card h-100 border-0 border-start border-4 border-${tarjeta.color} shadow-sm`}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <span className="text-muted small fw-bold text-uppercase">{tarjeta.titulo}</span>
                  <span aria-hidden="true" className="fs-4">{tarjeta.icono}</span>
                </div>
                <p className={`h2 fw-bold my-3 text-${tarjeta.color}`}>{tarjeta.valor}</p>
                <p className="text-secondary small mb-0">{tarjeta.detalle}</p>
              </div>
            </article>
          </div>
        ))}
      </section>

      <div className="row g-4">
        <section className="col-12 col-xl-8" aria-labelledby="pedidos-recientes">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h2 id="pedidos-recientes" className="h5 fw-bold mb-0">Pedidos recientes</h2>
              <Link to="/gestor/comandas" className="small fw-semibold text-dark">
                Ver todos
              </Link>
            </div>
            {resumen.comandasRecientes.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Pedido</th>
                      <th scope="col">Cliente</th>
                      <th scope="col">Estado</th>
                      <th scope="col">Total</th>
                      <th scope="col">Registrado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resumen.comandasRecientes.map((comanda) => (
                      <tr key={comanda.id}>
                        <th scope="row">#{comanda.id}</th>
                        <td>{comanda.cliente}</td>
                        <td>
                          <span className={`badge ${clasesEstado[comanda.estado] || 'bg-secondary'}`}>
                            {comanda.estado}
                          </span>
                        </td>
                        <td className="text-nowrap">{formatoMoneda.format(Number(comanda.total) || 0)}</td>
                        <td className="text-nowrap small text-muted">{mostrarFecha(comanda.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card-body text-center text-muted py-5">
                Todavía no hay pedidos registrados.
              </div>
            )}
          </div>
        </section>

        <section className="col-12 col-xl-4" aria-labelledby="acciones-rapidas">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-body p-4">
              <h2 id="acciones-rapidas" className="h5 fw-bold mb-2">Acciones rápidas</h2>
              <p className="text-muted small mb-4">
                Ingresá directamente a los módulos de operación.
              </p>
              <div className="d-grid gap-2">
                <Link to="/gestor/comandas" className="btn btn-dark text-start">
                  📋 Gestionar pedidos
                </Link>
                <Link to="/gestor/salon" className="btn btn-outline-dark text-start">
                  🍽️ Gestionar salón y reservas
                </Link>
                <Link to="/gestor/stock" className="btn btn-outline-dark text-start">
                  📦 Revisar stock
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
