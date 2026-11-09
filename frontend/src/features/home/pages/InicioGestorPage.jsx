import { Link } from 'react-router';
import { useEstadisticas } from '../hooks/useEstadisticas';
import SelectorPeriodo from '../components/SelectorPeriodo';
import TarjetasResumen from '../components/TarjetasResumen';
import GraficoVentas from '../components/GraficoVentas';
import GraficoTiposPedido from '../components/GraficoTiposPedido';
import TopProductos from '../components/TopProductos';
import OcupacionMesas from '../components/OcupacionMesas';
import ProximasReservas from '../components/ProximasReservas';
import PedidosRecientes from '../components/PedidosRecientes';

const formatoDiaLargo = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

function describirRango({ desde, hasta }) {
  const aFecha = (texto) => {
    const [anio, mes, dia] = texto.split('-').map(Number);
    return formatoDiaLargo.format(new Date(anio, mes - 1, dia));
  };
  return desde === hasta ? aFecha(desde) : `del ${aFecha(desde)} al ${aFecha(hasta)}`;
}

export default function InicioGestorPage() {
  const {
    periodo, setPeriodo, rango, estadisticas, pedidosRecientes,
    cargando, actualizando, error, recargar,
  } = useEstadisticas();

  // Spinner de pantalla completa solo la primera vez; después se actualiza encima de lo que ya se ve
  if (cargando && !estadisticas) {
    return (
      <div className="text-center py-5" role="status">
        <div className="spinner-border text-danger" aria-hidden="true" />
        <p className="text-muted mt-3 mb-0">Cargando el resumen del negocio...</p>
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          <p className="mb-3">{error || 'No se pudo cargar el panel de inicio.'}</p>
          <button className="btn btn-outline-danger" onClick={recargar}>Reintentar</button>
        </div>
      </div>
    );
  }

  const ocupado = cargando || actualizando;

  return (
    <div className="container-fluid py-4 px-xl-4">
      <header className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4 pb-3 border-bottom">
        <div>
          <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--color-negro)' }}>
            Panel de inicio 🍕
          </h1>
          <p className="text-muted mb-0">
            Estadísticas {describirRango(rango)}.
          </p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <SelectorPeriodo periodo={periodo} onCambiar={setPeriodo} deshabilitado={ocupado} />
          <button className="btn btn-sm btn-outline-dark" onClick={recargar} disabled={ocupado}>
            {ocupado ? 'Actualizando...' : '↻ Actualizar'}
          </button>
        </div>
      </header>

      {error && (
        <div className="alert alert-warning" role="alert">
          No se pudo actualizar el panel: {error}
        </div>
      )}

      <div style={{ opacity: ocupado ? 0.6 : 1, transition: 'opacity 0.2s' }} aria-busy={ocupado}>
        <TarjetasResumen estadisticas={estadisticas} />

        <div className="row g-4 mb-4">
          <section className="col-12 col-xl-8" aria-label="Ventas del período">
            <GraficoVentas serie={estadisticas.pedidos.serie} agrupadoPor={estadisticas.periodo.agrupadoPor} />
          </section>
          <section className="col-12 col-md-6 col-xl-4" aria-label="Pedidos por tipo">
            <GraficoTiposPedido porTipo={estadisticas.pedidos.porTipo} />
          </section>
          <section className="col-12 col-md-6 col-xl-4" aria-label="Productos más vendidos">
            <TopProductos productos={estadisticas.pedidos.topProductos} />
          </section>
          <section className="col-12 col-md-6 col-xl-4" aria-label="Ocupación de mesas">
            <OcupacionMesas mesas={estadisticas.mesas} />
          </section>
          <section className="col-12 col-md-6 col-xl-4" aria-label="Próximas reservas">
            <ProximasReservas reservas={estadisticas.reservas.proximas} />
          </section>
        </div>

        <div className="row g-4">
          <section className="col-12 col-xl-8" aria-label="Pedidos recientes">
            <PedidosRecientes pedidos={pedidosRecientes} />
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
    </div>
  );
}
